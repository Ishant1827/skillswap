"use strict";
const STORAGE_KEY = "skillswap_new_v1";
const SKILLS = [
  "HTML", "CSS", "JavaScript", "Python", "Java", "C++",
  "Web Design", "Graphic Design", "Video Editing",
  "Public Speaking", "Communication", "Leadership",
  "Teamwork", "English", "Hindi", "Excel", "PowerPoint",
  "MS Office", "Digital Marketing", "Content Writing",
  "AI Tools", "App Development", "Photography", "Canva",
  "Civil Engineering", "AutoCAD", "Project Management"
];
const DEMO_STUDENTS = [
  {
    id: "student_1",
    name: "Aarav Sharma",
    skillsTeach: ["HTML", "CSS", "Web Design"],
    skillsWant: ["Python", "JavaScript"],
    rating: 4.8,
    bio: "I enjoy building websites."
  },
  {
    id: "student_2",
    name: "Priya Kumari",
    skillsTeach: ["Graphic Design", "Canva"],
    skillsWant: ["English", "Public Speaking"],
    rating: 4.9,
    bio: "Creative designer who loves learning."
  },
  {
    id: "student_3",
    name: "Rahul Kumar",
    skillsTeach: ["Python", "Excel"],
    skillsWant: ["Web Design", "JavaScript"],
    rating: 4.7,
    bio: "Interested in programming."
  }
];
function createDatabase() {
  return {
    users: [],
    currentUser: null,
    connections: [],
    messages: {},
    quizResults: [],
    debateEntries: []
  };
}
function loadDatabase() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createDatabase();
    const parsed = JSON.parse(saved);
    const initial = createDatabase();
    return {
      ...initial,
      ...parsed,
      users: Array.isArray(parsed.users) ? parsed.users : [],
      connections: Array.isArray(parsed.connections)
        ? parsed.connections : [],
      messages: parsed.messages || {},
      quizResults: parsed.quizResults || [],
      debateEntries: parsed.debateEntries || []
    };
  } catch (error) {
    console.error("Database loading error:", error);
    return createDatabase();
  }
}
let db = loadDatabase();
function saveDatabase() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return true;
  } catch (error) {
    console.error("Database saving error:", error);
    alert("Data save nahi ho paya. Browser storage check karo.");
    return false;
  }
}
function el(id) {
  return document.getElementById(id);
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char];
  });
}
function createId() {
  return Date.now().toString(36) +
    Math.random().toString(36).slice(2, 9);
}
function currentUser() {
  return db.users.find(user => user.id === db.currentUser) || null;
}
function showMessage(id, message, error = false) {
  const element = el(id);
  if (!element) return;
  element.textContent = message;
  element.style.color = error ? "#c94b4b" : "#2f6b43";
}
/* LOGIN / SIGNUP */
function mode(selectedMode) {
  const signup = selectedMode === "signup";
  if (el("nameField")) {
    el("nameField").classList.toggle("hidden", !signup);
  }
  if (el("name")) {
    el("name").required = signup;
  }
  if (el("loginTab")) {
    el("loginTab").classList.toggle("active", !signup);
  }
  if (el("signupTab")) {
    el("signupTab").classList.toggle("active", signup);
  }
  if (el("authBtn")) {
    el("authBtn").textContent = signup ? "Create Account" : "Login";
  }
  if (el("authMsg")) el("authMsg").textContent = "";
  window.currentAuthMode = signup ? "signup" : "login";
}
function togglePass() {
  const password = el("password");
  if (!password) return;
  password.type = password.type === "password" ? "text" : "password";
  const button = el("togglePassword");
  if (button) {
    button.textContent = password.type === "password" ? "Show" : "Hide";
  }
}
function authSubmit(event) {
  if (event) event.preventDefault();
  const name = el("name")?.value.trim() || "";
  const email = el("email")?.value.trim().toLowerCase() || "";
  const password = el("password")?.value || "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMessage("authMsg", "Valid email address enter karo.", true);
    return false;
  }
  if (password.length < 6) {
    showMessage("authMsg", "Password kam se kam 6 characters ka hona chahiye.", true);
    return false;
  }
  if (window.currentAuthMode === "signup") {
    if (name.length < 2) {
      showMessage("authMsg", "Apna full name enter karo.", true);
      return false;
    }
    if (db.users.some(user => user.email === email)) {
      showMessage("authMsg", "Email already registered hai. Login karo.", true);
      return false;
    }
    const user = {
      id: createId(),
      name,
      email,
      password,
      skillsTeach: [],
      skillsWant: [],
      bio: "",
      coins: 100,
      rating: 0
    };
    db.users.push(user);
    db.currentUser = user.id;
    saveDatabase();
    openApp();
    return false;
  }
  const user = db.users.find(
    item => item.email === email && item.password === password
  );
  if (!user) {
    showMessage("authMsg", "Email ya password galat hai.", true);
    return false;
  }
  db.currentUser = user.id;
  saveDatabase();
  openApp();
  return false;
}
/* APP NAVIGATION */
function openApp() {
  const user = currentUser();
  if (!user) {
    el("auth")?.classList.remove("hidden");
    el("app")?.classList.add("hidden");
    return;
  }
  el("auth")?.classList.add("hidden");
  el("app")?.classList.remove("hidden");
  if (el("welcome")) {
    el("welcome").textContent = "Welcome, " + user.name + "!";
  }
  if (el("userPill")) {
    el("userPill").textContent = user.name;
  }
  page("dashboard");
}
function logout() {
  db.currentUser = null;
  saveDatabase();
  el("app")?.classList.add("hidden");
  el("auth")?.classList.remove("hidden");
  el("authForm")?.reset();
  mode("login");
}
function page(pageName) {
  if (!currentUser()) {
    el("auth")?.classList.remove("hidden");
    el("app")?.classList.add("hidden");
    return;
  }
  const titles = {
    dashboard: "Dashboard",
    students: "Explore Students",
    chat: "Student Chat",
    quiz: "Quiz Competition",
    debate: "Debate Competition",
    profile: "My Profile",
    team: "Our Team",
    ai: "AI Learning Helper"
  };
  if (el("pageTitle")) {
    el("pageTitle").textContent = titles[pageName] || "SkillSwap";
  }
  document.querySelectorAll("[data-page]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === pageName
    );
  });
  const pages = {
    dashboard: renderDashboard,
    students: renderStudents,
    chat: renderChat,
    quiz: renderQuiz,
    debate: renderDebate,
    profile: renderProfile,
    team: renderTeam,
    ai: renderAI
  };
  if (pages[pageName]) {
    pages[pageName]();
  } else if (el("content")) {
    el("content").innerHTML = "<div class='card'>Page not found.</div>";
  }
}
/* DASHBOARD */
function renderDashboard() {
  const user = currentUser();
  const content = el("content");
  if (!user || !content) return;
  const connections = db.connections.filter(
    item => item.userId === user.id
  ).length;
  content.innerHTML = `
    <div class="grid">
      <div class="card">
        <h2>Welcome, ${escapeHTML(user.name)}!</h2>
        <p>Learn together. Teach together. Grow together.</p>
      </div>
      <div class="card">
        <h3>🪙 Skill Coins</h3>
        <h2>${Number(user.coins) || 0}</h2>
      </div>
      <div class="card">
        <h3>🤝 Connections</h3>
        <h2>${connections}</h2>
      </div>
      <div class="card">
        <h3>⭐ Rating</h3>
        <h2>${user.rating || "New"}</h2>
      </div>
    </div>
    <div class="card">
      <h2>Skills are the New Currency</h2>
      <p>Exchange your knowledge and discover new skills.</p>
      <button onclick="page('students')">Find Students</button>
      <button onclick="page('quiz')">Play Quiz</button>
      <button onclick="page('ai')">AI Helper</button>
    </div>
  `;
}
/* STUDENTS */
function getStudents() {
  const user = currentUser();
  const registeredUsers = db.users
    .filter(item => item.id !== user?.id)
    .map(item => ({
      id: item.id,
      name: item.name,
      skillsTeach: item.skillsTeach || [],
      skillsWant: item.skillsWant || [],
      rating: item.rating || 0,
      bio: item.bio || "SkillSwap student"
    }));
  return registeredUsers.concat(DEMO_STUDENTS);
}
function renderStudents() {
  const content = el("content");
  if (!content) return;
  content.innerHTML = `
    <div class="card">
      <h2>Explore Students</h2>
      <input id="studentSearch" type="search"
        placeholder="Search students or skills...">
    </div>
    <div id="studentsList" class="students"></div>
  `;
  el("studentSearch")?.addEventListener("input", renderStudentCards);
  renderStudentCards();
}
function renderStudentCards() {
  const list = el("studentsList");
  if (!list) return;
  const query = (el("studentSearch")?.value || "").toLowerCase();
  const students = getStudents().filter(student => {
    const text = [
      student.name,
      student.bio,
      ...student.skillsTeach,
      ...student.skillsWant
    ].join(" ").toLowerCase();
    return text.includes(query);
  });
  if (!students.length) {
    list.innerHTML = "<div class='card'>No students found.</div>";
    return;
  }
  list.innerHTML = students.map(student => {
    const connected = db.connections.some(item =>
      item.userId === db.currentUser &&
      item.studentId === student.id
    );
    return `
      <div class="card">
        <h3>${escapeHTML(student.name)}</h3>
        <p>${escapeHTML(student.bio)}</p>
        <p><strong>Teaches:</strong>
          ${student.skillsTeach.map(escapeHTML).join(", ") || "Not specified"}
        </p>
        <p><strong>Wants:</strong>
          ${student.skillsWant.map(escapeHTML).join(", ") || "Not specified"}
        </p>
        <p>⭐ ${student.rating || "New"}</p>
        <button onclick="connect('${escapeHTML(student.id)}')"
          ${connected ? "disabled" : ""}>
          ${connected ? "Connected" : "Connect"}
        </button>
      </div>
    `;
  }).join("");
}
function connect(studentId) {
  const user = currentUser();
  if (!user) return;
  const student = getStudents().find(item => item.id === studentId);
  if (!student) {
    alert("Student nahi mila.");
    return;
  }
  if (db.connections.some(item =>
    item.userId === user.id && item.studentId === studentId
  )) {
    alert("Already connected!");
    return;
  }
  db.connections.push({
    id: createId(),
    userId: user.id,
    studentId,
    studentName: student.name
  });
  saveDatabase();
  alert("Connection added successfully!");
  renderStudentCards();
}

