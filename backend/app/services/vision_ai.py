from openai import OpenAI
from ..core.config import settings
import base64

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def analyze_image(image_path: str) -> dict:
    with open(image_path, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')
    
    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": """Analyze this image for scent-related context. Return JSON:
{
  "detected_objects": ["perfume bottle", "flowers", "beach"],
  "dominant_colors": ["#FFB6C1", "#FFFFFF"],
  "mood": "romantic/fresh/elegant/energetic",
  "setting": "indoor/outdoor/studio",
  "scent_suggestions": ["floral", "aquatic"]
}"""
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                }
            ]
        }],
        response_format={"type": "json_object"}
    )
    
    import json
    return json.loads(response.choices[0].message.content)