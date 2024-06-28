//admin-products.js
import '../../styles/admin-styles/admin-products.css';
import { db, storage } from '../../firebase-config.js'; 
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';


let selectedCategories = [];
let searchTerm = '';
let allCategories = [];

export async function renderAdminProducts() {
  await loadCategories(); 

  const adminContentDiv = document.getElementById('admin-content');
  adminContentDiv.innerHTML = `
    <nav id="categories-nav"></nav>
    <div id="search-bar-container">
      <input type="text" id="search-bar" placeholder="Cauta produse...">
    </div>
    <div id="add-product-button-container">
      <button id="add-product-button">Adaugă un produs</button>
    </div>
    <div id="products-list"></div>

    <div id="edit-modal" class="modal">
      <div class="modal-content">
        <span class="close-button">&times;</span>
        <h2>Modifică Produs</h2>
        <form id="edit-form">
          <input type="text" id="edit-name" placeholder="Nume" required>
          <input type="number" id="edit-quantity" placeholder="Cantitate" step="0.1" required>
          <input type="text" id="edit-measure" placeholder="Măsură">
          <input type="number" id="edit-price" placeholder="Preț" step="0.1" required>
          <input type="number" id="edit-stock" placeholder="Stoc" required>
          <select id="edit-category" required></select>
          <input type="file" id="edit-image" accept="image/*">
          <button type="submit">Salvează Modificările</button>
        </form>
      </div>
    </div>

    <div id="add-modal" class="modal">
      <div class="modal-content">
        <span class="close-button">&times;</span>
        <h2>Adaugă Produs</h2>
        <form id="add-form">
          <input type="text" id="add-name" placeholder="Nume" required>
          <input type="number" id="add-quantity" placeholder="Cantitate" step="0.1" required>
          <input type="text" id="add-measure" placeholder="Măsură">
          <input type="number" id="add-price" placeholder="Preț" step="0.1" required>
          <input type="number" id="add-stock" placeholder="Stoc" required>
          <select id="add-category" required></select>
          <input type="file" id="add-image" accept="image/*" required>
          <button type="submit">Adaugă Produs</button>
        </form>
      </div>
    </div>
  `;

  updateCategoriesNav();

  document.getElementById('search-bar').addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase();
    renderFilteredProducts();
  });

  document.querySelectorAll('.close-button').forEach(button => {
    button.addEventListener('click', () => {
      document.getElementById('edit-modal').style.display = 'none';
      document.getElementById('add-modal').style.display = 'none';
    });
  });

  document.getElementById('edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-form').dataset.id;
    const name = document.getElementById('edit-name').value;
    const quantity = document.getElementById('edit-quantity').value;
    const measure = document.getElementById('edit-measure').value;
    const price = document.getElementById('edit-price').value;
    const stock = document.getElementById('edit-stock').value;
    let category = document.getElementById('edit-category').value;
    const imageFile = document.getElementById('edit-image').files[0];
  
    try {
      let imagePath = null;
      if (imageFile) {
        const imageRef = ref(storage, `productsImages/${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imagePath = await getDownloadURL(imageRef);
      }
  
      if (category === 'new') {
        category = prompt('Introdu numele noii categorii:');
        if (category) {
          allCategories.push(category);
          await setDoc(doc(db, 'categories', category), { name: category });
          updateCategoriesNav();
        }
      }
  
      const updateData = {
        name,
        quantity,
        measure,
        price,
        stock,
        category,
      };
      
      if (imagePath) {
        updateData.imagePath = imagePath;
      }
  
      await updateDoc(doc(db, 'products', id), updateData);
      document.getElementById('edit-modal').style.display = 'none';
      renderFilteredProducts();
    } catch (error) {
      console.error('Error updating document:', error);
    }
  });

  document.getElementById('add-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('add-name').value;
    const quantity = document.getElementById('add-quantity').value;
    const measure = document.getElementById('add-measure').value;
    const price = document.getElementById('add-price').value;
    const stock = document.getElementById('add-stock').value;
    let category = document.getElementById('add-category').value;
    const imageFile = document.getElementById('add-image').files[0];
  
    try {
      if (category === 'new') {
        category = prompt('Introdu numele noii categorii:');
        if (category) {
          allCategories.push(category);
          await setDoc(doc(db, 'categories', category), { name: category });
          updateCategoriesNav();
        }
      }
  
      const imageRef = ref(storage, `productsImages/${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      const imagePath = await getDownloadURL(imageRef);
  
      await addDoc(collection(db, 'products'), {
        name,
        quantity,
        measure,
        price,
        stock,
        category,
        imagePath,
      });
  
      document.getElementById('add-modal').style.display = 'none';
      renderFilteredProducts();
    } catch (error) {
      console.error('Error adding document:', error);
    }
  });

  document.getElementById('add-product-button').addEventListener('click', () => {
    updateCategorySelectOptions('add-category');
    document.getElementById('add-modal').style.display = 'block';
  });

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

function updateCategoriesNav() {
  const categoriesNav = document.getElementById('categories-nav');
  categoriesNav.innerHTML = allCategories.map(category => `
    <label class="category-label">
      <input type="checkbox" class="category-checkbox" value="${category}"> ${category.charAt(0).toUpperCase() + category.slice(1)}
    </label>
  `).join('');

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
}

function updateCategorySelectOptions(selectId) {
  const selectElement = document.getElementById(selectId);
  selectElement.innerHTML = allCategories.map(category => `
    <option value="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</option>
  `).join('') + '<option value="new">Adaugă categorie nouă</option>';
}

async function renderFilteredProducts() {
  const productsListDiv = document.getElementById('products-list');
  const productsCollection = collection(db, 'products');
  const productsSnapshot = await getDocs(productsCollection);
  const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategories.length
      ? selectedCategories.includes(product.category)
      : true;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  productsListDiv.innerHTML = filteredProducts.map(product => `
    <div class="product">
      <div class="product-image-container">
        <img src="${product.imagePath}" alt="${product.name}" class="product-image">
      </div>
      <h3>${product.name}</h3>
      <p>${product.quantity} ${product.measure ? product.measure : ''}</p>
      <p>Preț: ${product.price} RON</p>
      <p>Stoc: ${product.stock}</p>
      <button class="edit-button" data-id="${product.id}">Modifică</button>
      <button class="delete-button" data-id="${product.id}" data-image-path="${product.imagePath}">Șterge</button>
    </div>
  `).join('');

  document.querySelectorAll('.edit-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const product = filteredProducts.find(product => product.id === id);
      openEditModal(product);
    });
  });

  document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      const imagePath = e.target.dataset.imagePath;

      if (confirm('Ești sigur că vrei să ștergi acest produs?')) {
        try {
          await deleteDoc(doc(db, 'products', id));
          const imageRef = ref(storage, imagePath);
          await deleteObject(imageRef);
          renderFilteredProducts();
        } catch (error) {
          console.error('Error deleting document:', error);
        }
      }
    });
  });
}

function openEditModal(product) {
  document.getElementById('edit-form').dataset.id = product.id;
  document.getElementById('edit-name').value = product.name;
  document.getElementById('edit-quantity').value = product.quantity;
  document.getElementById('edit-measure').value = product.measure || '';
  document.getElementById('edit-price').value = product.price;
  document.getElementById('edit-stock').value = product.stock;
  document.getElementById('edit-category').value = product.category;
  updateCategorySelectOptions('edit-category');
  document.getElementById('edit-modal').style.display = 'block';
}