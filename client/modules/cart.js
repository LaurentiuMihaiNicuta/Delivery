//cart.js

import { db, auth } from '../../firebase-config.js';
import { collection, doc, getDoc, getDocs, updateDoc, addDoc, arrayRemove } from 'firebase/firestore';
import '/styles/cart.css';

export async function renderCart() {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to view your cart.");
    return;
  }

  const cartRef = doc(db, 'carts', user.uid);
  const cartDoc = await getDoc(cartRef);
  const cartData = cartDoc.data();
  const productsList = cartData?.products || [];

  const productsCollection = collection(db, 'products');
  const productsSnapshot = await getDocs(productsCollection);
  const allProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const cartProducts = allProducts.filter(product => productsList.includes(product.id));

  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = `
    <div id="cart-container">
      <h2>My Cart</h2>
      <div id="cart-list">
        ${cartProducts.map(product => `
          <div class="cart-item">
            <div class="cart-item-image-container">
              <img src="${product.imagePath}" alt="${product.name}" class="cart-item-image">
            </div>
            <div class="cart-item-details">
              <h3>${product.name}</h3>
              <p>${product.quantity} ${product.measure ? product.measure : ''}</p>
              <p>Pret: ${product.price} RON</p>
            </div>
            <button class="remove-from-cart-button" data-id="${product.id}">Remove</button>
          </div>
        `).join('')}
      </div>
      <div id="cart-total">
        Total: ${calculateTotal(cartProducts)} RON
      </div>
      <button id="place-order-button">Plaseaza Comanda</button>
    </div>
  `;

  // Adăugăm event listeners pentru butoanele de eliminare din coș
  document.querySelectorAll('.remove-from-cart-button').forEach(button => {
    button.addEventListener('click', async (e) => {
      const productId = e.target.dataset.id;
      await removeFromCart(productId);
      renderCart();
    });
  });

  // Adăugăm event listener pentru butonul de plasare a comenzii
  document.getElementById('place-order-button').addEventListener('click', async () => {
    await placeOrder(cartProducts);
    alert("Comanda a fost plasată!");
    // Golește coșul după plasarea comenzii
    await updateDoc(cartRef, {
      products: []
    });
    renderCart();
  });
}

function calculateTotal(cartProducts) {
  return cartProducts.reduce((total, product) => total + Number(product.price), 0);
}

async function removeFromCart(productId) {
  const user = auth.currentUser;
  const cartRef = doc(db, 'carts', user.uid);
  await updateDoc(cartRef, {
    products: arrayRemove(productId)
  });
}

async function placeOrder(cartProducts) {
  const couriersCollection = collection(db, 'couriers');
  const couriersSnapshot = await getDocs(couriersCollection);
  const couriers = couriersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Asignăm comanda primului curier liber
  const freeCourier = couriers.find(courier => courier.free === true);
  if (freeCourier) {
    const user = auth.currentUser;
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    console.log('User Data for Order:', userData); // Debugging log

    // Adăugăm comanda în Firestore
    await addDoc(collection(db, 'orders'), {
      products: cartProducts,
      courierId: freeCourier.id,
      userId: auth.currentUser.uid,
      status: 'pending',
      address: userData.address, // Adăugăm adresa utilizatorului la comanda
      createdAt: new Date()
    });

    // Marcăm curierul ca ocupat
    await updateDoc(doc(db, 'couriers', freeCourier.id), {
      free: false
    });
  } else {
    alert("Nu există curieri disponibili momentan.");
  }
}