from fastapi import FastAPI

app = FastAPI()

tasks = []  # temporary in-memory storage, just a Python list for now

@app.get("/tasks")
def get_tasks():
    return tasks

@app.post("/tasks")
def create_task(title: str):
    task = {"id": len(tasks) + 1, "title": title, "done": False}
    tasks.append(task)
    return task