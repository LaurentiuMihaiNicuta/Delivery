import { db, auth } from '../../firebase-config.js';
import { doc, getDoc, updateDoc, query, where, collection, getDocs } from 'firebase/firestore';
import '/styles/courier-current-order.css';

export async function renderCourierCurrentOrder() {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to view your current order.");
      return;
    }
  
    // Preluăm comanda curentă asignată curierului
    const ordersCollection = collection(db, 'orders');
    const courierOrdersQuery = query(
      ordersCollection,
      where('courierId', '==', user.uid),
      where('status', '!=', 'delivered')
    );
    const ordersSnapshot = await getDocs(courierOrdersQuery);
  
    if (ordersSnapshot.empty) {
      alert("No current orders assigned.");
      return;
    }
  
    const orderDoc = ordersSnapshot.docs[0];
    const orderData = orderDoc.data();
    console.log('Order Data:', orderData); // Debugging log
  
    const customerRef = doc(db, 'users', orderData.userId);
    const customerDoc = await getDoc(customerRef);
    const customerData = customerDoc.data();
    console.log('Customer Data:', customerData); // Debugging log
  
    const contentDiv = document.getElementById('courier-main');
    contentDiv.innerHTML = `
      <div id="courier-current-order">
        <h2>Current Order</h2>
        <p>Customer: ${customerData ? customerData.name : 'Unknown'}</p>
        <p>Address: ${orderData.address || 'Address not available'}</p>
        <p>Status: ${orderData.status}</p>
        <button id="update-status-button">Update Status</button>
      </div>
    `;
  
    document.getElementById('update-status-button').addEventListener('click', async () => {
      let newStatus = 'picked up';
      if (orderData.status === 'picked up') {
        newStatus = 'delivered';
      }
  
      await updateDoc(doc(db, 'orders', orderDoc.id), {
        status: newStatus
      });
  
      // Actualizăm starea curierului dacă comanda a fost livrată
      if (newStatus === 'delivered') {
        await updateDoc(doc(db, 'couriers', user.uid), {
          free: true
        });
      }
  
      renderCourierCurrentOrder();
    });
  }