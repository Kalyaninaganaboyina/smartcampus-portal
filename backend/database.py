from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,declarative_base
from dotenv import load_dotenv
import os
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "smartcampus.db"))
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL or DATABASE_URL.startswith("sqlite"):
    DATABASE_URL = f"sqlite:///{db_path}"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            pass
    except Exception as e:
        print(f"Warning: Failed to connect to remote DATABASE_URL. Falling back to local SQLite: {e}")
        DATABASE_URL = f"sqlite:///{db_path}"
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
 

SessionLocal=sessionmaker(autocommit =False,autoflush=False,bind=engine)
def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()
Base = declarative_base()