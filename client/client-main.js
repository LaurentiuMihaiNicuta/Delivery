import '../styles/main-page.css';
import { renderProducts } from './modules/products.js';
import { renderCart } from './modules/cart.js';
import { renderProfile } from './modules/profile.js';
import { auth } from '../firebase-config.js';
import { signOut } from 'firebase/auth';
import { renderRoleSelection } from '../role-selection.js';
import { renderOrder } from './modules/order.js';

export function renderClientMainPage() {
  console.log('Rendering Client Main Page'); // Debugging log
  const appDiv = document.getElementById('app');
  appDiv.innerHTML = `
    <nav>
      <ul>
        <li><a href="#" id="products-link">Produse</a></li>
        <li><a href="#" id="cart-link">Cosul Meu</a></li>
        <li><a href="#" id="order-link">Comanda ta</a></li>
        <li><a href="#" id="profile-link">Profilul Meu</a></li>
      </ul>
    </nav>
    <div id="content">
      CONTENT
    </div>
  `;

  // Adăugăm event listeners pentru navigare
  document.getElementById('products-link').addEventListener('click', renderProducts);
  document.getElementById('cart-link').addEventListener('click', renderCart);
  document.getElementById('profile-link').addEventListener('click', renderProfile);
  document.getElementById('order-link').addEventListener('click', renderOrder);

  // Redirecționăm la dashboard-ul principal inițial
  renderClientDashboard();
}

function renderClientDashboard() {
  console.log('Rendering Client Dashboard'); // Debugging log
  const clientContentDiv = document.getElementById('content');
  clientContentDiv.innerHTML = `
    <h2>Dashboard Client</h2>
    <p>Bine ai venit în dashboard-ul clientului.</p>
  `;
}