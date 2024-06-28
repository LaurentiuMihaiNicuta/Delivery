import '../styles/courier-main.css';
import { renderCourierCurrentOrder } from './modules/courier-current-order.js';
import { renderCourierLogoutButton } from './courier-logout.js';
import { renderCourierChat } from './modules/courier-chat.js'; // Importăm funcția de randare a chatului

export function renderCourierMainPage() {
  const appDiv = document.getElementById('app');
  appDiv.innerHTML = `
    <div id="courier-main">
      <h2>Platforma de curier</h2>
      <p>Welcome to the courier dashboard!</p>
      <div id="order-content"></div>
      <div id="chat-container"></div> <!-- Container pentru chat -->
      <div id="alert-container"></div>
    </div>
  `;

  renderCourierCurrentOrder(); // Randează comanda curentă
  const logoutButton = renderCourierLogoutButton();
  appDiv.appendChild(logoutButton);
}
