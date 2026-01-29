import logging
from typing import Optional

import jwt
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from jwt.exceptions import InvalidTokenError

from ..core.config import settings
from .manager import manager


logger = logging.getLogger(__name__)
router = APIRouter()


def verify_websocket_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(
            token,
            settings.AUTH_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id: Optional[str] = payload.get("sub")
        return user_id
    except InvalidTokenError as e:
        logger.warning(f"Invalid WebSocket token: {e}")
        return None


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: str,
    token: Optional[str] = Query(None)
):
    if not token:
        await websocket.close(code=4001, reason="Authentication required")
        return

    verified_user_id = verify_websocket_token(token)

    if not verified_user_id:
        await websocket.close(code=4001, reason="Invalid token")
        return

    if verified_user_id != user_id:
        await websocket.close(code=4003, reason="User ID mismatch")
        return

    await manager.connect(user_id, websocket)
    logger.info(f"WebSocket connected for user {user_id}")

    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
        logger.info(f"WebSocket disconnected for user {user_id}")
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(user_id, websocket)
