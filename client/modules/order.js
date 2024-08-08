import { db, auth } from '../../firebase-config.js';
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, updateDoc } from 'firebase/firestore';
import { renderClientChat } from './client-chat.js'; // Importăm funcția de randare a chatului
import '/styles/client-styles/order.css';
import { showConfirm } from '../../confirm.js';

export async function renderOrder() {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to view your order.");
    return;
  }

  // Preluăm ultima comandă a utilizatorului
  const ordersCollection = collection(db, 'orders');
  const userOrdersQuery = query(
    ordersCollection,
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  const ordersSnapshot = await getDocs(userOrdersQuery);

  const contentDiv = document.getElementById('content');
  
  if (ordersSnapshot.empty || ordersSnapshot.docs[0].data().status === 'cancelled') {
    contentDiv.innerHTML = `
      <div id="order-container">
        <h2>Nu ai nicio comanda momentan!</h2>
      </div>
    `;
    return;
  }

  const orderDoc = ordersSnapshot.docs[0];
  const orderData = orderDoc.data();

  const courierRef = doc(db, 'couriers', orderData.courierId);
  const courierDoc = await getDoc(courierRef);
  const courierData = courierDoc.data();

  let orderStatusMessage = '';
  if (orderData.status === 'pending') {
    orderStatusMessage = 'Comanda ta este în preparare';
  } else if (orderData.status === 'picked up') {
    orderStatusMessage = 'Comanda ta este pe drum!';
  }

  if (orderData.status === 'delivered') {
    contentDiv.innerHTML = `
      <div id="order-container">
        <h2>Nu ai nicio comanda momentan!</h2>
      </div>
    `;
    return;
  }

  let totalAmount = orderData.products.reduce((total, product) => total + (product.orderedQuantity * product.price), 0).toFixed(2);

  contentDiv.innerHTML = `
    <div id="order-container">
      <div id="order-details">
        <h2>Comanda ta este pe drum!</h2>
        <p>Curierul tau este ${courierData ? courierData.name : 'Unknown'}</p>
        <p>Status: ${orderStatusMessage}</p>
        <div id="order-items-container">
          ${orderData.products.map(product => `
            <div class="order-item">
              <img src="${product.imagePath}" alt="${product.name}" class="order-item-image">
              <p>${product.name} - ${product.orderedQuantity} x ${product.price} RON = ${(product.orderedQuantity * product.price).toFixed(2)} RON</p>
            </div>
          `).join('')}
        </div>
        <div id="order-total">
          <p>Total: ${totalAmount} RON</p>
        </div>
        <button id="cancel-order-button">Anulează Comanda</button>
      </div>
      <div id="chat-container"></div> <!-- Container pentru chat -->
    </div>
  `;

  document.getElementById('cancel-order-button').addEventListener('click', async () => {
    const confirmed = await showConfirm('Ești sigur că vrei să anulezi această comandă?');
    if (confirmed) {
      await cancelOrder(orderDoc.id, orderData);
      clearOrderDetails();
    }
  });

  renderClientChat(orderDoc.id); // Randează chatul pentru comanda curentă
}
async function cancelOrder(orderId, orderData) {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to cancel your order.");
    return;
  }

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

  // Verificăm și actualizăm statusul curierului
  if (orderData.courierId) {
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
  }

  alert('Comanda a fost anulată cu succes.');
  clearOrderDetails(); // Clear order details after cancellation
}

function clearOrderDetails() {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = `
    <div id="order-container">
      <h2>Nu ai nicio comanda momentan!</h2>
    </div>
  `;
}