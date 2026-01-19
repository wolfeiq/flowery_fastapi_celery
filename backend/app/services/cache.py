import redis
import hashlib
import json
import logging
from typing import Optional
from datetime import datetime
from ..core.config import settings

logger = logging.getLogger(__name__)

redis_client = redis.Redis.from_url(
    settings.REDIS_URL,
    decode_responses=True,
    socket_connect_timeout=5,
    socket_timeout=5
)
def get_cache_key(cache_key_data: str, user_id: str) -> str:
    hash_key = hashlib.md5(cache_key_data.encode()).hexdigest()
    return f"rec:{user_id}:{hash_key}"

def get_cached_recommendation(cache_key_data: str, user_id: str) -> Optional[str]:
    try:
        cache_key = get_cache_key(cache_key_data, user_id)
        cached = redis_client.get(cache_key)
        if cached:
            logger.info(f"Exact cache hit: {cache_key}")
            return cached
    except Exception as e:
        logger.warning(f"Cache retrieval failed: {e}")
    return None

def cache_recommendation(
    cache_key_data: str,
    recommendation: str,
    query: str,
    user_id: str,
    context_preview: str = "",
    ttl: int = 3600
):

    try:
        cache_key = get_cache_key(cache_key_data, user_id)
        redis_client.setex(cache_key, ttl, recommendation)
        meta_key = f"rec_meta:{user_id}:{cache_key.split(':')[-1]}"
        metadata = {
            "query": query,
            "context_preview": context_preview,
            "timestamp": datetime.utcnow().isoformat(),
            "cache_key": cache_key
        }
        redis_client.setex(meta_key, ttl, json.dumps(metadata))
        
        logger.info(f"Cached recommendation: {cache_key}")
    except Exception as e:
        logger.warning(f"Cache storage failed: {e}")

def find_similar_cached_query(
    query: str,
    user_id: str,
    threshold: float = 0.85
) -> Optional[str]:

    try:

        pattern = f"rec_meta:{user_id}:*"
        meta_keys = redis_client.keys(pattern)
        
        if not meta_keys:
            return None
        
        query_lower = query.lower()
        query_words = set(query_lower.split())
        
        best_match = None
        best_similarity = 0.0
        
        for meta_key in meta_keys[:50]:  
            try:
                meta_json = redis_client.get(meta_key)
                if not meta_json:
                    continue
                
                meta = json.loads(meta_json)
                cached_query = meta['query'].lower()
                cached_words = set(cached_query.split())
                
                intersection = query_words & cached_words
                union = query_words | cached_words
                
                if len(union) == 0:
                    continue
                
                similarity = len(intersection) / len(union)
                
                if similarity > best_similarity and similarity >= threshold:
                    best_similarity = similarity
                    best_match = meta['cache_key']
                    
            except Exception as e:
                logger.warning(f"Error processing meta key {meta_key}: {e}")
                continue
        
        if best_match:
            logger.info(f"Similar query found (similarity: {best_similarity:.2f})")
            cached_response = redis_client.get(best_match)
            return cached_response
        
    except Exception as e:
        logger.warning(f"Similar query search failed: {e}")
    
    return None

def invalidate_user_recommendations(user_id: str):

    try:
        rec_pattern = f"rec:{user_id}:*"
        rec_keys = redis_client.keys(rec_pattern)
        
        meta_pattern = f"rec_meta:{user_id}:*"
        meta_keys = redis_client.keys(meta_pattern)
        
        all_keys = rec_keys + meta_keys
        
        if all_keys:
            redis_client.delete(*all_keys)
            logger.info(f"Invalidated {len(all_keys)} cached entries for user {user_id}")
    except Exception as e:
        logger.warning(f"Cache invalidation failed: {e}")

def get_cache_stats(user_id: str) -> dict:
    try:
        rec_keys = redis_client.keys(f"rec:{user_id}:*")
        meta_keys = redis_client.keys(f"rec_meta:{user_id}:*")
        
        return {
            "cached_recommendations": len(rec_keys),
            "metadata_entries": len(meta_keys),
            "user_id": user_id
        }
    except Exception as e:
        logger.warning(f"Cache stats retrieval failed: {e}")
        return {"error": str(e)}