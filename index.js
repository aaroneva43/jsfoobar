// This assumes you have a way to import or access the Zustand store
import store from './store.js';

const element = document.createElement('div');
element.innerHTML = `
<h1>Zustand Todo List</h1>
<input id="addTaskInput" type="text" />
<button id="addTaskButton">Add Task</button>
<ul id="tasksList"></ul>
`;
document.body.appendChild(element);

const addTaskInput = document.getElementById('addTaskInput');
const addTaskButton = document.getElementById('addTaskButton');
const tasksList = document.getElementById('tasksList');

addTaskButton.addEventListener('click', () => {
  const task = {
    id: Math.random(), // Simple ID for example purposes
    text: addTaskInput.value,
    completed: false,
  };
  store.getState().addTask(task);
  addTaskInput.value = ''; // Clear input field
  updateTasksList();
});

function updateTasksList() {
  const tasks = store.getState().tasks;
  tasksList.innerHTML = ''; // Clear current tasks
  tasks.forEach((task) => {
    const taskElement = document.createElement('li');
    taskElement.textContent = task.text;
    taskElement.style.textDecoration = task.completed ? 'line-through' : 'none';
    taskElement.addEventListener('click', () => {
      store.getState().toggleTask(task.id);
      updateTasksList();
    });
    tasksList.appendChild(taskElement);
  });
}

// Initial list update
updateTasksList();
