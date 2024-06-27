//products.js

import { db, auth } from '../../firebase-config.js';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import '/styles/client-styles/products.css';
import { showAlert } from '../../alert.js'; // Asigură-te că ai importat showAlert

let selectedCategories = [];
let searchTerm = '';
let allCategories = [];

export async function renderProducts() {
  await loadCategories(); // Load categories before rendering the UI

  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = `
    <nav id="categories-nav">
      ${allCategories.map(category => `
        <label class="category-label">
          <input type="checkbox" class="category-checkbox" value="${category}"> ${category.charAt(0).toUpperCase() + category.slice(1)}
        </label>
      `).join('')}
    </nav>
    <div id="search-bar-container">
      <input type="text" id="search-bar" placeholder="Cauta produse...">
    </div>
    <div id="products-list"></div>
  `;

  // Adăugăm event listeners pentru checkbox-uri
  const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const category = e.target.value;
      if (e.target.checked) {
        selectedCategories.push(category);
      } else {
        selectedCategories = selectedCategories.filter(cat => cat !== category);
      }
      renderFilteredProducts();
      updateLabelStyles();
    });
  });

  // Adăugăm event listener pentru search bar
  document.getElementById('search-bar').addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase();
    renderFilteredProducts();
  });

  // Inițial randăm toate produsele
  renderFilteredProducts();
}

async function loadCategories() {
  const categoriesCollection = collection(db, 'categories');
  const categoriesSnapshot = await getDocs(categoriesCollection);
  allCategories = categoriesSnapshot.docs.map(doc => doc.data().name);
}

function updateLabelStyles() {
  const labels = document.querySelectorAll('.category-label');
  labels.forEach(label => {
    const checkbox = label.querySelector('.category-checkbox');
    if (checkbox.checked) {
      label.classList.add('selected');
    } else {
      label.classList.remove('selected');
    }
  });
}

async function renderFilteredProducts() {
  const productsListDiv = document.getElementById('products-list');
  const productsCollection = collection(db, 'products');
  const productsSnapshot = await getDocs(productsCollection);
  const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Filtrăm produsele în funcție de categorii și termenii de căutare
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategories.length
      ? selectedCategories.includes(product.category)
      : true;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  // Randăm produsele
  productsListDiv.innerHTML = filteredProducts.map(product => `
    <div class="product">
      <div class="product-image-container">
        <img src="${product.imagePath}" alt="${product.name}" class="product-image">
      </div>
      <h3>${product.name}</h3>
      <p>${product.quantity} ${product.measure ? product.measure : ''}</p>
      <p>Pret: ${product.price} RON</p>
      ${product.stock > 0 ? `
        <button class="add-to-cart-button" data-id="${product.id}">Adauga</button>
      ` : `
        <button class="out-of-stock-button" disabled>Indisponibil</button>
      `}
    </div>
  `).join('');

  // Adăugăm event listeners pentru butoanele de adăugare în coș
  document.querySelectorAll('.add-to-cart-button').forEach(button => {
    button.addEventListener('click', async (e) => {
      const productId = e.target.dataset.id;
      await addToCart(productId);
    });
  });
}

async function addToCart(productId) {
  const user = auth.currentUser;
  if (!user) {
    showAlert('Please log in to add products to your cart.', 'error');
    return;
  }

  const cartRef = doc(db, 'carts', user.uid);
  const cartDoc = await getDoc(cartRef);
  let cartData = cartDoc.data();

  if (!cartDoc.exists()) {
    cartData = {
      products: [{ id: productId, quantity: 1 }]
    };
    await setDoc(cartRef, cartData);
  } else {
    const productInCart = cartData.products.find(product => product.id === productId);
    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cartData.products.push({ id: productId, quantity: 1 });
    }
    await updateDoc(cartRef, {
      products: cartData.products
    });
  }

  showAlert('Product added to cart!', 'success');
}