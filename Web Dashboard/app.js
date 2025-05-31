import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDjoCfHSkzv7YDsPUx1HzMKVOZ7NwDXlE0",
  authDomain: "fault-locator-f0b8f.firebaseapp.com",
  databaseURL: "https://fault-locator-f0b8f-default-rtdb.firebaseio.com",
  projectId: "fault-locator-f0b8f",
  storageBucket: "fault-locator-f0b8f.appspot.com",
  messagingSenderId: "12078071960",
  appId: "1:12078071960:web:d8fc7aafdf5128fef2d0ed"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const defaultUsername = 'admin';
const defaultPassword = 'admin1234';
let lastFaults = [];

const faultSound = new Audio("alert.mp3");

function getFaultData() {
  const faultRef = ref(database, '/');
  onValue(faultRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const timestamp = new Date().toLocaleString();
      const faults = [];

      updateCard('red-wire', 'Red', data.R.signal, data.R.status, timestamp, faults);
      updateCard('yellow-wire', 'Yellow', data.Y.signal, data.Y.status, timestamp, faults);
      updateCard('blue-wire', 'Blue', data.B.signal, data.B.status, timestamp, faults);

      updateFaultSummary(faults);

      if (faults.length > 0 && JSON.stringify(faults) !== JSON.stringify(lastFaults)) {
        faultSound.play();
        lastFaults = faults;
      }
    }
  });
}

function updateCard(id, color, signal, status, timestamp, faultsList) {
  let solutionMsg = "";
  let solutionClass = "";
  let causeMsg = "";
  const location = "Lab";
  const statusStr = String(status).toLowerCase();
  const displayName = (color === 'Red') ? 'Green' :
                      (color === 'Blue') ? 'Orange' : color;

  if (statusStr.includes("m")) {
    solutionMsg = `${displayName} wire is damaged. Please check the cable at ${status}.`;
    causeMsg = "This usually occurs due to physical stress, bending, or wear-and-tear at joints.";
    solutionClass = "damaged";
    faultsList.push(`${displayName} wire is damaged at ${status}`);
  } else if (statusStr === "nf") {
    if (parseInt(signal) > -70) {
      solutionMsg = `${displayName} cable is in good condition.`;
      causeMsg = "No issue detected.";
      solutionClass = "good";
    } else {
      solutionMsg = `${displayName} cable signal is weak. Please check.`;
      causeMsg = "This can be caused by loose connections, signal interference, or early signs of wear.";
      solutionClass = "weak";
      faultsList.push(`${displayName} wire has weak signal: ${signal} dBm`);
    }
  }

  document.getElementById(id).innerHTML =
    `<strong>${displayName} Wire</strong><br>
    Location: ${location}<br>
    Signal: ${signal} dBm<br>
    Status: <span class="status ${color.toUpperCase()}">${status}</span><br>
    Time: ${timestamp}<br>
    <div class="solution ${solutionClass}">${solutionMsg}</div>
    <div class="solution-cause"><strong>Why it happens:</strong> ${causeMsg}</div>
    <div class="solution-tips"><strong>Fix Tip:</strong> ${
      solutionClass === "damaged" ? "Replace or re-solder the damaged section." :
      solutionClass === "weak" ? "Tighten connectors, check for EMI sources, or replace worn segments." :
      "No action needed."
    }</div>`;
}

function updateFaultSummary(faults) {
  const faultDiv = document.getElementById("fault-summary");
  if (faults.length === 0) {
    faultDiv.innerHTML = "<h2>🟢 No current faults</h2><p>All cables are in good condition.</p>";
  } else {
    faultDiv.innerHTML = `<h2>🔴 Current Faults</h2><ul>${faults.map(f => `<li>${f}</li>`).join('')}</ul>`;
  }
}

function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (username === defaultUsername && password === defaultPassword) {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('dashboard-container').style.display = 'block';
    getFaultData();
  } else {
    alert('Invalid credentials, please try again.');
  }
}

window.onload = () => {
  document.getElementById('login-form').addEventListener('submit', handleLogin);

  // Sparkle effect
  const sparkleContainer = document.getElementById("sparkle-container");
  const colors = ['#ae77fa', '#77faff', '#fa77e1', '#ffffff', '#ffdd57'];

  document.addEventListener("mousemove", e => {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";

    const color = colors[Math.floor(Math.random() * colors.length)];
    const rotation = `${Math.floor(Math.random() * 360)}deg`;

    sparkle.style.left = `${e.pageX}px`;
    sparkle.style.top = `${e.pageY}px`;
    sparkle.style.setProperty('--sparkle-color', color);
    sparkle.style.setProperty('--sparkle-rotation', rotation);

    sparkleContainer.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 800);
  });
};
