# Task Manager API

A full-stack Task Manager application that allows users to create an account, securely log in, and manage their daily tasks through a web interface.

## Live Demo

- **Frontend:** https://task-manager-frontend-86yh.onrender.com/
- **API Documentation:** https://task-manager-api-1t8z.onrender.com/docs

## Features

- User registration and login
- Password hashing for secure authentication
- JWT-based authentication
- Create, view, update, and delete tasks
- User-specific task management
- RESTful API built with FastAPI
- Responsive web interface

## Technologies Used

**Backend**
- Python
- FastAPI
- SQLAlchemy
- SQLite
- JWT authentication
- Pydantic

**Frontend**
- HTML
- CSS
- JavaScript

**Tools & Deployment**
- Git and GitHub
- Render

## Project Structure

```text
Task_manager_api/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── main.py
├── database.py
├── models.py
├── schemas.py
├── requirements.txt
└── README.md
```

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/uvinjr/Task_manager_api.git
cd Task_manager_api
```

### 2. Create and activate a virtual environment

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the backend

```bash
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

### 5. Open the frontend

Open `frontend/index.html` using VS Code Live Server. For local development, configure the frontend API URL to `http://127.0.0.1:8000`.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/signup` | Register a user |
| POST | `/login` | Log in |
| GET | `/tasks` | Retrieve tasks |
| POST | `/tasks` | Create a task |
| PUT/PATCH | `/tasks/{task_id}` | Update a task |
| DELETE | `/tasks/{task_id}` | Delete a task |

See the interactive API documentation for request formats, authentication requirements, and available operations.

## Future Improvements

- Task deadlines and reminders
- Task priorities and categories
- Persistent production database
- Improved task filtering and search
