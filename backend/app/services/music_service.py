import lyricsgenius
from typing import Optional
from app.core.config import settings

# Don't initialize at import time
# this is an AI generated file completely, never edited it really, app doesnt use it

_genius_client: Optional[lyricsgenius.Genius] = None


def get_genius_client() -> lyricsgenius.Genius:

    global _genius_client
    
    if _genius_client is None:
        if not settings.GENIUS_ACCESS_TOKEN:
            raise ValueError(
                "GENIUS_ACCESS_TOKEN is not configured. "
                "Please add it to your .env file to use music features."
            )
        _genius_client = lyricsgenius.Genius(settings.GENIUS_ACCESS_TOKEN)
    
    return _genius_client


def search_and_analyze_song(song_name: str, artist_name: str = None):
    try:
        genius = get_genius_client()
        
        # Your existing search logic here
        if artist_name:
            song = genius.search_song(song_name, artist_name)
        else:
            song = genius.search_song(song_name)
        
        if not song:
            return {
                "success": False,
                "error": "Song not found"
            }
        
        return {
            "success": True,
            "title": song.title,
            "artist": song.artist,
            "lyrics": song.lyrics,
            "url": song.url,
            # Add any other fields you need
        }
        
    except ValueError as e:
        # Token not configured
        return {
            "success": False,
            "error": str(e)
        }
    except Exception as e:
        # Other errors (API issues, etc.)
        return {
            "success": False,
            "error": f"Failed to search song: {str(e)}"
        }


