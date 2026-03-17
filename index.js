// --------------------- Selectors ---------------------
//Selects the input element where the user types a new task.
//Stored in taskInput so we can read its value later.
const taskInput = document.getElementById("taskInput");


//Selects the <ul> (or container) element where all tasks will be displayed.
//Stored in taskLists for adding, editing, or removing tasks dynamically.
const taskLists = document.getElementById("taskLists");

//Selects the “Add Task” button element.
//Stored in addBtn to attach a click event to add a new task.
const addBtn = document.getElementById("addTaskbtn");

// --------------------- Event Listeners ---------------------
//Waits until the HTML is fully loaded before running loadTasks.
window.addEventListener("DOMContentLoaded", loadTasks);
//Ensures tasks from localStorage are displayed immediately when the page opens.

// ----------------------------------------------------------- ---------------------
//Adds a click event listener to the “Add” button.
addBtn.addEventListener("click", handleAddTask);
//When clicked, handleAddTask is called to create a new task.Adds a click event listener to the “Add” button.

// ----------------------------------------------------------- ---------------------

//Adds a single click event listener to the parent task container.
taskLists.addEventListener("click", handleTaskClick);
//Uses event delegation to handle clicks on Edit, Save, Complete, or Delete buttons dynamically.

// ----------------------------------------------------------- ---------------------

//Adds a listener for keyboard events in the input field.
taskInput.addEventListener("keypress", handleEnterKey);
//Detects if the user presses Enter to add a task quickly.

// ----------------------------------------------------------- --------------------


// --------------------- Task Handlers ---------------------



function handleAddTask() {
    //Reads the value typed by the user.
    const taskText = taskInput.value.trim();
    //.trim() removes extra spaces at start/end.

    //If the input is empty,
    if (!taskText) return;
    // the function exits (return) to prevent empty tasks.

    




//Creates a task object with three properties:
//id: unique identifier using current timestamp
//text: the task description
//completed: boolean to track completion
    const task = { id: Date.now(), text: taskText, completed: false };
    
    
    addTaskToDOM(task);// adds the task to the page visually.
    saveTask(task); //saves the task object to localStorage.

    taskInput.value = "";//Clears the input field after adding a task.
    taskInput.focus();//Brings focus back to the input so the user can type the next task.
}

function handleTaskClick(e) {
    const li = e.target.closest("li");
    //e.target is the clicked element (button, text, etc.).
    //closest("li") finds the parent <li> containing the task.

    //If no <li> is found, exit the function.
    if (!li) return;


    //Reads the task’s unique ID stored in data-id attribute.
    //Converted to Number because dataset values are strings.
    const taskId = Number(li.dataset.id);

    // Delete task
    //Checks if the clicked button has class clearBtn (Completed/Delete).
    //Removes the task <li> from the DOM.
    //Calls removeTask(taskId) to delete the task from localStorage.

    if (e.target.classList.contains("clearBtn")) {
        li.remove();
        removeTask(taskId);
        return; //return prevents further code from executing
    }

    // Edit task
    if (e.target.classList.contains("editBtn")) {//Checks if the clicked button is “Edit”.
        startEditing(li);//Calls startEditing(li) to convert the text into an editable input field.
        return;
    }

    // Save task
    if (e.target.classList.contains("saveBtn")) {//Checks if the clicked button is “Save”.
        saveEditing(li);//Calls saveEditing(li) to update the text and store changes in localStorage.
        return;
    }

    // Toggle completed
    if (e.target.classList.contains("taskText")) {//If the user clicks the task text, toggle a CSS class completed for strike-through.
        li.classList.toggle("completed");
        toggleCompleted(taskId);//Calls toggleCompleted(taskId) to update the task’s completion status in localStorage.
    }
}

function handleEnterKey(e) {
    if (e.key === "Enter") {//Detects the Enter key.



        if (e.target === taskInput) {//If pressed in the main input, it adds a task.
            addBtn.click();
        } else if (e.target.tagName === "INPUT") {//If pressed in an edit input, it saves the task.
            const li = e.target.closest("li");
            saveEditing(li);
        }
    }
}

// --------------------- Editing Functions ---------------------


function startEditing(li) {
    const span = li.querySelector(".taskText");
    const input = document.createElement("input");
    input.type = "text";
    input.value = span.textContent;

    li.insertBefore(input, li.querySelector("div"));
    li.removeChild(span);

    const btn = li.querySelector(".editBtn");
    btn.textContent = "Save";
    btn.classList.replace("editBtn", "saveBtn");//Changes the “Edit” button to “Save”.

    input.focus();//Focuses the input for immediate typing
}

function saveEditing(li) {
    const input = li.querySelector("input");
    if (!input) return;

    const span = document.createElement("span");
    span.className = "taskText";
    span.textContent = input.value;

    li.insertBefore(span, li.querySelector("div"));
    li.removeChild(input);

    const btn = li.querySelector(".saveBtn");
    btn.textContent = "Edit";
    btn.classList.replace("saveBtn", "editBtn");//Updates the “Save” button back to “Edit”.

    const taskId = Number(li.dataset.id);
    updateTask(taskId, input.value);//Calls updateTask(taskId, newText) to save changes in localStorage.
}

// --------------------- LocalStorage Functions ---------------------
function getTasks() {
    return JSON.parse(localStorage.getItem("tasks")) || [];//Reads tasks from localStorage.
                     //Returns an empty array if nothing is stored yet.
}

function saveTask(task) {
    const tasks = getTasks();
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));//Adds a new task to the existing array in localStorage.
}

function removeTask(id) {
    const tasks = getTasks().filter(task => task.id !== id);
    localStorage.setItem("tasks", JSON.stringify(tasks));//Removes a task by filtering out its id and updates localStorage.
}

function updateTask(id, newText) {
    const tasks = getTasks().map(task => 
        task.id === id ? { ...task, text: newText } : task
    );
    localStorage.setItem("tasks", JSON.stringify(tasks));//Updates the text of a task in localStorage based on its ID.
}

function toggleCompleted(id) {
    const tasks = getTasks().map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    localStorage.setItem("tasks", JSON.stringify(tasks));//Toggles the completed status of a task in localStorage.
}

// --------------------- DOM Rendering ---------------------
function loadTasks() {
    const tasks = getTasks();//Loads all tasks from localStorage when the page loads.

//Calls addTaskToDOM to render each task.
    tasks.forEach(addTaskToDOM);
}

function addTaskToDOM(task) {
    const li = document.createElement("li");//Creates an <li> element for each task.
    li.dataset.id = task.id;//Adds data-id for unique identification.
    li.className = task.completed ? "completed" : "";//Adds completed class if the task is marked complete.

    li.innerHTML = `
        <span class="taskText">${task.text}</span>
        <div>
            <button class="editBtn">Edit</button>
            <button class="clearBtn">Completed</button>
        </div>
    `;
    taskLists.appendChild(li);//Appends the task to the task list container.
}