from openai import OpenAI
from ..core.config import settings
import json

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def extract_scents(text: str) -> dict:
    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{
            "role": "system",
            "content": "Extract fragrance information from text. Return ONLY valid JSON."
        }, {
            "role": "user",
            "content": f"""Extract scent-related information from this text:

{text}

Return JSON format:
{{
  "scent_name": "perfume name or null",
  "brand": "brand name or null",
  "notes": ["rose", "vanilla", ...],
  "description": "brief quote mentioning scent",
  "fragrance_family": "floral/woody/fresh/oriental or null"
}}

If no scent info, return empty arrays/null values."""
        }],
        response_format={"type": "json_object"}
    )
    
    return json.loads(response.choices[0].message.content)