//courier-main.js

import '../styles/courier-main.css';
import { renderCourierCurrentOrder } from './modules/courier-current-order.js';
import { renderCourierLogoutButton } from './courier-logout.js';


export function renderCourierMainPage() {
  const appDiv = document.getElementById('app');
  appDiv.innerHTML = `
    <div id="courier-main">
      <h2>Courier</h2>
      <p>Welcome to the courier dashboard!</p>
      
    </div>
  `;

 
  renderCourierCurrentOrder(); // Randează comanda curentă
  const logoutButton = renderCourierLogoutButton();
  appDiv.appendChild(logoutButton);
 

}