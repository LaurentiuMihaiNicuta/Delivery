import { auth } from '../firebase-config.js';
import { signOut } from 'firebase/auth';
import { renderRoleSelection } from '../role-selection.js';
import { renderGuestMainPage } from '../guest/guest-main.js'; // Importăm funcția pentru pagina de vizitator

export function renderCourierLogoutButton() {
  const logoutButton = document.createElement('button');
  logoutButton.id = 'logout-button';
  logoutButton.textContent = 'Logout';
  logoutButton.classList.add('fixed-logout-button');

  logoutButton.addEventListener('click', async () => {
    try {
      await signOut(auth);
      renderRoleSelection();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  });

  return logoutButton;
}