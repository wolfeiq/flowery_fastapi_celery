# Flowery

Flowery recommends perfumes by learning from a user’s personal scent memories and contextual behavior.
Instead of asking users to describe their taste upfront, the system builds preference understanding over time through memories, queries, and feedback.

build in public @portable_writer on X

## How Flowery Works

- A **User** owns memories and preferences
- Each **ScentMemory** represents one uploaded experience (image, text, PDF, audio)
- Memories are split into **MemoryChunks** for vector-based retrieval
- Memories and chunks generate **ExtractedScents**, which update the user’s **ScentProfile**
- User queries generate **QueryLogs**, which may create **Recommendations** and **TrainingExamples**
- **Fragrance** and **FragranceNote** form a global scent taxonomy
- **ImageAnalysis** enriches memories with visual context
- **FineTuningJob** tracks ML fine-tuning over accumulated training data


## User Workflow

1. User uploads a memory
2. `ScentMemory` is created
3. Background processing:
   - Image analysis
   - Text enhancement
   - Chunking
   - Embedding
   - Scent extraction
4. User submits a query
5. Relevant chunks and profile data are retrieved
6. LLM generates recommendations
7. User feedback updates analytics and training data
8. Periodic fine-tuning improves personalization


## Next Steps

- Build FastAPI endpoints (auth, upload, query)
- Add Celery tasks for document processing
- Integrate a vector database (Pinecone or ChromaDB)
- Connect LLM providers (OpenAI)
- Automate fine-tuning and deployment


## Deadline
01.01.2026


## Model Logic

### Core Identity

#### User
**Purpose**
- Account ownership and authentication

**Fields**
- Email
- Hashed password
- Name
- Timestamps

**Relationships**
- One-to-many: `ScentMemory`
- One-to-one: `ScentProfile`
- One-to-many: `QueryLog`
- Many-to-many: `Fragrance` (via `UserFragrance`)

**Logic**
- Central entity; all data belongs to a user directly or indirectly


#### ScentProfile
**Purpose**
- Learned representation of user preferences

**Fields**
- Preferred scent families
- Disliked notes
- Intensity preference
- Budget range
- Aggregated analytics

**Relationships**
- One-to-one: `User`

**Logic**
- Updated continuously from memories and queries
- Used as context during recommendation generation


## Content Storage

#### ScentMemory
**Purpose**
- User-uploaded memories and documents

**Fields**
- Title
- Content
- Memory type
- Occasion, emotion, location, season
- File metadata
- Processing status

**Relationships**
- Belongs to: `User`
- One-to-many: `MemoryChunk`
- One-to-one: `ImageAnalysis`
- One-to-many: `ExtractedScent`

**Logic**
- Raw input that is processed into structured, searchable data


#### MemoryChunk
**Purpose**
- Retrieval units for RAG and vector search

**Fields**
- Content
- Chunk index
- Vector ID
- Embedding model

**Relationships**
- Belongs to: `ScentMemory`

**Logic**
- Memories are split into small chunks and embedded individually


#### ImageAnalysis
**Purpose**
- Vision AI enrichment for image memories

**Fields**
- Detected objects
- Colors
- Mood
- Setting
- Confidence score

**Relationships**
- One-to-one: `ScentMemory`

**Logic**
- Adds visual context that improves scent extraction and retrieval

#### ExtractedScent
**Purpose**
- Scents detected within memories

**Fields**
- Scent name
- Brand (optional)
- Notes
- Confidence score
- Source

**Relationships**
- Belongs to: `ScentMemory`
- Optional link to: `Fragrance`

**Logic**
- Bridges user descriptions to structured scent data


## Fragrance Catalog

#### Fragrance
**Purpose**
- Master perfume database

**Fields**
- Name
- Brand
- Notes (top, middle, base)
- Family
- Intensity
- Price
- Vector ID

**Relationships**
- Many-to-many: `FragranceNote`
- Many-to-many: `User` (via `UserFragrance`)
- One-to-many: `ExtractedScent`
- One-to-many: `Recommendation`

**Logic**
- Represents products recommended to users


#### FragranceNote
**Purpose**
- Scent taxonomy (e.g. rose, vanilla, bergamot)

**Fields**
- Name
- Category
- Synonyms

**Relationships**
- Many-to-many: `Fragrance`

**Logic**
- Shared vocabulary for filtering and matching


#### UserFragrance
**Purpose**
- User’s personal collection and wishlist

**Fields**
- Owned
- Wishlist
- Rating
- Personal notes

**Relationships**
- Belongs to: `User`
- Belongs to: `Fragrance`

**Logic**
- Prevents duplicate recommendations
- Improves personalization


## Query & Recommendation

#### QueryLog
**Purpose**
- Track user queries for analytics and training

**Fields**
- Query text
- Retrieved chunks
- LLM response
- Model version
- Rating
- Token usage

**Relationships**
- Belongs to: `User`
- One-to-many: `Recommendation`

**Logic**
- High-quality queries become training data


#### Recommendation
**Purpose**
- Individual perfume suggestions

**Fields**
- Rank
- Score
- Reasoning
- Clicked
- Liked
- Purchased

**Relationships**
- Belongs to: `QueryLog`
- Belongs to: `Fragrance`

**Logic**
- Tracks user engagement to improve recommendations


## Machine Learning

#### TrainingExample
**Purpose**
- Prompt/completion pairs for fine-tuning

**Fields**
- Prompt
- Completion
- Quality score
- Source
- Included-in-training flag

**Relationships**
- Optional link to: `User`
- Belongs to: `FineTuningJob`

**Logic**
- Derived from high-quality QueryLogs


#### FineTuningJob
**Purpose**
- Track fine-tuning operations

**Fields**
- Model name
- OpenAI job ID
- Status
- Metrics
- Cost
- Timestamps

**Relationships**
- One-to-many: `TrainingExample`

**Logic**
- Monitors training and stores deployed model references