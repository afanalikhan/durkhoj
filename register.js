document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const tabRegister = document.getElementById("tabRegister");
  const tabLogin = document.getElementById("tabLogin");
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  const alertBox = document.getElementById("alertBox");

  const roleBuyerLabel = document.getElementById("roleBuyerLabel");
  const roleSellerLabel = document.getElementById("roleSellerLabel");

  // Helper function to render alert messages
  function showAlert(message, type = "error") {
    alertBox.textContent = message;
    alertBox.className = `alert ${type}`;
  }

  function hideAlert() {
    alertBox.className = "alert hidden";
  }

  // Storage Helpers
  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem("dur_khoj_users") || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveUser(user) {
    const users = getUsers();
    users.push(user);
    localStorage.setItem("dur_khoj_users", JSON.stringify(users));
  }

  function setCurrentSession(user) {
    localStorage.setItem("dur_khoj_session", JSON.stringify(user));
  }

  // --- TAB SWITCHING HANDLERS ---
  tabRegister.addEventListener("click", () => {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");

    registerForm.classList.remove("hidden-form");
    registerForm.classList.add("active-form");

    loginForm.classList.remove("active-form");
    loginForm.classList.add("hidden-form");

    hideAlert();
  });

  tabLogin.addEventListener("click", () => {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");

    loginForm.classList.remove("hidden-form");
    loginForm.classList.add("active-form");

    registerForm.classList.remove("active-form");
    registerForm.classList.add("hidden-form");

    hideAlert();
  });

  // --- ROLE SWITCHING HANDLERS ---
  roleBuyerLabel.addEventListener("click", () => {
    roleBuyerLabel.classList.add("active");
    roleSellerLabel.classList.remove("active");
    roleBuyerLabel.querySelector('input[type="radio"]').checked = true;
  });

  roleSellerLabel.addEventListener("click", () => {
    roleSellerLabel.classList.add("active");
    roleBuyerLabel.classList.remove("active");
    roleSellerLabel.querySelector('input[type="radio"]').checked = true;
  });

  // --- CREATE ACCOUNT / REGISTER SUBMISSION ---
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    hideAlert();

    const roleRadio = document.querySelector('input[name="role"]:checked');
    const role = roleRadio ? roleRadio.value : "buyer";
    
    const fullName = document.getElementById("regFullName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const location = document.getElementById("regLocation").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("regConfirmPassword").value;

    if (password !== confirmPassword) {
      showAlert("Passwords do not match. Please try again.", "error");
      return;
    }

    const users = getUsers();
    const existingUser = users.find((u) => u.email === email);

    if (existingUser) {
      showAlert("An account with this email address already exists. Please Sign In.", "error");
      return;
    }

    const newUser = {
      id: Date.now(),
      fullName,
      email,
      location,
      password,
      role,
      createdAt: new Date().toISOString()
    };

    saveUser(newUser);
    setCurrentSession({
      id: newUser.id,
      fullName: newUser.fullName,
      role: newUser.role,
      email: newUser.email,
      location: newUser.location
    });

    showAlert("Registration successful! Redirecting to home...", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 800);
  });

  // --- SIGN IN / LOGIN SUBMISSION ---
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    hideAlert();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    const users = getUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      showAlert("Invalid email address or password.", "error");
      return;
    }

    setCurrentSession({
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      email: user.email,
      location: user.location
    });

    showAlert("Sign in successful! Redirecting...", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 800);
  });
});