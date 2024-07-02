// profile-order-history.js
import { auth, db } from '../../firebase-config.js';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { renderLogin } from '../client-login.js';

export async function renderOrderHistory() {
  const contentDiv = document.getElementById('profile-content');
  const user = auth.currentUser;

  if (!user) {
    renderLogin();
    return;
  }

  const ordersCollection = collection(db, 'orders');
  const userOrdersQuery = query(
    ordersCollection,
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc')
  );
  const ordersSnapshot = await getDocs(userOrdersQuery);

  if (ordersSnapshot.empty) {
    contentDiv.innerHTML = `
      <div id="order-history-container">
        <h2>Nu ai nicio comandă în istoric!</h2>
      </div>
    `;
    return;
  }

  contentDiv.innerHTML = `
    <div id="order-history-container">
      <h2>Istoric comenzi</h2>
      <div id="orders-list">
        ${ordersSnapshot.docs.map(orderDoc => {
          const order = orderDoc.data();
          const total = order.products.reduce((sum, product) => sum + product.price * product.orderedQuantity, 0);
          return `
            <div class="order-item">
              <h3>Comandă din ${new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</h3>
              <div class="products-grid">
                ${order.products.map(product => `
                  <div class="product-item">
                    <img src="${product.imagePath}" alt="${product.name}" class="product-image">
                    <div class="product-details">
                      <p>${product.name} - ${product.orderedQuantity} x ${product.price} RON</p>
                    </div>
                  </div>
                `).join('')}
              </div>
              <p>Total: ${total.toFixed(2)} RON</p>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
