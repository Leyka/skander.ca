const encodedEmail = 'c2thbi5rY0BwbS5tZQ==';

export function initEmail() {
  const contactLink = document.getElementById('contact-link');
  const decoded = atob(encodedEmail);
  contactLink.setAttribute('href', `mailto:${decoded}`);
}
