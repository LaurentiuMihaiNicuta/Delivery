import { auth } from '/../firebase-config.js';
import { signOut } from 'firebase/auth';
import { renderRoleSelection } from '../role-selection.js';

export function renderCourierLogoutButton() {
  const appDiv = document.getElementById('app');
  const logoutButton = document.createElement('button');
  logoutButton.id = 'logout-button';
  logoutButton.textContent = 'Logout';
  appDiv.appendChild(logoutButton);

  logoutButton.addEventListener('click', async () => {
    try {
      await signOut(auth);
      renderRoleSelection();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  });
}