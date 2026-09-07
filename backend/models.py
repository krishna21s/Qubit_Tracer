from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    # Profile fields
    bio = Column(Text, nullable=True)
    organization = Column(String, nullable=True)
    role = Column(String, nullable=True)
    location = Column(String, nullable=True)

    circuits = relationship("Circuit", back_populates="owner")

class Circuit(Base):
    __tablename__ = "circuits"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    # Store the JSON string of the circuit state (gates, qubits, etc.)
    data = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # Collaboration fields
    is_public = Column(Boolean, default=False)
    access_level = Column(String, default="view")  # "view" or "edit"

    owner = relationship("User", back_populates="circuits")

