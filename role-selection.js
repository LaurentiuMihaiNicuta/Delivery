import { renderLogin } from './client/client-login.js';
import { renderAdminLogin } from './admin/admin-login.js';
import { renderCourierLogin } from './curier/courier-login.js';
import './styles/role-selection.css';

export function renderRoleSelection() {
  const appDiv = document.getElementById('app');
  appDiv.innerHTML = `
    <div id="role-selection">
      <img src="LOGO2.PNG" alt="Logo" id="logo">
      <h1>Select Role</h1>
      <div id="role-buttons">
        <button id="client-login">Client Login</button>
        <button id="admin-login">Admin Login</button>
        <button id="courier-login">Courier Login</button>
      </div>
    </div>
  `;

  document.getElementById('client-login').addEventListener('click', renderLogin);
  document.getElementById('admin-login').addEventListener('click', renderAdminLogin);
  document.getElementById('courier-login').addEventListener('click', renderCourierLogin);
}