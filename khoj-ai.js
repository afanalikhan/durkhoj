document.addEventListener("DOMContentLoaded", () => {
  const existingWidget = document.getElementById("khoj-ai-widget");
  if (existingWidget) return;

  const widget = document.createElement("div");
  widget.id = "khoj-ai-widget";
  widget.className = "khoj-ai-widget";

  const launcher = document.createElement("button");
  launcher.type = "button";
  launcher.className = "khoj-ai-launcher";
  launcher.setAttribute("aria-label", "Open Khoj AI assistant");
  launcher.innerHTML = "<span>✨</span><span>Khoj AI</span>";

  const panel = document.createElement("div");
  panel.className = "khoj-ai-panel";
  panel.innerHTML = `
    <div class="khoj-ai-header">
      <div>
        <span class="khoj-ai-badge">Dur Khoj AI</span>
        <h3>Property Assistant</h3>
      </div>
      <button type="button" class="khoj-ai-close" aria-label="Close assistant">×</button>
    </div>
    <div id="khoj-ai-chatbox" class="khoj-ai-chatbox" aria-live="polite"></div>
    <form id="khoj-ai-form" class="khoj-ai-form">
      <input id="khoj-ai-input" type="text" placeholder="Ask about property prices, areas, or budget..." autocomplete="off" />
      <button type="submit">Send</button>
    </form>
  `;

  widget.appendChild(launcher);
  widget.appendChild(panel);
  document.body.appendChild(widget);

  const chatBox = panel.querySelector("#khoj-ai-chatbox");
  const form = panel.querySelector("#khoj-ai-form");
  const input = panel.querySelector("#khoj-ai-input");
  const closeBtn = panel.querySelector(".khoj-ai-close");

  const appendMessage = (text, sender) => {
    const item = document.createElement("div");
    item.className = `khoj-ai-message ${sender}`;
    item.textContent = text;
    chatBox.appendChild(item);
    chatBox.scrollTop = chatBox.scrollHeight;
    return item;
  };

  const localReply = (message) => {
    const lower = message.toLowerCase();

    if (lower.includes("price") || lower.includes("budget") || lower.includes("estimate")) {
      return "For Chitral, prices usually vary by area and property type. Try checking the AI Price Predictor on the page or share your location, land size, and budget so I can help narrow it down.";
    }
    if (lower.includes("rent") || lower.includes("rental")) {
      return "Rental demand in Chitral depends on the area, property size, and access to utilities. Booni, Ayun, and Chitral town usually see different pricing ranges.";
    }
    if (lower.includes("booni") || lower.includes("ayun") || lower.includes("mastuj") || lower.includes("drosh") || lower.includes("chitral")) {
      return "Those locations are common in the Dur Khoj market. I can help compare property demand and typical price ranges in each area.";
    }
    if (lower.includes("house") || lower.includes("plot") || lower.includes("commercial")) {
      return "A house, plot, and commercial property each have different value drivers. Share the area size and location and I can point you in the right direction.";
    }
    return "I can help with local property guidance in Chitral. Ask me about budget, area, rent, or a location like Booni, Ayun, Mastuj, or Chitral town.";
  };

  const askBackend = async (message) => {
    if (window.location.protocol === "file:") {
      return localReply(message);
    }

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      if (!response.ok) throw new Error("Request failed");

      const data = await response.json();
      if (data && data.response) return data.response;
      return localReply(message);
    } catch (error) {
      console.warn("Khoj AI backend unavailable, using fallback response.", error);
      return localReply(message);
    }
  };

  launcher.addEventListener("click", () => {
    widget.classList.toggle("open");
    if (widget.classList.contains("open")) input.focus();
  });

  closeBtn.addEventListener("click", () => widget.classList.remove("open"));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    appendMessage(message, "user");
    input.value = "";

    const loader = appendMessage("Thinking...", "bot");
    loader.classList.add("loading");

    const reply = await askBackend(message);
    loader.remove();
    appendMessage(reply, "bot");
  });

  appendMessage("Hi! I can help with local property guidance in Chitral. Ask me about budget, rent, areas, or property types.", "bot");
});
