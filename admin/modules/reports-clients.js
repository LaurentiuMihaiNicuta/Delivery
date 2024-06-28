import { db } from '../../firebase-config.js';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import '../../styles/admin-styles/admin-reports-clients.css';

export function renderClientsReport() {
  document.getElementById('report-result').innerHTML = `
    <div id="clients-report-container">
      <div id="clients-report-controls">
        <input type="text" id="search-client-input" placeholder="Caută client...">
        <input type="date" id="date-select">
        <div id="clients-buttons">
          <button id="most-active-client-button">Cel mai activ client</button>
          <button id="least-active-client-button">Cel mai neactiv client</button>
        </div>
      </div>
      <div id="clients-grid"></div>
      <div id="client-report-details"></div>
    </div>
  `;

  document.getElementById('search-client-input').addEventListener('input', searchClients);
  document.getElementById('most-active-client-button').addEventListener('click', showMostActiveClient);
  document.getElementById('least-active-client-button').addEventListener('click', showLeastActiveClient);

  populateClientsGrid();
}

async function populateClientsGrid() {
  const clientsSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'client')));
  const clientsGrid = document.getElementById('clients-grid');
  clientsGrid.innerHTML = clientsSnapshot.docs.map(doc => {
    const client = doc.data();
    return `
      <div class="client-card" data-id="${doc.id}">
        <p>${client.name}</p>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.client-card').forEach(card => {
    card.addEventListener('click', () => {
      const clientId = card.getAttribute('data-id');
      generateClientReport(clientId);
    });
  });
}

function searchClients() {
  const searchTerm = document.getElementById('search-client-input').value.toLowerCase();
  const clientCards = document.querySelectorAll('.client-card');

  clientCards.forEach(card => {
    const clientName = card.querySelector('p').textContent.toLowerCase();
    if (clientName.includes(searchTerm)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

async function showMostActiveClient() {
  const clientsSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'client')));
  const clients = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  let mostActiveClient = null;
  let maxOrders = 0;

  for (const client of clients) {
    const ordersSnapshot = await getDocs(query(collection(db, 'orders'), where('userId', '==', client.id)));
    const ordersCount = ordersSnapshot.size;

    if (ordersCount > maxOrders) {
      mostActiveClient = client;
      maxOrders = ordersCount;
    }
  }

  if (mostActiveClient) {
    generateClientReport(mostActiveClient.id);
  }
}

async function showLeastActiveClient() {
  const clientsSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'client')));
  const clients = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  let leastActiveClient = null;
  let minOrders = Infinity;

  for (const client of clients) {
    const ordersSnapshot = await getDocs(query(collection(db, 'orders'), where('userId', '==', client.id)));
    const ordersCount = ordersSnapshot.size;

    if (ordersCount < minOrders) {
      leastActiveClient = client;
      minOrders = ordersCount;
    }
  }

  if (leastActiveClient) {
    generateClientReport(leastActiveClient.id);
  }
}

async function generateClientReport(clientId) {
  const clientDoc = await getDoc(doc(db, 'users', clientId));
  const client = clientDoc.data();

  const selectedDate = document.getElementById('date-select').value;
  const date = selectedDate ? new Date(selectedDate) : new Date();
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  const ordersSnapshot = await getDocs(query(
    collection(db, 'orders'),
    where('userId', '==', clientId),
    where('createdAt', '>=', startOfDay),
    where('createdAt', '<=', endOfDay)
  ));

  const orders = ordersSnapshot.docs.map(doc => doc.data());
  const totalSpent = orders.reduce((total, order) => {
    return total + order.products.reduce((sum, product) => sum + (Number(product.price) * product.orderedQuantity), 0);
  }, 0);

  document.getElementById('client-report-details').innerHTML = `
    <h3>Detalii Client</h3>
    <p>Nume: ${client.name}</p>
    <p>Email: ${client.email}</p>
    <p>Adresă: ${client.address}</p>
    <p>Telefon: ${client.phone}</p>
    <p>Număr comenzi în ${selectedDate}: ${orders.length}</p>
    <p>Suma cheltuită în ${selectedDate}: ${totalSpent.toFixed(2)} RON</p>
  `;
}
