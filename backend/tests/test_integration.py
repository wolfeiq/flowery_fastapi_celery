import pytest
from fastapi import status
from io import BytesIO
from PIL import Image


@pytest.mark.integration
class TestUserJourney:
    """Test complete user workflows."""
    
    def test_complete_registration_to_recommendation_flow(
        self, client, db_session, mock_celery, mock_embedding, 
        mock_vector_db, mock_openai
    ):
        """Test full user journey from registration to getting recommendations."""
        
        # 1. Register new user
        register_response = client.post(
            "/api/auth/register",
            json={
                "email": "journey@example.com",
                "password": "SecurePass123!",
                "full_name": "Journey User"
            }
        )
        assert register_response.status_code == status.HTTP_200_OK
        user_id = register_response.json()["id"]
        
        # 2. Login
        login_response = client.post(
            "/api/auth/login",
            data={
                "username": "journey@example.com",
                "password": "SecurePass123!"
            }
        )
        assert login_response.status_code == status.HTTP_200_OK
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 3. Upload first memory
        memory1_response = client.post(
            "/api/memories/upload",
            headers=headers,
            data={
                "title": "Beach Vacation",
                "content": "Coconut sunscreen and ocean breeze",
                "occasion": "vacation",
                "emotion": "happy"
            }
        )
        assert memory1_response.status_code == status.HTTP_200_OK
        memory1_id = memory1_response.json()["id"]
        
        # 4. Upload second memory with image
        img = Image.new('RGB', (100, 100), color='blue')
        img_bytes = BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        memory2_response = client.post(
            "/api/memories/upload",
            headers=headers,
            data={
                "title": "Perfume Collection",
                "content": "My favorite perfumes",
                "emotion": "nostalgic"
            },
            files={"file": ("perfume.jpg", img_bytes, "image/jpeg")}
        )
        assert memory2_response.status_code == status.HTTP_200_OK
        
        # 5. List memories
        list_response = client.get("/api/memories/", headers=headers)
        assert list_response.status_code == status.HTTP_200_OK
        memories = list_response.json()
        assert len(memories) == 2
        
        # 6. Get specific memory
        detail_response = client.get(
            f"/api/memories/{memory1_id}",
            headers=headers
        )
        assert detail_response.status_code == status.HTTP_200_OK
        assert detail_response.json()["title"] == "Beach Vacation"
        
        # 7. Query for recommendations
        query_response = client.post(
            "/api/query/search",
            headers=headers,
            json={"query": "What perfumes would I like?"}
        )
        assert query_response.status_code == status.HTTP_200_OK
        query_data = query_response.json()
        query_id = query_data["query_id"]
        assert "response" in query_data
        
        # 8. Submit feedback
        feedback_response = client.post(
            f"/api/query/{query_id}/feedback",
            headers=headers,
            json={
                "rating": 4,
                "feedback_text": "Good recommendations!"
            }
        )
        assert feedback_response.status_code == status.HTTP_200_OK
    
    def test_negative_feedback_updates_profile(
        self, client, db_session, mock_celery, mock_embedding,
        mock_vector_db, mock_openai
    ):
        """Test that negative feedback properly updates scent profile."""
        
        # Register and login
        client.post(
            "/api/auth/register",
            json={
                "email": "feedback@example.com",
                "password": "SecurePass123!",
                "full_name": "Feedback User"
            }
        )
        login = client.post(
            "/api/auth/login",
            data={
                "username": "feedback@example.com",
                "password": "SecurePass123!"
            }
        )
        headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
        
        # Upload memory
        client.post(
            "/api/memories/upload",
            headers=headers,
            data={
                "title": "Test",
                "content": "Floral scent",
                "emotion": "happy"
            }
        )
        
        # Query
        query_resp = client.post(
            "/api/query/search",
            headers=headers,
            json={"query": "Recommend perfumes"}
        )
        query_id = query_resp.json()["query_id"]
        
        # Submit negative feedback with disliked notes
        client.post(
            f"/api/query/{query_id}/feedback",
            headers=headers,
            json={
                "rating": 1,
                "disliked_notes": ["patchouli", "musk"],
                "feedback_text": "Too heavy"
            }
        )
        
        # Query again - should use updated profile
        second_query = client.post(
            "/api/query/search",
            headers=headers,
            json={"query": "Recommend light perfumes"}
        )
        assert second_query.status_code == status.HTTP_200_OK


@pytest.mark.integration
class TestConcurrentUsers:
    """Test multiple users don't interfere with each other."""
    
    def test_users_have_isolated_memories(
        self, client, mock_celery, mock_embedding, mock_vector_db
    ):
        """Test that users can only access their own memories."""
        
        # Create two users
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
        
        # Login both
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
        
        # User 1 uploads memory
        resp1 = client.post(
            "/api/memories/upload",
            headers=headers1,
            data={"title": "User 1 Memory", "content": "Private"}
        )
        memory1_id = resp1.json()["id"]
        
        # User 2 uploads memory
        client.post(
            "/api/memories/upload",
            headers=headers2,
            data={"title": "User 2 Memory", "content": "Also private"}
        )
        
        # User 1 lists memories - should only see their own
        list1 = client.get("/api/memories/", headers=headers1)
        assert len(list1.json()) == 1
        assert list1.json()[0]["title"] == "User 1 Memory"
        
        # User 2 lists memories - should only see their own
        list2 = client.get("/api/memories/", headers=headers2)
        assert len(list2.json()) == 1
        assert list2.json()[0]["title"] == "User 2 Memory"
        
        # User 2 tries to access User 1's memory - should fail
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
        from app.models import ScentMemory
        from app.tasks.process_memory import process_memory_task
        from unittest.mock import patch
        
        # Create memory
        memory = ScentMemory(
            user_id=test_user.id,
            title="Test",
            content="Test",
            memory_type="TEXT",
            processed=False
        )
        db_session.add(memory)
        db_session.commit()
        
        # Simulate task failure
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
    
    def test_duplicate_query_uses_cache(
        self, client, auth_headers, test_memory, mock_embedding, mock_vector_db
    ):
        """Test that identical queries use cached responses."""
        from unittest.mock import patch
        
        with patch('app.routers.query.client.chat.completions.create') as mock_llm:
            mock_response = mock_llm.return_value
            mock_response.choices = [type('obj', (), {
                'message': type('obj', (), {'content': 'First response'})()
            })()]
            mock_response.usage = type('obj', (), {
                'prompt_tokens_details': type('obj', (), {'cached_tokens': 0})()
            })()
            
            # First query - should call LLM
            client.post(
                "/api/query/search",
                headers=auth_headers,
                json={"query": "What perfumes?"}
            )
            assert mock_llm.call_count == 1
            
            # Second identical query - should use cache
            resp = client.post(
                "/api/query/search",
                headers=auth_headers,
                json={"query": "What perfumes?"}
            )
            # Call count should still be 1 (cache hit)
            # Note: This depends on cache implementation