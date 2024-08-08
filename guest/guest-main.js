// guest-main.js
import '../styles/main-page.css';
import '../styles/guest.css'; // Importăm stilurile pentru guest
import { renderProducts } from '../client/modules/products.js';
import { renderRoleSelection } from '../role-selection.js';
import { renderLogin } from '../client/client-login.js';
import { renderRegister } from '../client/client-register.js';

export function renderGuestMainPage() {
  console.log('Rendering Guest Main Page'); // Debugging log
  const appDiv = document.getElementById('app');
  appDiv.innerHTML = `
    <nav class="guest-nav">
      <img src="LOGO2.PNG" alt="Logo" class="logo">
      <div class="nav-links">
        <a href="#" id="products-link"><img src="products.svg" alt="Produse" class="nav-icon">Produse</a>
        <a href="#" id="login-link"><img src="login.svg" alt="Log In" class="nav-icon">Log In</a>
        <a href="#" id="register-link"><img src="register.svg" alt="Inregistrează-te" class="nav-icon">Înregistrează-te</a>
        <a href="#" id="join-link"><img src="join.svg" alt="Alătură-te Echipei" class="nav-icon">Cont partener</a>
      </div>
    </nav>
    <div id="content" class="guest-content">
      <h2>Bine ați venit pe site-ul nostru!</h2>
      <p>Aici puteți găsi cele mai bune produse.</p>
      <div class="banner-container">

      <img src="banner.png" alt="Banner" class="banner-image">
      <img src="banner2.png" alt="Banner" class="banner-image">

      </div>
    </div>
  `;

  document.getElementById('products-link').addEventListener('click', renderProducts);
  document.getElementById('login-link').addEventListener('click', renderLogin);
  document.getElementById('register-link').addEventListener('click', renderRegister);
  document.getElementById('join-link').addEventListener('click', renderRoleSelection);
}