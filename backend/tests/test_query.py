import pytest
from fastapi import status
from unittest.mock import patch, Mock
from app.models import User, QueryLog


class TestSearchMemories:
    """Test search/recommendation endpoint."""
    
    def test_search_success(self, client, auth_headers, test_memory, 
                           mock_embedding, mock_vector_db, mock_openai):
        """Test successful search query."""
        response = client.post(
            "/api/query/search",
            headers=auth_headers,
            json={
                "query": "What perfumes would I like?",
                "query_type": "recommendation"
            }
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "query_id" in data
        assert "response" in data
        assert "sources" in data
        assert "cached" in data
        assert isinstance(data["sources"], list)
    
    def test_search_with_cache_hit(self, client, auth_headers, test_memory,
                                   mock_embedding, mock_vector_db, mock_redis):
        """Test cache hit for identical query."""

        mock_redis.get.return_value = '{"recommendation": "Cached response"}'
        
        with patch('app.api.query.get_cached_recommendation') as mock_cache:
            mock_cache.return_value = "Cached recommendation response"
            
            response = client.post(
                "/api/query/search",
                headers=auth_headers,
                json={"query": "What perfumes would I like?"}
            )
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["cached"] is True
            assert "Cached" in data["response"]
    
    def test_search_sanitizes_input(self, client, auth_headers, mock_embedding,
                                    mock_vector_db, mock_openai):
        """Test input sanitization in queries."""
        response = client.post(
            "/api/query/search",
            headers=auth_headers,
            json={"query": "<script>alert('xss')</script>What perfumes?"}
        )
        assert response.status_code == status.HTTP_200_OK
    
    def test_search_max_length_validation(self, client, auth_headers):
        """Test query length validation."""
        long_query = "a" * 1001
        response = client.post(
            "/api/query/search",
            headers=auth_headers,
            json={"query": long_query}
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_search_no_auth(self, client):
        """Test search without authentication."""
        response = client.post(
            "/api/query/search",
            json={"query": "What perfumes?"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_search_creates_query_log(self, client, auth_headers, db_session,
                                     mock_embedding, mock_vector_db, mock_openai):
        """Test that searches are logged."""
        
        
        response = client.post(
            "/api/query/search",
            headers=auth_headers,
            json={"query": "What perfumes would I like?"}
        )
        
        assert response.status_code == status.HTTP_200_OK
        query_id = response.json()["query_id"]
        
        log = db_session.query(QueryLog).filter_by(id=query_id).first()
        assert log is not None
        assert log.query_text == "What perfumes would I like?"
    
    def test_search_with_no_memories(self, client, auth_headers, 
                                     mock_embedding, mock_vector_db, mock_openai):
        """Test search when user has no memories."""
        mock_vector_db['search'].return_value = {'ids': [[]], 'distances': [[]]}
        
        response = client.post(
            "/api/query/search",
            headers=auth_headers,
            json={"query": "What perfumes?"}
        )
        assert response.status_code == status.HTTP_200_OK


class TestSubmitFeedback:
    """Test feedback submission endpoint."""
    
    def test_submit_positive_feedback(self, client, auth_headers, db_session, test_user):
        """Test submitting positive feedback."""

        query = QueryLog(
            user_id=test_user.id,
            query_text="What perfumes?",
            query_type="RECOMMENDATION",
            llm_response="Great recommendations!",
            model_version="gpt-4"
        )
        db_session.add(query)
        db_session.commit()
        
        response = client.post(
            f"/api/query/{query.id}/feedback",
            headers=auth_headers,
            json={
                "rating": 5,
                "feedback_text": "Very helpful recommendations!"
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        db_session.refresh(query)
        assert query.rating == 5
        assert query.feedback_text == "Very helpful recommendations!"
    
    def test_submit_negative_feedback_with_disliked_notes(
        self, client, auth_headers, db_session, test_user, test_scent_profile, mock_redis
    ):
        """Test negative feedback updates scent profile."""
        
        query = QueryLog(
            user_id=test_user.id,
            query_text="What perfumes?",
            query_type="RECOMMENDATION",
            llm_response="Recommendations",
            model_version="gpt-4"
        )
        db_session.add(query)
        db_session.commit()
        
        response = client.post(
            f"/api/query/{query.id}/feedback",
            headers=auth_headers,
            json={
                "rating": 2,
                "feedback_text": "Not my style",
                "disliked_notes": ["vanilla", "musk"]
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        db_session.refresh(test_scent_profile)
        assert "vanilla" in test_scent_profile.disliked_notes
        assert "musk" in test_scent_profile.disliked_notes
    
    def test_feedback_invalidates_cache(self, client, auth_headers, db_session,
                                       test_user, test_scent_profile):
        """Test that negative feedback invalidates cache."""
        
        query = QueryLog(
            user_id=test_user.id,
            query_text="What perfumes?",
            query_type="recommendation",
            llm_response="Recommendations",
            model_version="gpt-4"
        )
        db_session.add(query)
        db_session.commit()
        
        with patch('app.api.query.invalidate_user_recommendations') as mock_invalidate:
            response = client.post(
                f"/api/query/{query.id}/feedback",
                headers=auth_headers,
                json={
                    "rating": 1,
                    "disliked_notes": ["rose"]
                }
            )
            
            assert response.status_code == status.HTTP_200_OK
            mock_invalidate.assert_called_once()
    
    def test_feedback_rating_validation(self, client, auth_headers, db_session, test_user):
        """Test rating validation (must be 1-5)."""
        
        query = QueryLog(
            user_id=test_user.id,
            query_text="Test",
            query_type="RECOMMENDATION",
            llm_response="Response",
            model_version="gpt-4"
        )
        db_session.add(query)
        db_session.commit()
        
        response = client.post(
            f"/api/query/{query.id}/feedback",
            headers=auth_headers,
            json={"rating": 6}
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

        response = client.post(
            f"/api/query/{query.id}/feedback",
            headers=auth_headers,
            json={"rating": 0}
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_feedback_query_not_found(self, client, auth_headers):
        """Test feedback for non-existent query."""
        fake_id = uuid.uuid4()
        response = client.post(
            f"/api/query/{fake_id}/feedback",
            headers=auth_headers,
            json={"rating": 5}
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_feedback_wrong_user(self, client, auth_headers, db_session):
        """Test user cannot submit feedback for another user's query."""
        
        
        other_user = User(
            email="other@example.com",
            hashed_password="hash",
            full_name="Other"
        )
        db_session.add(other_user)
        db_session.commit()
        
        query = QueryLog(
            user_id=other_user.id,
            query_text="Test",
            query_type="RECOMMENDATION",
            llm_response="Response",
            model_version="gpt-4"
        )
        db_session.add(query)
        db_session.commit()
        
        response = client.post(
            f"/api/query/{query.id}/feedback",
            headers=auth_headers,
            json={"rating": 5}
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_feedback_disliked_notes_limit(self, client, auth_headers, db_session, test_user):
        """Test disliked notes limit validation."""
        
        
        query = QueryLog(
            user_id=test_user.id,
            query_text="Test",
            query_type="RECOMMENDATION",
            llm_response="Response",
            model_version="gpt-4"
        )
        db_session.add(query)
        db_session.commit()
        
        too_many_notes = [f"note_{i}" for i in range(51)]
        response = client.post(
            f"/api/query/{query.id}/feedback",
            headers=auth_headers,
            json={
                "rating": 2,
                "disliked_notes": too_many_notes
            }
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY