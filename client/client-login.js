import '../styles/login.css';
import { auth, db } from '../firebase-config.js';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { renderRegister } from './client-register.js';
import { renderClientMainPage } from './client-main.js';

export function renderLogin() {
  const appDiv = document.getElementById('app');
  appDiv.innerHTML = `
    <div id="login-container">
      <img src="LOGO2.PNG" alt="Logo" id="logo">
      <h2>Login</h2>
      <form id="login-form">
        <input type="email" id="email" placeholder="Email" required>
        <input type="password" id="password" placeholder="Password" required>
        <button type="submit">Login</button>
      </form>
      <div id="login-error"></div>
      <div id="login-buttons">
        <button id="go-to-register">You don't have an account? Create one</button>
        <button id="forgot-password">Forgot your password?</button>
      </div>
    </div>
    <div id ="login-second-div">Magazinul tau preferat acum si la tine acasa </da>
  `;

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        console.log('User data:', userDoc.data());
        renderClientMainPage(); // Redirecționăm către pagina principală
      } else {
        console.error('No such user data!');
      }
    } catch (error) {
      const errorMessage = error.message;
      document.getElementById('login-error').textContent = errorMessage;
      console.error('Login error:', error);
    }
  });

  document.getElementById('go-to-register').addEventListener('click', () => {
    renderRegister();
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
