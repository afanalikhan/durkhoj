document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const userGreeting = document.getElementById("userGreeting");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const userRoleDisplay = document.getElementById("userRoleDisplay");
  const userAvatar = document.getElementById("userAvatar");
  
  const housesSoldVal = document.getElementById("housesSoldVal");
  const housesListedVal = document.getElementById("housesListedVal");

  // Sync session user details
  function syncUserSession() {
    let sessionUser = null;
    try {
      sessionUser = JSON.parse(localStorage.getItem("dur_khoj_session"));
    } catch (e) {
      sessionUser = null;
    }

    if (sessionUser && sessionUser.fullName) {
      const name = sessionUser.fullName;
      userGreeting.textContent = "Welcome";
      userNameDisplay.textContent = name;
      userRoleDisplay.textContent = sessionUser.role === "seller" ? "Property Owner" : "Buyer / Tenant";
      
      const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
      userAvatar.textContent = initials || "DK";
    } else {
      userGreeting.textContent = "Welcome";
      userNameDisplay.textContent = "Guest Visitor";
      userRoleDisplay.textContent = "Local Portal Mode";
      userAvatar.textContent = "DK";
    }
  }

  // Set counters
  if (housesSoldVal) housesSoldVal.textContent = "0";
  if (housesListedVal) housesListedVal.textContent = "0";

  // Initialize
  syncUserSession();
});