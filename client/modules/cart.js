//cart.js

import { db, auth } from '../../firebase-config.js';
import { collection, doc, getDoc, getDocs, updateDoc, addDoc, query, where, arrayRemove } from 'firebase/firestore';
import { showAlert } from '../../alert.js';  // Importăm funcția showAlert
import '/styles/client-styles/cart.css';

export async function renderCart() {
  const user = auth.currentUser;
  if (!user) {
    showAlert("Please log in to view your cart.", 'error');
    return;
  }

  const cartRef = doc(db, 'carts', user.uid);
  const cartDoc = await getDoc(cartRef);
  const cartData = cartDoc.data();
  const productsList = cartData?.products || [];

  const productsCollection = collection(db, 'products');
  const productsSnapshot = await getDocs(productsCollection);
  const allProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const cartProducts = allProducts
    .filter(product => productsList.some(cartProduct => cartProduct.id === product.id))
    .map(product => {
      const cartProduct = productsList.find(cartProduct => cartProduct.id === product.id);
      return { ...product, orderedQuantity: cartProduct.quantity };
    });

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
              <p>Ordered Quantity: ${product.orderedQuantity}</p>
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
    const orderPlaced = await placeOrder(cartProducts);
    const cartContainer = document.getElementById('cart-container');
    if (orderPlaced) {
      cartContainer.style.backgroundColor = 'lightgreen';
      setTimeout(() => {
        cartContainer.style.backgroundColor = ''; // Reset the background color
      }, 2000);
      // Golește coșul după plasarea comenzii
      await updateDoc(cartRef, {
        products: []
      });
      renderCart();
      // Schimbăm culoarea pentru link-ul "Comanda ta"
      const orderLink = document.getElementById('order-link');
      orderLink.style.backgroundColor = 'lightgreen';
      setTimeout(() => {
        orderLink.style.backgroundColor = ''; // Reset the background color
      }, 2000);
    } else {
      cartContainer.style.backgroundColor = 'lightcoral';
      setTimeout(() => {
        cartContainer.style.backgroundColor = ''; // Reset the background color
      }, 2000);
    }
  });
}

async function updateProductStock(cartProducts) {
  for (const cartProduct of cartProducts) {
    const productRef = doc(db, 'products', cartProduct.id);
    const productDoc = await getDoc(productRef);
    const productData = productDoc.data();

    if (productData.stock >= cartProduct.orderedQuantity) {
      await updateDoc(productRef, {
        stock: productData.stock - cartProduct.orderedQuantity
      });
    } else {
      throw new Error(`Not enough stock for product: ${productData.name}`);
    }
  }
}

function calculateTotal(cartProducts) {
  return cartProducts.reduce((total, product) => total + (Number(product.price) * product.orderedQuantity), 0);
}

async function removeFromCart(productId) {
  const user = auth.currentUser;
  const cartRef = doc(db, 'carts', user.uid);
  const cartDoc = await getDoc(cartRef);
  const cartData = cartDoc.data();
  const productInCart = cartData.products.find(product => product.id === productId);

  if (productInCart.quantity > 1) {
    productInCart.quantity -= 1;
    await updateDoc(cartRef, {
      products: cartData.products
    });
  } else {
    await updateDoc(cartRef, {
      products: arrayRemove(productInCart)
    });
  }

  showAlert('Product removed from cart!', 'success');
}

async function placeOrder(cartProducts) {
  if (cartProducts.length === 0) {
    showAlert("Your cart is empty. Cannot place an order.", 'error');
    return false;
  }

  const ordersCollection = collection(db, 'orders');
  const user = auth.currentUser;

  // Verificăm dacă există comenzi active pentru acest utilizator
  const activeOrdersQuery = query(
    ordersCollection,
    where('userId', '==', user.uid),
    where('status', 'in', ['pending', 'picked up'])
  );
  const activeOrdersSnapshot = await getDocs(activeOrdersQuery);

  if (!activeOrdersSnapshot.empty) {
    showAlert("You have an active order. Please wait for it to be completed before placing a new one.", 'error');
    return false;
  }

  const couriersCollection = collection(db, 'couriers');
  const couriersSnapshot = await getDocs(couriersCollection);
  const couriers = couriersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Asignăm comanda primului curier liber
  const freeCourier = couriers.find(courier => courier.free === true);
  if (freeCourier) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      console.log('User Data for Order:', userData); // Debugging log

      // Actualizăm stocul produselor
      await updateProductStock(cartProducts);

      // Adăugăm comanda în Firestore
      await addDoc(ordersCollection, {
        products: cartProducts,
        courierId: freeCourier.id,
        userId: user.uid,
        status: 'pending',
        address: userData.address, // Adăugăm adresa utilizatorului la comanda
        createdAt: new Date()
      });

      // Marcăm curierul ca ocupat
      await updateDoc(doc(db, 'couriers', freeCourier.id), {
        free: false
      });

      showAlert("Order placed successfully!", 'success');
      return true;
    } catch (error) {
      console.error("Error placing order:", error);
      showAlert(`Failed to place order: ${error.message}`, 'error');
      return false;
    }
  } else {
    showAlert("No couriers available at the moment.", 'error');
    return false;
  }
}
