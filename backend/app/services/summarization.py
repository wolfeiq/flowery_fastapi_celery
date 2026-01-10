from openai import OpenAI
from ..core.config import settings
import logging

logger = logging.getLogger(__name__)
client = OpenAI(api_key=settings.OPENAI_API_KEY)

SUMMARY_SYSTEM_PROMPT = """You are an expert at creating concise, evocative summaries of scent memories.

Guidelines:
- Create ONE sentence summary (max 100 words)
- Focus on key sensory details, emotions, and context
- Mention the media type (image/pdf/text) naturally
- Make it vivid and memorable
- Use descriptive language

Return ONLY the summary text, no preamble."""

def generate_summary(content: str, user_context: str = "") -> str:
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": SUMMARY_SYSTEM_PROMPT  # Now cacheable!
                },
                {
                    "role": "user",
                    "content": f"""
{f"Context: {user_context}" if user_context else ""}

Content to summarize:
{content[:2000]}
"""
                }
            ],
            max_tokens=100,
            temperature=0.7
        )
        
        summary = response.choices[0].message.content.strip()
        logger.info(f"Generated summary: {summary[:50]}...")
        return summary
        
    except Exception as e:
        logger.error(f"Summary generation failed: {e}", exc_info=True)
        
        fallback = content[:200].strip()
        if len(content) > 200: 
            last_period = fallback.rfind('.')
            if last_period > 100:
                fallback = fallback[:last_period + 1]
            else:
                fallback += "..."
        
        logger.warning(f"Using fallback summary: {fallback[:50]}...")
        return fallback