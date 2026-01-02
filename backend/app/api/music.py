from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from ..database import get_db
from ..models import User, ScentMemory, SpotifyLink, ExtractedScent
from .auth import get_current_user
from ..services.music_service import search_and_analyze_song
from ..core.validation import sanitize_text

router = APIRouter()

class MusicLinkRequest(BaseModel):
    memory_id: uuid.UUID
    artist_name: str
    track_name: str
    spotify_url: str = None  # Optional

@router.post("/link")
async def link_song(
    request: MusicLinkRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
 
    
    memory = db.query(ScentMemory).filter(
        ScentMemory.id == request.memory_id,
        ScentMemory.user_id == current_user.id
    ).first()
    if not memory:
        raise HTTPException(404, "Memory not found")
    
    artist_name = sanitize_text(request.artist_name, max_length=255)
    track_name = sanitize_text(request.track_name, max_length=255)
    spotify_url = sanitize_text(request.spotify_url, max_length=500) if request.spotify_url else None
    
   
    try:
        result = search_and_analyze_song(artist_name, track_name, spotify_url)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to analyze song: {str(e)}")
    
    link = SpotifyLink(
        memory_id=memory.id,
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
            memory_id=memory.id,
            notes=scent_data.get('notes', []),
            description=f"From song '{result['track_name']}' by {result['artist_name']}: {scent_data.get('description', '')}",
            confidence=0.75,
            source='audio',
            extraction_method='lyrics_analysis'
        )
        db.add(extracted)
    
    db.commit()
    db.refresh(link)
    
    return {
        "link_id": str(link.id),
        "track": f"{result['track_name']} by {result['artist_name']}",
        "analysis": result['analysis'],
        "album_art": result.get('album_art')
    }

@router.get("/memory/{memory_id}")
def get_songs(
    memory_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    memory = db.query(ScentMemory).filter(
        ScentMemory.id == memory_id,
        ScentMemory.user_id == current_user.id
    ).first()
    if not memory:
        raise HTTPException(404, "Memory not found")
    
    return [
        {
            "id": str(link.id),
            "track_name": link.track_name,
            "artist_name": link.artist_name,
            "album_art": link.album_art,
            "spotify_url": link.spotify_url,
            "analysis": link.lyrics_analysis,
            "created_at": link.created_at
        }
        for link in memory.spotify_links
    ]

@router.get("/{link_id}")
def get_song_details(
    link_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    link = db.query(SpotifyLink).join(ScentMemory).filter(
        SpotifyLink.id == link_id,
        ScentMemory.user_id == current_user.id
    ).first()
    
    if not link:
        raise HTTPException(404, "Song not found")
    
    return {
        "id": str(link.id),
        "track_name": link.track_name,
        "artist_name": link.artist_name,
        "spotify_url": link.spotify_url,
        "album_art": link.album_art,
        "lyrics": link.lyrics,
        "analysis": link.lyrics_analysis,
        "created_at": link.created_at
    }

@router.delete("/{link_id}")
def unlink_song(
    link_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    link = db.query(SpotifyLink).join(ScentMemory).filter(
        SpotifyLink.id == link_id,
        ScentMemory.user_id == current_user.id
    ).first()
    
    if not link:
        raise HTTPException(404, "Song not found")
    
    db.delete(link)
    db.commit()
    return {"status": "unlinked"}