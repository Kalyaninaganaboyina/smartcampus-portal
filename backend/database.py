from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,declarative_base
from dotenv import load_dotenv
import os
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
DATABASE_URL=os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("sqlite"):
    engine=create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine=create_engine(DATABASE_URL)
 

SessionLocal=sessionmaker(autocommit =False,autoflush=False,bind=engine)
def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()
Base = declarative_base()