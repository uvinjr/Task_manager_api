const TOKEN_KEY = 'daymark_access_token';
const USER_KEY = 'daymark_username';

const API_BASE_URL = 'https://task-manager-api-1t8z.onrender.com';

const elements = {
  authView: document.querySelector('#auth-view'),
  tasksView: document.querySelector('#tasks-view'),
  accountBar: document.querySelector('#account-bar'),
  accountName: document.querySelector('#account-name'),
  authForm: document.querySelector('#auth-form'),
  authMessage: document.querySelector('#auth-message'),
  authSubmit: document.querySelector('#auth-submit'),
  formHeading: document.querySelector('#form-heading'),
  formSubheading: document.querySelector('#form-subheading'),
  username: document.querySelector('#username'),
  password: document.querySelector('#password'),
  taskForm: document.querySelector('#task-form'),
  taskTitle: document.querySelector('#task-title'),
  taskList: document.querySelector('#task-list'),
  taskSummary: document.querySelector('#task-summary'),
  taskMessage: document.querySelector('#task-message'),
  completionNumber: document.querySelector('#completion-number'),
};

let authMode = 'login';
let taskFilter = 'all';
let tasks = [];

function showWorkspace(isSignedIn) {
  elements.authView.hidden = isSignedIn;
  elements.tasksView.hidden = !isSignedIn;
  elements.accountBar.hidden = !isSignedIn;
  elements.accountName.textContent = localStorage.getItem(USER_KEY) || '';
}

function setAuthMode(mode) {
  authMode = mode;
  const signingUp = mode === 'signup';
  document.querySelectorAll('.auth-tab').forEach((tab) => {
    const selected = tab.dataset.mode === mode;
    tab.classList.toggle('is-selected', selected);
    tab.setAttribute('aria-selected', String(selected));
  });
  elements.formHeading.textContent = signingUp ? 'Start fresh' : 'Welcome back';
  elements.formSubheading.textContent = signingUp
    ? 'Create an account to keep your tasks in one place.'
    : 'Pick up right where you left off.';
  elements.authSubmit.innerHTML = signingUp
    ? 'Create account <span aria-hidden="true">&rarr;</span>'
    : 'Sign in <span aria-hidden="true">&rarr;</span>';
  elements.password.autocomplete = signingUp ? 'new-password' : 'current-password';
  elements.authMessage.textContent = '';
}

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(options.headers || {});
  if (options.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
  ...options,
  headers
});
  if (response.status === 401 && token) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    showWorkspace(false);
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(', ')
      : detail || 'Something went wrong. Please try again.';
    throw new Error(message);
  }
  return data;
}

elements.authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  elements.authMessage.textContent = '';
  elements.authSubmit.disabled = true;
  const username = elements.username.value.trim();
  const password = elements.password.value;
  try {
    if (authMode === 'signup') {
      await apiRequest('/signup', { method: 'POST', body: JSON.stringify({ username, password }) });
      setAuthMode('login');
      elements.username.value = username;
      elements.authMessage.textContent = 'Account created. Sign in to continue.';
    } else {
      const result = await apiRequest('/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      localStorage.setItem(TOKEN_KEY, result.access_token);
      localStorage.setItem(USER_KEY, username);
      showWorkspace(true);
      await loadTasks();
    }
  } catch (error) {
    elements.authMessage.textContent = error.message;
  } finally {
    elements.authSubmit.disabled = false;
  }
});

document.querySelectorAll('.auth-tab').forEach((tab) => {
  tab.addEventListener('click', () => setAuthMode(tab.dataset.mode));
});

document.querySelector('#logout-button').addEventListener('click', () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  tasks = [];
  showWorkspace(false);
});

elements.taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = elements.taskTitle.value.trim();
  if (!title) return;
  elements.taskMessage.textContent = '';
  try {
    await apiRequest('/tasks', { method: 'POST', body: JSON.stringify({ title }) });
    elements.taskTitle.value = '';
    await loadTasks();
  } catch (error) {
    elements.taskMessage.textContent = error.message;
  }
});

document.querySelectorAll('.filter-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    taskFilter = tab.dataset.filter;
    document.querySelectorAll('.filter-tab').forEach((item) => {
      const selected = item === tab;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    renderTasks();
  });
});

elements.taskList.addEventListener('change', async (event) => {
  if (!event.target.matches('.task-check')) return;
  const task = tasks.find((item) => item.id === Number(event.target.dataset.id));
  if (!task) return;
  await updateTask(task.id, { done: event.target.checked });
});

elements.taskList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const taskId = Number(button.dataset.id);
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;

  if (button.dataset.action === 'edit') {
    const updatedTitle = window.prompt('Edit task', task.title);
    if (updatedTitle === null) return;
    const title = updatedTitle.trim();
    if (!title) {
      elements.taskMessage.textContent = 'A task title cannot be empty.';
      return;
    }
    if (title.length > 100) {
      elements.taskMessage.textContent = 'Task titles must be 100 characters or fewer.';
      return;
    }
    await updateTask(taskId, { title });
  }

  if (button.dataset.action === 'delete' && window.confirm(`Delete "${task.title}"?`)) {
    try {
      await apiRequest(`/tasks/${taskId}`, { method: 'DELETE' });
      await loadTasks();
    } catch (error) {
      elements.taskMessage.textContent = error.message;
    }
  }
});

async function updateTask(taskId, updates) {
  elements.taskMessage.textContent = '';
  try {
    await apiRequest(`/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(updates) });
    await loadTasks();
  } catch (error) {
    elements.taskMessage.textContent = error.message;
    await loadTasks();
  }
}

async function loadTasks() {
  elements.taskSummary.textContent = 'Loading your tasks...';
  try {
    tasks = await apiRequest('/tasks');
    renderTasks();
  } catch (error) {
    elements.taskSummary.textContent = error.message;
    elements.taskList.replaceChildren();
  }
}

function renderTasks() {
  const completedCount = tasks.filter((task) => task.done).length;
  const visibleTasks = tasks.filter((task) => {
    if (taskFilter === 'active') return !task.done;
    if (taskFilter === 'done') return task.done;
    return true;
  });
  elements.completionNumber.textContent = String(completedCount);
  elements.taskSummary.textContent = `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} · ${completedCount} completed`;
  elements.taskList.replaceChildren();

  if (visibleTasks.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = tasks.length === 0 ? 'Nothing on the list yet. Add your first task above.' : 'No tasks in this view.';
    elements.taskList.append(empty);
    return;
  }

  for (const task of visibleTasks) {
    const row = document.createElement('div');
    row.className = `task-row${task.done ? ' is-done' : ''}`;
    const checkbox = document.createElement('input');
    checkbox.className = 'task-check';
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.dataset.id = String(task.id);
    checkbox.setAttribute('aria-label', `${task.done ? 'Mark active' : 'Complete'}: ${task.title}`);

    const title = document.createElement('span');
    title.className = 'task-title';
    title.textContent = task.title;

    const actions = document.createElement('div');
    actions.className = 'task-actions';
    actions.append(
      makeActionButton('edit', task.id, 'Edit'),
      makeActionButton('delete', task.id, 'Delete', 'delete'),
    );
    row.append(checkbox, title, actions);
    elements.taskList.append(row);
  }
}

function makeActionButton(action, taskId, label, className = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `task-action ${className}`.trim();
  button.dataset.action = action;
  button.dataset.id = String(taskId);
  button.textContent = label;
  return button;
}

if (localStorage.getItem(TOKEN_KEY)) {
  showWorkspace(true);
  loadTasks();
} else {
  showWorkspace(false);
}