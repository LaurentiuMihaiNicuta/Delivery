import '../styles/admin-styles/admin.css';
import { renderAdminProducts } from './modules/admin-products.js';
import { renderReports } from './modules/reports.js';
import { renderCouriers } from './modules/couriers.js';
import { renderOrders } from './modules/orders.js';
import { auth } from '../firebase-config.js';
import { signOut } from 'firebase/auth';
import { renderRoleSelection } from '../role-selection.js';

export function renderAdminMainPage() {
  console.log('Rendering Admin Main Page'); // Debugging log
  const appDiv = document.getElementById('app');
  appDiv.innerHTML = `
    <nav class="admin-nav">
      <img src="/public/LOGO2.png" alt="Logo" class="logo">
      <div class="nav-links">
        <a href="#" id="admin-products-link">Gestionare Produse</a>
        <a href="#" id="admin-couriers-link">Gestionare Curieri</a>
        <a href="#" id="admin-orders-link">Comenzi</a>
        <a href="#" id="admin-reports-link">Rapoarte</a>
      </div>
    </nav>
    <div id="admin-content" style="padding-top: 70px;">
      <!-- Conținutul principal va fi aici -->
    </div>
    <button id="logout-button" class="fixed-logout-button">Logout</button>
  `;

  // Adăugăm event listeners pentru navigare
  document.getElementById('admin-products-link').addEventListener('click', renderAdminProducts);
  document.getElementById('admin-couriers-link').addEventListener('click', renderCouriers);
  document.getElementById('admin-orders-link').addEventListener('click', renderOrders);
  document.getElementById('logout-button').addEventListener('click', handleLogout);
  document.getElementById('admin-reports-link').addEventListener('click', renderReports);

  // Redirecționăm la dashboard-ul principal inițial
  renderAdminDashboard();
}

function renderAdminDashboard() {
  console.log('Rendering Admin Dashboard'); // Debugging log
  const adminContentDiv = document.getElementById('admin-content');
  adminContentDiv.innerHTML = `
    <h2>Dashboard Admin</h2>
    <p>Bine ai venit în dashboard-ul de administrare.</p>
  `;
}

function handleLogout() {
  signOut(auth).then(() => {
    renderRoleSelection();
  }).catch((error) => {
    console.error('Logout error:', error);
  });
}