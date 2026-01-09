from openai import OpenAI
from ..core.config import settings
import base64
import logging
client = OpenAI(api_key=settings.OPENAI_API_KEY)
import json
logger = logging.getLogger(__name__)

#cache-friendly for ChatGPT

VISION_SYSTEM_PROMPT = """You are an expert at analyzing images for scent-related context.

Your task is to carefully examine images and identify:
1. Objects that suggest scents (beach, ocean, furniture, flowers, food, environments)
2. Dominant colors and their emotional associations
3. The overall mood and setting
4. Potential scent suggestions based on the visual context

Be specific and detailed in your analysis. Focus on sensory details that would translate to fragrance notes.

Always return your analysis in valid JSON format with these exact fields:
- detected_objects: array of strings
- dominant_colors: array of hex color codes
- mood: string (romantic/fresh/elegant/energetic/cozy/mysterious)
- colors_associated_with_mood: string
- setting: string (indoor/outdoor/studio/nature/urban)
- scent_suggestions: array of strings

Example response:
{
  "detected_objects": ["perfume bottle", "roses", "vintage vanity"],
  "dominant_colors": ["#FFB6C1", "#8B4513", "#F5F5DC"],
  "mood": "romantic",
  "colors_associated_with_mood": "pink, brown, cream",
  "setting": "indoor",
  "scent_suggestions": ["floral", "powdery", "vintage"]
}"""

def analyze_image(image_bytes: bytes) -> dict:
    logger.info("Vision API call started")
    base64_image = base64.b64encode(image_bytes).decode('utf-8')
       #processed in transit, images never stored in S3 buckets, no file I/O
    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[
            {
                "role": "system",
                "content": VISION_SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Please analyze this image:"
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
    if hasattr(usage, 'prompt_tokens_details'):
        cached_tokens = usage.prompt_tokens_details.get('cached_tokens', 0)
        if cached_tokens > 0:
            logger.info(f"Cache hit: {cached_tokens} tokens cached")

    return json.loads(response.choices[0].message.content)