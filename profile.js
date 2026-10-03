document.addEventListener("DOMContentLoaded", () => {
  // Session User State
  const defaultUser = {
    fullName: "Afan Ali Khan",
    email: "afan.chitral@example.com",
    phone: "+92 345 9876543",
    region: "Chitral Main Town",
    role: "Property Owner"
  };

  let currentUser = JSON.parse(localStorage.getItem("dur_khoj_session")) || defaultUser;

  // Initial Managed Properties
  const initialProperties = [
    {
      id: "my_1",
      title: "Spacious Family House in Booni Valley",
      location: "Booni Main Town",
      purpose: "sale",
      phone: "+92 345 9876543",
      price: 12500000,
      priceFormatted: "PKR 1.25 Crore",
      beds: 4,
      baths: 3,
      area: "1 Kanal",
      description: "Traditional and modern blend house with fruit garden.",
      images: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80"],
      image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
      status: "active"
    },
    {
      id: "my_2",
      title: "Chitral Town Upper Portion Rental",
      location: "Goldoor, Chitral",
      purpose: "rent",
      phone: "+92 345 9876543",
      price: 35000,
      priceFormatted: "PKR 35,000 / Month",
      beds: 2,
      baths: 2,
      area: "8 Marla",
      description: "Furnished upper portion near Chitral Fort.",
      images: ["https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80"],
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
      status: "active"
    }
  ];

  let managedProperties = JSON.parse(localStorage.getItem("dur_khoj_user_managed_props")) || initialProperties;

  // Array to hold multiple Base64 image strings for active form
  let currentUploadedImages = [];

  // DOM Elements - Profile UI
  const profileNameDisplay = document.getElementById("profileNameDisplay");
  const profileEmailDisplay = document.getElementById("profileEmailDisplay");
  const profilePhoneDisplay = document.getElementById("profilePhoneDisplay");
  const profileRegionDisplay = document.getElementById("profileRegionDisplay");
  const profileRoleBadge = document.getElementById("profileRoleBadge");
  const profileAvatarLg = document.getElementById("profileAvatarLg");
  const sidebarAvatar = document.getElementById("sidebarAvatar");
  const sidebarUserName = document.getElementById("sidebarUserName");
  const sidebarUserRole = document.getElementById("sidebarUserRole");

  const statActiveCount = document.getElementById("statActiveCount");
  const statSoldCount = document.getElementById("statSoldCount");
  const myListingsGrid = document.getElementById("myListingsGrid");

  // Conditional Sections
  const sellerOnlyBtns = document.querySelectorAll(".seller-only-btn");
  const sellerOnlySections = document.querySelectorAll(".seller-only-section");
  const buyerWelcomeSection = document.getElementById("buyerWelcomeSection");

  // DOM Elements - Modals
  const editProfileModal = document.getElementById("editProfileModal");
  const openEditProfileModalBtn = document.getElementById("openEditProfileModalBtn");
  const closeProfileModalBtn = document.getElementById("closeProfileModalBtn");
  const cancelProfileBtn = document.getElementById("cancelProfileBtn");
  const editProfileForm = document.getElementById("editProfileForm");

  const editFullName = document.getElementById("editFullName");
  const editEmail = document.getElementById("editEmail");
  const editPhone = document.getElementById("editPhone");
  const editRegion = document.getElementById("editRegion");
  const editRole = document.getElementById("editRole");

  const propertyModal = document.getElementById("propertyModal");
  const openAddModalBtn = document.getElementById("openAddModalBtn");
  const closePropModalBtn = document.getElementById("closePropModalBtn");
  const cancelPropBtn = document.getElementById("cancelPropBtn");
  const propertyForm = document.getElementById("propertyForm");
  const propModalTitle = document.getElementById("propModalTitle");
  const imagePreviewContainer = document.getElementById("imagePreviewContainer");

  /**
   * Helper Function: Reads image, scales down dimensions, and compresses quality 
   * to keep localStorage size under 100KB per image (prevents QuotaExceededError).
   */
  function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.6) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedBase64);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  }

  // Multiple File Upload Listener
  const propImageFileInput = document.getElementById("propImageFile");
  if (propImageFileInput) {
    propImageFileInput.addEventListener("change", async (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        for (const file of files) {
          try {
            const compressedBase64 = await compressImage(file);
            currentUploadedImages.push(compressedBase64);
          } catch (err) {
            console.error("Error compressing image file:", err);
          }
        }
        renderImagePreviews();
      }
    });
  }

  // Render Image Thumbnails
  function renderImagePreviews() {
    if (!imagePreviewContainer) return;
    imagePreviewContainer.innerHTML = "";

    currentUploadedImages.forEach((imgSrc, idx) => {
      const wrap = document.createElement("div");
      wrap.style.cssText = "position: relative; width: 60px; height: 60px; border-radius: 8px; overflow: hidden; border: 1px solid #ccc;";
      
      wrap.innerHTML = `
        <img src="${imgSrc}" style="width:100%; height:100%; object-fit:cover;">
        <span class="remove-img-btn" data-idx="${idx}" style="position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.6); color:#fff; border-radius:50%; width:16px; height:16px; font-size:10px; display:flex; align-items:center; justify-content:center; cursor:pointer;">&times;</span>
      `;
      imagePreviewContainer.appendChild(wrap);
    });

    document.querySelectorAll(".remove-img-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.target.getAttribute("data-idx"));
        currentUploadedImages.splice(index, 1);
        renderImagePreviews();
      });
    });
  }

  // Safe State Save to LocalStorage
  function saveState() {
    try {
      localStorage.setItem("dur_khoj_session", JSON.stringify(currentUser));
      localStorage.setItem("dur_khoj_user_managed_props", JSON.stringify(managedProperties));

      const exploreProps = JSON.parse(localStorage.getItem("dur_khoj_explore_properties")) || [];
      managedProperties.forEach(mProp => {
        const idx = exploreProps.findIndex(p => p.id === mProp.id);
        if (idx > -1) {
          exploreProps[idx] = { ...exploreProps[idx], ...mProp };
        } else {
          exploreProps.unshift({ ...mProp, likes: 0, isLiked: false, isSaved: false, comments: [] });
        }
      });
      localStorage.setItem("dur_khoj_explore_properties", JSON.stringify(exploreProps));
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        alert("Browser Storage Full! Please remove some existing properties or upload fewer photos.");
      } else {
        console.error("Storage Error:", e);
      }
    }
  }

  // Render Profile UI
  function renderProfile() {
    if (profileNameDisplay) profileNameDisplay.textContent = currentUser.fullName;
    if (profileEmailDisplay) profileEmailDisplay.textContent = currentUser.email;
    if (profilePhoneDisplay) profilePhoneDisplay.textContent = currentUser.phone || "+92 345 0000000";
    if (profileRegionDisplay) profileRegionDisplay.textContent = currentUser.region;
    if (profileRoleBadge) profileRoleBadge.textContent = currentUser.role;

    if (sidebarUserName) sidebarUserName.textContent = currentUser.fullName;
    if (sidebarUserRole) sidebarUserRole.textContent = currentUser.role;

    const initials = currentUser.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "DK";
    if (profileAvatarLg) profileAvatarLg.textContent = initials;
    if (sidebarAvatar) sidebarAvatar.textContent = initials;

    const isBuyer = currentUser.role === "Buyer / Tenant";

    if (isBuyer) {
      sellerOnlyBtns.forEach(btn => btn.style.display = "none");
      sellerOnlySections.forEach(sec => sec.style.display = "none");
      if (buyerWelcomeSection) buyerWelcomeSection.style.display = "block";
    } else {
      sellerOnlyBtns.forEach(btn => btn.style.display = "inline-flex");
      sellerOnlySections.forEach(sec => sec.style.display = "block");
      if (buyerWelcomeSection) buyerWelcomeSection.style.display = "none";
      renderListings();
    }
  }

  // Render Managed Listings Grid
  function renderListings() {
    if (!myListingsGrid) return;

    const activeProps = managedProperties.filter(p => p.status !== "sold");
    const soldProps = managedProperties.filter(p => p.status === "sold");

    if (statActiveCount) statActiveCount.textContent = activeProps.length;
    if (statSoldCount) statSoldCount.textContent = soldProps.length;

    myListingsGrid.innerHTML = "";

    if (managedProperties.length === 0) {
      myListingsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: #fff; border-radius: 16px; border: 1px solid #e5e7eb;">
          <p style="font-weight: 700; font-size: 16px;">You haven't listed any properties yet.</p>
          <p style="font-size: 13px; color: #6b7280; margin-top: 4px;">Click "+ Add New Property Listing" to get started.</p>
        </div>
      `;
      return;
    }

    managedProperties.forEach(prop => {
      const card = document.createElement("article");
      card.className = "managed-card";

      const isSold = prop.status === "sold";
      const displayImage = (prop.images && prop.images.length > 0) ? prop.images[0] : (prop.image || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80');

      card.innerHTML = `
        <div class="managed-card-img">
          <img src="${displayImage}" alt="${prop.title}">
          <span class="badge-status ${isSold ? 'sold-status' : 'active-status'}">
            ${isSold ? 'Sold / Rented' : 'Active Listing'}
          </span>
        </div>

        <div class="managed-body">
          <div class="managed-title-row">
            <h3>${prop.title}</h3>
            <span class="managed-price">${prop.priceFormatted || 'PKR ' + prop.price}</span>
          </div>

          <div style="font-size: 12px; color: #6b7280;">
            📍 ${prop.location} &bull; 🛏️ ${prop.beds} Beds &bull; 📐 ${prop.area} ${prop.phone ? '&bull; 📞 ' + prop.phone : ''}
          </div>

          <div class="managed-actions">
            <button class="btn-card-action btn-edit" data-id="${prop.id}">✏️ Edit</button>
            <button class="btn-card-action btn-mark" data-id="${prop.id}">
              ${isSold ? '🔄 Mark Active' : '✅ Mark Sold/Rented'}
            </button>
            <button class="btn-card-action btn-delete" data-id="${prop.id}">🗑️ Delete</button>
          </div>
        </div>
      `;

      myListingsGrid.appendChild(card);
    });

    attachListingActionEvents();
  }

  // Card Action Event Listeners
  function attachListingActionEvents() {
    document.querySelectorAll(".btn-edit").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const prop = managedProperties.find(p => p.id === id);
        if (prop) openPropertyModal(prop);
      });
    });

    document.querySelectorAll(".btn-mark").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const prop = managedProperties.find(p => p.id === id);
        if (prop) {
          prop.status = prop.status === "sold" ? "active" : "sold";
          saveState();
          renderListings();
        }
      });
    });

    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this property listing?")) {
          managedProperties = managedProperties.filter(p => p.id !== id);

          let exploreProps = JSON.parse(localStorage.getItem("dur_khoj_explore_properties")) || [];
          exploreProps = exploreProps.filter(p => p.id !== id);
          localStorage.setItem("dur_khoj_explore_properties", JSON.stringify(exploreProps));

          saveState();
          renderListings();
        }
      });
    });
  }

  // PROFILE MODAL HANDLERS
  if (openEditProfileModalBtn) {
    openEditProfileModalBtn.addEventListener("click", () => {
      editFullName.value = currentUser.fullName;
      editEmail.value = currentUser.email;
      editPhone.value = currentUser.phone || "";
      editRegion.value = currentUser.region;
      editRole.value = currentUser.role;
      editProfileModal.classList.add("open");
    });
  }

  const closeProfileModal = () => editProfileModal.classList.remove("open");
  if (closeProfileModalBtn) closeProfileModalBtn.addEventListener("click", closeProfileModal);
  if (cancelProfileBtn) cancelProfileBtn.addEventListener("click", closeProfileModal);

  if (editProfileForm) {
    editProfileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      currentUser.fullName = editFullName.value.trim();
      currentUser.email = editEmail.value.trim();
      currentUser.phone = editPhone.value.trim();
      currentUser.region = editRegion.value.trim();
      currentUser.role = editRole.value;

      saveState();
      renderProfile();
      closeProfileModal();
    });
  }

  // PROPERTY MODAL HANDLERS
  function openPropertyModal(propToEdit = null) {
    currentUploadedImages = [];

    if (propToEdit) {
      propModalTitle.textContent = "Edit Property Listing";
      document.getElementById("propId").value = propToEdit.id;
      document.getElementById("propTitle").value = propToEdit.title;
      document.getElementById("propLocation").value = propToEdit.location;
      document.getElementById("propPurpose").value = propToEdit.purpose;
      document.getElementById("propPhone").value = propToEdit.phone || currentUser.phone || "";
      document.getElementById("propPrice").value = propToEdit.price;
      document.getElementById("propPriceFormatted").value = propToEdit.priceFormatted;
      document.getElementById("propBeds").value = propToEdit.beds;
      document.getElementById("propBaths").value = propToEdit.baths;
      document.getElementById("propArea").value = propToEdit.area;
      document.getElementById("propDescription").value = propToEdit.description || "";
      
      const propImgInput = document.getElementById("propImage");
      if (propImgInput) propImgInput.value = propToEdit.image || "";
      
      if (propToEdit.images && propToEdit.images.length > 0) {
        currentUploadedImages = [...propToEdit.images];
      } else if (propToEdit.image) {
        currentUploadedImages = [propToEdit.image];
      }
    } else {
      propModalTitle.textContent = "Add New Property Listing";
      propertyForm.reset();
      document.getElementById("propId").value = "";
      document.getElementById("propPhone").value = currentUser.phone || "";
    }

    renderImagePreviews();
    propertyModal.classList.add("open");
  }

  if (openAddModalBtn) {
    openAddModalBtn.addEventListener("click", () => openPropertyModal());
  }

  const closePropModal = () => propertyModal.classList.remove("open");
  if (closePropModalBtn) closePropModalBtn.addEventListener("click", closePropModal);
  if (cancelPropBtn) cancelPropBtn.addEventListener("click", closePropModal);

  if (propertyForm) {
    propertyForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("propId").value;
      const title = document.getElementById("propTitle").value.trim();
      const location = document.getElementById("propLocation").value.trim();
      const purpose = document.getElementById("propPurpose").value;
      const phone = document.getElementById("propPhone").value.trim();
      const price = parseFloat(document.getElementById("propPrice").value) || 0;
      let priceFormatted = document.getElementById("propPriceFormatted").value.trim();
      const beds = parseInt(document.getElementById("propBeds").value) || 1;
      const baths = parseInt(document.getElementById("propBaths").value) || 1;
      const area = document.getElementById("propArea").value.trim();
      const description = document.getElementById("propDescription").value.trim();

      const textImgInput = document.getElementById("propImage");
      const textImageUrl = textImgInput ? textImgInput.value.trim() : "";

      if (textImageUrl && !currentUploadedImages.includes(textImageUrl)) {
        currentUploadedImages.unshift(textImageUrl);
      }

      const finalImagesList = currentUploadedImages.length > 0 
        ? currentUploadedImages 
        : ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80"];

      if (!priceFormatted) {
        priceFormatted = purpose === 'rent' ? `PKR ${price.toLocaleString()}/Mo` : `PKR ${price.toLocaleString()}`;
      }

      if (id) {
        const index = managedProperties.findIndex(p => p.id === id);
        if (index > -1) {
          managedProperties[index] = {
            ...managedProperties[index],
            title, location, purpose, phone, price, priceFormatted, beds, baths, area,
            images: finalImagesList,
            image: finalImagesList[0],
            description
          };
        }
      } else {
        const newProp = {
          id: "my_" + Date.now(),
          title, location, purpose, phone, price, priceFormatted, beds, baths, area,
          images: finalImagesList,
          image: finalImagesList[0],
          description,
          status: "active"
        };
        managedProperties.unshift(newProp);
      }

      saveState();
      renderProfile();
      closePropModal();
      propertyForm.reset();
      currentUploadedImages = [];
    });
  }

  // Init
  renderProfile();
});