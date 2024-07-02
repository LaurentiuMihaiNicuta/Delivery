import { db } from '../../firebase-config.js';
import { collection, getDocs, query, where } from 'firebase/firestore';
import '../../styles/admin-styles/admin-reports-revenue.css';

export async function renderRevenueReport() {
  document.getElementById('report-result').innerHTML = `
    <div id="revenue-report-container">
      <h3>Venituri</h3>
      <label for="start-date-select">Alege Data de Început:</label>
      <input type="date" id="start-date-select">
      <label for="end-date-select">Alege Data de Sfârșit:</label>
      <input type="date" id="end-date-select">
      <button id="generate-revenue-report-button">Generează Raport</button>
    </div>
    <div id="revenue-report-details">
      <h3>Detalii Venituri</h3>
      <p id="total-revenue"></p>
      <h3>Venituri pe Categorii</h3>
      <ul id="category-revenue-list"></ul>
    </div>
  `;

  document.getElementById('generate-revenue-report-button').addEventListener('click', generateRevenueReport);
}

async function generateRevenueReport() {
  const startDate = document.getElementById('start-date-select').value;
  const endDate = document.getElementById('end-date-select').value;

  if (!startDate || !endDate) {
    alert('Te rog să selectezi ambele date.');
    return;
  }

  const startDateTime = new Date(`${startDate}T00:00:00`);
  const endDateTime = new Date(`${endDate}T23:59:59`);

  const ordersSnapshot = await getDocs(query(
    collection(db, 'orders'),
    where('createdAt', '>=', startDateTime),
    where('createdAt', '<=', endDateTime)
  ));

  const orders = ordersSnapshot.docs.map(doc => doc.data());

  const totalRevenue = orders.reduce((total, order) => {
    return total + order.products.reduce((sum, product) => sum + (Number(product.price) * product.orderedQuantity), 0);
  }, 0);

  const categoryRevenue = {};

  orders.forEach(order => {
    order.products.forEach(product => {
      if (!categoryRevenue[product.category]) {
        categoryRevenue[product.category] = 0;
      }
      categoryRevenue[product.category] += Number(product.price) * product.orderedQuantity;
    });
  });

  renderRevenueReportDetails(startDate, endDate, totalRevenue, categoryRevenue);
}

function renderRevenueReportDetails(startDate, endDate, totalRevenue, categoryRevenue) {
  document.getElementById('total-revenue').innerHTML = `
    <p>Total venituri fără TVA între ${startDate} și ${endDate}: ${totalRevenue.toFixed(2)} RON</p>
  `;

  document.getElementById('category-revenue-list').innerHTML = Object.keys(categoryRevenue).map(category => `
    <li>
      <p>${category}: ${categoryRevenue[category].toFixed(2)} RON (fără TVA)</p>
    </li>
  `).join('');
}