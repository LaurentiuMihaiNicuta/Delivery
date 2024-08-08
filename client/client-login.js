import '../styles/login.css';
import { auth, db } from '../firebase-config.js';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { renderRegister } from './client-register.js';
import { renderClientMainPage } from './client-main.js';
import { showAlert } from '../alert.js';  // Importăm funcția showAlert

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
        <button id="go-to-register">Nu ai cont? Fa-ți acum unul!</button>
        <button id="forgot-password">Ți-ai uitat parola?</button>
      </div>
    </div>
    <div id ="login-second-div">Magazinul tau preferat acum si la tine acasa </div>
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
        showAlert('Te rog verifica datele introduse!', 'error');
      }
    } catch (error) {
      const errorMessage = error.message;
      document.getElementById('login-error').textContent = '';
      showAlert('Te rog verifica datele introduse');  // Utilizăm showAlert pentru a afișa eroarea
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
          document.getElementById('login-error').textContent = '';
          showAlert('Ai primit un email pentru resetarea parolei!', 'success');  // Utilizăm showAlert pentru a afișa mesajul de succes
        })
        .catch((error) => {
          const errorMessage = error.message;
          document.getElementById('login-error').textContent = '';
          showAlert(errorMessage, 'error');  // Utilizăm showAlert pentru a afișa eroarea
          console.error('Password reset error:', error);
        });
    } else {
      document.getElementById('login-error').textContent = '';
      showAlert('Te rog introdu datele.', 'warning');  // Utilizăm showAlert pentru a afișa un mesaj de avertizare
    }
  });
}