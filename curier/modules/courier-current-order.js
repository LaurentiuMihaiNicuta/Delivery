import { db, auth } from '../../firebase-config.js';
import { doc, getDoc, updateDoc, query, where, collection, getDocs } from 'firebase/firestore';
import '/styles/courier-current-order.css';
import { renderCourierChat } from './courier-chat.js';
import { renderCourierOrderList } from './courier-order-list.js'; // Importă funcția de render pentru lista de comenzi

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
    where('status', '!=', 'delivered')
  );
  const ordersSnapshot = await getDocs(courierOrdersQuery);

  const contentDiv = document.getElementById('courier-main');

  if (ordersSnapshot.empty) {
    contentDiv.innerHTML = `<h2>Nu ai nicio comanda momentan!</h2>`;
    await renderCourierOrderList(); // Render the order list when there are no current orders
    return;
  }

  const orderDoc = ordersSnapshot.docs[0];
  const orderData = orderDoc.data();

  const customerRef = doc(db, 'users', orderData.userId);
  const customerDoc = await getDoc(customerRef);
  const customerData = customerDoc.exists() ? customerDoc.data() : {};

  contentDiv.innerHTML = `
    <div id="courier-current-order">
      <h2>Current Order</h2>
      <p>Ai de livrat la adresa aceasta: ${orderData.address || 'Address not available'}</p>
      <p>Numele clientului este: ${customerData.name || 'Unknown'}</p>
      <p>Status: ${orderData.status}</p>
      <button id="update-status-button">Update Status</button>
    </div>
    <div id="chat-container"></div>
  `;

  renderCourierChat(orderDoc.id);

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
}
