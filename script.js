// ---------- LOGIN PROTECTION ----------


let currentPage = window.location.pathname.split("/").pop();

if (
  currentPage !== "login.html" &&
  currentPage !== "signup.html" &&
  localStorage.getItem("loggedIn") !== "true"
) {
  window.location.href = "login.html";
}

// ---------- DATA ----------

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let screenTimes = JSON.parse(localStorage.getItem("screenTimes")) || [];
let focusSessions = Number(localStorage.getItem("focusSessions")) || 0;

let taskChart, pomodoroChart, habitChart, screenChart;

// ---------- LOGIN ----------

function login() {
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value.trim();

  if (email === "" || password === "") {
    alert("Please enter email and password");
    return;
  }

  localStorage.setItem("loggedIn", "true");
localStorage.setItem("userEmail", email);
window.location.href = "index.html";
}
function handleLoginEnter(event) {
  if (event.key === "Enter") {
    login();
  }
}

// ---------- TASKS ----------

function addTask() {
  let input = document.getElementById("taskInput");
  if (!input || input.value.trim() === "") return;

  tasks.push({
    text: input.value.trim(),
    completed: false
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
  input.value = "";

  displayTasks();
  updateDashboard();
}

function handleTaskEnter(event) {
  if (event.key === "Enter") addTask();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  localStorage.setItem("tasks", JSON.stringify(tasks));

  displayTasks();
  updateDashboard();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  displayTasks();
  updateDashboard();
}

function displayTasks() {
  let list = document.getElementById("taskList");
  if (!list) return;

  list.innerHTML = "";

  tasks.forEach((task, index) => {
    let li = document.createElement("li");

    li.innerHTML = `
      <span class="${task.completed ? "completed" : ""}">
        ${task.text}
      </span>

      <div>
        <button onclick="toggleTask(${index})">
          ${task.completed ? "Undo" : "Done"}
        </button>
        <button onclick="deleteTask(${index})">Delete</button>
      </div>
    `;

    list.appendChild(li);
  });

  loadTaskChart();
}

// ---------- POMODORO ----------

let time = 25 * 60;
let timerInterval = null;

function updateTimer() {
  let timer = document.getElementById("timer");
  if (!timer) return;

  let minutes = Math.floor(time / 60);
  let seconds = time % 60;

  timer.innerText = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

function startTimer() {
  if (timerInterval !== null) return;

  timerInterval = setInterval(() => {
    if (time > 0) {
      time--;
      updateTimer();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;

      focusSessions++;
      localStorage.setItem("focusSessions", focusSessions);

      alert("Focus session completed!");
      resetTimer();

      updateDashboard();
      loadPomodoroChart();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  time = 25 * 60;
  updateTimer();
}

// ---------- HABITS ----------

function addHabit() {
  let input = document.getElementById("habitInput");
  if (!input || input.value.trim() === "") return;

  habits.push({
    text: input.value.trim(),
    completed: false
  });

  localStorage.setItem("habits", JSON.stringify(habits));
  input.value = "";

  displayHabits();
}

function handleHabitEnter(event) {
  if (event.key === "Enter") addHabit();
}

function toggleHabit(index) {
  habits[index].completed = !habits[index].completed;
  localStorage.setItem("habits", JSON.stringify(habits));

  displayHabits();
}

function deleteHabit(index) {
  habits.splice(index, 1);
  localStorage.setItem("habits", JSON.stringify(habits));

  displayHabits();
}

function displayHabits() {
  let list = document.getElementById("habitList");
  if (!list) return;

  list.innerHTML = "";

  habits.forEach((habit, index) => {
    let li = document.createElement("li");

    li.innerHTML = `
      <span class="${habit.completed ? "completed" : ""}">
        ${habit.text}
      </span>

      <div>
        <button onclick="toggleHabit(${index})">
          ${habit.completed ? "Undo" : "Done"}
        </button>
        <button onclick="deleteHabit(${index})">Delete</button>
      </div>
    `;

    list.appendChild(li);
  });

  loadHabitChart();
}

// ---------- SCREEN TIME ----------

function addScreenTime() {
  let app = document.getElementById("appName");
  let hours = document.getElementById("hoursUsed");
  let category = document.getElementById("category");

  if (!app || !hours || !category) return;

  if (app.value.trim() === "" || Number(hours.value) <= 0) {
    alert("Please enter valid app name and hours");
    return;
  }

  screenTimes.push({
    app: app.value.trim(),
    hours: Number(hours.value),
    category: category.value
  });

  localStorage.setItem("screenTimes", JSON.stringify(screenTimes));

  app.value = "";
  hours.value = "";

  displayScreenTime();
  updateDashboard();
}

function handleScreenTimeEnter(event) {
  if (event.key === "Enter") addScreenTime();
}

function deleteScreenTime(index) {
  screenTimes.splice(index, 1);
  localStorage.setItem("screenTimes", JSON.stringify(screenTimes));

  displayScreenTime();
  updateDashboard();
}

function displayScreenTime() {
  let list = document.getElementById("screenList");
  if (!list) return;

  list.innerHTML = "";

  screenTimes.forEach((item, index) => {
    let li = document.createElement("li");

    li.innerHTML = `
      <span>${item.app} - ${item.hours}h</span>
      <span>${item.category}</span>
      <button onclick="deleteScreenTime(${index})">Delete</button>
    `;

    list.appendChild(li);
  });

  let total = getTotalScreenTime();
  let productive = getProductiveTime();
  let score = total === 0 ? 0 : Math.round((productive / total) * 100);

  let totalScreenTime = document.getElementById("totalScreenTime");
  if (totalScreenTime) totalScreenTime.innerText = total + "h";

  let productivityScore = document.getElementById("productivityScore");
  if (productivityScore) productivityScore.innerText = score + "%";

  let suggestion = document.getElementById("suggestion");

  if (suggestion) {
    if (score >= 70) {
      suggestion.innerText = "Excellent! You are using your screen time productively.";
    } else if (score >= 40) {
      suggestion.innerText = "Good, but try to reduce entertainment and social media.";
    } else {
      suggestion.innerText = "Needs improvement. Increase study, coding, or reading time.";
    }
  }

  loadScreenChart();
}

function getTotalScreenTime() {
  return screenTimes.reduce((sum, item) => sum + item.hours, 0);
}

function getProductiveTime() {
  return screenTimes
    .filter(item => item.category === "Productive")
    .reduce((sum, item) => sum + item.hours, 0);
}

// ---------- NOTES ----------

function saveNotes() {
  let notes = document.getElementById("notes");
  if (!notes) return;

  localStorage.setItem("studentNotes", notes.value);
  alert("Notes saved!");
}

// ---------- DASHBOARD ----------

function updateDashboard() {
  let completedTasks = tasks.filter(task => task.completed).length;
  let totalScreen = getTotalScreenTime();
  let productive = getProductiveTime();
  let score = totalScreen === 0 ? 0 : Math.round((productive / totalScreen) * 100);

  let taskCount = document.getElementById("taskCount");
  if (taskCount) taskCount.innerText = completedTasks;

  let sessionCount = document.getElementById("sessionCount");
  if (sessionCount) sessionCount.innerText = focusSessions;

  let totalScreenTime = document.getElementById("totalScreenTime");
  if (totalScreenTime) totalScreenTime.innerText = totalScreen + "h";

  let productivityScore = document.getElementById("productivityScore");
  if (productivityScore) productivityScore.innerText = score + "%";
  updateStreaks();
  loadMotivation();
}

// ---------- CHARTS ----------

function loadTaskChart() {
  let ctx = document.getElementById("taskChart");
  if (!ctx || typeof Chart === "undefined") return;

  if (taskChart) taskChart.destroy();

  let completed = tasks.filter(task => task.completed).length;
  let pending = tasks.length - completed;

  taskChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Completed Tasks",
          data: [2, 3, 4, completed, 0, 0, 0]
        },
        {
          label: "Pending Tasks",
          data: [1, 2, 1, pending, 0, 0, 0]
        }
      ]
    }
  });
}

function loadPomodoroChart() {
  let ctx = document.getElementById("pomodoroChart");
  if (!ctx || typeof Chart === "undefined") return;

  if (pomodoroChart) pomodoroChart.destroy();

  pomodoroChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Focus Sessions",
          data: [1, 2, 3, focusSessions, 0, 0, 0]
        }
      ]
    }
  });
}

