import '../styles/courier-login.css';
import { auth, db } from '../firebase-config.js';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { renderCourierMainPage } from './courier-main.js';

export function renderCourierLogin() {
  const appDiv = document.getElementById('app');
  appDiv.innerHTML = `
    <div id="login">
      <h2>Courier Login</h2>
      <form id="login-form">
        <input type="email" id="email" placeholder="Email" required>
        <input type="password" id="password" placeholder="Password" required>
        <button type="submit">Login</button>
      </form>
      <div id="login-error"></div>
      <button id="forgot-password">Forgot your password?</button>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, 'couriers', user.uid));
      if (userDoc.exists() && userDoc.data().role === 'courier') {
        renderCourierMainPage(); // Redirecționăm către pagina principală a curierului
      } else {
        throw new Error('Unauthorized');
      }
    } catch (error) {
      const errorMessage = error.message;
      document.getElementById('login-error').textContent = errorMessage;
      console.error('Login error:', error);
    }
  });

  document.getElementById('forgot-password').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    if (email) {
      sendPasswordResetEmail(auth, email)
        .then(() => {
          document.getElementById('login-error').textContent = 'Password reset email sent!';
        })
        .catch((error) => {
          const errorMessage = error.message;
          document.getElementById('login-error').textContent = errorMessage;
          console.error('Password reset error:', error);
        });
    } else {
      document.getElementById('login-error').textContent = 'Please enter your email to reset your password.';
    }
  });
}