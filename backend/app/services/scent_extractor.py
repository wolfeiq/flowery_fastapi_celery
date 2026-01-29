
import json
import logging
from typing import Optional

from openai import OpenAI

from ..core.config import settings
from ..schemas.common import ScentData


logger = logging.getLogger(__name__)

client = OpenAI(api_key=settings.OPENAI_API_KEY)


# Cache-friendly prompt for ChatGPT
SCENT_EXTRACTION_PROMPT = """Extract scent information from text. If explicit scent/perfume info exists, extract it. If no scents are mentioned, infer fragrance notes based on context, emotions, imagery, or themes.

Take into account the emotion: "{emotion}" and occasion: "{occasion}" the user has submitted alongside the text, if present. Use these to guide your fragrance note suggestions.

Be specific and detailed in your analysis. Focus on sensory details that would translate to fragrance notes. Be creative with the fragrance notes.

Be creative with the color and suggest shades rather than primary colors based on the text's imagery and mood.

No longer than two sentences, description (i.e. the description field) should summarize the text's vibe and setting, the core memory or context of the attached PDF (may it be present and indicated as such), mentioning the identified fragrance notes, color, and emotion.

Always return your analysis in valid JSON format with these exact fields:
- description: string
- brand: string
- scent_name: string
- top_notes: List[str]
- heart_notes: List[str]
- base_notes: List[str]
- color: str (hex color code)
- emotion: string
- scent_family: str


Return the color strictly as a HEX value in the format "#RRGGBB". One color only.
Do NOT return color names, descriptions, or words.
If you cannot determine the color, return "#FFB6C1".

Example response:
{{
  "description": "A memory of a peaceful rainy afternoon spent reading by the window, with notes of petrichor and paper evoking a contemplative mood",
  "brand": "Jo Malone",
  "scent_name": "Wood Sage & Sea Salt",
  "top_notes": ["petrichor", "green tea", "mint"],
  "heart_notes": ["paper", "sage", "lavender"],
  "base_notes": ["cedarwood", "musk", "amber"],
  "color": "#708090",
  "emotion": "contemplative",
  "scent_family": "fresh aromatic"
}}

Examples:
- "Beach sunset" → top_notes: ["sea salt", "bergamot"], heart_notes: ["jasmine"], base_notes: ["amber", "driftwood"]
- "Rainy day reading" → top_notes: ["petrichor", "green tea"], heart_notes: ["paper"], base_notes: ["cedarwood", "musk"]
- "Grandmother's kitchen" → top_notes: ["vanilla", "cinnamon"], heart_notes: ["rose water"], base_notes: ["tonka bean", "warm spices"]

If absolutely no context exists, generate at least one note at any one suitable layer based on common pleasant scents, otherwise, generate more."""


def extract_scents(
    text: str,
    emotion: Optional[str],
    occasion: Optional[str]
) -> ScentData:

    logger.info("API call started to extract")

    formatted_prompt = SCENT_EXTRACTION_PROMPT.format(
        emotion=emotion or "not specified",
        occasion=occasion or "not specified"
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": formatted_prompt
            },
            {
                "role": "user",
                "content": f"Extract scent information from:\n\n{text}"
            }
        ],
        response_format={"type": "json_object"}
    )

    usage = response.usage
    if usage and hasattr(usage, 'prompt_tokens_details'):
        cached_tokens = getattr(usage.prompt_tokens_details, 'cached_tokens', 0)
        if cached_tokens > 0:
            logger.info(f"Cache hit: {cached_tokens} tokens cached")

    content = response.choices[0].message.content
    if content:
        return json.loads(content)
    return {}
