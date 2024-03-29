const isDeviceDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

const buttonThemeToggle = document.querySelector('.icon-theme');
const darkIcon = document.querySelector('.icon-dark');
const LightIcon = document.querySelector('.icon-light');

export function initTheme() {
  const localTheme = localStorage.getItem('theme');

  if (localTheme) {
    localTheme === 'dark' ? setDarkTheme() : setLightTheme();
  } else {
    isDeviceDarkTheme ? setDarkTheme() : setLightTheme();
  }

  registerEventsToggleTheme();
}

function registerEventsToggleTheme() {
  // Manual trigger
  buttonThemeToggle.addEventListener('click', (e) => {
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
  document.documentElement.setAttribute('data-theme', 'dark');
  localStorage.setItem('theme', 'dark');

  darkIcon.classList.add('hidden');
  LightIcon.classList.remove('hidden');

  buttonThemeToggle.title = 'Switch to light theme';
}

function setLightTheme() {
  document.documentElement.setAttribute('data-theme', 'light');
  localStorage.setItem('theme', 'light');

  darkIcon.classList.remove('hidden');
  LightIcon.classList.add('hidden');

  buttonThemeToggle.title = 'Switch to dark theme';
}
