from app.database import SessionLocal
from app.models import User, ScentMemory, MemoryType

db = SessionLocal()

user = User(email="test4@test.com", hashed_password="hash123", full_name="Test User 4")
db.add(user)
db.commit()


memory = ScentMemory(
    user_id=user.id,
    title="Wedding Day",
    content="Wore rose perfume",
    memory_type=MemoryType.TEXT
)
db.add(memory)
db.commit()


print(f"User has {len(user.memories)} memories")
print(f"Memory belongs to: {memory.user.email}")

db.close()