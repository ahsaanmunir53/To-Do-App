const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const lastUpdated = document.getElementById("last-updated");

inputBox.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        addTask();
    }
});

function addTask() {
    if (inputBox.value === "") {
        alert("You must write something!");
    } else {
        let li = document.createElement("li");
        li.appendChild(document.createTextNode(inputBox.value));
        listContainer.appendChild(li);

        let edit = document.createElement("button");
        edit.innerHTML = "✎";
        edit.className = "edit-btn";
        li.appendChild(edit);

        let span = document.createElement("span");
        span.innerHTML = "🗑";
        li.appendChild(span);

        updateLastUpdated();
    }

    inputBox.value = "";
    saveTasks();
}

function updateLastUpdated() {
    const now = new Date();
    lastUpdated.textContent = now.toLocaleString();
}

listContainer.addEventListener("click", function(e) {

    if (e.target.tagName === "LI") {
        e.target.classList.toggle("checked");
        updateLastUpdated();
    } else if (e.target.tagName === "SPAN") {
        e.target.parentElement.remove();
        updateLastUpdated();
    } else if (e.target.classList.contains("edit-btn")) {

        let li = e.target.parentElement;

        let newTask = prompt("Edit Task", li.firstChild.textContent);

        if (newTask !== null && newTask.trim() !== "") {
            li.firstChild.textContent = newTask;
            updateLastUpdated();
        }
    }

    saveTasks();

}, false);

function saveTasks() {
    localStorage.setItem("tasks", listContainer.innerHTML);
    localStorage.setItem("lastUpdated", lastUpdated.textContent);
}

function loadTasks() {
    listContainer.innerHTML = localStorage.getItem("tasks") || "";
    lastUpdated.textContent = localStorage.getItem("lastUpdated") || "Never";
}

loadTasks();