document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const tabBtns = document.querySelectorAll(".tab-btn");
  const sectionBlocks = document.querySelectorAll(".section-block");
  
  const userNameDisplay = document.getElementById("userNameDisplay");
  const userRoleDisplay = document.getElementById("userRoleDisplay");
  const userAvatar = document.getElementById("userAvatar");

  // Interactive Tab Switcher
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons
      tabBtns.forEach((b) => b.classList.remove("active"));
      // Hide all sections
      sectionBlocks.forEach((sec) => sec.classList.remove("active"));

      // Set active button
      btn.classList.add("active");
      const targetId = btn.getAttribute("data-target");
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        targetSection.classList.add("active");
      }
    });
  });

  // Sync user profile state from localStorage session
  function syncUserSession() {
    let sessionUser = null;
    try {
      sessionUser = JSON.parse(localStorage.getItem("dur_khoj_session"));
    } catch (e) {
      sessionUser = null;
    }

    if (sessionUser && sessionUser.fullName) {
      const name = sessionUser.fullName;
      if (userNameDisplay) userNameDisplay.textContent = name;
      if (userRoleDisplay) userRoleDisplay.textContent = sessionUser.role === "seller" ? "Property Owner" : "Buyer / Tenant";
      
      const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
      if (userAvatar) userAvatar.textContent = initials || "AA";
    } else {
      if (userNameDisplay) userNameDisplay.textContent = "Afan Ali Khan";
      if (userRoleDisplay) userRoleDisplay.textContent = "Student Developer";
      if (userAvatar) userAvatar.textContent = "AA";
    }
  }

  // Smooth scroll helper for quick links
  document.querySelectorAll('.region-chip[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetHash = this.getAttribute('href');
      
      if (targetHash === "#durkhoj") switchTab("sec-durkhoj");
      if (targetHash === "#developer") switchTab("sec-afan");
      if (targetHash === "#fellowships") switchTab("sec-global");
      if (targetHash === "#projects") switchTab("sec-projects");
    });
  });

  function switchTab(sectionId) {
    tabBtns.forEach(b => b.classList.remove("active"));
    sectionBlocks.forEach(sec => sec.classList.remove("active"));

    const btn = document.querySelector(`[data-target="${sectionId}"]`);
    const sec = document.getElementById(sectionId);

    if (btn) btn.classList.add("active");
    if (sec) sec.classList.add("active");
  }

  // Initialize
  syncUserSession();
});