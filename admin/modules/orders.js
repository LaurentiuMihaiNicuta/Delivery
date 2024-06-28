import { db } from '../../firebase-config.js';
import { collection, getDocs, getDoc, doc, query, where } from 'firebase/firestore';
import '../../styles/admin-styles/admin-order.css';

let orders = [];
let filteredOrders = [];

export async function renderOrders() {
  const adminContentDiv = document.getElementById('admin-content');
  adminContentDiv.innerHTML = `
    <div id="orders-filters">
      <label for="client-search-bar">Search by Client Name:</label>
      <input type="text" id="client-search-bar" placeholder="Search by client...">
      <label for="courier-search-bar">Search by Courier Name:</label>
      <input type="text" id="courier-search-bar" placeholder="Search by courier...">
      <label for="date-filter">Filter by Date:</label>
      <input type="date" id="date-filter">
    </div>
    <div id="orders-list-container">
      <div id="orders-list"></div>
    </div>
  `;

  await loadOrders();
  renderOrderList(orders);

  document.getElementById('client-search-bar').addEventListener('input', filterOrders);
  document.getElementById('courier-search-bar').addEventListener('input', filterOrders);
  document.getElementById('date-filter').addEventListener('input', filterOrders);
}

async function loadOrders() {
  const ordersCollection = collection(db, 'orders');
  const ordersSnapshot = await getDocs(ordersCollection);
  orders = await Promise.all(
    ordersSnapshot.docs.map(async (orderDoc) => {
      const orderData = orderDoc.data();
      const clientDoc = await getDoc(doc(db, 'users', orderData.userId));
      const courierDoc = await getDoc(doc(db, 'couriers', orderData.courierId));

      const totalAmount = orderData.products.reduce((total, product) => {
        return total + (Number(product.price) * product.orderedQuantity);
      }, 0);

      return {
        id: orderDoc.id,
        ...orderData,
        clientName: clientDoc.exists() ? clientDoc.data().name : 'Unknown',
        courierName: courierDoc.exists() ? courierDoc.data().name : 'Unknown',
        totalAmount: totalAmount.toFixed(2), // Formatăm suma totală cu două zecimale
      };
    })
  );
  filteredOrders = orders;
}

function filterOrders() {
  const clientSearchTerm = document.getElementById('client-search-bar').value.toLowerCase();
  const courierSearchTerm = document.getElementById('courier-search-bar').value.toLowerCase();
  const dateFilter = document.getElementById('date-filter').value;

  filteredOrders = orders.filter(order => {
    const matchesClientSearch = order.clientName.toLowerCase().includes(clientSearchTerm);
    const matchesCourierSearch = order.courierName.toLowerCase().includes(courierSearchTerm);
    const matchesDate = dateFilter ? order.createdAt.toDate().toISOString().split('T')[0] === dateFilter : true;
    return matchesClientSearch && matchesCourierSearch && matchesDate;
  });

  renderOrderList(filteredOrders);
}

function renderOrderList(orders) {
  const ordersListDiv = document.getElementById('orders-list');
  if (orders.length === 0) {
    ordersListDiv.innerHTML = '<p>No orders found.</p>';
    return;
  }
  ordersListDiv.innerHTML = orders.map(order => `
    <div class="order">
      <p>Order ID: ${order.id}</p>
      <p>Client: ${order.clientName}</p>
      <p>Curier: ${order.courierName}</p>
      <p>Addresa: ${order.address}</p>
      <p>Statusul comenzii: ${order.status}</p>
      <p>Valoarea totala: ${order.totalAmount} RON</p>
      <div class="order-products">
        <p>Products:</p>
        ${order.products.map(product => `
          <div>
             <p>${product.name} - ${product.orderedQuantity} x ${product.quantity} ${product.measure} = ${(Number(product.price) * product.orderedQuantity).toFixed(2)} RON</p>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}
