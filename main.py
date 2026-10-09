from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session

import models
from database import engine, SessionLocal

from pydantic import BaseModel
from pwdlib import PasswordHash

from datetime import datetime, timedelta, timezone
import jwt


import os
from dotenv import load_dotenv

load_dotenv()



app = FastAPI()
models.Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



password_hash = PasswordHash.recommended()


class UserCreate(BaseModel):
    username: str
    password: str


@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(
        models.User.username == user.username
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    new_user = models.User(
        username=user.username,
        hashed_password=password_hash.hash(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "username": new_user.username,
        "message": "User registered successfully"
    }

@app.get("/tasks")
def get_tasks():
    return tasks

@app.post("/tasks")
def create_task(title: str, db: Session = Depends(get_db)):
    new_task = models.Task(title=title, done=False)

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task

@app.get("/tasks/{task_id}")
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    return task

@app.put("/tasks/{task_id}")
def update_task(
    task_id: int,
    title: str = None,
    done: bool = None,
    db: Session = Depends(get_db)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    if title is not None:
        task.title = title

    if done is not None:
        task.done = done

    db.commit()
    db.refresh(task)

    return task


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {"message": "Task deleted"}




SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is missing. Check your .env file.")


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


@app.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(
        models.User.username == user.username
    ).first()

    if not existing_user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not password_hash.verify(user.password, existing_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    token = jwt.encode(
        {"sub": existing_user.username, "exp": expire},
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }