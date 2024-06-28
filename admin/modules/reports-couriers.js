import { db } from '../../firebase-config.js';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import '../../styles/admin-styles/admin-reports-courier.css';

export function renderCourierReport() {
  document.getElementById('report-result').innerHTML = `
    <div id="courier-report-container">
      <h3>Curieri</h3>
      <label for="courier-select">Alege Curier:</label>
      <select id="courier-select"></select>
      <label for="date-select">Alege Data:</label>
      <input type="date" id="date-select">
      <button id="generate-report-button">Generează Raport</button>
    </div>
    <div id="courier-report-details">
      <h3>Detalii Curier</h3>
      <p id="courier-details"></p>
      <h3>Comenzi în <span id="report-date"></span></h3>
      <div id="courier-orders-grid"></div>
    </div>
  `;

  populateCourierSelect();

  document.getElementById('generate-report-button').addEventListener('click', generateCourierReport);
}

async function populateCourierSelect() {
  const couriersSnapshot = await getDocs(collection(db, 'couriers'));
  const courierSelect = document.getElementById('courier-select');
  courierSelect.innerHTML = couriersSnapshot.docs.map(doc => {
    const courier = doc.data();
    return `<option value="${doc.id}">${courier.name}</option>`;
  }).join('');
}

async function generateCourierReport() {
  const courierId = document.getElementById('courier-select').value;
  const date = document.getElementById('date-select').value;

  if (!courierId || !date) {
    alert('Te rog să selectezi un curier și o dată.');
    return;
  }

  const ordersSnapshot = await getDocs(query(
    collection(db, 'orders'),
    where('courierId', '==', courierId),
    where('createdAt', '>=', new Date(`${date}T00:00:00`)),
    where('createdAt', '<=', new Date(`${date}T23:59:59`))
  ));

  const orders = ordersSnapshot.docs.map(doc => doc.data()).reverse();
  const totalRevenue = orders.reduce((total, order) => {
    return total + order.products.reduce((sum, product) => sum + (Number(product.price) * product.orderedQuantity), 0);
  }, 0);

  renderCourierReportDetails(courierId, date, totalRevenue, orders);
}

async function renderCourierReportDetails(courierId, date, totalRevenue, orders) {
  const courierDoc = await getDoc(doc(db, 'couriers', courierId));
  const courier = courierDoc.data();

  document.getElementById('courier-details').innerHTML = `
    <p>Nume: ${courier.name}</p>
    <p>Email: ${courier.email}</p>
    <p>Venituri generate în ${date}: ${totalRevenue.toFixed(2)} RON</p>
  `;

  document.getElementById('report-date').textContent = date;

  document.getElementById('courier-orders-grid').innerHTML = orders.map(order => `
    <div class="order-card">
      <p>Adresă: ${order.address}</p>
      <p>Produse: ${order.products.map(p => `${p.name} (${p.orderedQuantity})`).join(', ')}</p>
      <p>Total: ${order.products.reduce((sum, p) => sum + (Number(p.price) * p.orderedQuantity), 0).toFixed(2)} RON</p>
    </div>
  `).join('');
}
