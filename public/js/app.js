(function () {
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  const storageKey = "museu-theme";

  const savedTheme = localStorage.getItem(storageKey);
  if (savedTheme === "dark" || savedTheme === "light") {
    root.setAttribute("data-theme", savedTheme);
  }

  function updateButtonText() {
    const darkModeEnabled = root.getAttribute("data-theme") === "dark";
    if (toggle) {
      toggle.textContent = darkModeEnabled ? "Modo claro" : "Modo escuro";
    }
  }

  updateButtonText();

  if (toggle) {
    toggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") || "light";
      const next = current === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      localStorage.setItem(storageKey, next);
      updateButtonText();
    });
  }
})();
