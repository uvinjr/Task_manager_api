from fastapi import FastAPI, HTTPException

app = FastAPI()

tasks = []

@app.get("/tasks")
def get_tasks():
    return tasks

@app.post("/tasks")
def create_task(title: str):
    task = {"id": len(tasks) + 1, "title": title, "done": False}
    tasks.append(task)
    return task

@app.get("/tasks/{task_id}")
def get_task(task_id: int):
    for task in tasks:
        if task["id"] == task_id:
            return task
    raise HTTPException(status_code=404, detail="Task not found")

@app.put("/tasks/{task_id}")
def update_task(task_id: int, title: str = None, done: bool = None):
    for task in tasks:
        if task["id"] == task_id:
            if title is not None:
                task["title"] = title
            if done is not None:
                task["done"] = done
            return task
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    for task in tasks:
        if task["id"] == task_id:
            tasks.remove(task)
            return {"message": "Task deleted"}
    raise HTTPException(status_code=404, detail="Task not found")