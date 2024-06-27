// admin-login.js
import '../styles/login.css';
import { auth, db } from '../firebase-config.js';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { renderAdminMainPage } from './admin-main.js';

export function renderAdminLogin() {
  const appDiv = document.getElementById('app');
  appDiv.innerHTML = `
    <div id="login">
      <h2>Admin Login</h2>
      <form id="login-form">
        <input type="email" id="email" placeholder="Email" required>
        <input type="password" id="password" placeholder="Password" required>
        <button type="submit">Login</button>
      </form>
      <div id="login-error"></div>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        renderAdminMainPage(); // Redirecționăm către pagina principală a adminului
      } else {
        throw new Error('Unauthorized');
      }
    } catch (error) {
      const errorMessage = error.message;
      document.getElementById('login-error').textContent = errorMessage;
      console.error('Login error:', error);
    }
  });
}