function loadHabitChart() {
  let ctx = document.getElementById("habitChart");
  if (!ctx || typeof Chart === "undefined") return;

  if (habitChart) habitChart.destroy();

  let completedHabits = habits.filter(habit => habit.completed).length;

  habitChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Completed Habits",
          data: [1, 2, 3, completedHabits, 0, 0, 0]
        }
      ]
    }
  });
}

function loadScreenChart() {
  let ctx = document.getElementById("screenChart");
  if (!ctx || typeof Chart === "undefined") return;

  if (screenChart) screenChart.destroy();

  let productive = getProductiveTime();
  let total = getTotalScreenTime();
  let unproductive = total - productive;

  screenChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Productive", "Unproductive"],
      datasets: [
        {
          label: "Screen Time",
          data: [productive, unproductive]
        }
      ]
    }
  });
}

// ---------- PAGE LOAD ----------
window.onload = function() {

  displayTasks();
  displayHabits();
  displayScreenTime();

  updateTimer();
  updateDashboard();

  let notes = document.getElementById("notes");
  let savedNotes = localStorage.getItem("studentNotes");

  if (notes && savedNotes) {
    notes.value = savedNotes;
  }

  loadTaskChart();
  loadPomodoroChart();
  loadHabitChart();
  loadScreenChart();

  loadProfile();
  loadTheme();
  displayCalendarPlans();
  loadGreeting();
  loadProfile();
loadTheme();
loadGreeting();

};
function toggleProfileMenu() {
  let menu = document.getElementById("profileDropdown");
  if (menu) menu.classList.toggle("show");
}

