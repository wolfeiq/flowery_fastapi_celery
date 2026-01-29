
import logging
from typing import Any, Optional

import chromadb
from chromadb.config import Settings as ChromaSettings

from ..core.config import settings
from ..schemas.common import EmbeddingMetadata, VectorSearchResult


logger = logging.getLogger(__name__)

# Cached client instance
_client: Optional[chromadb.HttpClient] = None


def get_client() -> chromadb.HttpClient:
    global _client

    if _client is not None:
        return _client

    # Build client settings
    client_settings = ChromaSettings(
        anonymized_telemetry=False,
    )

    # Create client with optional authentication
    if settings.CHROMA_AUTH_TOKEN:
        _client = chromadb.HttpClient(
            host=settings.CHROMA_HOST,
            port=settings.CHROMA_PORT,
            settings=client_settings,
            headers={"X-Chroma-Token": settings.CHROMA_AUTH_TOKEN}
        )
        logger.info("ChromaDB client created with authentication")
    else:
        _client = chromadb.HttpClient(
            host=settings.CHROMA_HOST,
            port=settings.CHROMA_PORT,
            settings=client_settings,
        )
        logger.warning("ChromaDB client created WITHOUT authentication - not recommended for production")

    return _client


def get_collection() -> Any:
    client = get_client()
    return client.get_or_create_collection(name="memory_chunks")


def store_embedding(
    chunk_id: str,
    embedding: list[float],
    metadata: EmbeddingMetadata
) -> None:
    collection = get_collection()
    collection.add(ids=[chunk_id], embeddings=[embedding], metadatas=[metadata])


def search_similar(
    query_embedding: list[float],
    user_id: str,
    top_k: int = 5
) -> VectorSearchResult:
    collection = get_collection()
    result: Any = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where={"user_id": user_id}
    )
    return result


def delete_embeddings(chunk_ids: list[str]) -> None:
    if not chunk_ids:
        return

    collection = get_collection()
    collection.delete(ids=chunk_ids)
    logger.info(f"Deleted {len(chunk_ids)} embeddings from ChromaDB")


def delete_user_embeddings(user_id: str) -> int:
    collection = get_collection()

    # Get all chunks for this user
    results = collection.get(
        where={"user_id": user_id},
        include=[]
    )

    if results['ids']:
        collection.delete(ids=results['ids'])
        logger.info(f"Deleted {len(results['ids'])} embeddings for user {user_id}")
        return len(results['ids'])

    return 0
