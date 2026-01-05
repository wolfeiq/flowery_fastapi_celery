from fastapi import APIRouter, WebSocket, Depends
from .manager import manager

router = APIRouter()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()  # keep alive
    except Exception:
        manager.disconnect(user_id, websocket)
