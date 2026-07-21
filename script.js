const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const lastUpdated = document.getElementById("last-updated");

const STORAGE_KEY = "tasks";
const STAMP_KEY = "lastUpdated";

let tasks = [];
let editingIndex = null;

inputBox.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        addTask();
    }
});

/* ---------------- actions ---------------- */

function addTask() {
    const text = inputBox.value.trim();

    if (text === "") {
        alert("You must write something!");
        return;
    }

    tasks.push({ text: text, checked: false });
    inputBox.value = "";
    updateLastUpdated();
    saveTasks();
    renderTasks();
}

function toggleTask(index) {
    tasks[index].checked = !tasks[index].checked;
    updateLastUpdated();
    saveTasks();
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    if (editingIndex === index) editingIndex = null;
    updateLastUpdated();
    saveTasks();
    renderTasks();
}

function startEdit(index) {
    editingIndex = index;
    renderTasks();
}

function saveEdit(index, newText) {
    const text = newText.trim();

    if (text === "") {
        alert("You must write something!");
        return;
    }

    tasks[index].text = text;
    editingIndex = null;
    updateLastUpdated();
    saveTasks();
    renderTasks();
}

function cancelEdit() {
    editingIndex = null;
    renderTasks();
}

function updateLastUpdated() {
    const now = new Date();
    lastUpdated.textContent = now.toLocaleString();
}

/* ---------------- rendering ---------------- */

function renderTasks() {
    listContainer.textContent = "";

    tasks.forEach(function(task, index) {
        const li = document.createElement("li");
        if (task.checked) li.classList.add("checked");

        if (index === editingIndex) {
            li.classList.add("editing");
            li.appendChild(buildEditor(task, index));
        } else {
            const text = document.createElement("span");
            text.className = "task-text";
            text.textContent = task.text;
            li.appendChild(text);

            li.appendChild(buildButton("edit", "\u270E", "Edit task", function() {
                startEdit(index);
            }));

            li.appendChild(buildButton("remove", "\u00D7", "Delete task", function() {
                deleteTask(index);
            }));
        }

        listContainer.appendChild(li);
    });
}

function buildEditor(task, index) {
    const wrap = document.createElement("div");
    wrap.className = "edit-row";

    const field = document.createElement("input");
    field.type = "text";
    field.className = "edit-input";
    field.value = task.text;
    field.setAttribute("aria-label", "Edit task");

    let settled = false;

    function commit() {
        if (settled) return;
        settled = true;
        saveEdit(index, field.value);
        if (editingIndex === index) settled = false; // save was rejected, stay open
    }

    field.addEventListener("keydown", function(e) {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") { settled = true; cancelEdit(); }
    });

    const save = buildButton("save", "\u2713", "Save changes", commit);
    const cancel = buildButton("cancel", "\u21A9", "Cancel editing", function() {
        settled = true;
        cancelEdit();
    });

    wrap.appendChild(field);
    wrap.appendChild(save);
    wrap.appendChild(cancel);

    // focus after the row is in the DOM
    setTimeout(function() {
        field.focus();
        field.setSelectionRange(field.value.length, field.value.length);
    }, 0);

    return wrap;
}

function buildButton(name, glyph, label, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "task-btn " + name;
    btn.textContent = glyph;
    btn.title = label;
    btn.setAttribute("aria-label", label);
    btn.addEventListener("click", function(e) {
        e.stopPropagation();
        onClick();
    });
    return btn;
}

/* ---------------- events ---------------- */

listContainer.addEventListener("click", function(e) {
    if (e.target.closest(".task-btn") || e.target.closest(".edit-row")) return;

    const li = e.target.closest("li");
    if (!li) return;

    const index = Array.prototype.indexOf.call(listContainer.children, li);
    if (index > -1 && index !== editingIndex) toggleTask(index);
});

/* ---------------- storage ---------------- */

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    localStorage.setItem(STAMP_KEY, lastUpdated.textContent);
}

function loadTasks() {
    const raw = localStorage.getItem(STORAGE_KEY);
    lastUpdated.textContent = localStorage.getItem(STAMP_KEY) || "Never";

    if (!raw) {
        tasks = [];
        renderTasks();
        return;
    }

    try {
        const parsed = JSON.parse(raw);
        tasks = Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        // Tasks saved by the old version were stored as raw HTML — bring them across.
        tasks = migrateOldTasks(raw);
        saveTasks();
    }

    renderTasks();
}

function migrateOldTasks(html) {
    const holder = document.createElement("ul");
    holder.innerHTML = html;

    return Array.prototype.map.call(holder.querySelectorAll("li"), function(li) {
        const copy = li.cloneNode(true);
        Array.prototype.forEach.call(copy.querySelectorAll("span"), function(s) {
            s.remove();
        });
        return {
            text: copy.textContent.trim(),
            checked: li.classList.contains("checked")
        };
    }).filter(function(task) {
        return task.text !== "";
    });
}

loadTasks();
