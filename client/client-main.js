//client-main.js

import '../styles/main-page.css';
import { renderProducts } from './modules/products.js';
import { renderCart } from './modules/cart.js';
import { renderProfile } from './modules/profile.js';
import { auth } from '../firebase-config.js';
import { signOut } from 'firebase/auth';
import { renderRoleSelection } from '../role-selection.js';
import { renderOrder } from './modules/order.js';
import { renderGuestMainPage } from '../guest/guest-main.js';

export function renderClientMainPage() {
  console.log('Rendering Client Main Page'); // Debugging log
  const appDiv = document.getElementById('app');
  appDiv.innerHTML = `
    <nav class="client-nav">
      <img src="LOGO2.PNG" alt="Logo" class="logo">
      <div class="nav-links">
        <a href="#" id="products-link"><img src="products.svg" alt="Produse" class="nav-icon">Produse</a>
        <a href="#" id="cart-link"><img src="cart.svg" alt="Cosul Meu" class="nav-icon">Coșul Meu</a>
        <a href="#" id="order-link"><img src="order.svg" alt="Comanda ta" class="nav-icon">Comanda ta</a>
        <a href="#" id="profile-link"><img src="profile.svg" alt="Profilul Meu" class="nav-icon">Profilul Meu</a>
      </div>
    </nav>
    <div id="content">
      CONTENT
    </div>
    <button id="logout-button" class="fixed-logout-button">Logout</button>
  `;

  document.getElementById('products-link').addEventListener('click', renderProducts);
  document.getElementById('cart-link').addEventListener('click', renderCart);
  document.getElementById('profile-link').addEventListener('click', renderProfile);
  document.getElementById('order-link').addEventListener('click', renderOrder);
  document.getElementById('logout-button').addEventListener('click', handleLogout);

  renderClientDashboard();
}

function renderClientDashboard() {
  console.log('Rendering Client Dashboard'); // Debugging log
  const clientContentDiv = document.getElementById('content');
  clientContentDiv.innerHTML = `
    <div class="client-dashboard-content">

    <h2>Home</h2>
    <p>Bine ai revenit in aplicatie! Avem noi oferte pentru tine.</p>
    <div class="client-banners-container">

    <img src="banner.png" alt="Banner" class="banner-image">
    <img src="banner2.png" alt="Banner" class="banner-image">

    </div>
    </div>
  `;
}

function handleLogout() {
  signOut(auth).then(() => {
    renderGuestMainPage();
  }).catch((error) => {
    console.error('Logout error:', error);
  });
}
