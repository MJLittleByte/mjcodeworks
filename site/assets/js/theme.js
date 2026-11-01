// Runs before first paint: applies the saved (or system) light/dark theme so the page never flashes.
(function () {
  var root = document.documentElement;
  var theme = null;
  try { theme = localStorage.getItem('theme'); } catch (e) { /* storage blocked */ }
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  root.setAttribute('data-theme', theme);
  root.classList.add('js');
})();
