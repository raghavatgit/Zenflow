// ZenFlow - app.js
// main state object loads saved data from localStorage on page load

var STATE = {
  tasks: JSON.parse(localStorage.getItem('zf_tasks') || '[]'),
  focusMins: +(localStorage.getItem('zf_focusMins') || 0),
  breatheMins: +(localStorage.getItem('zf_breatheMins') || 0),
  sessions: +(localStorage.getItem('zf_sessions') || 0),
  streak: +(localStorage.getItem('zf_streak') || 0),
  lastDate: localStorage.getItem('zf_lastDate') || '',
  activeTab: 'daily', activeFilter: 'all'
};

// persist current state to localStorage so data survives page refresh
function save() {
  localStorage.setItem('zf_tasks', JSON.stringify(STATE.tasks));
  localStorage.setItem('zf_focusMins', STATE.focusMins);
  localStorage.setItem('zf_breatheMins', STATE.breatheMins);
  localStorage.setItem('zf_sessions', STATE.sessions);
  localStorage.setItem('zf_streak', STATE.streak);
  localStorage.setItem('zf_lastDate', STATE.lastDate);
}

// check streak on page load - reset if user missed more than 1 day
(function () {
  var today = new Date().toDateString();
  if (STATE.lastDate && STATE.lastDate !== today) {
    if ((new Date(today) - new Date(STATE.lastDate)) / 86400000 > 1) STATE.streak = 0;
  }
  if (!STATE.lastDate) STATE.lastDate = today;
  save();
})();

// called whenever user does something (adds task, finishes timer, etc)
function bumpStreak() {
  var today = new Date().toDateString();
  if (STATE.lastDate !== today) {
    var diff = (new Date(today) - new Date(STATE.lastDate)) / 86400000;
    STATE.streak = diff <= 1 ? STATE.streak + 1 : 1;
    STATE.lastDate = today;
    save();
  }
}

var QUOTES = [
  { t: "The secret of getting ahead is getting started.", a: "Mark Twain" },
  { t: "Focus on being productive instead of busy.", a: "Tim Ferriss" },
  { t: "Almost everything will work again if you unplug it for a few minutes - including you.", a: "Anne Lamott" },
  { t: "You don't have to see the whole staircase, just take the first step.", a: "MLK Jr." },
  { t: "Your calm mind is the ultimate weapon against your challenges.", a: "Bryant McGill" },
  { t: "Start where you are. Use what you have. Do what you can.", a: "Arthur Ashe" }
];

// sidebar nav - clicking a button shows the matching view and hides others
document.querySelectorAll('.nav-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var target = btn.dataset.view;
    document.querySelectorAll('.nav-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    document.querySelectorAll('.view').forEach(function (v) {
      v.classList.toggle('active', v.id === 'view-' + target);
    });
    if (target === 'dashboard') refreshDashboard();
  });
});

// dark/light theme toggle - saves preference to localStorage
var themeToggle = document.getElementById('theme-toggle');
var moonSvg = '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>';
var sunSvg = '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

function applyTheme(t) {
  document.body.classList.toggle('light', t === 'light');
  themeToggle.innerHTML = t === 'light' ? sunSvg : moonSvg;
}
applyTheme(localStorage.getItem('zf_theme') || 'dark');
themeToggle.addEventListener('click', function () {
  var next = document.body.classList.contains('light') ? 'dark' : 'light';
  localStorage.setItem('zf_theme', next);
  applyTheme(next);
});

// updates dashboard stats, greeting, quote, and upcoming task list
function refreshDashboard() {
  var h = new Date().getHours();
  document.getElementById('greeting').textContent = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('date-display').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  var done = 0;
  for (var i = 0; i < STATE.tasks.length; i++)
    if (STATE.tasks[i].type === 'daily' && STATE.tasks[i].done) done++;

  document.getElementById('stat-completed').textContent = done;
  document.getElementById('stat-focus-mins').textContent = STATE.focusMins;
  document.getElementById('stat-streak-count').textContent = STATE.streak;
  document.getElementById('stat-breathe-mins').textContent = STATE.breatheMins;

  var q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  document.getElementById('quote-text').textContent = '"' + q.t + '"';
  document.getElementById('quote-author').textContent = '- ' + q.a;

  var upcoming = [], list = document.getElementById('upcoming-list');
  for (var j = 0; j < STATE.tasks.length; j++)
    if (!STATE.tasks[j].done && STATE.tasks[j].type === 'daily' && upcoming.length < 5) upcoming.push(STATE.tasks[j]);

  if (!upcoming.length) { list.innerHTML = '<li class="empty-state">No tasks yet - add some!</li>'; return; }
  var html = '';
  for (var k = 0; k < upcoming.length; k++)
    html += '<li><span class="priority-dot ' + upcoming[k].priority + '"></span>' + escHTML(upcoming[k].text) + '</li>';
  list.innerHTML = html;
}

