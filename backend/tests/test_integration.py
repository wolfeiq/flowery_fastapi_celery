import pytest
from fastapi import status
from io import BytesIO
from PIL import Image
from app.models import ScentMemory
from app.tasks.process_memory import process_memory_task
from unittest.mock import patch

    

@pytest.mark.integration
class TestConcurrentUsers:
    """Test multiple users don't interfere with each other."""
    
    def test_users_have_isolated_memories(
        self, client, mock_celery, mock_embedding, mock_vector_db
    ):
        """Test that users can only access their own memories."""

        client.post("/api/auth/register", json={
            "email": "user1@example.com",
            "password": "Pass123!",
            "full_name": "User One"
        })
        client.post("/api/auth/register", json={
            "email": "user2@example.com",
            "password": "Pass123!",
            "full_name": "User Two"
        })
        

        login1 = client.post("/api/auth/login", data={
            "username": "user1@example.com",
            "password": "Pass123!"
        })
        login2 = client.post("/api/auth/login", data={
            "username": "user2@example.com",
            "password": "Pass123!"
        })
        
        headers1 = {"Authorization": f"Bearer {login1.json()['access_token']}"}
        headers2 = {"Authorization": f"Bearer {login2.json()['access_token']}"}
        

        resp1 = client.post(
            "/api/memories/upload",
            headers=headers1,
            data={"title": "User 1 Memory", "content": "Private"}
        )
        memory1_id = resp1.json()["id"]
        
        client.post(
            "/api/memories/upload",
            headers=headers2,
            data={"title": "User 2 Memory", "content": "Also private"}
        )
        

        list1 = client.get("/api/memories/", headers=headers1)
        assert len(list1.json()) == 1
        assert list1.json()[0]["title"] == "User 1 Memory"
        

        list2 = client.get("/api/memories/", headers=headers2)
        assert len(list2.json()) == 1
        assert list2.json()[0]["title"] == "User 2 Memory"
        

        access_attempt = client.get(
            f"/api/memories/{memory1_id}",
            headers=headers2
        )
        assert access_attempt.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.integration
class TestErrorRecovery:
    """Test system handles errors gracefully."""
    
    def test_failed_celery_task_marks_memory_as_failed(
        self, client, db_session, test_user, auth_headers
    ):
        """Test that failed processing is properly recorded."""
        
        
        memory = ScentMemory(
            user_id=test_user.id,
            title="Test",
            content="Test",
            memory_type="TEXT",
            processed=False
        )
        db_session.add(memory)
        db_session.commit()
        
        with patch('app.tasks.process_memory.extract_scents') as mock_extract, \
             patch('redis.Redis.from_url') as mock_redis:
            mock_extract.side_effect = Exception("Processing failed")
            mock_redis_instance = mock_redis.return_value
            mock_redis_instance.publish.return_value = 1
            
            with pytest.raises(Exception):
                process_memory_task(str(memory.id), str(test_user.id))
            
            db_session.refresh(memory)
            assert memory.processed is False
            assert memory.processing_error is not None
    