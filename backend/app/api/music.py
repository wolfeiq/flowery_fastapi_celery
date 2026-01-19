from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid
from ..tasks.proccess_music import process_music_task

from ..database import get_db
from ..models import User, ScentMemory, SpotifyLink
from .auth import get_current_user
from ..core.validation import sanitize_text

router = APIRouter()

class MusicLinkRequest(BaseModel):
    memory_id: uuid.UUID
    artist_name: str
    track_name: str
    spotify_url: str = None

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

    process_music_task.delay(
        str(current_user.id),
        str(request.memory_id),
        artist_name,
        track_name,
        spotify_url,
    )
    
    return {
        "status": "processing",
        "message": "Song analysis started"
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





