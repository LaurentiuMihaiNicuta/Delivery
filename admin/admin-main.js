import '../styles/admin.css';
import { renderAdminProducts } from './modules/admin-products.js';
//import { renderReports } from './modules/reports.js';
import { renderCouriers } from './modules/couriers.js';
//import { renderOrders } from './modules/orders.js';
import { auth } from '../firebase-config.js';
import { signOut } from 'firebase/auth';
import { renderRoleSelection } from '../role-selection.js';

export function renderAdminMainPage() {
  console.log('Rendering Admin Main Page'); // Debugging log
  const appDiv = document.getElementById('app');
  appDiv.innerHTML = `
    <nav>
      <ul>
        <li><a href="#" id="admin-products-link">Gestionare Produse</a></li>
        <li><a href="#" id="admin-reports-link">Rapoarte</a></li>
        <li><a href="#" id="admin-couriers-link">Gestionare Curieri</a></li>
        <li><a href="#" id="admin-orders-link">Comenzi</a></li>
        <li><button id="logout-button">Logout</button></li>
      </ul>
    </nav>
    <div id="admin-content">
      <!-- Conținutul principal va fi aici -->
    </div>
  `;

  // Adăugăm event listeners pentru navigare
  document.getElementById('admin-products-link').addEventListener('click', renderAdminProducts);
  //document.getElementById('admin-reports-link').addEventListener('click', renderReports);
  document.getElementById('admin-couriers-link').addEventListener('click', renderCouriers);
  //document.getElementById('admin-orders-link').addEventListener('click', renderOrders);
  document.getElementById('logout-button').addEventListener('click', handleLogout);

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