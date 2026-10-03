document.addEventListener("DOMContentLoaded", () => {
  // Read properties dynamic state from localStorage (or empty array if none created yet)
  let properties = JSON.parse(localStorage.getItem("dur_khoj_explore_properties")) || [];

  function savePropertiesState() {
    localStorage.setItem("dur_khoj_explore_properties", JSON.stringify(properties));
  }

  // DOM Elements
  const houseGrid = document.getElementById("houseGrid");
  const searchInput = document.getElementById("searchInput");
  const locationFilter = document.getElementById("locationFilter");
  const purposeFilter = document.getElementById("purposeFilter");
  const bedsFilter = document.getElementById("bedsFilter");
  const priceSort = document.getElementById("priceSort");
  const resultsCount = document.getElementById("resultsCount");
  const resetFiltersBtn = document.getElementById("resetFiltersBtn");

  // Sync active user profile state in sidebar/header
  function syncUserSession() {
    const userNameDisplay = document.getElementById("userNameDisplay");
    const userRoleDisplay = document.getElementById("userRoleDisplay");
    const userAvatar = document.getElementById("userAvatar");

    let sessionUser = null;
    try {
      sessionUser = JSON.parse(localStorage.getItem("dur_khoj_session"));
    } catch (e) { 
      sessionUser = null; 
    }

    if (sessionUser && sessionUser.fullName) {
      if (userNameDisplay) userNameDisplay.textContent = sessionUser.fullName;
      if (userRoleDisplay) userRoleDisplay.textContent = sessionUser.role === "seller" ? "Property Owner" : "Buyer / Tenant";
      if (userAvatar) {
        const initials = sessionUser.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
        userAvatar.textContent = initials || "DK";
      }
    }
  }

  // Render Feed Function
  function renderFeed() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const selectedLoc = locationFilter ? (locationFilter.value ? locationFilter.value.toLowerCase().trim() : "all") : "all";
    const selectedPurp = purposeFilter ? purposeFilter.value : "all";
    const selectedBeds = bedsFilter ? bedsFilter.value : "all";
    const sortVal = priceSort ? priceSort.value : "default";

    let filtered = properties.filter(item => {
      const itemTitle = item.title || "";
      const itemLoc = item.location || "";
      const itemDesc = item.description || "";
      const itemBeds = item.beds || 0;
      const itemPurpose = item.purpose || "sale";

      // General Keyword Search match
      const matchesSearch = itemTitle.toLowerCase().includes(query) ||
                            itemLoc.toLowerCase().includes(query) ||
                            itemDesc.toLowerCase().includes(query);
      
      // Location / Area filter
      const matchesLoc = (selectedLoc === "all" || selectedLoc === "") || 
                         itemLoc.toLowerCase().includes(selectedLoc);

      // Purpose filter (sale vs rent)
      const matchesPurp = (selectedPurp === "all") || (itemPurpose === selectedPurp);

      // Bedrooms filter
      const matchesBeds = (selectedBeds === "all") || (itemBeds >= parseInt(selectedBeds));

      return matchesSearch && matchesLoc && matchesPurp && matchesBeds;
    });

    // Sorting Logic
    if (sortVal === "low-high") {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortVal === "high-low") {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    if (resultsCount) {
      resultsCount.textContent = `Showing ${filtered.length} property listing${filtered.length === 1 ? '' : 's'}`;
    }

    houseGrid.innerHTML = "";

    // Empty state when no properties exist or match filter
    if (filtered.length === 0) {
      houseGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; margin-top: 10px;">
          <h3 style="font-size: 18px; font-weight: 700; color: #0f172a;">No listings available</h3>
          <p style="font-size: 14px; color: #64748b; margin-top: 6px;">Try adjusting your search criteria or add new listings to populate the feed.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(house => {
      const card = document.createElement("article");
      card.className = "house-card";

      // Pick main image or fallback placeholder
      let primaryImg = "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80";
      if (house.images && house.images.length > 0) {
        primaryImg = house.images[0];
      } else if (house.image) {
        primaryImg = house.image;
      }

      const commentsCount = (house.comments && Array.isArray(house.comments)) ? house.comments.length : 0;
      const likesCount = house.likes || 0;

      card.innerHTML = `
        <div class="house-image-wrap">
          <a href="detail.html?id=${house.id}">
            <img src="${primaryImg}" alt="${house.title || 'Property'}" loading="lazy">
          </a>
          <span class="badge-purpose ${house.purpose || 'sale'}">${house.purpose === 'rent' ? 'For Rent' : 'For Sale'}</span>
          <span class="badge-location">📍 ${house.location || 'Chitral'}</span>
        </div>

        <div class="house-body">
          <div class="house-title-row">
            <h2><a href="detail.html?id=${house.id}" style="text-decoration:none; color:inherit;">${house.title || 'Untitled Property'}</a></h2>
            <span class="house-price">${house.priceFormatted || 'PKR ' + (house.price || 0)}</span>
          </div>

          <div class="house-specs">
            <span>🛏️ ${house.beds || 1} Beds</span>
            <span>🚿 ${house.baths || 1} Baths</span>
            <span>📐 ${house.area || 'N/A'}</span>
          </div>

          <p class="house-desc">${house.description || 'No description provided.'}</p>

          <div class="card-actions-bar">
            <button class="action-btn like-btn ${house.isLiked ? 'liked' : ''}" data-id="${house.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <span>${likesCount}</span>
            </button>

            <button class="action-btn comment-toggle-btn" data-id="${house.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <span>${commentsCount} Comments</span>
            </button>

            <button class="action-btn save-btn ${house.isSaved ? 'saved' : ''}" data-id="${house.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              <span>${house.isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        <div class="comments-section" id="comments-${house.id}">
          <div class="comments-list">
            ${commentsCount === 0 ? '<p style="font-size: 11px; color: #6b7280;">No comments yet. Be the first to ask!</p>' : ''}
            ${(house.comments || []).map(c => `
              <div class="comment-item">
                <div class="comment-author">${c.author || 'User'}</div>
                <div class="comment-text">${c.text || ''}</div>
              </div>
            `).join('')}
          </div>

          <form class="comment-form" data-id="${house.id}">
            <input type="text" placeholder="Ask a question or comment..." required>
            <button type="submit">Post</button>
          </form>
        </div>
      `;

      houseGrid.appendChild(card);
    });

    attachCardEventListeners();
  }

  // Interaction Handlers (Likes, Saves, Comments)
  function attachCardEventListeners() {
    // Like Button
    document.querySelectorAll(".like-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        const house = properties.find(h => h.id === id);
        if (house) {
          house.isLiked = !house.isLiked;
          house.likes = (house.likes || 0) + (house.isLiked ? 1 : -1);
          if (house.likes < 0) house.likes = 0;
          savePropertiesState();
          renderFeed();
        }
      });
    });

    // Save Button
    document.querySelectorAll(".save-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        const house = properties.find(h => h.id === id);
        if (house) {
          house.isSaved = !house.isSaved;
          savePropertiesState();
          renderFeed();
        }
      });
    });

    // Toggle Comments View
    document.querySelectorAll(".comment-toggle-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        const commentSec = document.getElementById(`comments-${id}`);
        if (commentSec) {
          commentSec.classList.toggle("open");
        }
      });
    });

    // Submit New Comment
    document.querySelectorAll(".comment-form").forEach(form => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = form.getAttribute("data-id");
        const input = form.querySelector("input");
        const text = input.value.trim();

        if (text) {
          const house = properties.find(h => h.id === id);
          if (house) {
            let authorName = "Visitor";
            try {
              const sessionUser = JSON.parse(localStorage.getItem("dur_khoj_session"));
              if (sessionUser && sessionUser.fullName) authorName = sessionUser.fullName;
            } catch(err) {}

            if (!house.comments) house.comments = [];
            house.comments.push({ author: authorName, text: text });
            savePropertiesState();
            renderFeed();

            const openSec = document.getElementById(`comments-${id}`);
            if (openSec) openSec.classList.add("open");
          }
        }
      });
    });
  }

  // Filter Listeners
  if (searchInput) searchInput.addEventListener("input", renderFeed);
  if (locationFilter) {
    locationFilter.addEventListener("input", renderFeed);
    locationFilter.addEventListener("change", renderFeed);
  }
  if (purposeFilter) purposeFilter.addEventListener("change", renderFeed);
  if (bedsFilter) bedsFilter.addEventListener("change", renderFeed);
  if (priceSort) priceSort.addEventListener("change", renderFeed);

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (locationFilter) locationFilter.value = "all";
      if (purposeFilter) purposeFilter.value = "all";
      if (bedsFilter) bedsFilter.value = "all";
      if (priceSort) priceSort.value = "default";
      renderFeed();
    });
  }

  // Initial Execution
  syncUserSession();
  renderFeed();
});