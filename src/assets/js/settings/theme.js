const buttonToggleTheme = document.querySelector('.btn-toggle-theme');
const isDeviceDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

export function initTheme() {
  const localTheme = localStorage.getItem('theme');

  if (localTheme === 'dark' || isDeviceDarkTheme) {
    setDarkTheme();
  } else {
    setLightTheme();
  }

  registerEventsToggleTheme();
}

function registerEventsToggleTheme() {
  // Manual trigger
  buttonToggleTheme.addEventListener('click', (e) => {
    e.preventDefault();

    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      setLightTheme();
    } else {
      setDarkTheme();
    }
  });

  // Device theme trigger
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    event.matches ? setDarkTheme() : setLightTheme();
  });
}

function setDarkTheme() {
  document.body.setAttribute('data-theme', 'dark');
  localStorage.setItem('theme', 'dark');
  buttonToggleTheme.innerHTML = 'Light mode';
}

function setLightTheme() {
  document.body.removeAttribute('data-theme');
  localStorage.setItem('theme', 'light');
  buttonToggleTheme.innerHTML = 'Dark mode';
}
