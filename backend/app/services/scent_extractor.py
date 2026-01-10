from openai import OpenAI
from ..core.config import settings
import json
import logging


logger = logging.getLogger(__name__)


client = OpenAI(api_key=settings.OPENAI_API_KEY)


#cache-friendly for ChatGPT

SCENT_EXTRACTION_PROMPT = """Extract scent information from text. If explicit scent/perfume info exists, extract it. If no scents are mentioned, infer fragrance notes based on context, emotions, imagery, or themes.

Return only valid JSON:
{
  "scent_name": "string or null",
  "brand": "string or null",
  "notes": ["all", "notes"],
  "top_notes": ["citrus", "bergamot"],
  "heart_notes": ["rose", "jasmine"],
  "base_notes": ["vanilla", "musk"],
  "fragrance_family": "string or null",
  "description": "string or null"
}

Examples:
- "Beach sunset" → top_notes: ["sea salt", "bergamot"], heart_notes: ["jasmine"], base_notes: ["amber", "driftwood"]
- "Rainy day reading" → top_notes: ["petrichor", "green tea"], heart_notes: ["paper"], base_notes: ["cedarwood", "musk"]
- "Grandmother's kitchen" → top_notes: ["vanilla", "cinnamon"], heart_notes: ["rose water"], base_notes: ["tonka bean", "warm spices"]

If absolutely no context exists, generate at least one note per layer based on common pleasant scents."""

def extract_scents(text: str) -> dict:
    logger.info("API call started to extract")
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": SCENT_EXTRACTION_PROMPT
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
        cached_tokens = getattr(usage.prompt_tokens_details, 'cached_tokens', 0)
        if cached_tokens > 0:
            logger.info(f"Cache hit: {cached_tokens} tokens cached")
    
    return json.loads(response.choices[0].message.content)