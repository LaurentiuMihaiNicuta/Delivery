import { renderLogin } from './client/client-login.js';
import { renderAdminLogin } from './admin/admin-login.js';
import { renderCourierLogin } from './curier/courier-login.js';
import './styles/role-selection.css';

export function renderRoleSelection() {
  const appDiv = document.getElementById('app');
  appDiv.innerHTML = `
    <div id="role-selection">
      <img src="LOGO2.PNG" alt="Logo" id="logo">
      <h1>Cum vrei să te conectezi?</h1>
      <div id="role-buttons">
        
        <button id="admin-login">Admin Login</button>
        <button id="courier-login">Courier Login</button>
      </div>
      <p> Vrei să devii partener? Asteptăm CV-ul tău la Geo&oana_shop@gmail.com </p>
    </div>
  `;


  document.getElementById('admin-login').addEventListener('click', renderAdminLogin);
  document.getElementById('courier-login').addEventListener('click', renderCourierLogin);
}