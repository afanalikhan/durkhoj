document.addEventListener("DOMContentLoaded", () => {
  // Get Property ID from URL query
  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get("id");

  // Read data state from LocalStorage
  let exploreProps = JSON.parse(localStorage.getItem("dur_khoj_explore_properties")) || [];
  let userProps = JSON.parse(localStorage.getItem("dur_khoj_user_managed_props")) || [];
  let allProperties = [...exploreProps, ...userProps];

  // Match target property
  let property = allProperties.find(p => p.id === propertyId);

  // Fallback to first property if ID missing/unmatched
  if (!property && allProperties.length > 0) {
    property = allProperties[0];
  }

  const container = document.getElementById("detailAppContainer");

  if (!property) {
    container.innerHTML = `
      <div style="text-align: center; padding: 50px 16px; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0;">
        <h2 style="font-size: 18px; font-weight: 700;">Property Not Found</h2>
        <p style="color: #64748b; margin-top: 6px; font-size: 13px;">The property listing you are looking for does not exist or was removed.</p>
        <a href="explore.html" style="display: inline-block; margin-top: 14px; padding: 10px 18px; background: #004d25; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 13px;">Return to Explore Page</a>
      </div>
    `;
    return;
  }

  // Resolve Images List
  let images = [];
  if (property.images && Array.isArray(property.images) && property.images.length > 0) {
    images = property.images;
  } else if (property.image) {
    images = [property.image];
  } else {
    images = ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80"];
  }

  // State
  const isLiked = property.isLiked || false;
  const isSaved = property.isSaved || false;
  const likesCount = property.likes || 0;
  const comments = property.comments || [];
  const contactPhone = property.phone || "+923459876543";

  // Update Mobile Bottom Contact Bar
  const mobileBarPrice = document.getElementById("mobileBarPrice");
  const mobileWhatsappBtn = document.getElementById("mobileWhatsappBtn");
  const mobileCallBtn = document.getElementById("mobileCallBtn");

  if (mobileBarPrice) mobileBarPrice.textContent = property.priceFormatted || 'PKR ' + (property.price || 0);
  if (mobileWhatsappBtn) mobileWhatsappBtn.href = `https://wa.me/${contactPhone.replace(/[^0-9]/g, '')}?text=Hi,%20I%20am%20interested%20in%20property:%20${encodeURIComponent(property.title || 'Listing')}`;
  if (mobileCallBtn) mobileCallBtn.href = `tel:${contactPhone}`;

  // Render Mobile-optimized Layout
  container.innerHTML = `
    <div class="detail-layout">
      <!-- SWIPER GALLERY CARD -->
      <section class="gallery-card">
        <div class="swiper mainSwiper main-swiper">
          <span class="purpose-pill">${property.purpose === 'rent' ? 'For Rent' : 'For Sale'}</span>
          <span class="fullscreen-trigger-badge" id="openLightboxBtn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
            Fullscreen
          </span>
          <div class="swiper-wrapper">
            ${images.map(img => `<div class="swiper-slide"><img src="${img}" alt="${property.title}"></div>`).join('')}
          </div>
          <div class="swiper-button-next"></div>
          <div class="swiper-button-prev"></div>
        </div>

        ${images.length > 1 ? `
          <div class="swiper thumbSwiper thumb-swiper">
            <div class="swiper-wrapper">
              ${images.map(img => `<div class="swiper-slide"><img src="${img}" alt="thumb"></div>`).join('')}
            </div>
          </div>
        ` : ''}
      </section>

      <!-- MAIN DETAILS GRID -->
      <div class="content-grid">
        <div class="details-card">
          <h1 class="prop-title">${property.title || 'Property Listing'}</h1>
          <div class="prop-location">📍 ${property.location || 'Chitral'}</div>
          <div class="prop-price">${property.priceFormatted || 'PKR ' + (property.price || 0)}</div>

          <!-- HORIZONTAL SCROLLABLE ACTION BAR -->
          <div class="interaction-bar">
            <button class="action-chip ${isLiked ? 'liked' : ''}" id="likeBtn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <span id="likeCountText">${likesCount} Likes</span>
            </button>

            <button class="action-chip ${isSaved ? 'saved' : ''}" id="saveBtn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              <span id="saveText">${isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button class="action-chip" id="shareChipBtn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              <span>Share</span>
            </button>
          </div>

          <!-- SPECS -->
          <div class="specs-row">
            <div class="spec-box">
              <span class="icon">🛏️</span>
              <div class="value">${property.beds || 1}</div>
              <div class="label">Bedrooms</div>
            </div>
            <div class="spec-box">
              <span class="icon">🚿</span>
              <div class="value">${property.baths || 1}</div>
              <div class="label">Bathrooms</div>
            </div>
            <div class="spec-box">
              <span class="icon">📐</span>
              <div class="value">${property.area || 'N/A'}</div>
              <div class="label">Size</div>
            </div>
          </div>

          <!-- DESCRIPTION -->
          <div class="description-section">
            <h2 class="section-heading">Description</h2>
            <p class="description-text">${property.description || 'No additional details provided for this property listing.'}</p>
          </div>

          <!-- COMMENTS PANEL -->
          <div class="comments-panel">
            <h2 class="section-heading">Questions & Comments (${comments.length})</h2>
            <div class="comments-list" id="commentsList">
              ${comments.length === 0 ? '<p style="font-size: 12px; color: #64748b;">No comments yet. Be the first to ask!</p>' : ''}
              ${comments.map(c => `
                <div class="comment-card">
                  <div class="comment-user">${c.author || 'Visitor'}</div>
                  <div class="comment-body">${c.text || ''}</div>
                </div>
              `).join('')}
            </div>

            <form class="comment-input-wrap" id="commentForm">
              <input type="text" id="commentInput" placeholder="Ask a question..." required>
              <button type="submit">Post</button>
            </form>
          </div>
        </div>

        <!-- DESKTOP CONTACT SIDEBAR -->
        <div class="contact-sidebar">
          <div class="owner-info">
            <div class="owner-avatar-circle">DK</div>
            <div>
              <div class="owner-title">Property Owner</div>
              <div class="owner-sub">Verified Chitral Seller</div>
            </div>
          </div>

          <a href="https://wa.me/${contactPhone.replace(/[^0-9]/g, '')}?text=Hi,%20I%20am%20interested%20in%20property:%20${encodeURIComponent(property.title || 'Listing')}" class="desktop-contact-btn btn-whatsapp-desktop" target="_blank">Chat on WhatsApp</a>
          <a href="tel:${contactPhone}" class="desktop-contact-btn btn-call-desktop">Call Owner</a>
        </div>
      </div>
    </div>
  `;

  // Swiper Slider Init
  let thumbSwiper = null;
  if (images.length > 1) {
    thumbSwiper = new Swiper(".thumbSwiper", {
      spaceBetween: 8,
      slidesPerView: 4,
      freeMode: true,
      watchSlidesProgress: true,
    });
  }

  const mainSwiper = new Swiper(".mainSwiper", {
    spaceBetween: 10,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    thumbs: {
      swiper: thumbSwiper,
    },
  });

  // Lightbox Integration
  const lightboxModal = document.getElementById("lightboxModal");
  const lightboxSwiperWrapper = document.getElementById("lightboxSwiperWrapper");
  const openLightboxBtn = document.getElementById("openLightboxBtn");
  const lightboxClose = document.getElementById("lightboxClose");

  images.forEach(img => {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    slide.innerHTML = `<img src="${img}" alt="Fullscreen View">`;
    lightboxSwiperWrapper.appendChild(slide);
  });

  const lightboxSwiper = new Swiper(".lightboxSwiper", {
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  if (openLightboxBtn) {
    openLightboxBtn.addEventListener("click", () => {
      lightboxModal.classList.add("active");
      lightboxSwiper.update();
      lightboxSwiper.slideTo(mainSwiper.activeIndex);
    });
  }

  if (lightboxClose) {
    lightboxClose.addEventListener("click", () => {
      lightboxModal.classList.remove("active");
    });
  }

  // Persist State Helper
  function persistPropertyState() {
    let exploreProps = JSON.parse(localStorage.getItem("dur_khoj_explore_properties")) || [];
    let idx = exploreProps.findIndex(p => p.id === property.id);
    if (idx !== -1) {
      exploreProps[idx] = property;
      localStorage.setItem("dur_khoj_explore_properties", JSON.stringify(exploreProps));
    }
  }

  // Interactivity
  const likeBtn = document.getElementById("likeBtn");
  const likeCountText = document.getElementById("likeCountText");
  const saveBtn = document.getElementById("saveBtn");
  const saveText = document.getElementById("saveText");

  if (likeBtn) {
    likeBtn.addEventListener("click", () => {
      property.isLiked = !property.isLiked;
      property.likes = (property.likes || 0) + (property.isLiked ? 1 : -1);
      if (property.likes < 0) property.likes = 0;

      likeBtn.classList.toggle("liked", property.isLiked);
      likeCountText.textContent = `${property.likes} Likes`;
      persistPropertyState();
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      property.isSaved = !property.isSaved;
      saveBtn.classList.toggle("saved", property.isSaved);
      saveText.textContent = property.isSaved ? 'Saved' : 'Save';
      persistPropertyState();
    });
  }

  const commentForm = document.getElementById("commentForm");
  const commentInput = document.getElementById("commentInput");
  const commentsList = document.getElementById("commentsList");

  if (commentForm) {
    commentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = commentInput.value.trim();
      if (text) {
        let authorName = "Visitor";
        try {
          const sessionUser = JSON.parse(localStorage.getItem("dur_khoj_session"));
          if (sessionUser && sessionUser.fullName) authorName = sessionUser.fullName;
        } catch(err) {}

        if (!property.comments) property.comments = [];
        property.comments.push({ author: authorName, text: text });
        persistPropertyState();

        const card = document.createElement("div");
        card.className = "comment-card";
        card.innerHTML = `<div class="comment-user">${authorName}</div><div class="comment-body">${text}</div>`;
        commentsList.appendChild(card);
        commentInput.value = "";
      }
    });
  }

  const shareHandler = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title || 'Property',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Property link copied to clipboard!");
    }
  };

  const headerShareBtn = document.getElementById("headerShareBtn");
  const shareChipBtn = document.getElementById("shareChipBtn");

  if (headerShareBtn) headerShareBtn.addEventListener("click", shareHandler);
  if (shareChipBtn) shareChipBtn.addEventListener("click", shareHandler);
});