// task management - handles adding, toggling, deleting, filtering tasks
var taskInput = document.getElementById('task-input');
var taskList = document.getElementById('task-list');

document.querySelectorAll('.tab').forEach(function (btn) {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.tab').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    STATE.activeTab = btn.dataset.tab;
    renderTasks();
  });
});
document.querySelectorAll('.filter-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    STATE.activeFilter = btn.dataset.filter;
    renderTasks();
  });
});

document.getElementById('btn-add-task').addEventListener('click', addTask);
taskInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') addTask(); }); // enter key also adds

function addTask() {
  var text = taskInput.value.trim();
  if (!text) return;
  STATE.tasks.push({ id: Date.now(), text: text, priority: document.getElementById('task-priority').value, category: document.getElementById('task-category').value, type: STATE.activeTab, done: false });
  taskInput.value = '';
  save(); renderTasks(); bumpStreak();
}

// these are on window so the onclick attributes in the HTML can call them
window.toggleTask = function (id) {
  var t = STATE.tasks.find(function (x) { return x.id === id; });
  if (t) { t.done = !t.done; save(); renderTasks(); }
};
window.deleteTask = function (id) {
  STATE.tasks = STATE.tasks.filter(function (x) { return x.id !== id; });
  save(); renderTasks();
};

// builds the task list HTML based on current tab and filter
function renderTasks() {
  var filtered = [], total = 0, doneCount = 0;
  for (var i = 0; i < STATE.tasks.length; i++) {
    var t = STATE.tasks[i];
    if (t.type === STATE.activeTab) {
      total++;
      if (t.done) doneCount++;
      if (STATE.activeFilter === 'all' || (STATE.activeFilter === 'active' && !t.done) || (STATE.activeFilter === 'completed' && t.done))
        filtered.push(t);
    }
  }
  var pct = total ? Math.round((doneCount / total) * 100) : 0;
  document.getElementById('task-progress-fill').style.width = pct + '%';
  document.getElementById('task-progress-text').textContent = doneCount + ' of ' + total + ' done';

  var emoji = { work: '🏢', personal: '🏠', health: '💪', learning: '📚' };
  var html = '';
  for (var k = 0; k < filtered.length; k++) {
    var t = filtered[k];
    html += '<li class="task-item ' + (t.done ? 'completed' : '') + '"><button class="task-checkbox ' + (t.done ? 'checked' : '') + '" onclick="toggleTask(' + t.id + ')"></button><span class="task-text">' + escHTML(t.text) + '</span><div class="task-meta"><span class="task-badge ' + t.category + '">' + (emoji[t.category] || '') + ' ' + t.category + '</span><span class="priority-dot ' + t.priority + '"></span></div><button class="task-delete" onclick="deleteTask(' + t.id + ')">✕</button></li>';
  }
  taskList.innerHTML = html;
}

