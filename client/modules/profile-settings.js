import { auth, db } from '../../firebase-config.js';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { renderLogin } from '../client-login.js';
import { showAlert } from '../../alert.js';

export async function renderSettings() {
  const contentDiv = document.getElementById('profile-content');
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
    <div id="settings-container">
      <div class="header" id='profile-header'>
        <h2>Profilul tau</h2>
      </div>
      <div class="form-container">
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
      </div>

      <div class="header" id="password-header">
        <h2>Schimbă Parola</h2>
      </div>
      <div class="form-container">
        <form id="password-form">
          <label for="current-password">Parola Curentă:</label>
          <input type="password" id="current-password" required>
          
          <label for="new-password">Parola Nouă:</label>
          <input type="password" id="new-password" required>
          
          <label for="confirm-password">Confirmă Parola Nouă:</label>
          <input type="password" id="confirm-password" required>
          
          <button type="submit">Schimbă Parola</button>
        </form>
      </div>
      
      <div id="profile-error"></div>
    </div>
  `;

  function isValidPhoneNumber(phone) {
    const phoneRegex = /^[0-9]{10,15}$/; // Adjust the regex to fit your phone number format
    return phoneRegex.test(phone);
  }

  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('phone').value;
    if (!isValidPhoneNumber(phone)) {
      showAlert('Numărul de telefon este invalid!', 'error');
      return;
    }
    const updatedData = {
      name: document.getElementById('name').value,
      address: document.getElementById('address').value,
      phone: phone,
    };

    try {
      await updateDoc(doc(db, 'users', user.uid), updatedData);
      showAlert('Informațiile au fost actualizate cu succes!', 'success');
    } catch (error) {
      showAlert('Eroare la actualizarea informațiilor: ' + error.message, 'error');
    }
  });

  document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
      showAlert('Parolele nu coincid!', 'error');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      showAlert('Parola a fost schimbată cu succes!', 'success');
    } catch (error) {
      showAlert('Eroare la schimbarea parolei: ' + error.message, 'error');
    }
  });
}