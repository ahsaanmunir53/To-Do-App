const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const lastUpdated = document.getElementById("last-updated");

inputBox.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        addTask();
    }
});

function addTask() {
    if (inputBox.value === '') {
        alert("You must write something!");
    } else {
        let li = document.createElement("li");
        li.innerHTML = inputBox.value;
        listContainer.appendChild(li);

        let span = document.createElement("span");
        span.innerHTML = "\u00d7";
        li.appendChild(span);
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
    } else if (e.target.tagName === "SPAN") {
        e.target.parentElement.remove();
        updateLastUpdated();
    }
    saveTasks();
}, false);

function saveTasks() {
    localStorage.setItem("tasks", listContainer.innerHTML);
    localStorage.setItem("lastUpdated", lastUpdated.textContent);
}

function loadTasks() {
    listContainer.innerHTML = localStorage.getItem("tasks");
    lastUpdated.textContent = localStorage.getItem("lastUpdated") || "Never";
}
loadTasks();