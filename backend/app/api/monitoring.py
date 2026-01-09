from fastapi import APIRouter, HTTPException
import requests

router = APIRouter()

@router.get("/monitoring/flower/health")
async def check_flower_health():
    try:
        response = requests.get("http://localhost:5555/api/workers", timeout=5)
        if response.status_code == 200:
            return {"status": "healthy", "workers": response.json()}
        else:
            raise HTTPException(503, "Flower unhealthy")
    except Exception as e:
        raise HTTPException(503, f"Flower not accessible: {str(e)}")