/* CHAT */
function connectedStudents() {
  const user = currentUser();
  if (!user) return [];
  return db.connections
    .filter(item => item.userId === user.id)
    .map(connection => getStudents().find(
      student => student.id === connection.studentId
    ) || {
      id: connection.studentId,
      name: connection.studentName,
      skillsTeach: [],
      skillsWant: []
    });
}
let activeChatStudentId = "";
let chatLastRenderedSignature = "";
function formatChatTime(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}
function renderChat() {
  const content = el("content");
  if (!content) return;
  const students = connectedStudents();
  activeChatStudentId = "";
  chatLastRenderedSignature = "";
  content.innerHTML = `
    <div class="card">
      <h2>Student Chat 💬</h2>
      <p>Choose a connected student to start chatting.</p>
      <select id="chatStudent" onchange="openChat(this.value)">
        <option value="">Select student</option>
        ${students.map(student => `
          <option value="${escapeHTML(student.id)}">
            ${escapeHTML(student.name)}
          </option>
        `).join("")}
      </select>
      <div id="chatWindow">
        ${students.length
          ? "<p>Select a student to view messages.</p>"
          : "<p>No connected students found. Connect with a student first.</p>"}
      </div>
    </div>
  `;
}
function openChat(studentId) {
  const user = currentUser();
  const windowBox = el("chatWindow");
  if (!windowBox || !user) return;
  const student = connectedStudents().find(item => item.id === studentId);
  if (!student) {
    activeChatStudentId = "";
    chatLastRenderedSignature = "";
    windowBox.innerHTML = "<p>Select a connected student.</p>";
    return;
  }
  activeChatStudentId = studentId;
  const key = [user.id, student.id].sort().join("__");
  const messages = Array.isArray(db.messages[key]) ? db.messages[key] : [];
  const signature = JSON.stringify(messages);
  if (
    signature === chatLastRenderedSignature &&
    windowBox.querySelector(".chat-messages")
  ) {
    return;
  }
  chatLastRenderedSignature = signature;
  windowBox.innerHTML = `
    <h3>Chat with ${escapeHTML(student.name)}</h3>
    <div class="chat-messages" aria-live="polite" aria-relevant="additions text">
      ${messages.length ? messages.map(message => {
        const mine = message.senderId === user.id;
        return `
          <div class="message ${mine ? "message-mine" : "message-other"}">
            <strong>${escapeHTML(message.senderName || "Member")}</strong>
            <p>${escapeHTML(message.text)}</p>
            <small>${escapeHTML(formatChatTime(message.createdAt))}</small>
          </div>
        `;
      }).join("") : "<p class='chat-empty'>No messages yet. Say hello! 👋</p>"}
    </div>
    <form id="chatForm" onsubmit="return sendMsg(event, '${escapeHTML(student.id)}')">
      <input
        id="chatInput"
        type="text"
        maxlength="1000"
        placeholder="Write a message..."
        autocomplete="off"
        required
      >
      <button type="submit">Send ➤</button>
    </form>
  `;
  const messagesBox = windowBox.querySelector(".chat-messages");
  if (messagesBox) messagesBox.scrollTop = messagesBox.scrollHeight;
  const studentSelect = el("chatStudent");
  if (studentSelect) studentSelect.value = student.id;
}
function sendMsg(event, studentId) {
  if (event) event.preventDefault();
  const user = currentUser();
  const input = el("chatInput");
  const student = connectedStudents().find(item => item.id === studentId);
  if (!user || !input || !student) return false;
  const text = input.value.trim();
  if (!text) return false;
  const key = [user.id, studentId].sort().join("__");
  if (!Array.isArray(db.messages[key])) db.messages[key] = [];
  db.messages[key].push({
    id: createId(),
    senderId: user.id,
    senderName: user.name,
    text,
    createdAt: Date.now()
  });
  if (!saveDatabase()) return false;
  chatLastRenderedSignature = "";
  openChat(studentId);
  return false;
}
window.addEventListener("storage", function (event) {
  if (event.key !== STORAGE_KEY) return;
  db = loadDatabase();
  if (activeChatStudentId && el("chatWindow") && currentUser()) {
    chatLastRenderedSignature = "";
    openChat(activeChatStudentId);
  }
});
/* QUIZ */
const QUESTIONS = [
  {
    question: "Which language styles web pages?",
    options: ["HTML", "CSS", "SQL", "Python"],
    correct: 1
  },
  {
    question: "What does HTML stand for?",
    options: [
      "HyperText Markup Language",
      "HighText Machine Language",
      "Hyper Tool Multi Language",
      "HomeText Markup Language"
    ],
    correct: 0
  },
  {
    question: "Which application is used for spreadsheets?",
    options: ["Excel", "Paint", "Notepad", "Camera"],
    correct: 0
  },
  {
    question: "Which is an important teamwork skill?",
    options: ["Communication", "Ignoring", "Guessing", "Avoiding"],
    correct: 0
  }
];
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;
function renderQuiz() {
  if (!el("content")) return;
  el("content").innerHTML = `
    <div class="card">
      <h2>Quiz Competition</h2>
      <p>Test your knowledge and practise new skills.</p>
      <button onclick="startQuiz()">Start Quiz</button>
    </div>
    <div id="quizArea"></div>
  `;
}
function startQuiz() {
  quizIndex = 0;
  quizScore = 0;
  quizAnswered = false;
  showQuestion();
}
function showQuestion() {
  const area = el("quizArea");
  if (!area) return;
  if (quizIndex >= QUESTIONS.length) {
    area.innerHTML = `
      <div class="card">
        <h2>Quiz Completed!</h2>
        <h3>Score: ${quizScore}/${QUESTIONS.length}</h3>
        <button onclick="startQuiz()">Play Again</button>
      </div>
    `;
    db.quizResults.push({
      userId: db.currentUser,
      score: quizScore,
      total: QUESTIONS.length,
      createdAt: Date.now()
    });
    saveDatabase();
    return;
  }
  const item = QUESTIONS[quizIndex];
  quizAnswered = false;
  area.innerHTML = `
    <div class="card quizq">
      <p>Question ${quizIndex + 1} of ${QUESTIONS.length}</p>
      <h3>${escapeHTML(item.question)}</h3>
      <div class="quiz-options">
        ${item.options.map((option, index) => `
          <button class="option" onclick="answer(${index})">
            ${escapeHTML(option)}
          </button>
        `).join("")}
      </div>
      <p id="quizFeedback"></p>
      <button id="nextQuestion" onclick="nextQuestion()" disabled>
        Next Question
      </button>
    </div>
  `;
}
function answer(optionIndex) {
  if (quizAnswered) return;
  const item = QUESTIONS[quizIndex];
  if (!item || optionIndex < 0 || optionIndex >= item.options.length) return;
  quizAnswered = true;
  document.querySelectorAll(".quiz-options .option").forEach((button, index) => {
    button.disabled = true;
    if (index === item.correct) {
      button.style.backgroundColor = "#d9f2d2";
    } else if (index === optionIndex) {
      button.style.backgroundColor = "#ffe0e0";
    }
  });
  const feedback = el("quizFeedback");
  if (optionIndex === item.correct) {
    quizScore++;
    if (feedback) feedback.textContent = "Correct answer!";
  } else if (feedback) {
    feedback.textContent = "Correct answer: " + item.options[item.correct];
  }
  if (el("nextQuestion")) el("nextQuestion").disabled = false;
}
function nextQuestion() {
  if (!quizAnswered) return;
  quizIndex++;
  showQuestion();
}
/* DEBATE */
function renderDebate() {
  const content = el("content");
  if (!content) return;
  content.innerHTML = `
    <div class="card">
      <h2>Debate Competition</h2>
      <label for="debateTopic">Topic</label>
      <select id="debateTopic">
        <option>Is online learning better than classroom learning?</option>
        <option>Should students learn coding?</option>
        <option>Is AI helpful for students?</option>
        <option>Is teamwork better than working alone?</option>
      </select>
      <label for="debateSide">Your position</label>
      <select id="debateSide">
        <option>For / Agree</option>
        <option>Against / Disagree</option>
      </select>
      <textarea id="debateText" rows="5"
        placeholder="Write your argument..."></textarea>
      <button onclick="startDebate()">Submit Argument</button>
      <p id="debateMessage"></p>
      <div id="debateHistory"></div>
    </div>
  `;
  updateDebateHistory();
}
function startDebate() {
  const topic = el("debateTopic")?.value;
  const side = el("debateSide")?.value;
  const text = el("debateText")?.value.trim();
  if (!text || text.length < 10) {
    showMessage("debateMessage", "At least 10 characters likho.", true);
    return;
  }
  db.debateEntries.push({
    id: createId(),
    userId: db.currentUser,
    topic,
    side,
    text,
    createdAt: Date.now()
  });
  saveDatabase();
  el("debateText").value = "";
  showMessage("debateMessage", "Argument saved successfully!");
  updateDebateHistory();
}
function updateDebateHistory() {
  const history = el("debateHistory");
  if (!history) return;
  const entries = db.debateEntries.filter(
    item => item.userId === db.currentUser
  );
  history.innerHTML = entries.slice().reverse().map(item => `
    <div class="card">
      <h3>${escapeHTML(item.topic)}</h3>
      <p>${escapeHTML(item.side)}</p>
      <p>${escapeHTML(item.text)}</p>
    </div>
  `).join("") || "<p>No arguments submitted yet.</p>";
}

