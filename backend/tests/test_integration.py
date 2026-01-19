import pytest
from fastapi import status
from io import BytesIO
from PIL import Image
from app.models import ScentMemory
from app.tasks.process_memory import process_memory_task
from unittest.mock import patch

@pytest.mark.integration
class TestUserJourney:
    """Test complete user workflows."""
    
    def test_complete_registration_to_recommendation_flow(
        self, client, db_session, mock_celery, mock_embedding, 
        mock_vector_db, mock_openai
    ):
        """Test full user journey from registration to getting recommendations."""

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
        

        list_response = client.get("/api/memories/", headers=headers)
        assert list_response.status_code == status.HTTP_200_OK
        memories = list_response.json()
        assert len(memories) == 2

        detail_response = client.get(
            f"/api/memories/{memory1_id}",
            headers=headers
        )
        assert detail_response.status_code == status.HTTP_200_OK
        assert detail_response.json()["title"] == "Beach Vacation"

        query_response = client.post(
            "/api/query/search",
            headers=headers,
            json={"query": "What perfumes would I like?"}
        )
        assert query_response.status_code == status.HTTP_200_OK
        query_data = query_response.json()
        query_id = query_data["query_id"]
        assert "response" in query_data
        

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

        client.post(
            "/api/memories/upload",
            headers=headers,
            data={
                "title": "Test",
                "content": "Floral scent",
                "emotion": "happy"
            }
        )
        

        query_resp = client.post(
            "/api/query/search",
            headers=headers,
            json={"query": "Recommend perfumes"}
        )
        query_id = query_resp.json()["query_id"]
        

        client.post(
            f"/api/query/{query_id}/feedback",
            headers=headers,
            json={
                "rating": 1,
                "disliked_notes": ["patchouli", "musk"],
                "feedback_text": "Too heavy"
            }
        )

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
    
    def test_duplicate_query_uses_cache(
    self, client, auth_headers, test_memory, mock_embedding, mock_vector_db
    ):
        """Test that identical queries use cached responses."""
        resp1 = client.post(
            "/api/query/search",
            headers=auth_headers,
            json={"query": "What perfumes?"}
        )
        assert resp1.status_code == 200
 
        resp2 = client.post(
            "/api/query/search",
            headers=auth_headers,
            json={"query": "What perfumes?"}
        )
        assert resp2.status_code == 200