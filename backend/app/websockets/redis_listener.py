import asyncio
import json
import redis.asyncio as redis
from .manager import manager
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

async def redis_listener(): #Redis pubsub -> Websocket connections

    try:
        r = await redis.from_url(settings.REDIS_URL)
        pubsub = r.pubsub()
        await pubsub.subscribe("memory_events")

        while True:
            try:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message and message["type"] == "message":
                    
                    payload = json.loads(message["data"])
                    user_id = payload.get("user_id")

                    await manager.send_to_user(user_id, payload)
                    
                await asyncio.sleep(0.01)
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON: {e}")
            except Exception as e:
                logger.error(f"Error: {e}")
                
    except Exception:
        await asyncio.sleep(5)
        await redis_listener()