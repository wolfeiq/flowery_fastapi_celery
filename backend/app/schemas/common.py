from datetime import datetime
from typing import TypedDict, Optional, Literal
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum

class ScentData(TypedDict, total=False):
    description: str
    brand: str
    scent_name: str
    top_notes: list[str]
    heart_notes: list[str]
    base_notes: list[str]
    color: str
    emotion: str
    scent_family: str


class VisionAnalysisResult(TypedDict, total=False):
    image_description: str
    brand: str
    scent_name: str
    top_notes: list[str]
    heart_notes: list[str]
    base_notes: list[str]
    color: str
    emotion: str
    scent_family: str


class FileDataType(Enum):
    BASE64 = "base64"
    TEMP_FILE = "temp_file"


class FileData(TypedDict, total=False):
    type: str  
    data: str  
    path: str  
    content_type: str
    extension: str


class EmbeddingMetadata(TypedDict):
    user_id: str
    memory_id: str


class VectorSearchResult(TypedDict):
    ids: list[list[str]]
    distances: list[list[float]]
    metadatas: list[list[dict[str, str]]]
    documents: list[list[str]]

class CacheMetadata(TypedDict):
    query: str
    context_preview: str
    timestamp: str
    cache_key: str


class CacheStats(TypedDict):
    cached_recommendations: int
    metadata_entries: int
    user_id: str


class CacheStatsError(TypedDict):
    error: str

class WebSocketMessage(TypedDict, total=False):
    user_id: str
    event: str
    memory_id: str
    error: str


class ExtractedScentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    scent_name: Optional[str] = None
    brand: Optional[str] = None
    scent_family: Optional[str] = None
    top_notes: list[str] = Field(default_factory=list)
    heart_notes: list[str] = Field(default_factory=list)
    base_notes: list[str] = Field(default_factory=list)
    color: Optional[str] = None
    emotion: Optional[str] = None
    description: Optional[str] = None
    confidence: float = 0.0


class MemoryUploadResponse(BaseModel):
    id: str
    title: str
    status: Literal["processing", "completed", "failed"] = "processing"


class MemoryListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    content: Optional[str] = None
    occasion: Optional[str] = None
    memory_type: str
    emotion: Optional[str] = None
    processed: bool = False
    created_at: datetime
    extracted_scents: Optional[list[ExtractedScentResponse]] = None


class MemoryDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    content: Optional[str] = None
    occasion: Optional[str] = None
    memory_type: str
    emotion: Optional[str] = None
    processed: bool = False
    extracted_scents: Optional[list[ExtractedScentResponse]] = None
    chunks_count: int = 0


class MemoryDeleteResponse(BaseModel):
    status: Literal["deleted"] = "deleted"
    id: str

class SearchResponse(BaseModel):
    query_id: str
    response: str
    sources: list[str] = Field(default_factory=list)
    cached: bool = False


class FeedbackResponse(BaseModel):
    status: Literal["feedback recorded"] = "feedback recorded"


class NoteCount(BaseModel):
    note: str
    count: int


class ProfileResponse(BaseModel):
    preferred_families: list[str] = Field(default_factory=list)
    disliked_notes: list[str] = Field(default_factory=list)
    emotional_preferences: list[str] = Field(default_factory=list)
    top_notes: list[NoteCount] = Field(default_factory=list)
    heart_notes: list[NoteCount] = Field(default_factory=list)
    base_notes: list[NoteCount] = Field(default_factory=list)
    intensity_preference: Optional[str] = None
    budget_range: Optional[str] = None
    total_memories: int = 0
    total_queries: int = 0
    total_extracted_scents: int = 0
    last_updated: Optional[str] = None
    message: Optional[str] = None 


class ProfileUpdateResponse(BaseModel):
    status: Literal["updated"] = "updated"

class RateLimitInfo(BaseModel):
    allowed: bool
    remaining: int
    used: int
    limit: int
    reset_at: Optional[str] = None


class RateLimitsResponse(BaseModel):
    uploads: RateLimitInfo
    queries: RateLimitInfo
    profile_updates: RateLimitInfo


class HealthResponse(BaseModel):
    status: Literal["healthy", "degraded", "unhealthy"]
    version: str = "0.1.0"
    environment: str


class HealthReadyResponse(BaseModel):
    status: Literal["ready", "not_ready"]
    checks: dict[str, bool]

class StatusResponse(BaseModel):
    status: str


class ErrorResponse(BaseModel):
    detail: str
