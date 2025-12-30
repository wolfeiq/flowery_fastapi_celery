
import chromadb
from chromadb.config import Settings

def get_collection():
    client = chromadb.PersistentClient(path="./chroma_db")
    return client.get_or_create_collection(name="memory_chunks")

def store_embedding(chunk_id: str, embedding: list, metadata: dict):
    collection = get_collection()
    collection.add(ids=[chunk_id], embeddings=[embedding], metadatas=[metadata])

#cosine similarity: 1 the same, -1 opposite meaning
def search_similar(query_embedding: list, user_id: str, top_k: int = 5):
    collection = get_collection()
    return collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where={"user_id": user_id}
    )