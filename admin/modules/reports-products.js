import { db } from '../../firebase-config.js';
import { collection, getDocs, query, where, getDoc, doc, Timestamp } from 'firebase/firestore';
import '../../styles/admin-styles/admin-reports-products.css';

export function renderProductsReport() {
  document.getElementById('report-result').innerHTML = `
    <div id="products-report-container">
      <div id="products-report-controls">
        <input type="text" id="search-product-input" placeholder="Caută produs...">
        <select id="categories-select">
          <option value="">Toate categoriile</option>
        </select>
        <input type="date" id="date-select">
        <div id="products-buttons">
          <button id="most-sold-product-button">Cel mai vândut produs</button>
          <button id="least-sold-product-button">Cel mai puțin vândut produs</button>
        </div>
      </div>
      <div id="products-grid"></div>
      <div id="product-report-details"></div>
    </div>
  `;

  document.getElementById('search-product-input').addEventListener('input', searchProducts);
  document.getElementById('categories-select').addEventListener('change', filterProductsByCategory);
  document.getElementById('most-sold-product-button').addEventListener('click', showMostSoldProduct);
  document.getElementById('least-sold-product-button').addEventListener('click', showLeastSoldProduct);

  populateProductsGrid();
  populateCategoriesSelect();
}

async function populateProductsGrid() {
  const productsSnapshot = await getDocs(collection(db, 'products'));
  const productsGrid = document.getElementById('products-grid');
  productsGrid.innerHTML = productsSnapshot.docs.map(doc => {
    const product = doc.data();
    return `
      <div class="product-card" data-id="${doc.id}" data-category="${product.category}">
        <p>${product.name}</p>
        <p>${product.quantity} ${product.measure}</p>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const productId = card.getAttribute('data-id');
      generateProductReport(productId);
    });
  });
}

async function populateCategoriesSelect() {
  const categoriesSnapshot = await getDocs(collection(db, 'categories'));
  const categoriesSelect = document.getElementById('categories-select');
  categoriesSelect.innerHTML += categoriesSnapshot.docs.map(doc => {
    const category = doc.data();
    return `<option value="${category.name}">${category.name}</option>`;
  }).join('');
}

function searchProducts() {
  const searchTerm = document.getElementById('search-product-input').value.toLowerCase();
  const productCards = document.querySelectorAll('.product-card');

  productCards.forEach(card => {
    const productName = card.querySelector('p').textContent.toLowerCase();
    if (productName.includes(searchTerm)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

function filterProductsByCategory() {
  const selectedCategory = document.getElementById('categories-select').value.toLowerCase();
  const productCards = document.querySelectorAll('.product-card');

  productCards.forEach(card => {
    const productCategory = card.getAttribute('data-category').toLowerCase();
    if (!selectedCategory || productCategory === selectedCategory) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

async function showMostSoldProduct() {
  const selectedDate = document.getElementById('date-select').value;
  if (!selectedDate) {
    alert('Te rog să selectezi o dată.');
    return;
  }

  const startOfDay = new Date(`${selectedDate}T00:00:00`);
  const endOfDay = new Date(`${selectedDate}T23:59:59`);

  const productsSnapshot = await getDocs(collection(db, 'products'));
  const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  let mostSoldProduct = null;
  let maxSoldQuantity = 0;

  for (const product of products) {
    const ordersSnapshot = await getDocs(query(
      collection(db, 'orders'),
      where('createdAt', '>=', startOfDay),
      where('createdAt', '<=', endOfDay)
    ));

    const soldQuantity = ordersSnapshot.docs.reduce((total, orderDoc) => {
      const order = orderDoc.data();
      const productInOrder = order.products.find(p => p.id === product.id);
      return total + (productInOrder ? productInOrder.orderedQuantity : 0);
    }, 0);

    if (soldQuantity > maxSoldQuantity) {
      mostSoldProduct = product;
      maxSoldQuantity = soldQuantity;
    }
  }

  if (mostSoldProduct) {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
      if (card.getAttribute('data-id') === mostSoldProduct.id) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }
}

async function showLeastSoldProduct() {
  const selectedDate = document.getElementById('date-select').value;
  if (!selectedDate) {
    alert('Te rog să selectezi o dată.');
    return;
  }

  const startOfDay = new Date(`${selectedDate}T00:00:00`);
  const endOfDay = new Date(`${selectedDate}T23:59:59`);

  const productsSnapshot = await getDocs(collection(db, 'products'));
  const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  let leastSoldProduct = null;
  let minSoldQuantity = Infinity;

  for (const product of products) {
    const ordersSnapshot = await getDocs(query(
      collection(db, 'orders'),
      where('createdAt', '>=', startOfDay),
      where('createdAt', '<=', endOfDay)
    ));

    const soldQuantity = ordersSnapshot.docs.reduce((total, orderDoc) => {
      const order = orderDoc.data();
      const productInOrder = order.products.find(p => p.id === product.id);
      return total + (productInOrder ? productInOrder.orderedQuantity : 0);
    }, 0);

    if (soldQuantity < minSoldQuantity) {
      leastSoldProduct = product;
      minSoldQuantity = soldQuantity;
    }
  }

  if (leastSoldProduct) {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
      if (card.getAttribute('data-id') === leastSoldProduct.id) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }
}

async function generateProductReport(productId) {
  const selectedDate = document.getElementById('date-select').value;
  if (!selectedDate) {
    alert('Te rog să selectezi o dată.');
    return;
  }

  const startOfDay = new Date(`${selectedDate}T00:00:00`);
  const endOfDay = new Date(`${selectedDate}T23:59:59`);

  const productDoc = await getDoc(doc(db, 'products', productId));
  const product = productDoc.data();

  const ordersSnapshot = await getDocs(query(
    collection(db, 'orders'),
    where('createdAt', '>=', startOfDay),
    where('createdAt', '<=', endOfDay)
  ));

  const soldQuantity = ordersSnapshot.docs.reduce((total, orderDoc) => {
    const order = orderDoc.data();
    const productInOrder = order.products.find(p => p.id === productId);
    return total + (productInOrder ? productInOrder.orderedQuantity : 0);
  }, 0);

  console.log("Orders Snapshot:", ordersSnapshot.docs.map(doc => doc.data())); // Log pentru comenzi
  console.log("Product in Orders:", ordersSnapshot.docs.map(doc => doc.data().products)); // Log pentru produse în comenzi

  const totalRevenue = ordersSnapshot.docs.reduce((total, orderDoc) => {
    const order = orderDoc.data();
    const productInOrder = order.products.find(p => p.id === productId);
    return total + (productInOrder ? productInOrder.orderedQuantity * Number(productInOrder.price) : 0);
  }, 0);

  document.getElementById('product-report-details').innerHTML = `
    <h3>Detalii Produs</h3>
    <p>Nume: ${product.name}</p>
    <p>Categorie: ${product.category}</p>
    <p>Preț: ${product.price} RON</p>
    <p>Unități vândute în ${selectedDate}: ${soldQuantity}</p>
    <p>Venituri generate în ${selectedDate}: ${totalRevenue.toFixed(2)} RON</p>
  `;
}