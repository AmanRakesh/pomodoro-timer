// Variables
let workTime = 25 * 60;
let breakTime = 5 * 60;
let sessionCount = 4;
let currentSession = 1;
let timeLeft = workTime;
let isBreak = false;
let timer;
let completedSessions = 0;
let totalSessions = sessionCount;
let profiles = [
  { name: 'default', workDuration: 25, breakDuration: 5, sessions: 4 }
];
let currentProfile = profiles[0];

// Audio elements for ticking sound and session end
const workSound = document.getElementById('workSound');
const breakSound = document.getElementById('breakSound');
const tickSound = document.getElementById('tickSound');

// Timer and buttons
const timerElement = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');

// Profile inputs and management
const profileSelect = document.getElementById('profileSelect');
const addProfileButton = document.getElementById('addProfileButton');
const deleteProfileButton = document.getElementById('deleteProfileButton');
const removeAllProfilesButton = document.getElementById('removeAllProfilesButton');

// Profile information display
const profileInfo = {
  work: document.getElementById('profile-work'),
  break: document.getElementById('profile-break'),
  sessions: document.getElementById('profile-sessions'),
  completedSessions: document.getElementById('completedSessions'),
  remainingSessions: document.getElementById('remainingSessions'),
};

// Modal elements for adding profiles
const addProfileModal = document.getElementById('addProfileModal');
const saveProfileModal = document.getElementById('saveProfileModal');
const modalProfileName = document.getElementById('modalProfileName');
const modalWorkDuration = document.getElementById('modalWorkDuration');
const modalBreakDuration = document.getElementById('modalBreakDuration');
const modalSessionCount = document.getElementById('modalSessionCount');

// Start button handler
startButton.onclick = function() {
  if (!timer) {
    timer = setInterval(updateTimer, 1000);
  }
};

// Reset button handler
resetButton.onclick = function() {
    resetTimer()
};

// Add new profile button click
addProfileButton.onclick = function() {
  openAddProfileModal();
};

// Save profile after modal input
saveProfileModal.onclick = function() {
  const profileName = modalProfileName.value;
  const workDuration = parseInt(modalWorkDuration.value);
  const breakDuration = parseInt(modalBreakDuration.value);
  const sessionCount = parseInt(modalSessionCount.value);

  if (profileName && workDuration > 0 && breakDuration > 0 && sessionCount > 0) {
    const profile = {
      workDuration: workDuration,
      breakDuration: breakDuration,
      sessionCount: sessionCount
    };

    saveProfile(profileName, profile);
    loadProfiles();
    closeAddProfileModal();
  } else {
    alert('Please fill all fields correctly.');
  }
};

// Profile select change handler
profileSelect.onchange = function() {
  const profile = getProfile(profileSelect.value);
  if (profile) {
    updateProfileInfo(profile);
    workTime = profile.workDuration * 60;
    breakTime = profile.breakDuration * 60;
    sessionCount = profile.sessionCount;
    resetTimer();
  }
};

// Timer update function
function updateTimer() {
  if (timeLeft > 0) {
    timeLeft--;
    updateTimerDisplay();
    tickSound.currentTime = 0;
    tickSound.play();
  } else {
    if (isBreak) {
      currentSession++;
      breakSound.play();
    } else {
      workSound.play();
    }

    if (currentSession > sessionCount) {
      resetTimer();
    } else {
      isBreak = !isBreak;
      timeLeft = isBreak ? breakTime : workTime;
    }
  }
}

// Update timer display
function updateTimerDisplay() {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  timerElement.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Reset the timer
function resetTimer() {
  // Stop the timer interval if it's running
  if (timer) {
    clearInterval(timer); // Clear the timer interval
    timer = null; // Reset the timer variable
  }
    currentSession = 1; // Reset the current session
    timeLeft = workTime; // Reset the time to the work time
    isBreak = false; // Reset break status
    completedSessions = 0; // Reset completed sessions count
    updateTimerDisplay(); // Update the display
    updateSessionInfo(); // Update the session info UI
    
    // Stop the tick sound and reset it to the beginning
    tickSound.pause();
    tickSound.currentTime = 0; // Reset the time of the tick sound
    
    // Stop any other sounds if needed
    workSound.pause();
    workSound.currentTime = 0;
    breakSound.pause();
    breakSound.currentTime = 0;
}

// Profile management in localStorage
function getProfile(name) {
  const profiles = JSON.parse(localStorage.getItem('profiles')) || {};
  return profiles[name] || null;
}

// Save profile to localStorage
function saveProfile(name, profile) {
  const profiles = JSON.parse(localStorage.getItem('profiles')) || {};
  profiles[name] = profile;
  localStorage.setItem('profiles', JSON.stringify(profiles));
}

// Load profiles from localStorage
function loadProfiles() {
  const profiles = JSON.parse(localStorage.getItem('profiles')) || {};
  profileSelect.innerHTML = '<option value="default">Default (25 min work, 5 min break)</option>';
  for (const name in profiles) {
    const option = document.createElement('option');
    option.value = name;
    option.text = name;
    profileSelect.add(option);
  }
}

// Update profile info in the UI
function updateProfileInfo(profile) {
  profileInfo.work.textContent = `${profile.workDuration} min`;
  profileInfo.break.textContent = `${profile.breakDuration} min`;
  profileInfo.sessions.textContent = profile.sessions;
  totalSessions = profile.sessions;
  updateSessionInfo();
}

// Update session info UI
function updateSessionInfo() {
  profileInfo.completedSessions.textContent = completedSessions;
  profileInfo.remainingSessions.textContent = totalSessions - completedSessions;
}

// Handle profile deletion
deleteProfileButton.onclick = function() {
  if (profileSelect.value === 'default') {
    alert("Default profile cannot be deleted.");
    return;
  }

  let profiles = JSON.parse(localStorage.getItem('profiles')) || {};
  delete profiles[profileSelect.value];
  localStorage.setItem('profiles', JSON.stringify(profiles));
  loadProfiles();
  alert("Profile deleted!");
};

// Remove all profiles except default
removeAllProfilesButton.onclick = function() {
  let profiles = JSON.parse(localStorage.getItem('profiles')) || {};
  profiles = { default: profiles['default'] };
  localStorage.setItem('profiles', JSON.stringify(profiles));
  loadProfiles();
  alert("All profiles except default have been deleted.");
};

// Call this function when a session completes
function completeSession() {
  completedSessions++;
  updateSessionInfo();

  if (completedSessions >= totalSessions) {
    alert("All sessions completed!");
    resetTimer();
  }
}

// Open the modal for adding a new profile
function openAddProfileModal() {
  modalProfileName.value = "";
  modalWorkDuration.value = 25;
  modalBreakDuration.value = 5;
  modalSessionCount.value = 4;
  M.Modal.getInstance(addProfileModal).open();
}

// Close the modal
function closeAddProfileModal() {
  M.Modal.getInstance(addProfileModal).close();
}

// Load profiles on startup
document.addEventListener('DOMContentLoaded', function() {
  const modals = document.querySelectorAll('.modal');
  M.Modal.init(modals);
  const elemsTooltip = document.querySelectorAll('.tooltipped');
  M.Tooltip.init(elemsTooltip);
  loadProfiles();
});
