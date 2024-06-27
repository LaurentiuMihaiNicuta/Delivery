// main.js
import { renderRoleSelection } from './role-selection.js';
import { renderClientMainPage } from './client/client-main.js'; // funcție pentru client main page
import { renderAdminMainPage } from './admin/admin-main.js';
import { renderCourierMainPage } from './curier/courier-main.js';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase-config.js';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, async (user) => {
    console.log('Auth state changed:', user); // Debugging log
    if (user) {
      try {
        const role = localStorage.getItem('debugRole'); // Doar pentru debug
        if (role) {
          if (role === 'admin') {
            renderAdminMainPage();
          } else if (role === 'client') {
            renderClientMainPage();
          } else if (role === 'courier') {
            renderCourierMainPage();
          }
          return;
        }

        // Verificăm colecția 'users'
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User data:', userData); // Debugging log
          if (userData.role === 'admin') {
            renderAdminMainPage();
          } else if (userData.role === 'client') {
            renderClientMainPage();
          } else {
            renderRoleSelection();
          }
        } else {
          // Dacă nu există în 'users', verificăm colecția 'couriers'
          const courierQuery = query(collection(db, 'couriers'), where('email', '==', user.email));
          const courierSnapshot = await getDocs(courierQuery);
          if (!courierSnapshot.empty) {
            const courierDoc = courierSnapshot.docs[0];
            const courierData = courierDoc.data();
            console.log('Courier data:', courierData); // Debugging log
            renderCourierMainPage(); // Redirecționează către pagina de curier
          } else {
            console.error('User data not found in both collections!');
            renderRoleSelection();
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        renderRoleSelection();
      }
    } else {
      renderRoleSelection();
    }
  });

  // Doar pentru debug - butoane pentru a seta rolul manual
  const debugButtons = document.createElement('div');
  debugButtons.innerHTML = `
    <button id="debug-client">Set Client Role</button>
    <button id="debug-admin">Set Admin Role</button>
    <button id="debug-courier">Set Courier Role</button>
  `;
  document.body.appendChild(debugButtons);

  document.getElementById('debug-client').addEventListener('click', () => {
    localStorage.setItem('debugRole', 'client');
    renderClientMainPage();
  });
  document.getElementById('debug-admin').addEventListener('click', () => {
    localStorage.setItem('debugRole', 'admin');
    renderAdminMainPage();
  });
  document.getElementById('debug-courier').addEventListener('click', () => {
    localStorage.setItem('debugRole', 'courier');
    renderCourierMainPage();
  });
});