// prevents XSS by escaping HTML characters in user input
function escHTML(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// pomodoro timer - 1500s = 25min default, CIRC is the SVG circle circumference for the ring animation
var timerInterval = null, timerRemaining = 1500, timerTotal = 1500, timerRunning = false;
var CIRC = 2 * Math.PI * 120;
var timerTimeEl = document.getElementById('timer-time');
var timerLabelEl = document.getElementById('timer-label');
var ringProgress = document.getElementById('ring-progress');
var btnStart = document.getElementById('btn-timer-start');

// inject a gradient into the SVG so the timer ring has a purple-to-cyan color
var timerSvg = document.querySelector('.timer-ring');
var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
defs.innerHTML = '<linearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#06b6d4"/></linearGradient>';
timerSvg.prepend(defs);
ringProgress.style.strokeDasharray = CIRC;

document.querySelectorAll('.timer-tab').forEach(function (tab) {
  tab.addEventListener('click', function () {
    if (timerRunning) return;
    document.querySelectorAll('.timer-tab').forEach(function (t) { t.classList.remove('active'); });
    tab.classList.add('active');
    timerTotal = timerRemaining = (+tab.dataset.duration) * 60;
    updateTimerDisplay();
    timerLabelEl.textContent = 'Ready to focus';
  });
});

btnStart.addEventListener('click', function () { timerRunning ? pauseTimer() : startTimer(); });
document.getElementById('btn-timer-reset').addEventListener('click', resetTimer);

function startTimer() {
  timerRunning = true;
  btnStart.textContent = 'Pause'; btnStart.classList.add('running');
  timerLabelEl.textContent = 'Focusing...';
  timerInterval = setInterval(function () {
    timerRemaining--;
    updateTimerDisplay();
    if (timerRemaining <= 0) {
      clearInterval(timerInterval); timerRunning = false;
      btnStart.textContent = 'Start'; btnStart.classList.remove('running');
      timerLabelEl.textContent = 'Done!';
      STATE.sessions++; STATE.focusMins += Math.round(timerTotal / 60);
      save();
      document.getElementById('session-count').textContent = STATE.sessions;
      playChime(); bumpStreak();
    }
  }, 1000);
}
function pauseTimer() {
  clearInterval(timerInterval); timerRunning = false;
  btnStart.textContent = 'Resume'; btnStart.classList.remove('running');
  timerLabelEl.textContent = 'Paused';
}
function resetTimer() {
  clearInterval(timerInterval); timerRunning = false;
  timerTotal = timerRemaining = (+document.querySelector('.timer-tab.active').dataset.duration) * 60;
  btnStart.textContent = 'Start'; btnStart.classList.remove('running');
  timerLabelEl.textContent = 'Ready to focus';
  updateTimerDisplay();
}
// updates the MM:SS display and the SVG ring progress (offset controls how much of the ring is visible)
function updateTimerDisplay() {
  var m = Math.floor(timerRemaining / 60), s = timerRemaining % 60;
  timerTimeEl.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  ringProgress.style.strokeDashoffset = CIRC * (1 - timerRemaining / timerTotal);
}
document.getElementById('session-count').textContent = STATE.sessions;
updateTimerDisplay();

// breathing exercise - each pattern defines durations in seconds for inhale/hold/exhale phases
var patterns = { '478': { inhale: 4, hold1: 7, exhale: 8, hold2: 0 }, 'box': { inhale: 4, hold1: 4, exhale: 4, hold2: 4 }, '22': { inhale: 2, hold1: 0, exhale: 2, hold2: 0 } };
var curPattern = patterns['478'], breatheRunning = false, breatheTimeout = null, breatheStart = 0;
var breatheCircle = document.getElementById('breathe-circle');
var breatheText = document.getElementById('breathe-text');
var breatheCounter = document.getElementById('breathe-counter');
var btnBreathe = document.getElementById('btn-breathe');

document.querySelectorAll('.pattern-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    if (breatheRunning) return;
    document.querySelectorAll('.pattern-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    curPattern = patterns[btn.dataset.pattern];
  });
});
btnBreathe.addEventListener('click', function () { breatheRunning ? stopBreathe() : startBreathe(); });

