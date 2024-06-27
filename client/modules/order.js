//order.jsimport { db, auth } from '../../firebase-config.js';
import { db, auth } from '../../firebase-config.js';
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import '/styles/order.css';

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

  if (ordersSnapshot.empty) {
    alert("No orders found.");
    return;
  }

  const orderDoc = ordersSnapshot.docs[0];
  const orderData = orderDoc.data();

  const courierRef = doc(db, 'couriers', orderData.courierId);
  const courierDoc = await getDoc(courierRef);
  const courierData = courierDoc.data();

  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = `
    <div id="order-container">
      <div id="order-details">
        <h2>Order Details</h2>
        <p>Courier: ${courierData ? courierData.name : 'Unknown'}</p>
        <p>Status: ${orderData.status}</p>
      </div>
      <div id="order-content"></div>
    </div>
  `;
}