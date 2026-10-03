/* ai-predictor.js - Standalone AI Price Predictor */

(function () {
  // 1. Valuation Logic
  const KhojAIEngine = {
    locationRates: {
      "chitral town": 4800,
      "ataliq": 6000,
      "shahi bazaar": 6500,
      "chew bazaar": 5200,
      "seenlasht": 4200,
      "danin": 3900,
      "ayun": 3200,
      "drosh": 3100,
      "booni": 2600,
      "mastuj": 2100,
      "garam chashma": 2400,
      "default": 3000
    },

    facilityWeights: {
      electricity: 0.08,
      water: 0.07,
      road_access: 0.12,
      commercial_zone: 0.18,
      solar_backup: 0.05,
      boundary_wall: 0.04,
      fiber_internet: 0.03
    },

    normalizeArea(val, unit) {
      const num = parseFloat(val) || 0;
      if (unit === "marla") return num * 225;
      if (unit === "kanal") return num * 4500;
      return num; // sqft
    },

    predict(data) {
      const sqft = this.normalizeArea(data.area, data.unit);
      if (sqft <= 0) return null;

      let baseRate = this.locationRates["default"];
      const loc = (data.location || "").toLowerCase();
      for (const [k, r] of Object.entries(this.locationRates)) {
        if (loc.includes(k)) {
          baseRate = r;
          break;
        }
      }

      let typeFactor = 1.0;
      if (data.type === "plot") typeFactor = 0.72;
      if (data.type === "commercial") typeFactor = 1.45;

      let total = sqft * baseRate * typeFactor;

      if (data.type === "house") {
        total += ((parseInt(data.beds) || 1) * 350000) + ((parseInt(data.baths) || 1) * 200000);
      }

      let facilityFactor = 0;
      (data.facilities || []).forEach(f => {
        if (this.facilityWeights[f]) facilityFactor += this.facilityWeights[f];
      });
      total *= (1 + facilityFactor);

      if (data.purpose === "rent") {
        total = Math.round((total * 0.052) / 12);
      } else {
        total = Math.round(total);
      }

      const low = Math.round(total * 0.92);
      const high = Math.round(total * 1.08);

      const fmt = (num) => {
        const suf = data.purpose === "rent" ? " / mo" : "";
        if (num >= 10000000) return `PKR ${(num / 10000000).toFixed(2)} Crore${suf}`;
        if (num >= 100000) return `PKR ${(num / 100000).toFixed(2)} Lakh${suf}`;
        return `PKR ${num.toLocaleString()}${suf}`;
      };

      return {
        price: fmt(total),
        range: `${fmt(low)} – ${fmt(high)}`,
        confidence: Math.min(95, 75 + (data.facilities ? data.facilities.length * 3 : 0))
      };
    }
  };

  // 2. Build UI with Inlined CSS (prevents any external CSS issues)
  function init() {
    if (document.getElementById("dk-ai-btn")) return;

    // Floating Button
    const btn = document.createElement("button");
    btn.id = "dk-ai-btn";
    btn.type = "button";
    btn.innerHTML = `<span>✨</span> <span>AI Price Predictor</span>`;
    Object.assign(btn.style, {
      position: "fixed",
      bottom: "20px",
      right: "18px",
      zIndex: "99999",
      background: "#004d25",
      color: "#ffffff",
      border: "2px solid #ffffff",
      padding: "12px 18px",
      borderRadius: "50px",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: "700",
      fontSize: "13px",
      cursor: "pointer",
      boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    });

    // Modal Overlay
    const modal = document.createElement("div");
    modal.id = "dk-ai-modal";
    Object.assign(modal.style, {
      display: "none",
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      backdropFilter: "blur(4px)",
      zIndex: "100000",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      boxSizing: "border-box"
    });

    modal.innerHTML = `
      <div style="background:#fff; width:100%; max-width:500px; border-radius:16px; padding:24px; box-shadow:0 10px 30px rgba(0,0,0,0.3); font-family:'Plus Jakarta Sans',sans-serif; max-height:90vh; overflow-y:auto; box-sizing:border-box;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid #e2e8f0; padding-bottom:10px;">
          <div>
            <span style="background:#e6f2eb; color:#004d25; font-size:10px; font-weight:800; padding:3px 8px; border-radius:12px; text-transform:uppercase;">Dur Khoj AI</span>
            <h3 style="margin:4px 0 0; color:#004d25; font-size:18px;">Property Price Predictor</h3>
          </div>
          <button id="dk-ai-close" style="background:#f1f5f9; border:none; font-size:20px; width:32px; height:32px; border-radius:50%; cursor:pointer; color:#64748b;">&times;</button>
        </div>

        <form id="dk-ai-form" style="display:flex; flex-direction:column; gap:12px;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:11px; font-weight:700; color:#64748b; display:block; margin-bottom:4px;">PURPOSE</label>
              <select id="dk-purpose" style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:13px;">
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#64748b; display:block; margin-bottom:4px;">PROPERTY TYPE</label>
              <select id="dk-type" style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:13px;">
                <option value="house">House</option>
                <option value="plot">Plot / Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:2fr 1fr; gap:10px;">
            <div>
              <label style="font-size:11px; font-weight:700; color:#64748b; display:block; margin-bottom:4px;">AREA SIZE</label>
              <input type="number" id="dk-area" min="1" step="any" placeholder="e.g. 5" required style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:13px; box-sizing:border-box;">
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#64748b; display:block; margin-bottom:4px;">UNIT</label>
              <select id="dk-unit" style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:13px;">
                <option value="marla">Marla</option>
                <option value="kanal">Kanal</option>
                <option value="sqft">Sq Ft</option>
              </select>
            </div>
          </div>

          <div>
            <label style="font-size:11px; font-weight:700; color:#64748b; display:block; margin-bottom:4px;">CHITRAL LOCATION</label>
            <input type="text" id="dk-loc" placeholder="e.g. Booni, Ayun, Chew Bazaar, Drosh..." required style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:13px; box-sizing:border-box;">
          </div>

          <div id="dk-room-row" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:11px; font-weight:700; color:#64748b; display:block; margin-bottom:4px;">BEDROOMS</label>
              <input type="number" id="dk-beds" min="0" max="20" value="3" style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:13px; box-sizing:border-box;">
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#64748b; display:block; margin-bottom:4px;">BATHROOMS</label>
              <input type="number" id="dk-baths" min="0" max="15" value="2" style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:13px; box-sizing:border-box;">
            </div>
          </div>

          <div>
            <label style="font-size:11px; font-weight:700; color:#64748b; display:block; margin-bottom:6px;">FACILITIES AVAILABLE</label>
            <div style="display:flex; flex-wrap:wrap; gap:8px; font-size:12px;">
              <label style="display:inline-flex; align-items:center; gap:4px; background:#f8fafc; border:1px solid #e2e8f0; padding:4px 8px; border-radius:6px; cursor:pointer;"><input type="checkbox" name="dk-fac" value="electricity" checked> Electricity</label>
              <label style="display:inline-flex; align-items:center; gap:4px; background:#f8fafc; border:1px solid #e2e8f0; padding:4px 8px; border-radius:6px; cursor:pointer;"><input type="checkbox" name="dk-fac" value="water" checked> Water Supply</label>
              <label style="display:inline-flex; align-items:center; gap:4px; background:#f8fafc; border:1px solid #e2e8f0; padding:4px 8px; border-radius:6px; cursor:pointer;"><input type="checkbox" name="dk-fac" value="road_access" checked> Road Access</label>
              <label style="display:inline-flex; align-items:center; gap:4px; background:#f8fafc; border:1px solid #e2e8f0; padding:4px 8px; border-radius:6px; cursor:pointer;"><input type="checkbox" name="dk-fac" value="solar_backup"> Solar Backup</label>
              <label style="display:inline-flex; align-items:center; gap:4px; background:#f8fafc; border:1px solid #e2e8f0; padding:4px 8px; border-radius:6px; cursor:pointer;"><input type="checkbox" name="dk-fac" value="boundary_wall"> Boundary Wall</label>
              <label style="display:inline-flex; align-items:center; gap:4px; background:#f8fafc; border:1px solid #e2e8f0; padding:4px 8px; border-radius:6px; cursor:pointer;"><input type="checkbox" name="dk-fac" value="fiber_internet"> Fiber Internet</label>
            </div>
          </div>

          <button type="submit" style="background:#004d25; color:#fff; border:none; padding:12px; border-radius:8px; font-weight:700; font-size:14px; cursor:pointer; margin-top:8px;">Calculate Estimated Price</button>
        </form>

        <div id="dk-result" style="display:none; margin-top:16px; padding:16px; background:#f0fdf4; border:1px solid #86efac; border-radius:10px; text-align:center;">
          <div style="font-size:11px; font-weight:800; color:#166534; text-transform:uppercase;">AI Estimated Market Value</div>
          <div id="dk-res-price" style="font-size:24px; font-weight:800; color:#004d25; margin:6px 0;">PKR 0</div>
          <div id="dk-res-range" style="font-size:12px; color:#15803d; font-weight:600;">Expected Range: PKR 0</div>
          <div style="font-size:11px; color:#64748b; margin-top:8px;">Confidence Score: <strong id="dk-res-conf">85%</strong></div>
        </div>
      </div>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(modal);

    // Event Bindings
    btn.onclick = () => { modal.style.display = "flex"; };
    document.getElementById("dk-ai-close").onclick = () => { modal.style.display = "none"; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

    const typeEl = document.getElementById("dk-type");
    const roomRow = document.getElementById("dk-room-row");
    typeEl.onchange = () => {
      roomRow.style.display = typeEl.value === "plot" ? "none" : "grid";
    };

    document.getElementById("dk-ai-form").onsubmit = (e) => {
      e.preventDefault();
      const facs = Array.from(document.querySelectorAll("input[name='dk-fac']:checked")).map(c => c.value);
      const res = KhojAIEngine.predict({
        purpose: document.getElementById("dk-purpose").value,
        type: document.getElementById("dk-type").value,
        area: document.getElementById("dk-area").value,
        unit: document.getElementById("dk-unit").value,
        location: document.getElementById("dk-loc").value,
        beds: document.getElementById("dk-beds").value,
        baths: document.getElementById("dk-baths").value,
        facilities: facs
      });

      if (res) {
        document.getElementById("dk-res-price").textContent = res.price;
        document.getElementById("dk-res-range").textContent = `Expected Range: ${res.range}`;
        document.getElementById("dk-res-conf").textContent = `${res.confidence}%`;
        document.getElementById("dk-result").style.display = "block";
      }
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();