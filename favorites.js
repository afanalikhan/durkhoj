document.addEventListener("DOMContentLoaded", () => {
  const favoritesGrid = document.getElementById("favoritesGrid");
  const savedCountText = document.getElementById("savedCountText");

  const sidebarAvatar = document.getElementById("sidebarAvatar");
  const sidebarUserName = document.getElementById("sidebarUserName");
  const sidebarUserRole = document.getElementById("sidebarUserRole");

  // Sync User Info from localStorage
  function loadUserProfile() {
    const sessionUser = JSON.parse(localStorage.getItem("dur_khoj_session")) || {
      fullName: "mnm",
      role: "Buyer / Tenant"
    };

    if (sidebarUserName) sidebarUserName.textContent = sessionUser.fullName || "User";
    if (sidebarUserRole) sidebarUserRole.textContent = sessionUser.role || "Buyer / Tenant";

    const initials = (sessionUser.fullName || "U")
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    if (sidebarAvatar) sidebarAvatar.textContent = initials || "U";
  }

  // Fetch all saved properties from localStorage
  function getAllProperties() {
    let exploreProps = JSON.parse(localStorage.getItem("dur_khoj_explore_properties")) || [];
    let userProps = JSON.parse(localStorage.getItem("dur_khoj_user_managed_props")) || [];

    const combinedMap = new Map();
    [...exploreProps, ...userProps].forEach(item => {
      combinedMap.set(item.id, item);
    });

    return Array.from(combinedMap.values());
  }

  // Update localStorage when bookmark is removed
  function updatePropertyInStorage(updatedProp) {
    let exploreProps = JSON.parse(localStorage.getItem("dur_khoj_explore_properties")) || [];
    let idx = exploreProps.findIndex(p => p.id === updatedProp.id);
    if (idx !== -1) {
      exploreProps[idx] = updatedProp;
      localStorage.setItem("dur_khoj_explore_properties", JSON.stringify(exploreProps));
    }

    let userProps = JSON.parse(localStorage.getItem("dur_khoj_user_managed_props")) || [];
    let uIdx = userProps.findIndex(p => p.id === updatedProp.id);
    if (uIdx !== -1) {
      userProps[uIdx] = updatedProp;
      localStorage.setItem("dur_khoj_user_managed_props", JSON.stringify(userProps));
    }
  }

  // Render Saved Favorites Grid
  function renderFavorites() {
    const allProps = getAllProperties();
    const savedProps = allProps.filter(p => p.isSaved === true);

    if (savedCountText) {
      savedCountText.textContent = `${savedProps.length} property item${savedProps.length === 1 ? '' : 's'} saved in your favorites list`;
    }

    favoritesGrid.innerHTML = "";

    if (savedProps.length === 0) {
      favoritesGrid.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon">🤍</div>
          <h2>No Saved Properties Yet</h2>
          <p>Tap the "Save" bookmark button on any property listing to save it here for quick access.</p>
          <a href="explore.html" class="empty-btn">Explore Properties &rarr;</a>
        </div>
      `;
      return;
    }

    savedProps.forEach(prop => {
      const displayImage = (prop.images && prop.images.length > 0) 
        ? prop.images[0] 
        : (prop.image || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80');

      const card = document.createElement("article");
      card.className = "fav-card";

      card.innerHTML = `
        <div class="fav-img-wrap">
          <img src="${displayImage}" alt="${prop.title}">
          <span class="fav-badge-purpose">${prop.purpose === 'rent' ? 'For Rent' : 'For Sale'}</span>
          <button class="btn-remove-fav" data-id="${prop.id}" title="Remove from Saved">
            <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
        </div>

        <div class="fav-body">
          <h3 class="fav-title">${prop.title}</h3>
          <div class="fav-location">📍 ${prop.location}</div>
          <div class="fav-price">${prop.priceFormatted || 'PKR ' + prop.price}</div>
          <div class="fav-specs">🛏️ ${prop.beds || 1} Beds &bull; 📐 ${prop.area || 'N/A'}</div>
          <a href="detail.html?id=${prop.id}" class="btn-view-details">View Details &rarr;</a>
        </div>
      `;

      favoritesGrid.appendChild(card);
    });

    // Attach Click Event to Remove Bookmark
    document.querySelectorAll(".btn-remove-fav").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const allProps = getAllProperties();
        const targetProp = allProps.find(p => p.id === id);

        if (targetProp) {
          targetProp.isSaved = false;
          updatePropertyInStorage(targetProp);
          renderFavorites();
        }
      });
    });
  }

  loadUserProfile();
  renderFavorites();
});