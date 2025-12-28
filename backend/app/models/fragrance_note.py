from sqlalchemy import Table, Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base

fragrance_notes = Table(
    'fragrance_notes',
    Base.metadata,
    Column('fragrance_id', UUID(as_uuid=True), ForeignKey('fragrances.id', ondelete="CASCADE")),
    Column('note_id', UUID(as_uuid=True), ForeignKey('notes.id', ondelete="CASCADE")),
    Column('position', String(20))  
)
