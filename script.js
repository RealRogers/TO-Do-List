// Espera a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", () => {
    // Selecciona elementos del DOM para interactuar con ellos
    const taskForm = document.getElementById("task-form");
    const taskInput = document.getElementById("task-input");
    const categorySelect = document.getElementById("category-select");
    const prioritySelect = document.getElementById("priority-select");
    const dueDateInput = document.getElementById("due-date-input");
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const taskList = document.getElementById("task-list");
  
    // Carga las tareas desde localStorage o inicializa un array vacío
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    // Determina si el modo oscuro está activo
    let isDarkMode = localStorage.getItem("isDarkMode") === "true";
  
    // Función para guardar tareas en localStorage
    function saveTasks() {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  
    // Función para renderizar tareas en la lista
    function renderTasks(filteredTasks = tasks) {
      taskList.innerHTML = ""; // Limpia la lista antes de renderizar
      filteredTasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.className = `task-item ${task.completed ? "completed" : ""} ${
          isDarkMode ? "dark-mode" : ""
        }`;
        li.draggable = true; // Hace que las tareas sean arrastrables
        li.dataset.index = index; // Guarda el índice de la tarea
        li.innerHTML = `
          <span class="task-checkbox" data-index="${index}">
            <i data-lucide="${task.completed ? "check-square" : "square"}"></i>
          </span>
          <span class="task-text">${task.text}</span>
          <span class="task-category">${task.category}</span>
          <span class="task-priority">${task.priority}</span>
          <span class="task-due-date">${task.dueDate}</span>
          <button class="delete-button" data-index="${index}">
            <i data-lucide="trash-2"></i>
          </button>
        `;
        taskList.appendChild(li); // Agrega la tarea a la lista
      });
      lucide.createIcons(); // Renderiza los iconos de Lucide
    }
  
    // Función para manejar el inicio del arrastre
    function handleDragStart(e) {
      e.dataTransfer.setData("text/plain", e.target.dataset.index);
      e.target.classList.add("dragging");
    }
  
    // Función para manejar el final del arrastre
    function handleDragEnd(e) {
      e.target.classList.remove("dragging");
    }
  
    // Función para manejar el evento dragover
    function handleDragOver(e) {
      e.preventDefault();
      const afterElement = getDragAfterElement(taskList, e.clientY);
      const draggable = document.querySelector(".dragging");
      if (afterElement == null) {
        taskList.appendChild(draggable);
      } else {
        taskList.insertBefore(draggable, afterElement);
      }
    }
  
    // Función para determinar el elemento después del cual se debe soltar
    function getDragAfterElement(container, y) {
      const draggableElements = [
        ...container.querySelectorAll(".task-item:not(.dragging)"),
      ];
      return draggableElements.reduce(
        (closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = y - box.top - box.height / 2;
          if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
          } else {
            return closest;
          }
        },
        { offset: Number.NEGATIVE_INFINITY }
      ).element;
    }
  
   
    // Evento para agregar una nueva tarea
    taskForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Evita que el formulario se envíe
      const taskText = taskInput.value.trim();
      const taskCategory = categorySelect.value;
      const taskPriority = prioritySelect.value;
      const taskDueDate = dueDateInput.value;
      if (taskText) {
        tasks.push({
          text: taskText,
          category: taskCategory,
          priority: taskPriority,
          dueDate: taskDueDate,
          completed: false,
        });
        saveTasks(); // Guarda las tareas en localStorage
        renderTasks(); // Renderiza las tareas actualizadas
        updateProductivityStats(); // Actualiza las estadísticas de productividad
        taskInput.value = ""; // Limpia el campo de texto
        dueDateInput.value = ""; // Limpia el campo de fecha
      }
    });
  
    // Evento para manejar la lista de tareas
    taskList.addEventListener("click", (e) => {
      if (e.target.closest(".task-checkbox")) {
        const index = e.target.closest(".task-checkbox").dataset.index;
        tasks[index].completed = !tasks[index].completed;
        saveTasks(); // Guarda las tareas actualizadas
        renderTasks(); // Renderiza las tareas actualizadas
        updateProductivityStats(); // Actualiza las estadísticas de productividad
      } else if (e.target.closest(".delete-button")) {
        const index = e.target.closest(".delete-button").dataset.index;
        tasks.splice(index, 1);
        saveTasks(); // Guarda las tareas actualizadas
        renderTasks(); // Renderiza las tareas actualizadas
        updateProductivityStats(); // Actualiza las estadísticas de productividad
      }
    });
  
    // Evento para buscar tareas
    searchButton.addEventListener("click", () => {
      const searchTerm = searchInput.value.trim().toLowerCase();
      const filteredTasks = tasks.filter((task) =>
        task.text.toLowerCase().includes(searchTerm)
      );
      renderTasks(filteredTasks); // Renderiza las tareas filtradas
      updateProductivityStats(); // Actualiza las estadísticas de productividad
    });
  
    
  
    // Función para manejar recordatorios
    function checkReminders() {
      const now = new Date();
      tasks.forEach((task, index) => {
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          const timeDiff = dueDate - now;
          if (timeDiff > 0 && timeDiff <= 3600000) {
            alert(`Reminder: Task "${task.text}" is due soon!`);
          }
        }
      });
    }
  
    // Verificar recordatorios cada minuto
    setInterval(checkReminders, 60000);
  
    // Configurar arrastrar y soltar
    taskList.addEventListener("dragstart", handleDragStart);
    taskList.addEventListener("dragend", handleDragEnd);
    taskList.addEventListener("dragover", handleDragOver);
  
    // Función para actualizar las estadísticas de productividad
    function updateProductivityStats() {
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((task) => task.completed).length;
      const pendingTasks = totalTasks - completedTasks;
  
      document.getElementById("total-tasks").textContent = totalTasks;
      document.getElementById("completed-tasks").textContent = completedTasks;
      document.getElementById("pending-tasks").textContent = pendingTasks;
    }
  
    // Actualizar estadísticas de productividad al cargar la página y al agregar/completar/eliminar tareas
    updateProductivityStats();
  
    // Función para tomar screenshot de la lista de tareas completadas
    function takeScreenshot() {
      const completedTasks = document.querySelectorAll(".task-item.completed");
      if (completedTasks.length === 0) {
        alert("No completed tasks to screenshot.");
        return;
      }
  
      const tempElement = document.createElement("div");
      tempElement.style.position = "fixed";
      tempElement.style.left = "-9999px";
      document.body.appendChild(tempElement);
  
      completedTasks.forEach((task) => {
        const clone = task.cloneNode(true);
        tempElement.appendChild(clone);
      });
  
      html2canvas(tempElement).then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "completed_tasks_screenshot.png";
        link.click();
      });
  
      document.body.removeChild(tempElement);
    }
  
    // Evento para tomar screenshot de la lista de tareas completadas
    document.getElementById("screenshot-button").addEventListener("click", takeScreenshot);
  
    // Renderizar tareas iniciales
    renderTasks();
  
    
  });