function toggleTheme() {
  document.body.classList.toggle("light-theme");

  if (document.body.classList.contains("light-theme")) {
    localStorage.setItem("theme", "light");
  } else {
    localStorage.setItem("theme", "dark");
  }
}

function updateProfile() {
  let usernameInput = document.getElementById("usernameInput");

  if (!usernameInput || usernameInput.value.trim() === "") {
    alert("Please enter username");
    return;
  }

  localStorage.setItem("username", usernameInput.value.trim());
  loadProfile();

  usernameInput.value = "";
  alert("Profile updated!");
}

function loadProfile() {
  let profileName = document.getElementById("profileName");
  let profileEmail = document.getElementById("profileEmail");

  let username = localStorage.getItem("username") || "Student";
  let email = localStorage.getItem("userEmail") || "student@email.com";

  if (profileName) profileName.innerText = username;
  if (profileEmail) profileEmail.innerText = email;
}

function loadTheme() {
  let theme = localStorage.getItem("theme");

  if (theme === "light") {
    document.body.classList.add("light-theme");
  }
}
function logout() {

  localStorage.removeItem("loggedIn");
  localStorage.removeItem("userEmail");

  window.location.replace("login.html");

}
function updateStreaks() {
  let completedTasks = tasks.filter(task => task.completed).length;
  let completedHabits = habits.filter(habit => habit.completed).length;

  let taskStreak = Number(localStorage.getItem("taskStreak")) || 0;
  let habitStreak = Number(localStorage.getItem("habitStreak")) || 0;

  if (completedTasks > 0) {
    taskStreak = completedTasks;
  }

  if (completedHabits > 0) {
    habitStreak = completedHabits;
  }

  localStorage.setItem("taskStreak", taskStreak);
  localStorage.setItem("habitStreak", habitStreak);

  if (document.getElementById("taskStreak")) {
    document.getElementById("taskStreak").innerText = taskStreak;
  }

  if (document.getElementById("habitStreak")) {
    document.getElementById("habitStreak").innerText = habitStreak;
  }
}
let calendarPlans = JSON.parse(localStorage.getItem("calendarPlans")) || [];

function addCalendarPlan() {
  let date = document.getElementById("calendarDate");
  let task = document.getElementById("calendarTask");

  if (!date || !task || date.value === "" || task.value.trim() === "") {
    alert("Please select date and enter plan");
    return;
  }

  calendarPlans.push({
    date: date.value,
    task: task.value.trim()
  });

  localStorage.setItem("calendarPlans", JSON.stringify(calendarPlans));

  date.value = "";
  task.value = "";

  displayCalendarPlans();
}

function deleteCalendarPlan(index) {
  calendarPlans.splice(index, 1);
  localStorage.setItem("calendarPlans", JSON.stringify(calendarPlans));
  displayCalendarPlans();
}

function displayCalendarPlans() {
  let list = document.getElementById("calendarList");
  if (!list) return;

  list.innerHTML = "";

  calendarPlans.forEach((plan, index) => {
    let li = document.createElement("li");

    li.innerHTML = `
      <span>${plan.date} - ${plan.task}</span>
      <button onclick="deleteCalendarPlan(${index})">Delete</button>
    `;

    list.appendChild(li);
  });
}
function loadMotivation() {
  let motivationText = document.getElementById("motivationText");
  if (!motivationText) return;

  let completedTasks = tasks.filter(task => task.completed).length;
  let completedHabits = habits.filter(habit => habit.completed).length;
  let totalScreen = getTotalScreenTime();
  let productive = getProductiveTime();

  let score = totalScreen === 0 ? 0 : Math.round((productive / totalScreen) * 100);

  if (completedTasks >= 5 && score >= 70) {
    motivationText.innerText =
      "Excellent work! You completed many tasks and used your screen time productively.";
  } else if (completedTasks >= 3) {
    motivationText.innerText =
      "Good progress! Try adding one more focus session today.";
  } else if (score < 40 && totalScreen > 0) {
    motivationText.innerText =
      "Your screen time needs improvement. Reduce social media and add one Pomodoro session.";
  } else if (completedHabits > 0) {
    motivationText.innerText =
      "Nice! You are building good habits. Keep your streak alive.";
  } else {
    motivationText.innerText =
      "Start small today. Complete one task, one habit, and one Pomodoro session.";
  }
}
function loadGreeting() {

  let greeting = document.getElementById("greetingText");

  if (!greeting) return;

  let hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    greeting.innerText = "Good Morning! 🌤️";
  }

  else if (hour >= 12 && hour < 17) {
    greeting.innerText = "Good Afternoon! ☀️";
  }

  else if (hour >= 17 && hour < 21) {
    greeting.innerText = "Good Evening! 🌆";
  }

  else {
    greeting.innerText = "Good Night! 🌙";
  }

}