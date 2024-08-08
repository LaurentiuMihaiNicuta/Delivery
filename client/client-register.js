import { auth, db } from '../firebase-config.js';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { renderLogin } from './client-login.js';
import '../styles/register.css';
import { showAlert } from '../alert.js';

export function renderRegister() {
  const appDiv = document.getElementById('app');
  appDiv.innerHTML = `
    <div id="register-container">
      <img src="LOGO2.PNG" alt="Logo" id="logo">
      <h2>Fă-ți chiar acum un cont!</h2>
      <form id="register-form">
        <input type="text" id="name" placeholder="Name" required>
        <input type="email" id="email" placeholder="Email" required>
        <input type="password" id="password" placeholder="Password" required>
        <input type="text" id="address" placeholder="Address" required>
        <input type="text" id="phone" placeholder="Phone Number" required>
        <button type="submit">Înregistreaza-te!</button>
      </form>
      <div id="register-error"></div>
      <div id="register-buttons">
        <button id="go-to-login">Ai deja un cont? Logheaza-te</button>
      </div>
    </div>
    <div id="register-second-div">Magazinul tau preferat acum si la tine acasa</div>
  `;

  document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
          name,
          email,
          address,
          phone,
          role: 'client',
          createdAt: new Date()
        });
        console.log('User registered and data saved:', user);
        renderLogin();
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        showAlert("Ceva nu a functionat! Verifica Datele introduse")
        console.error('Register error:', errorCode, errorMessage);
      });
  });

  document.getElementById('go-to-login').addEventListener('click', () => {
    renderLogin();
  });
}