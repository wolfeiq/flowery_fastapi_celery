import lyricsgenius
from ..core.config import settings
from openai import OpenAI
import re

genius = lyricsgenius.Genius(settings.GENIUS_ACCESS_TOKEN)
genius.verbose = False
genius.remove_section_headers = True

openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)

def parse_spotify_url(url: str) -> dict:

    if "spotify.com/track/" in url:
        return {"spotify_url": url}
    else:
        raise ValueError("Paste Spotify URL or 'Artist - Song Name'")

def search_and_analyze_song(artist: str, track_name: str, spotify_url: str = None) -> dict:

    song = genius.search_song(track_name, artist)
    if not song:
        raise ValueError("Lyrics not found")
    
    analysis = analyze_lyrics_for_scents(song.lyrics, track_name, artist)
    
    return {
        "track_name": track_name,
        "artist_name": artist,
        "spotify_url": spotify_url,
        "lyrics": song.lyrics,
        "analysis": analysis,
        "album_art": song.song_art_image_url
    }

def analyze_lyrics_for_scents(lyrics: str, track_name: str, artist_name: str) -> dict:
    response = openai_client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{
            "role": "system",
            "content": "You are an expert at analyzing song lyrics to extract scent associations, moods, and vibes."
        }, {
            "role": "user",
            "content": f"""Analyze these lyrics from "{track_name}" by {artist_name}:

{lyrics}

Extract and return JSON:
{{
  "mood": "romantic/energetic/melancholic/peaceful/mysterious",
  "vibes": ["sunset", "summer", "nostalgia"],
  "scent_associations": {{
    "notes": ["rose", "vanilla", "ocean breeze"],
    "fragrance_families": ["floral", "fresh"],
    "intensity": "light/medium/strong",
    "description": "brief explanation of why these scents fit"
  }},
  "emotions": ["love", "longing", "joy"],
  "imagery": ["beach", "night", "flowers"],
  "season": "spring/summer/fall/winter or null"
}}"""
        }],
        response_format={"type": "json_object"}
    )
    
    import json
    return json.loads(response.choices[0].message.content)

