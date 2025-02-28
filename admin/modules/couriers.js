import { auth, db } from '../../firebase-config.js';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import '../../styles/admin-styles/admin-couriers.css';
import { showAlert } from '../../alert.js';
import { showConfirm } from '../../confirm.js';

export async function renderCouriers() {
  const adminContentDiv = document.getElementById('admin-content');
  adminContentDiv.innerHTML = `
    <div id="courier-management">
      <h2>Gestionează Curieri</h2>
      <form id="courier-form">
        <input type="text" id="courier-name" placeholder="Nume" required>
        <input type="email" id="courier-email" placeholder="Email" required>
        <input type="password" id="courier-password" placeholder="Parola" required>
        <input type="text" id="courier-phone" placeholder="Telefon" required>
        <button type="submit" id="add-courier-button">Adaugă Curier</button>
      </form>
      <h3>Lista Curieri</h3>
      <div id="courier-list"></div>
    </div>
  `;

  document.getElementById('courier-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('courier-name').value;
    const email = document.getElementById('courier-email').value;
    const password = document.getElementById('courier-password').value;
    const phone = document.getElementById('courier-phone').value;

    if (!isValidPhoneNumber(phone)) {
      showAlert('Numărul de telefon este invalid. Te rog să introduci un număr valid.', 'error');
      return;
    }

    try {
      const response = await fetch('https://us-central1-licentanicutalaurentiu.cloudfunctions.net/createCourier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, phone }),
      });

      if (response.ok) {
        showAlert('Curier adăugat cu succes', 'success');
        renderCourierList();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (error) {
      console.error('Error adding courier:', error);
      showAlert('Eroare la adăugarea curierului: ' + error.message, 'error');
    }
  });

  await renderCourierList();
}


async function renderCourierList() {
  const courierList = document.getElementById('courier-list');
  const couriersSnapshot = await getDocs(collection(db, 'couriers'));
  const couriers = couriersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  courierList.innerHTML = couriers.map(courier => `
    <div class="courier-card">
      <p><strong>Nume:</strong> ${courier.name}</p>
      <p><strong>Email:</strong> ${courier.email}</p>
      <p><strong>Telefon:</strong> ${courier.phone}</p>
      <p><strong>Creat la:</strong> ${courier.createdAt.toDate().toLocaleDateString()}</p>
      <p>
        <strong>Status:</strong>
        <span class="courier-status ${courier.free ? 'free' : 'busy'}">
          ${courier.free ? 'Curierul nu livrează' : 'Curierul livrează acum'}
        </span>
      </p>
      <button class="delete-courier-button" data-id="${courier.id}">Șterge</button>
    </div>
  `).join('');

  document.querySelectorAll('.delete-courier-button').forEach(button => {
    button.addEventListener('click', async (e) => {
      const courierId = e.target.dataset.id;
      const confirm = await showConfirm('Ești sigur că vrei să ștergi acest curier?');
      if (confirm) {
        try {
          const functions = getFunctions();
          const deleteCourier = httpsCallable(functions, 'deleteCourier');
          await deleteCourier({ uid: courierId });
          renderCourierList();
        } catch (error) {
          console.error('Error deleting courier:', error);
          showAlert('Eroare la ștergerea curierului: ' + error.message, 'error');
        }
      }
    });
  });
}

function isValidPhoneNumber(phone) {
  const phoneRegex = /^[0-9]{10,15}$/; // Modifică regex-ul după cum e necesar
  return phoneRegex.test(phone);
}