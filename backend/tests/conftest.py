import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import Mock, patch
import uuid
import os

os.environ["TESTING"] = "true"
os.environ["ENVIRONMENT"] = "testing"


openai_patcher = patch('openai.OpenAI')
mock_openai_class = openai_patcher.start()
mock_openai_client = Mock()
mock_response = Mock()
mock_response.choices = [Mock(message=Mock(content="Mocked AI response"))]
mock_response.usage = Mock(prompt_tokens_details=Mock(cached_tokens=0))
mock_openai_client.chat.completions.create.return_value = mock_response
mock_openai_class.return_value = mock_openai_client

from app.main import app
from app.database import get_db, engine, SessionLocal, Base
from app.models import User, ScentMemory, MemoryChunk, ScentProfile, QueryLog
from app.api.auth import get_password_hash, create_access_token

@pytest.fixture(scope="function", autouse=True)
def setup_test_db():
    """Create and drop all tables for each test."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(setup_test_db):
    """Create a fresh database session for each test."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with overridden database dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session):
    """Create a test user."""
    user = User(
        id=uuid.uuid4(),
        email="test@example.com",
        hashed_password=get_password_hash("testpass123"),
        full_name="Test User"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_token(test_user):
    """Generate auth token for test user."""
    return create_access_token(data={"sub": str(test_user.id)})


@pytest.fixture
def auth_headers(auth_token):
    """Generate authorization headers."""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture
def test_memory(db_session, test_user):
    """Create a test memory."""
    memory = ScentMemory(
        id=uuid.uuid4(),
        user_id=test_user.id,
        title="Summer Vacation",
        content="Beach memories with coconut sunscreen",
        memory_type="TEXT",
        occasion="vacation",
        emotion="happy",
        processed=True
    )
    db_session.add(memory)
    db_session.commit()
    db_session.refresh(memory)
    return memory


@pytest.fixture
def test_scent_profile(db_session, test_user):
    """Create a test scent profile."""
    profile = ScentProfile(
        user_id=test_user.id,
        preferred_families=["floral", "citrus"],
        disliked_notes=["patchouli"],
        note_occurrence_counts={"top": {"bergamot": 2}, "heart": {}, "base": {}},
        emotional_preferences=["happy", "relaxed"],
        total_memories=1
    )
    db_session.add(profile)
    db_session.commit()
    db_session.refresh(profile)
    return profile


@pytest.fixture
def mock_celery():
    """Mock Celery task execution."""
    with patch('app.tasks.process_memory.process_memory_task.delay') as mock:
        yield mock


@pytest.fixture(autouse=True)
def mock_openai():
    """Mock OpenAI API calls globally."""
    with patch('openai.OpenAI') as mock_class:
        mock_client = Mock()
        mock_response = Mock()
        mock_response.choices = [Mock(message=Mock(content="Mocked AI response"))]
        mock_response.usage = Mock(prompt_tokens_details=Mock(cached_tokens=0))
        mock_client.chat.completions.create.return_value = mock_response
        mock_class.return_value = mock_client
        yield mock_client


@pytest.fixture
def mock_redis():
    """Mock Redis operations."""
    with patch('redis.Redis.from_url') as mock:
        mock_redis = Mock()
        mock_redis.get.return_value = None
        mock_redis.setex.return_value = True
        mock_redis.delete.return_value = 1
        mock_redis.publish.return_value = 1
        mock.return_value = mock_redis
        yield mock_redis


@pytest.fixture
def mock_embedding():
    """Mock embedding generation."""
    with patch('app.services.embeddings.client') as mock:
        mock_response = Mock()
        mock_embedding = Mock()
        mock_embedding.embedding = [0.1] * 1536
        mock_response.data = [mock_embedding]
        mock.embeddings.create.return_value = mock_response
        yield mock


@pytest.fixture
def mock_vector_db():
    """Mock vector database operations."""
    with patch('app.services.vector_db.store_embedding') as store_mock, \
         patch('app.services.vector_db.search_similar') as search_mock:
        search_mock.return_value = {'ids': [[]], 'distances': [[]]}
        yield {'store': store_mock, 'search': search_mock}