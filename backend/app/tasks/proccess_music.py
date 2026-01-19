from .celery_app import celery_app
from ..database import SessionLocal
from ..models import SpotifyLink, ExtractedScent, ScentMemory
from ..services.music_service import search_and_analyze_song
import redis
import json
import redis
from app.core.config import settings

@celery_app.task
def process_music_task(user_id: str, memory_id: str, artist: str, track: str, spotify_url: str = None):
    db = SessionLocal()
    
    try:
        memory = db.query(ScentMemory).filter(ScentMemory.id == memory_id).first()

        
        result = search_and_analyze_song(artist, track, spotify_url)

    
        link = SpotifyLink(
            memory_id=memory_id,
            track_name=result['track_name'],
            artist_name=result['artist_name'],
            spotify_url=result.get('spotify_url'),
            album_art=result.get('album_art'),
            lyrics=result['lyrics'],
            lyrics_analysis=result['analysis']
        )
        db.add(link)

        scent_data = result['analysis'].get('scent_associations', {})
        if scent_data.get('notes'):
            extracted = ExtractedScent(
                memory_id=memory_id,
                notes=scent_data.get('notes', []),
                description=f"From song: {scent_data.get('description')}",
                confidence=0.75,
                source='audio',
                extraction_method='lyrics_analysis'
            )
            db.add(extracted)
        
        db.commit()

        r = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
        
        message = {
            "user_id": user_id,
            "event": "memory_processed",
            "memory_id": memory_id,
        }
        
        
        song_result = r.publish("memory_events", json.dumps(message))
        
    

        r.close()

        return {"status": "processed", "analysis": result['analysis']}
        
    except Exception as e:
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()