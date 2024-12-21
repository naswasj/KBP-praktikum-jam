// Theme Toggle
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
}

function toggleMenu() {
  const navLinks = document.getElementById("nav-links");
  navLinks.classList.toggle("show");
}

let currentTimeInterval;

function updateCurrentTime() {
  const currentTimeElement = document.getElementById("current-time");
  const currentTime = new Date().toLocaleTimeString(); // Mendapatkan waktu lokal
  currentTimeElement.textContent = currentTime; // Menampilkan waktu, dengan id 'current-time'
}

// Memastikan waktu diperbarui setiap detik
setInterval(updateCurrentTime, 1000);

// Menampilkan waktu saat halaman pertama kali dimuat
document.addEventListener("DOMContentLoaded", updateCurrentTime)

// Fungsi untuk menampilkan section yang dipilih dan menyembunyikan yang lain
function scrollToSection(sectionId) {
  // Sembunyikan semua section
  const sections = document.querySelectorAll("main > section");
  sections.forEach((section) => {
    section.style.display = "none";
  });

  // Tampilkan section yang dipilih
  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    selectedSection.style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  scrollToSection("default-content"); // Menampilkan konten default
});

// Inisialisasi variabel
let totalSessions = localStorage.getItem("totalSessions")
  ? parseInt(localStorage.getItem("totalSessions"))
  : 0;
let totalBreaks = localStorage.getItem("totalBreaks")
  ? parseInt(localStorage.getItem("totalBreaks"))
  : 0;
let studyHistory = JSON.parse(localStorage.getItem("studyHistory")) || [];
let timerInterval;
let isStudySession = true;
const StudyAudio = new Audio(
  "https://www.freespecialeffects.co.uk/soundfx/scifi/alien_laser_2.wav"
);
const BreakAudio = new Audio(
  "https://www.freespecialeffects.co.uk/soundfx/bells/church_bells_01.wav"
);

