import { auth, db } from '../../firebase-config.js';
import { collection, getDocs } from 'firebase/firestore';
import '../../styles/admin-styles/admin-couriers.css';

export async function renderCouriers() {
  const adminContentDiv = document.getElementById('admin-content');
  adminContentDiv.innerHTML = `
    <div id="courier-management">
      <h2>Gestionează Curieri</h2>
      <form id="courier-form">
        <input type="text" id="courier-name" placeholder="Nume" required>
        <input type="email" id="courier-email" placeholder="Email" required>
        <input type="password" id="courier-password" placeholder="Parola" required>
        <button type="submit">Adaugă Curier</button>
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

    try {
      const response = await fetch('https://us-central1-licentanicutalaurentiu.cloudfunctions.net/createCourier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (response.ok) {
        alert('Curier adăugat cu succes');
        renderCourierList();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (error) {
      console.error('Error adding courier:', error);
      alert('Eroare la adăugarea curierului: ' + error.message);
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
      <p><strong>Creat la:</strong> ${courier.createdAt.toDate().toLocaleDateString()}</p>
    </div>
  `).join('');
}