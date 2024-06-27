// modules/profile.js
import { auth, db } from '../../firebase-config.js';
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { renderLogin } from '../client-login.js';
import '/styles/client-styles/profile.css'

export async function renderProfile() {
  const contentDiv = document.getElementById('content');
  const user = auth.currentUser;

  if (!user) {
    renderLogin();
    return;
  }

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) {
    console.error('No such user data!');
    return;
  }

  const userData = userDoc.data();

  contentDiv.innerHTML = `
    <h2 id='profile-header'>Profilul tau</h2>
    <form id="profile-form">
      <label for="name">Nume:</label>
      <input type="text" id="name" value="${userData.name}" required>
      
      <label for="email">Email:</label>
      <input type="email" id="email" value="${userData.email}" required disabled>
      
      <label for="address">Adresa:</label>
      <input type="text" id="address" value="${userData.address}" required>
      
      <label for="phone">Telefon:</label>
      <input type="text" id="phone" value="${userData.phone}" required>
      
      <button type="submit">Salvează modificările</button>
    </form>

    <h2 id="password-header">Schimbă Parola</h2>
    <form id="password-form">
      <label for="current-password">Parola Curentă:</label>
      <input type="password" id="current-password" required>
      
      <label for="new-password">Parola Nouă:</label>
      <input type="password" id="new-password" required>
      
      <label for="confirm-password">Confirmă Parola Nouă:</label>
      <input type="password" id="confirm-password" required>
      
      <button type="submit">Schimbă Parola</button>
    </form>
    
    <div id='button-container'>
        <button id="logout-button">Logout</button>
    <div>
    
    <div id="profile-error"></div>
  `;

  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedData = {
      name: document.getElementById('name').value,
      address: document.getElementById('address').value,
      phone: document.getElementById('phone').value,
    };

    try {
      await updateDoc(doc(db, 'users', user.uid), updatedData);
      document.getElementById('profile-error').textContent = 'Informațiile au fost actualizate cu succes!';
    } catch (error) {
      document.getElementById('profile-error').textContent = 'Eroare la actualizarea informațiilor: ' + error.message;
    }
  });

  document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
      document.getElementById('profile-error').textContent = 'Parolele nu coincid!';
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      document.getElementById('profile-error').textContent = 'Parola a fost schimbată cu succes!';
    } catch (error) {
      document.getElementById('profile-error').textContent = 'Eroare la schimbarea parolei: ' + error.message;
    }
  });

  document.getElementById('logout-button').addEventListener('click', async () => {
    try {
      await signOut(auth);
      renderLogin();
    } catch (error) {
      console.error('Logout error:', error);
    }
  });
}