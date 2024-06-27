// client-register.js
import { auth, db } from '../firebase-config.js';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { renderLogin } from './client-login.js';

export function renderRegister() {
  const appDiv = document.getElementById('app');
  appDiv.innerHTML = `
    <div id="register">
      <h2>Register</h2>
      <form id="register-form">
        <input type="text" id="name" placeholder="Name" required>
        <input type="email" id="email" placeholder="Email" required>
        <input type="password" id="password" placeholder="Password" required>
        <input type="text" id="address" placeholder="Address" required>
        <input type="text" id="phone" placeholder="Phone Number" required>
        <button type="submit">Register</button>
      </form>
      <div id="register-error"></div>
      <button id="go-to-login">Already have an account? Login</button>
    </div>
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
        document.getElementById('register-error').textContent = errorMessage;
        console.error('Register error:', errorCode, errorMessage);
      });
  });

  document.getElementById('go-to-login').addEventListener('click', () => {
    renderLogin();
  });
}