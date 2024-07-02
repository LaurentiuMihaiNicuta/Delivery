// profile.js
import { renderSettings } from './profile-settings.js';
import { renderOrderHistory } from './profile-order-history.js';
import { auth } from '../../firebase-config.js';
import { renderLogin } from '../client-login.js';
import '/styles/client-styles/profile.css';

export async function renderProfile() {
  const contentDiv = document.getElementById('content');
  const user = auth.currentUser;

  if (!user) {
    renderLogin();
    return;
  }

  contentDiv.innerHTML = `
    <div id="profile-nav">
      <button id="settings-button">Setari</button>
      <button id="order-history-button">Istoric comenzi</button>
    </div>
    <div id="profile-content"></div>
  `;

  document.getElementById('settings-button').addEventListener('click', () => {
    renderSettings();
  });

  document.getElementById('order-history-button').addEventListener('click', () => {
    renderOrderHistory();
  });

  // Randează implicit setările
  renderSettings();
}
