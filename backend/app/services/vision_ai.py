
import base64
import json
import logging
from typing import Optional

from openai import OpenAI

from ..core.config import settings
from ..schemas.common import VisionAnalysisResult


logger = logging.getLogger(__name__)

client = OpenAI(api_key=settings.OPENAI_API_KEY)


# Cache-friendly prompt for ChatGPT
VISION_SYSTEM_PROMPT = """You are an expert at analyzing images for scent-related context.

Your task is to carefully examine images and create a:
1. Description of the image setting, vibe, explicitly mentioning objects that suggest scents (for example: beach, ocean, furniture, flowers, food, environments)
2. Dominant color and its emotional association
3. Potential top, heart and base fragrace note you'd associate with the visual context (if absolutely no context exists, generate at least one note at any one suitable layer based on common pleasant scents. otherwise, generate more)
4. One potential fragrance family suggestion based on the context
5. If visual context permits, a brand and scent name visible in the image

Take into account the emotion: "{emotion}" and occasion: "{occasion}" the user has submitted alongside the image, if present.

Be specific and detailed in your analysis. Focus on sensory details that would translate to fragrance notes. Be creative with the fragrance notes.

Be creative with the color and suggest shades rather than primary colors.

No longer than two sentences, description (i.e. the image_description field) should always include the identified top, base or heart notes, color and emotion. Tie it into the description of the image.

Always return your analysis in valid JSON format with these exact fields:
- image_description: string
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
  "image_description": "A luxurious living room sofa with gold accents against a dark background of a wall with an antique painting",
  "brand": "Dior",
  "scent_name": "Sauvage",
  "top_notes": ["bergamot", "pepper", "citrus"],
  "heart_notes": ["lavender", "geranium", "patchouli"],
  "base_notes": ["ambroxan", "cedar", "labdanum"],
  "color": "#2C3E50",
  "emotion": "confident",
  "scent_family": "woody aromatic"
}}"""


def analyze_image(
    image_bytes: bytes,
    content: str,
    emotion: Optional[str],
    occasion: Optional[str]
) -> VisionAnalysisResult:
    logger.info("Vision API call started")
    base64_image = base64.b64encode(image_bytes).decode('utf-8')
    # Processed in transit, images never stored in S3 buckets, no file I/O

    formatted_prompt = VISION_SYSTEM_PROMPT.format(
        emotion=emotion or "not specified",
        occasion=occasion or "not specified"
    )

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": formatted_prompt
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Analyze this image:"
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                    }
                ]
            }
        ],
        response_format={"type": "json_object"}
    )

    usage = response.usage
    if usage and hasattr(usage, 'prompt_tokens_details'):
        cached_tokens = getattr(usage.prompt_tokens_details, 'cached_tokens', 0)
        if cached_tokens > 0:
            logger.info(f"Cache hit: {cached_tokens} tokens cached")

    content_response = response.choices[0].message.content
    if content_response:
        return json.loads(content_response)
    return {}