// Mulai Pomodoro
function startPomodoro() {
  const studyMinutes =
    parseInt(document.getElementById("study-time").value) || 25; // Durasi belajar
  const breakMinutes =
    parseInt(document.getElementById("break-time").value) || 5; // Durasi istirahat
  let timeRemaining = isStudySession ? studyMinutes * 60 : breakMinutes * 60;

  // Timer interval untuk mengupdate countdown
  timerInterval = setInterval(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById("timer-display").textContent = `${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
    timeRemaining--;

    if (timeRemaining < 0) {
      clearInterval(timerInterval);
      // Memainkan suara berdasarkan sesi
      (isStudySession ? StudyAudio : BreakAudio).play();
      notifyUser();

      // Menyimpan statistik dan riwayat
      if (isStudySession) {
        totalSessions++;
        const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD
        const currentStudyTime = studyMinutes;
        let dayHistory = studyHistory.find((record) => record.date === today);
        if (dayHistory) {
          dayHistory.totalStudyTime += currentStudyTime;
        } else {
          studyHistory.push({
            date: today,
            totalStudyTime: currentStudyTime,
          });
        }
        localStorage.setItem("studyHistory", JSON.stringify(studyHistory));
        localStorage.setItem("totalSessions", totalSessions);
      } else {
        totalBreaks++;
        const today = new Date().toISOString().split("T")[0];
        const currentBreakTime = breakMinutes;
        let dayHistory = studyHistory.find((record) => record.date === today);
        if (dayHistory) {
          dayHistory.totalBreakTime =
            (dayHistory.totalBreakTime || 0) + currentBreakTime; // Simpan waktu istirahat
        } else {
          studyHistory.push({
            date: today,
            totalBreakTime: currentBreakTime, // Simpan waktu istirahat
          });
        }
        localStorage.setItem("studyHistory", JSON.stringify(studyHistory));
        localStorage.setItem("totalBreaks", totalBreaks);
      }
      updateStatistics();

      isStudySession = !isStudySession;
      startPomodoro();
    }
  }, 1000);
}

// Fungsi notifikasi
function notifyUser() {
  const notificationMessage = isStudySession
    ? "Sesi belajar selesai! Waktunya istirahat."
    : "Waktu istirahat selesai! Kembali belajar.";

  if (Notification.permission === "granted") {
    const notification = new Notification(notificationMessage, {
      body: "Klik untuk menghentikan alarm!",
    });

    notification.onclick = () => {
      (isStudySession ? StudyAudio : BreakAudio).pause();
      (isStudySession ? StudyAudio : BreakAudio).currentTime = 0;
      notification.close();
    };
  } else {
    alert(notificationMessage);
    (isStudySession ? StudyAudio : BreakAudio).play();
  }
}

// Fungsi update statistic
function updateStatistics() {
  const today = new Date().toISOString().split("T")[0];
  const dayHistory = studyHistory.find((record) => record.date === today);
  const totalStudyTimeToday = dayHistory ? dayHistory.totalStudyTime : 0;

  document.getElementById("total-sessions").textContent = totalSessions;
  document.getElementById("total-breaks").textContent = totalBreaks;
  document.getElementById("total-study-time").textContent = totalStudyTimeToday; // Menampilkan total waktu belajar hari ini

  const historyList = document.getElementById("study-history");
  historyList.innerHTML = "";
  studyHistory.forEach((record) => {
    const li = document.createElement("li");
    li.textContent = `Date: ${record.date} - Total Study Time: ${record.totalStudyTime} minutes`;
    historyList.appendChild(li);
  });
}

// Meminta izin notifikasi
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Fungsi Clear
function clearPomodoro() {
  clearInterval(timerInterval);
  document.getElementById("timer-display").textContent = "00:00";
  isStudySession = true;

  // Reset form input waktu belajar dan istirahat
  document.getElementById("study-time").value = 25;
  document.getElementById("break-time").value = 5;
}

document.getElementById("start-btn").addEventListener("click", () => {
  startPomodoro();
});
document.getElementById("clear-btn").addEventListener("click", clearPomodoro);

// To-Do List
function addTodo() {
  const todoInput = document.getElementById("name");
  const timelineInput = document.getElementById("waktu");
  const task = todoInput.value.trim();
  const timeline = timelineInput.value.trim();

  if (!task || !timeline) {
    alert("Semua field harus diisi!");
    return;
  }

  const todos = JSON.parse(localStorage.getItem("todos")) || [];
  todos.push({ task, timeline, completed: false });
  localStorage.setItem("todos", JSON.stringify(todos));
  renderTodoList();

  todoInput.value = "";
  timelineInput.value = "";
}

function renderTodoList() {
  const todoList = document.getElementById("todo-list");
  const todos = JSON.parse(localStorage.getItem("todos")) || [];

  todoList.innerHTML = "";
  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    const taskName = document.createElement("span");
    taskName.classList.add("task-name");
    taskName.textContent = `${todo.task} - ${todo.timeline}`;

    if (todo.completed) {
      taskName.classList.add("completed");
    }

    const completeButton = document.createElement("button");
    completeButton.textContent = "Complete";
    completeButton.classList.add("complete-button");
    completeButton.onclick = () => {
      todo.completed = !todo.completed;
      li.classList.toggle("completed");
      localStorage.setItem("todos", JSON.stringify(todos));
      renderTodoList();
    };

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-button");
    deleteButton.onclick = () => {
      todos.splice(index, 1);
      localStorage.setItem("todos", JSON.stringify(todos));
      renderTodoList();
    };
    li.appendChild(taskName);
    li.appendChild(completeButton);
    li.appendChild(deleteButton);
    todoList.appendChild(li);
  });
}

window.onload = function () {
  const navbar = document.getElementById("navbar");
  const main = document.querySelector("main");
  main.style.marginTop = `${navbar.offsetHeight}px`;
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  updateCurrentTime();
});
renderTodoList();
updateStatistics();
