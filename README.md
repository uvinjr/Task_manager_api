# Task Manager API

A RESTful Task Manager API built with **FastAPI, SQLite, and SQLAlchemy**. It supports user registration, secure login with JWT authentication, and task management with user-specific access control.

## Live Demo

**Live API Documentation:** [Task Manager API — Swagger UI](https://task-manager-api-1t8z.onrender.com/docs)

The API is deployed on Render. Use the interactive Swagger UI to explore and test the available endpoints, including user registration, JWT authentication, and task management.

**Note:** The free hosting instance may sleep after inactivity, so the first request can take longer. The current deployment uses SQLite without persistent disk storage, so database contents may not survive restarts or redeployments.

## Features

- **User Registration:** Create an account with a securely hashed password.
- **JWT Authentication:** Log in and receive an access token.
- **Create Tasks:** Add tasks for the authenticated user.
- **View Tasks:** List all tasks belonging to the logged-in user or retrieve an individual task.
- **Update Tasks:** Modify task titles and completion status.
- **Delete Tasks:** Delete tasks owned by the logged-in user.
- **Data Validation:** Validate task titles using Pydantic.
- **Interactive API Documentation:** Explore and test endpoints using Swagger UI.

## Technologies Used

- Python
- FastAPI
- SQLite
- SQLAlchemy
- Pydantic
- JWT (PyJWT)
- pwdlib with Argon2 password hashing

## Project Structure

```text
Task_manager_api/
├── main.py
├── models.py
├── database.py
├── schemas.py
├── requirements.txt
├── .gitignore
└── .env
```

The `.env` file contains the secret key used for JWT signing. It should remain local and must not be committed to GitHub.

## Setup and Installation

### 1. Clone the repository

```bash
git clone https://github.com/uvinjr/Task_manager_api.git
cd Task_manager_api
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the project root and add a strong, randomly generated secret:

```env
SECRET_KEY=your_generated_secret_key
```

Generate a secret locally using:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Replace the placeholder with the generated value. Never publish your real secret key.

### 5. Run the application

```bash
uvicorn main:app --reload
```

### 6. Open the API documentation

Visit:

http://127.0.0.1:8000/docs

Use Swagger UI to register, log in, authorize requests, and test the endpoints.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Register a new user |
| POST | `/login` | Authenticate and obtain a JWT |
| POST | `/tasks` | Create a task |
| GET | `/tasks` | List the current user's tasks |
| GET | `/tasks/{task_id}` | Retrieve a task |
| PUT | `/tasks/{task_id}` | Update a task |
| DELETE | `/tasks/{task_id}` | Delete a task |

Task endpoints require authentication. Users can access and modify only their own tasks.

## Validation

Task titles must contain between **1 and 100 characters**. Invalid input is rejected with a validation error.

## Database

The application uses SQLite for persistent storage and SQLAlchemy as its ORM. The database file is created locally when the application initializes.

## Learning Outcomes

This project demonstrates practical experience with REST API development, database integration, password hashing, JWT authentication, authorization, request validation, and API testing.

## Future Improvements

- Automated tests using Pytest
- Pagination and filtering
- Improved API error handling

## Author

**Uvin**

GitHub: https://github.com/uvinjr