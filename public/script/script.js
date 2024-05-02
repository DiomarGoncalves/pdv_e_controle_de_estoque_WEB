const ThemeSwitcher = {
    init: function () {
      // Evento para alternar o tema
      const themeSwitch = document.getElementById("theme-switch");
      const body = document.body;
      themeSwitch.addEventListener("change", () => {
        body.classList.toggle("dark-mode");
      });
    },
  };
  ThemeSwitcher.init();