function startBreathe() {
  breatheRunning = true; btnBreathe.textContent = 'Stop'; btnBreathe.classList.add('active');
  breatheStart = Date.now(); runCycle();
}
function stopBreathe() {
  breatheRunning = false; clearTimeout(breatheTimeout);
  btnBreathe.textContent = 'Begin'; btnBreathe.classList.remove('active');
  breatheCircle.className = 'breathe-circle'; breatheText.textContent = 'Tap to start'; breatheCounter.textContent = '';
  var mins = Math.round((Date.now() - breatheStart) / 60000);
  if (mins > 0) { STATE.breatheMins += mins; save(); }
  bumpStreak();
}
// builds phase list from current pattern and runs them one after another, then loops
function runCycle() {
  if (!breatheRunning) return;
  var p = curPattern, phases = [];
  phases.push({ name: 'Breathe in', cls: 'inhale', dur: p.inhale });
  if (p.hold1) phases.push({ name: 'Hold', cls: 'hold', dur: p.hold1 });
  phases.push({ name: 'Breathe out', cls: 'exhale', dur: p.exhale });
  if (p.hold2) phases.push({ name: 'Hold', cls: 'hold', dur: p.hold2 });
  var idx = 0;
  (function next() {
    if (!breatheRunning || idx >= phases.length) { if (breatheRunning) runCycle(); return; }
    var ph = phases[idx];
    breatheCircle.className = 'breathe-circle ' + ph.cls;
    breatheCircle.style.transitionDuration = ph.dur + 's';
    breatheText.textContent = ph.name;
    var sec = ph.dur; breatheCounter.textContent = sec;
    var ci = setInterval(function () { sec--; if (sec <= 0) { clearInterval(ci); breatheCounter.textContent = ''; } else breatheCounter.textContent = sec; }, 1000);
    breatheTimeout = setTimeout(function () { idx++; next(); }, ph.dur * 1000);
  })();
}

// ambient sounds using Web Audio API - creates audio context and connects through gain nodes for volume control
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var activeSounds = {}; // keeps track of which sounds are currently playing
var soundBase = 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds';
var soundUrls = { rain: soundBase + '/rain/light-rain.mp3', ocean: soundBase + '/nature/waves.mp3', forest: soundBase + '/nature/jungle.mp3', fire: soundBase + '/nature/campfire.mp3', wind: soundBase + '/nature/wind.mp3', cafe: soundBase + '/places/cafe.mp3' };

// creates an audio element, routes it through Web Audio API gain node for smooth volume control
function playSound(type, vol) {
  var audio = new Audio(soundUrls[type]); audio.crossOrigin = 'anonymous'; audio.loop = true;
  var src = audioCtx.createMediaElementSource(audio), gain = audioCtx.createGain();
  gain.gain.value = 0; src.connect(gain); gain.connect(audioCtx.destination);
  audio.play().catch(function () { });
  gain.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + 1.5);
  return { audio: audio, gainNode: gain, source: src };
}
// fades out sound over 0.8s then disconnects and cleans up
function stopSound(type) {
  var s = activeSounds[type]; if (!s) return;
  s.gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
  s.gainNode.gain.setValueAtTime(s.gainNode.gain.value, audioCtx.currentTime);
  s.gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.8);
  setTimeout(function () { s.audio.pause(); s.audio.src = ''; try { s.source.disconnect(); } catch (e) { } try { s.gainNode.disconnect(); } catch (e) { } delete activeSounds[type]; }, 900);
}

document.querySelectorAll('.sound-card').forEach(function (card) {
  var type = card.dataset.sound, slider = card.querySelector('.sound-vol');
  // stop slider clicks from toggling the sound on/off
  slider.addEventListener('click', function (e) { e.stopPropagation(); });
  slider.addEventListener('mousedown', function (e) { e.stopPropagation(); });
  card.addEventListener('click', function (e) {
    if (e.target === slider || e.target.closest && e.target.closest('.sound-vol')) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (activeSounds[type]) { stopSound(type); card.classList.remove('active'); }
    else { activeSounds[type] = playSound(type, slider.value / 100); card.classList.add('active'); }
  });
  slider.addEventListener('input', function () {
    if (!activeSounds[type]) return;
    var g = activeSounds[type].gainNode;
    g.gain.cancelScheduledValues(audioCtx.currentTime);
    g.gain.setValueAtTime(g.gain.value, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(slider.value / 100, audioCtx.currentTime + 0.1);
  });
});
document.getElementById('btn-stop-sounds').addEventListener('click', function () {
  Object.keys(activeSounds).forEach(function (k) { stopSound(k); });
  document.querySelectorAll('.sound-card').forEach(function (c) { c.classList.remove('active'); });
});

// plays a short chime using oscillator when timer finishes
function playChime() {
  var osc = audioCtx.createOscillator(), g = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(830, audioCtx.currentTime);
  osc.frequency.setValueAtTime(1050, audioCtx.currentTime + 0.15);
  g.gain.setValueAtTime(0.3, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
  osc.connect(g); g.connect(audioCtx.destination);
  osc.start(); osc.stop(audioCtx.currentTime + 0.6);
}

// run on page load
refreshDashboard();
renderTasks();
