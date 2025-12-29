from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, memories, query, spotify

#from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

#Will deploy with nginx + SSL certificate -> with Docker

app = FastAPI(title="Scent Memory API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#if settings.ENVIRONMENT == "production":
    #app.add_middleware(HTTPSRedirectMiddleware)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(memories.router, prefix="/api/memories", tags=["memories"])
app.include_router(query.router, prefix="/api/query", tags=["query"])
app.include_router(spotify.router, prefix="/api/spotify", tags=["spotify"])

@app.get("/")
def root():
    return {"message": "Scent Memory API v0.1"}