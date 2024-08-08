import { db, auth } from '../../firebase-config.js';
import { doc, getDoc, updateDoc, query, where, collection, getDocs } from 'firebase/firestore';
import '/styles/courier-current-order.css';
import { renderCourierChat } from './courier-chat.js';
import { renderCourierOrderList } from './courier-order-list.js'; // Importăm funcția pentru a randa lista comenzilor
import { showConfirm } from '../../confirm.js';

export async function renderCourierCurrentOrder() {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to view your current order.");
    return;
  }

  const ordersCollection = collection(db, 'orders');
  const courierOrdersQuery = query(
    ordersCollection,
    where('courierId', '==', user.uid),
    where('status', 'in', ['pending', 'picked up'])
  );
  const ordersSnapshot = await getDocs(courierOrdersQuery);

  const contentDiv = document.getElementById('courier-main');

  if (ordersSnapshot.empty) {
    contentDiv.innerHTML = `
      <h2>Order history for today</h2>
      <div id="order-history-container"></div>
    `;
    renderCourierOrderList();
    return;
  }

  const orderDoc = ordersSnapshot.docs[0];
  const orderData = orderDoc.data();

  const customerRef = doc(db, 'users', orderData.userId);
  const customerDoc = await getDoc(customerRef);
  const customerData = customerDoc.data();

  let totalAmount = orderData.products.reduce((total, product) => total + (product.orderedQuantity * product.price), 0).toFixed(2);

  contentDiv.innerHTML = `
    <div id="courier-current-order">
      <h2>Comanda ta este aceasta</h2>
      <p>Ai de livrat la adresa aceasta: ${orderData.address || 'Address not available'}</p>
      <p>Numele clientului este: ${customerData ? customerData.name : 'Unknown'}</p>
      <p>Telefon: ${customerData ? customerData.phone : 'Unknown'}</p>
      <p>Status: ${orderData.status}</p>
      <p>Total de platit: ${totalAmount} RON</p>
      <div id="order-items-container">
        ${orderData.products.map(product => `
          <div class="order-item">
            <img src="${product.imagePath}" alt="${product.name}" class="order-item-image">
            <p>${product.name} - ${product.orderedQuantity} x ${product.price} RON = ${(product.orderedQuantity * product.price).toFixed(2)} RON</p>
          </div>
        `).join('')}
      </div>
      <button id="update-status-button">Update Status</button>
      <button id="cancel-order-button">Anulează Comanda</button>
    </div>
    <div id="chat-container"></div>
  `;

  document.getElementById('update-status-button').addEventListener('click', async () => {
    let newStatus = 'picked up';
    if (orderData.status === 'picked up') {
      newStatus = 'delivered';
    }

    await updateDoc(doc(db, 'orders', orderDoc.id), {
      status: newStatus
    });

    if (newStatus === 'delivered') {
      await updateDoc(doc(db, 'couriers', user.uid), {
        free: true
      });
    }

    renderCourierCurrentOrder();
  });

  document.getElementById('cancel-order-button').addEventListener('click', async () => {
    const confirm = await showConfirm('Ești sigur că vrei să anulezi această comandă?');
    if (confirm) {
      await cancelOrder(orderDoc.id, orderData);
    }
  });

  renderCourierChat(orderDoc.id);
}

async function cancelOrder(orderId, orderData) {
  const products = orderData.products;

  // Actualizăm stocul produselor
  for (const product of products) {
    const productRef = doc(db, 'products', product.id);
    const productDoc = await getDoc(productRef);
    const productData = productDoc.data();
    await updateDoc(productRef, {
      stock: productData.stock + product.orderedQuantity
    });
  }

  // Anulăm comanda
  await updateDoc(doc(db, 'orders', orderId), {
    status: 'cancelled'
  });

  // Actualizăm statusul curierului
  const ordersCollection = collection(db, 'orders');
  const activeOrdersQuery = query(
    ordersCollection,
    where('courierId', '==', orderData.courierId),
    where('status', 'in', ['pending', 'picked up'])
  );
  const activeOrdersSnapshot = await getDocs(activeOrdersQuery);

  if (activeOrdersSnapshot.empty) {
    await updateDoc(doc(db, 'couriers', orderData.courierId), {
      free: true
    });
  }

  alert('Comanda a fost anulată cu succes.');
  renderCourierCurrentOrder(); // Refresh the courier page
}