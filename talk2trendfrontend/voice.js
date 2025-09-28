// Check browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.continuous = false;

  // Start listening
  function startCartVoice() {
    recognition.start();
    localStorage.setItem("voiceActive", "true");
    document.getElementById("cartVoiceBtn")?.classList.add("listening");
  }

  // Stop listening
  function stopCartVoice() {
    recognition.stop();
    localStorage.setItem("voiceActive", "false");
    document.getElementById("cartVoiceBtn")?.classList.remove("listening");
  }

  // Handle voice command result
  recognition.onresult = function (event) {
    const command = event.results[0][0].transcript.toLowerCase();
    console.log("Voice command:", command);

    // Check for "add product 2" kind of command
    const match = command.match(/add(?: (?:product|item))? ?(\d+)/);

    if (match) {
      const serial = parseInt(match[1]);
      const productCard = document.querySelector(`[data-serial="${serial}"]`);
      if (productCard) {
        const button = productCard.querySelector("button");
        if (button) {
          button.click();
          return;
        }
      }
      alert(`Product #${serial} not found.`);
      return;
    }

   // --- Filter by category (case-insensitive) ---
const categoryMatch = command.match(/(?:filter|show)(?: category)?\s+([a-zA-Z0-9]+)/);

if (categoryMatch) {
  const spokenCategory = categoryMatch[1].toLowerCase();

  if (window.categoryFilter) {
    let found = false;
    for (let option of window.categoryFilter.options) {
      if (option.value.toLowerCase() === spokenCategory) {
        window.categoryFilter.value = option.value; // set exact case from dropdown
        window.applyFiltersAndSort();
        alert(`Filtering category: ${option.value}`);
        found = true;
        break;
      }
    }
    if (!found) {
      alert(`Category "${spokenCategory}" not found.`);
    }
    return;
  }
}



  // --- Sort price ---
  if (command.includes("low to high") || command.includes("price ascending") || command.includes("sort price asc")) {
    if (window.priceSort) {
      window.priceSort.value = "asc";
      window.applyFiltersAndSort();
      alert("Sorted price: low to high");
      return;
    }
  }
  if (command.includes("high to low") || command.includes("price descending") || command.includes("sort price desc")) {
    if (window.priceSort) {
      window.priceSort.value = "desc";
      window.applyFiltersAndSort();
      alert("Sorted price: high to low");
      return;
    }
  }

  // --- Clear filters / show all ---
  if (/(clear filters|show all|all products)/.test(command)) {
    if (window.categoryFilter) window.categoryFilter.value = "all";
    if (window.priceSort) window.priceSort.value = "default";
    if (window.applyFiltersAndSort) window.applyFiltersAndSort();
    alert("Cleared filters. Showing all products.");
    return;
  }

  // --- Dark mode voice controls ---
if (command.match(/\b(dark mode on|enable dark mode|turn on dark mode|dark mode|dark please)\b/)) {
  window.setDarkMode(true);
  alert("Dark mode enabled.");
  return;
}
if (command.match(/\b(light mode|light theme|dark off)\b/)) {
  window.setDarkMode(false);
  alert("Light mode enabled.");
  return;
}
if (command.match(/\b(toggle dark mode|switch theme)\b/)) {
  window.toggleDarkMode();
  alert("Toggled theme.");
  return;
}


  // Fallback to existing routes
  handleVoiceCommand(command);

    // Handle other voice routes
    handleVoiceCommand(command);
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error:", event.error);
    alert("Voice recognition error. Please try again.");
  };

  recognition.onend = function () {
    if (localStorage.getItem("voiceActive") === "true") {
      recognition.start(); // auto-restart
    } else {
      document.getElementById("cartVoiceBtn")?.classList.remove("listening");
    }
  };

  // Auto start on page load
  window.addEventListener("load", () => {
    if (localStorage.getItem("voiceActive") === "true") {
      startCartVoice();
    }
  });

  // Voice route keywords and actions
  const voiceRoutes = [

    {
  keywords: ["clear filters", "show all products", "all products"],
  action: () => {
    if (window.categoryFilter) window.categoryFilter.value = "all";
    if (window.priceSort) window.priceSort.value = "default";
    if (window.applyFiltersAndSort) window.applyFiltersAndSort();
    alert("Cleared filters.");
  }
},


    {
      keywords: ["product", "products", "product page", "open products", "show products"],
      action: () => window.location.href = "product.html"
    },
    {
      keywords: ["home", "homepage", "go to home", "index"],
      action: () => window.location.href = "index.html"
    },
    {
      keywords: ["cart", "caat", "cat", "shopping cart", "go to cart", "show my cart"],
      action: () => window.location.href = "cart.html"
    },
    {
      keywords: ["dashboard", "my dashboard", "open dashboard"],
      action: () => window.location.href = "dashboard.html"
    },
    {
      keywords: ["logout", "log me out", "sign out", "close account"],
      action: () => {
        localStorage.clear();
        window.location.href = "login.html";
      }
    },
    {
      keywords: ["sign up", "signup"],
      action: () => {
        localStorage.clear();
        window.location.href = "signup.html";
      }
    },
    {
      keywords: ["place order", "order", "buy now", "confirm order", "checkout"],
      action: () => {
        const btn = document.getElementById("placeOrderBtn");
        if (btn) btn.click();
        else alert("Place Order button not found.");
      }
    },
    {
      keywords: ["stop listening", "voice off", "disable voice", "stop voice"],
      action: () => {
        stopCartVoice();
        alert("Voice control stopped.");
      }
    },
    {
      keywords: ["remove"],
      action: () => {
        const btn = document.getElementById("remove");
        if (btn) btn.click();
        else alert("Remove button not found.");
      }
    }
  ];

  function handleVoiceCommand(command) {
    let matched = false;
    for (const route of voiceRoutes) {
      for (const keyword of route.keywords) {
        if (command.includes(keyword)) {
          route.action();
          matched = true;
          break;
        }
      }
      if (matched) break;
    }

    if (!matched) {
      alert("Sorry, I didn't understand that command.");
    }
  }



  // Export functions globally (optional if used by buttons)
  window.startCartVoice = startCartVoice;
  window.stopCartVoice = stopCartVoice;

} else {
  alert("Speech Recognition is not supported in your browser.");
}


