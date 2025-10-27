document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const timerDisplay = document.querySelector('.timer-display');
    const startStopBtn = document.getElementById('start-stop-btn');
    const pomodoroBtn = document.getElementById('pomodoro-btn');
    const shortBreakBtn = document.getElementById('short-break-btn');
    const longBreakBtn = document.getElementById('long-break-btn');
    const currentTaskText = document.getElementById('current-task-text');
    const settingsModal = document.getElementById('settings-modal');
    const reportModal = document.getElementById('report-modal');
    const settingBtn = document.getElementById('setting-btn');
    const reportBtn = document.getElementById('report-btn');
    const signinBtn = document.getElementById('signin-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const closeReportBtn = document.getElementById('close-report-btn');
    const okBtn = document.getElementById('ok-btn');
    const pomodoroSettingInput = document.getElementById('pomodoro-setting');
    const shortBreakSettingInput = document.getElementById('short-break-setting');
    const longBreakSettingInput = document.getElementById('long-break-setting');
    const colorDots = document.querySelectorAll('.color-dot');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskForm = document.getElementById('task-form');
    const cancelTaskBtn = document.getElementById('cancel-task-btn');
    const saveTaskBtn = document.getElementById('save-task-btn');
    const taskInput = document.getElementById('task-input');
    const pomodoroEstimateInput = document.getElementById('pomodoro-estimate');
    const taskListContainer = document.getElementById('task-list');

    // --- State Management ---
    let timer;
    let currentMode = 'pomodoro';
    let isRunning = false;
    let timeInSeconds;
    let settings = {};
    let tasks = [];
    let activeTaskIndex = 0;

    // --- Default Settings ---
    const defaultSettings = {
        pomodoro: 25, shortBreak: 5, longBreak: 15, themeColor: '#c15c5c'
    };

    // --- Task Logic ---
    function renderTasks() {
        taskListContainer.innerHTML = ''; // Clear existing tasks
        tasks.forEach((task, index) => {
            const taskElement = document.createElement('div');
            taskElement.classList.add('task-item');
            if (index === activeTaskIndex) {
                taskElement.classList.add('active');
            }
            taskElement.innerHTML = `
                <div class="task-title">${task.title}</div>
                <div class="task-pomodoros">${task.estPomodoros}</div>
            `;
            taskListContainer.appendChild(taskElement);
        });
        updateCurrentTaskText();
    }

    function updateCurrentTaskText() {
        if (tasks.length > 0 && activeTaskIndex < tasks.length) {
            currentTaskText.innerHTML = `#${activeTaskIndex + 1} <br> ${tasks[activeTaskIndex].title}`;
        } else {
            currentTaskText.innerHTML = "#1 <br> Time to focus!";
        }
    }
    
    function showTaskForm() {
        addTaskBtn.classList.add('hidden');
        taskForm.classList.remove('hidden');
    }

    function hideTaskForm() {
        addTaskBtn.classList.remove('hidden');
        taskForm.classList.add('hidden');
        taskInput.value = ''; // Clear input
        pomodoroEstimateInput.value = 1;
    }
    
    function saveTask() {
        const title = taskInput.value.trim();
        if (title) {
            const newTask = {
                title: title,
                estPomodoros: parseInt(pomodoroEstimateInput.value, 10)
            };
            tasks.push(newTask);
            saveData();
            renderTasks();
        }
        hideTaskForm();
    }
    
    // --- Timer Logic ---
    function updateDisplay() {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.title = `${timerDisplay.textContent} - Time to focus!`;
    }

    function switchMode(mode) {
        currentMode = mode;
        isRunning = false;
        clearInterval(timer);
        startStopBtn.textContent = 'START';
        if (mode === 'pomodoro') timeInSeconds = settings.pomodoro * 60;
        else if (mode === 'shortBreak') timeInSeconds = settings.shortBreak * 60;
        else timeInSeconds = settings.longBreak * 60;
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${mode.replace('B', '-b')}-btn`).classList.add('active');
        updateDisplay();
    }

    function startTimer() {
        if (timeInSeconds <= 0) return;
        isRunning = true;
        startStopBtn.textContent = 'PAUSE';
        timer = setInterval(() => {
            timeInSeconds--;
            if (timeInSeconds < 0) stopTimer();
            else updateDisplay();
        }, 1000);
    }

    function stopTimer() {
        isRunning = false;
        startStopBtn.textContent = 'START';
        clearInterval(timer);
    }

    // --- Settings and Data Persistence ---
    function saveData() {
        localStorage.setItem('pomofocusSettings', JSON.stringify(settings));
        localStorage.setItem('pomofocusTasks', JSON.stringify(tasks));
    }

    function loadData() {
        const savedSettings = JSON.parse(localStorage.getItem('pomofocusSettings'));
        const savedTasks = JSON.parse(localStorage.getItem('pomofocusTasks'));
        settings = { ...defaultSettings, ...savedSettings };
        tasks = savedTasks || [];
        pomodoroSettingInput.value = settings.pomodoro;
        shortBreakSettingInput.value = settings.shortBreak;
        longBreakSettingInput.value = settings.longBreak;
        applyTheme(settings.themeColor);
        switchMode('pomodoro');
        renderTasks();
    }

    function applyTheme(color) {
        document.body.style.backgroundColor = color;
        colorDots.forEach(dot => dot.classList.toggle('active', dot.dataset.color === color));
        document.getElementById('start-stop-btn').style.color = color;
    }

    function openModal(modal) { modal.classList.remove('hidden'); }
    function closeModal(modal) { modal.classList.add('hidden'); }

    // --- Event Listeners ---
    startStopBtn.addEventListener('click', () => isRunning ? stopTimer() : startTimer());
    pomodoroBtn.addEventListener('click', () => switchMode('pomodoro'));
    shortBreakBtn.addEventListener('click', () => switchMode('shortBreak'));
    longBreakBtn.addEventListener('click', () => switchMode('longBreak'));

    settingBtn.addEventListener('click', () => openModal(settingsModal));
    reportBtn.addEventListener('click', () => openModal(reportModal));
    signinBtn.addEventListener('click', () => alert("Sign In feature will be added in a future update!"));
    closeSettingsBtn.addEventListener('click', () => closeModal(settingsModal));
    closeReportBtn.addEventListener('click', () => closeModal(reportModal));
    
    addTaskBtn.addEventListener('click', showTaskForm);
    cancelTaskBtn.addEventListener('click', hideTaskForm);
    saveTaskBtn.addEventListener('click', saveTask);

    okBtn.addEventListener('click', () => {
        settings.pomodoro = parseInt(pomodoroSettingInput.value, 10);
        settings.shortBreak = parseInt(shortBreakSettingInput.value, 10);
        settings.longBreak = parseInt(longBreakSettingInput.value, 10);
        saveData();
        closeModal(settingsModal);
        switchMode(currentMode);
    });

    colorDots.forEach(dot => {
        dot.addEventListener('click', () => {
            settings.themeColor = dot.dataset.color;
            applyTheme(settings.themeColor);
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) closeModal(settingsModal);
        if (event.target === reportModal) closeModal(reportModal);
    });

    // --- Initial Load ---
    loadData();
});