/* ---------- 13. PROFILE ---------- */
function renderProfile() {
  const content = getElement("content");
  const user = getCurrentUser();
  if (!content || !user) return;
  content.innerHTML = `
    <div class="card">
      <h2>My Profile</h2>
      <label for="profileName">Full name</label>
      <input
        id="profileName"
        type="text"
        maxlength="80"
        value="${escapeHTML(user.name)}"
        required
      >
      <label for="profileEmail">Email address</label>
      <input
        id="profileEmail"
        type="email"
        value="${escapeHTML(user.email)}"
        disabled
      >
      <label for="teachSkills">Skills I can teach</label>
      <select id="teachSkills" multiple size="7">
        ${SKILLS.map(function (skill) {
          const selected = (user.skillsTeach || []).includes(skill)
            ? "selected" : "";
          return `<option value="${escapeHTML(skill)}" ${selected}>${escapeHTML(skill)}</option>`;
        }).join("")}
      </select>
      <small>On a computer, use Ctrl (Windows) or Command (Mac) to select multiple skills.</small>
      <label for="wantSkills">Skills I want to learn</label>
      <select id="wantSkills" multiple size="7">
        ${SKILLS.map(function (skill) {
          const selected = (user.skillsWant || []).includes(skill)
            ? "selected" : "";
          return `<option value="${escapeHTML(skill)}" ${selected}>${escapeHTML(skill)}</option>`;
        }).join("")}
      </select>
      <label for="profileBio">About me</label>
      <textarea
        id="profileBio"
        rows="4"
        maxlength="500"
        placeholder="Tell others about yourself..."
      >${escapeHTML(user.bio || "")}</textarea>
      <p><strong>Skill Coins:</strong> ${Number(user.coins) || 0}</p>
      <p><strong>Rating:</strong> ${
        Number(user.rating) > 0 ? Number(user.rating).toFixed(1) : "Not rated yet"
      }</p>
      <button type="button" onclick="saveProfile()">Save Profile</button>
      <p id="profileMessage" aria-live="polite"></p>
    </div>
  `;
}
function saveProfile() {
  const user = getCurrentUser();
  const nameInput = getElement("profileName");
  const bioInput = getElement("profileBio");
  if (!user || !nameInput || !bioInput) return;
  const name = nameInput.value.trim();
  if (name.length < 2) {
    showMessage("profileMessage", "Name must contain at least 2 characters.", true);
    return;
  }
  user.name = name;
  user.skillsTeach = selectedSkills("teachSkills");
  user.skillsWant = selectedSkills("wantSkills");
  user.bio = bioInput.value.trim();
  saveDatabase();
  const welcome = getElement("welcome");
  const userPill = getElement("userPill");
  if (welcome) welcome.textContent = "Welcome, " + user.name + "!";
  if (userPill) userPill.textContent = user.name;
  showMessage("profileMessage", "Profile saved successfully.");
}
/* ---------- 14. TEAM PAGE ---------- */
function renderTeam() {
  const content = getElement("content");
  if (!content) return;
  const team = [
    {
      name: "Roshani Kumari",
      role: "Team Leader & Representative",
      image: "images/roshani.png"
    },
    {
      name: "Subham Kasyap",
      role: "Website Design & Project Coordinator",
      image: "images/subham.png"
    },
    {
      name: "Anurag Kumar",
      role: "Website Manager & Co-coordinator",
      image: "images/anurag.png"
    }
  ];
  content.innerHTML = `
    <div class="card">
      <h2>Meet Our Team</h2>
      <p>Government Polytechnic Gopalganj</p>
      <p>Skills are the New Currency.</p>
    </div>
    <div class="grid">
      ${team.map(function (member) {
        return `
          <div class="card team-card">
            <div class="team-photo">
              <img
                src="${escapeHTML(member.image)}"
                alt="${escapeHTML(member.name)}"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
              >
              <div class="avatar" style="display:none;">
                ${escapeHTML(initials(member.name))}
              </div>
            </div>
            <p>${escapeHTML(member.role)}</p>
          </div>
        `;
      }).join("")}
    </div>
  `;
}
/* ---------- 15. AI LEARNING HELPER ---------- */
function renderAI() {
  const content = getElement("content");
  if (!content) return;
  content.innerHTML = `
    <div class="card">
      <h2>🤖 AI Learning Helper</h2>
      <p>Ask for learning tips, skill suggestions or a study plan.</p>
      <p><small>This demo uses built-in responses. It is not connected to a live AI API.</small></p>
      <form id="aiForm" onsubmit="askAI(event)">
        <textarea
          id="aiQuestion"
          rows="3"
          maxlength="1000"
          placeholder="Example: How can I learn web development?"
          required
        ></textarea>
        <button type="submit">Get Suggestions</button>
      </form>
      <div id="aiAnswer" class="card" aria-live="polite">
        Your learning suggestions will appear here.
      </div>
    </div>
  `;
}
function askAI(event) {
  if (event) event.preventDefault();
  const questionInput = getElement("aiQuestion");
  const answerBox = getElement("aiAnswer");
  if (!questionInput || !answerBox) return false;
  const question = questionInput.value.trim().toLowerCase();
  if (!question) {
    answerBox.textContent = "Please enter a question first.";
    return false;
  }
  let answerText;
  if (/html|css|javascript|website|web development/.test(question)) {
    answerText =
      "Web development roadmap:\n\n" +
      "1. Learn HTML to structure web pages.\n" +
      "2. Learn CSS to design and style them.\n" +
      "3. Learn JavaScript for interactivity.\n" +
      "4. Build a portfolio website.\n" +
      "5. Practise by creating small projects.";
  } else if (/python|programming|coding|java/.test(question)) {
    answerText =
      "Programming roadmap:\n\n" +
      "1. Start with variables and data types.\n" +
      "2. Practise conditions and loops.\n" +
      "3. Learn functions and basic data structures.\n" +
      "4. Solve beginner problems regularly.\n" +
      "5. Build a small project to apply your knowledge.";
  } else if (/english|speak|communication|public speaking/.test(question)) {
    answerText =
      "To improve communication:\n\n" +
      "1. Practise speaking for five minutes each day.\n" +
      "2. Read a short passage aloud.\n" +
      "3. Learn a few useful words daily.\n" +
      "4. Record a practice presentation.\n" +
      "5. Ask a trusted friend for feedback.";
  } else if (/exam|study|time|timetable|plan/.test(question)) {
    answerText =
      "A simple study plan:\n\n" +
      "1. Write down the topics you need to cover.\n" +
      "2. Break them into small tasks.\n" +
      "3. Study one topic at a time.\n" +
      "4. Take short breaks.\n" +
      "5. Review what you learned and practise questions.";
  } else if (/design|canva|graphic|ui|ux/.test(question)) {
    answerText =
      "Design learning roadmap:\n\n" +
      "1. Learn basic layout, spacing and typography.\n" +
      "2. Study colour contrast and readability.\n" +
      "3. Recreate simple designs for practice.\n" +
      "4. Try a tool such as Canva or a UI design app.\n" +
      "5. Save your best work in a portfolio.";
  } else {
    answerText =
      "Here is a general learning strategy:\n\n" +
      "1. Choose one clear goal.\n" +
      "2. Break the goal into small skills.\n" +
      "3. Learn from reliable lessons or a skill partner.\n" +
      "4. Practise by doing a real task.\n" +
      "5. Review your progress every week.\n\n" +
      "Tip: Try the Students section to find a learning partner.";
  }
  answerBox.textContent = answerText;
  return false;
}

