import pytest
from unittest.mock import patch, Mock
import uuid
import base64
from app.models import ScentMemory, ScentProfile
from app.tasks.process_memory import process_memory_task
from PIL import Image
from io import BytesIO


class TestProcessMemoryTask:
    """Test Celery memory processing task."""
    
    def test_process_text_memory(self, db_session, test_user, mock_embedding, 
                                mock_vector_db, mock_redis):
        """Test processing text-only memory."""
        
        
        memory = ScentMemory(
            id=uuid.uuid4(),
            user_id=test_user.id,
            title="Test Memory",
            content="Lovely floral scent with rose and jasmine",
            memory_type="TEXT",
            processed=False
        )
        db_session.add(memory)
        db_session.commit()
        
        with patch('app.tasks.process_memory.extract_scents') as mock_extract:
            mock_extract.return_value = {
                'scent_name': 'Rose Garden',
                'brand': 'Unknown',
                'top_notes': ['rose', 'bergamot'],
                'heart_notes': ['jasmine'],
                'base_notes': ['musk'],
                'description': 'Floral fragrance',
                'scent_family': 'floral',
                'emotion': 'happy',
                'color': 'pink'
            }
            
            process_memory_task(str(memory.id), str(test_user.id))
            
            db_session.refresh(memory)
            assert memory.processed is True
            assert len(memory.chunks) > 0
            assert len(memory.extracted_scents) > 0
    
    def test_process_image_memory(self, db_session, test_user, mock_embedding,
                                  mock_vector_db, mock_redis):
        """Test processing memory with image."""
        
        
        memory = ScentMemory(
            id=uuid.uuid4(),
            user_id=test_user.id,
            title="Perfume Bottle",
            content="My favorite perfume",
            memory_type="PHOTO",
            processed=False
        )
        db_session.add(memory)
        db_session.commit()
        

        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        file_data = {
            "type": "base64",
            "data": base64.b64encode(img_bytes.read()).decode('utf-8'),
            "content_type": "image/jpeg",
            "extension": ".jpg"
        }
        
        with patch('app.tasks.process_memory.analyze_image') as mock_analyze:
            mock_analyze.return_value = {
                'scent_name': 'Chanel No. 5',
                'brand': 'Chanel',
                'top_notes': ['aldehydes', 'neroli'],
                'heart_notes': ['jasmine', 'rose'],
                'base_notes': ['vanilla', 'sandalwood'],
                'image_description': 'Classic perfume bottle',
                'scent_family': 'floral',
                'emotion': 'elegant',
                'color': 'gold'
            }
            
            process_memory_task(str(memory.id), str(test_user.id), file_data)
            
            db_session.refresh(memory)
            assert memory.processed is True
            assert 'Classic perfume bottle' in memory.content
    
    def test_process_pdf_memory(self, db_session, test_user, mock_embedding,
                               mock_vector_db, mock_redis):
        """Test processing memory with PDF."""
        
        memory = ScentMemory(
            id=uuid.uuid4(),
            user_id=test_user.id,
            title="Fragrance Notes",
            content="PDF with fragrance information",
            memory_type="PDF",
            processed=False
        )
        db_session.add(memory)
        db_session.commit()
        
        pdf_content = b"%PDF-1.4 fake pdf content"
        file_data = {
            "type": "base64",
            "data": base64.b64encode(pdf_content).decode('utf-8'),
            "content_type": "application/pdf",
            "extension": ".pdf"
        }
        
        with patch('app.tasks.process_memory.extract_text_from_pdf') as mock_pdf, \
             patch('app.tasks.process_memory.extract_scents') as mock_extract:
            mock_pdf.return_value = "Extracted text from PDF"
            mock_extract.return_value = {
                'scent_name': 'Test Scent',
                'brand': 'Test Brand',
                'top_notes': ['bergamot'],
                'heart_notes': ['rose'],
                'base_notes': ['vanilla'],
                'description': 'PDF scent',
                'scent_family': 'floral',
                'emotion': 'calm',
                'color': 'white'
            }
            
            process_memory_task(str(memory.id), str(test_user.id), file_data)
            
            db_session.refresh(memory)
            assert memory.processed is True
            assert 'PDF' in memory.content or 'Extracted text from PDF' in memory.content
    
    def test_process_updates_scent_profile(self, db_session, test_user, 
                                          mock_embedding, mock_vector_db, mock_redis):
        """Test that processing updates user's scent profile."""

        
        profile = ScentProfile(
            user_id=test_user.id,
            preferred_families=[],
            disliked_notes=[],
            note_occurrence_counts={"top": {}, "heart": {}, "base": {}},
            emotional_preferences=[],
            total_memories=0
        )
        db_session.add(profile)
        db_session.commit()
        
        memory = ScentMemory(
            id=uuid.uuid4(),
            user_id=test_user.id,
            title="Test",
            content="Floral scent",
            memory_type="TEXT",
            emotion="happy",
            processed=False
        )
        db_session.add(memory)
        db_session.commit()
        
        with patch('app.tasks.process_memory.extract_scents') as mock_extract:
            mock_extract.return_value = {
                'scent_name': 'Floral Dream',
                'brand': 'Test',
                'top_notes': ['rose', 'bergamot'],
                'heart_notes': ['jasmine'],
                'base_notes': ['musk'],
                'description': 'Floral',
                'scent_family': 'floral',
                'emotion': 'happy',
                'color': 'pink'
            }
            
            process_memory_task(str(memory.id), str(test_user.id))
            
            db_session.refresh(profile)
            assert 'floral' in profile.preferred_families
            assert 'happy' in profile.emotional_preferences
            assert profile.total_memories == 1
            assert profile.note_occurrence_counts['top']['rose'] == 1
            assert profile.note_occurrence_counts['top']['bergamot'] == 1
    
    def test_process_invalidates_cache(self, db_session, test_user, 
                                      mock_embedding, mock_vector_db):
        """Test that processing invalidates recommendation cache."""
        
        memory = ScentMemory(
            id=uuid.uuid4(),
            user_id=test_user.id,
            title="Test",
            content="Test content",
            memory_type="TEXT",
            processed=False
        )
        db_session.add(memory)
        db_session.commit()
        
        with patch('app.tasks.process_memory.extract_scents') as mock_extract, \
             patch('app.tasks.process_memory.invalidate_user_recommendations') as mock_invalidate, \
             patch('redis.Redis.from_url') as mock_redis:
            
            mock_extract.return_value = {
                'scent_name': 'Test',
                'brand': 'Test',
                'top_notes': [],
                'heart_notes': [],
                'base_notes': [],
                'description': 'Test',
                'scent_family': 'floral',
                'emotion': 'happy',
                'color': 'pink'
            }
            mock_redis_instance = Mock()
            mock_redis_instance.publish.return_value = 1
            mock_redis.return_value = mock_redis_instance
            
            process_memory_task(str(memory.id), str(test_user.id))
            
            mock_invalidate.assert_called_once_with(str(test_user.id))
    
    def test_process_handles_failure(self, db_session, test_user):
        """Test task handles processing failures gracefully."""
        
        memory = ScentMemory(
            id=uuid.uuid4(),
            user_id=test_user.id,
            title="Test",
            content="Test content",
            memory_type="TEXT",
            processed=False
        )
        db_session.add(memory)
        db_session.commit()
        
        with patch('app.tasks.process_memory.extract_scents') as mock_extract, \
             patch('redis.Redis.from_url') as mock_redis:
            mock_extract.side_effect = Exception("Processing failed")
            mock_redis_instance = Mock()
            mock_redis_instance.publish.return_value = 1
            mock_redis.return_value = mock_redis_instance
            
            with pytest.raises(Exception):
                process_memory_task(str(memory.id), str(test_user.id))
            
            db_session.refresh(memory)
            assert memory.processed is False
            assert memory.processing_error is not None
    
    def test_process_publishes_redis_event(self, db_session, test_user,
                                          mock_embedding, mock_vector_db):
        """Test task publishes success event to Redis."""

        
        memory = ScentMemory(
            id=uuid.uuid4(),
            user_id=test_user.id,
            title="Test",
            content="Test content",
            memory_type="TEXT",
            processed=False
        )
        db_session.add(memory)
        db_session.commit()
        
        with patch('app.tasks.process_memory.extract_scents') as mock_extract, \
             patch('redis.Redis.from_url') as mock_redis:
            mock_extract.return_value = {
                'scent_name': 'Test',
                'brand': 'Test',
                'top_notes': [],
                'heart_notes': [],
                'base_notes': [],
                'description': 'Test',
                'scent_family': 'floral',
                'emotion': 'happy',
                'color': 'pink'
            }
            mock_redis_instance = Mock()
            mock_redis.return_value = mock_redis_instance
            
            process_memory_task(str(memory.id), str(test_user.id))
            
            mock_redis_instance.publish.assert_called()
            call_args = mock_redis_instance.publish.call_args
            assert call_args[0][0] == "memory_events"