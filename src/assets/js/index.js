import { initTheme } from './settings/theme';

initTheme();

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    const baseUrl = new URL(self.location.href).origin;
    navigator.serviceWorker.register(baseUrl + '/assets/js/service-worker.js');
  }
});
