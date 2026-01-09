from openai import OpenAI
from ..core.config import settings
import json
import logging


logger = logging.getLogger(__name__)


client = OpenAI(api_key=settings.OPENAI_API_KEY)


#cache-friendly for ChatGPT

SCENT_EXTRACTION_PROMPT = """You are an expert perfumer and fragrance analyst.

Extract scent-related information from text:
- Scent/perfume names
- Brands
- Fragrance notes (top/middle/base)
- Fragrance families (floral, woody, citrus, etc.)
- Descriptions

Return ONLY valid JSON with these fields:
{
  "scent_name": "string or null",
  "brand": "string or null",
  "notes": ["array", "of", "notes"],
  "fragrance_family": "string or null",
  "description": "string or null"
}

If no scent info, return empty arrays/null values."""

def extract_scents(text: str) -> dict:
    logger.info("API call started to extract")
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": SCENT_EXTRACTION_PROMPT  # Cached!
            },
            {
                "role": "user",
                "content": f"Extract scent information from:\n\n{text}"
            }
        ],
        response_format={"type": "json_object"}
    )

    usage = response.usage
    if hasattr(usage, 'prompt_tokens_details'):
        cached_tokens = usage.prompt_tokens_details.get('cached_tokens', 0)
        if cached_tokens > 0:
            logger.info(f"Cache hit: {cached_tokens} tokens cached")
    
    return json.loads(response.choices[0].message.content)