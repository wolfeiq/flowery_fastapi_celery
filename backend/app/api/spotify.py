from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import requests
import uuid

from ..database import get_db
from ..models import User, ScentMemory, SpotifyLink
from .auth import get_current_user
from ..core.config import settings

router = APIRouter()

class SpotifyLinkRequest(BaseModel):
    memory_id: uuid.UUID
    spotify_url: str 

def extract_track_id(url: str) -> str:
    if "track/" in url:
        return url.split("track/")[1].split("?")[0]
    raise ValueError("Invalid Spotify URL")

def get_track_metadata(track_id: str, access_token: str) -> dict:
    response = requests.get(
        f"https://api.spotify.com/v1/tracks/{track_id}",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    if response.status_code != 200:
        raise HTTPException(400, "Failed to fetch Spotify data")
    return response.json()

@router.post("/link")
def link_spotify_track(
    request: SpotifyLinkRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    memory = db.query(ScentMemory).filter(
        ScentMemory.id == request.memory_id,
        ScentMemory.user_id == current_user.id
    ).first()
    if not memory:
        raise HTTPException(404, "Memory not found")
    
    track_id = extract_track_id(request.spotify_url)
    
    link = SpotifyLink(
        memory_id=memory.id,
        track_id=track_id,
        spotify_url=request.spotify_url
    )
    
    db.add(link)
    db.commit()
    
    return {"status": "linked", "track_id": track_id}

@router.get("/memory/{memory_id}")
def get_spotify_links(
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
            "artist": link.artist_name,
            "spotify_url": link.spotify_url
        }
        for link in memory.spotify_links
    ]

@router.delete("/{link_id}")
def unlink_spotify(
    link_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    link = db.query(SpotifyLink).join(ScentMemory).filter(
        SpotifyLink.id == link_id,
        ScentMemory.user_id == current_user.id
    ).first()
    
    if not link:
        raise HTTPException(404, "Link not found")
    
    db.delete(link)
    db.commit()
    return {"status": "unlinked"}