/* ---------- 16. CONNECTION REQUESTS ---------- */
function renderRequests() {
  const user = getCurrentUser();
  const content = getElement("content");
  if (!user || !content) return;
  const requests = (db.requests || []).filter(function (request) {
    return request.toUserId === user.id &&
      request.status === "pending";
  });
  content.innerHTML = `
    <div class="card">
      <h2>Connection Requests</h2>
      ${
        requests.length
          ? requests.map(function (request) {
              return `
                <div class="request-item">
                  <strong>${escapeHTML(request.fromName)}</strong>
                  <button type="button" onclick="respondRequest('${escapeHTML(request.id)}', true)">Accept</button>
                  <button type="button" onclick="respondRequest('${escapeHTML(request.id)}', false)">Decline</button>
                </div>
              `;
            }).join("")
          : "<p>You have no pending requests.</p>"
      }
    </div>
  `;
}
function respondRequest(requestId, accept) {
  const user = getCurrentUser();
  if (!user) return;
  if (!Array.isArray(db.requests)) db.requests = [];
  const request = db.requests.find(function (item) {
    return item.id === requestId &&
      item.toUserId === user.id &&
      item.status === "pending";
  });
  if (!request) {
    alert("Request not found.");
    return;
  }
  request.status = accept ? "accepted" : "declined";
  if (accept) {
    const alreadyConnected = db.connections.some(function (connection) {
      return connection.userId === user.id &&
        connection.studentId === request.fromUserId;
    });
    if (!alreadyConnected) {
      db.connections.push({
        id: createId(),
        userId: user.id,
        studentId: request.fromUserId,
        studentName: request.fromName,
        createdAt: Date.now()
      });
    }
  }
  saveDatabase();
  renderRequests();
}
/* ---------- 17. INITIAL STARTUP ---------- */
function getElement(id) {
  return document.getElementById(id);
}
function getCurrentUser() {
  return currentUser();
}
function selectedSkills(id) {
  const select = getElement(id);
  if (!select) return [];
  return Array.from(select.selectedOptions, option => option.value);
}
function initials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .map(part => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
function initializeSkillSwap() {
  if (!Array.isArray(db.users)) db.users = [];
  db.currentUser = null;
  const auth = getElement("auth");
  const app = getElement("app");
  if (auth) auth.classList.remove("hidden");
  if (app) app.classList.add("hidden");
  const form = getElement("authForm");
  if (form && form.dataset.initialized !== "true") {
    form.dataset.initialized = "true";
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      authSubmit(event);
    });
  }
  mode("login");
}
/* Make functions available to HTML */
Object.assign(window, {
  mode,
  togglePass,
  authSubmit,
  openApp,
  logout,
  page,
  connect,
  renderStudents,
  openChat,
  sendMsg,
  answer,
  startQuiz,
  nextQuestion,
  startDebate,
  saveProfile,
  askAI,
  renderProfile,
  renderTeam,
  renderAI,
  renderRequests,
  respondRequest,
  openMyProfile: () => page("profile"),
  openOurTeam: () => page("team"),
  openAIHelper: () => page("ai")
});
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeSkillSwap);
} else {
  initializeSkillSwap();
}
