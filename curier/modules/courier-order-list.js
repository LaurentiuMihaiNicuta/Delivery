import { db, auth } from '../../firebase-config.js';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import '/styles/courier-order-list.css';

export async function renderCourierOrderList() {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to view your order list.");
    return;
  }

  const ordersCollection = collection(db, 'orders');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const courierOrdersQuery = query(
    ordersCollection,
    where('courierId', '==', user.uid),
    where('createdAt', '>=', today),
    where('createdAt', '<', tomorrow)
  );

  const ordersSnapshot = await getDocs(courierOrdersQuery);

  const contentDiv = document.getElementById('courier-main');
  contentDiv.innerHTML = `<h2>Order history for today</h2>`;

  if (ordersSnapshot.empty) {
    contentDiv.innerHTML += `<p>No orders for today.</p>`;
    return;
  }

  const orders = await Promise.all(
    ordersSnapshot.docs.map(async (orderDoc) => {
      const orderData = orderDoc.data();
      const customerRef = doc(db, 'users', orderData.userId);
      const customerDoc = await getDoc(customerRef);
      const customerData = customerDoc.data();
      return { ...orderData, customer: customerData };
    })
  );

  console.log('Orders:', orders); // Log the orders for debugging

  contentDiv.innerHTML += `
    <div class="orders-grid">
      ${orders.map(order => `
        <div class="order-item">
          <h3>Order ID: ${order.id}</h3>
          <p>Client: ${order.customer.name || 'Unknown'}</p>
          <p>Phone: ${order.customer.phone || 'Unknown'}</p>
          <p>Address: ${order.address}</p>
          <p>Status: ${order.status}</p>
          <div class="products-grid">
            ${order.products.map(product => `
              <div class="product-item">
                <img src="${product.imagePath}" alt="${product.name}" class="product-image">
                <div class="product-details">
                  <p>${product.name}</p>
                  <p>Quantity: ${product.orderedQuantity}</p>
                  <p>Price: ${product.price} RON</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function handleError(error) {
  console.error('Error:', error); // Log the error for debugging
}
