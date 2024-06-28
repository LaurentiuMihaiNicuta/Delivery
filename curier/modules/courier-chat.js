//courier-chat.js

import { db, auth } from '../../firebase-config.js';
import { collection, addDoc, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import '/styles/courier-chat.css';
import { showAlert } from '../../alert.js';

export async function renderCourierChat(orderId) {
  const chatContainer = document.getElementById('chat-container');
  chatContainer.innerHTML = `
    <div id="courier-chat-box">
      <div id="courier-messages"></div>
      <form id="courier-message-form">
        <input type="text" id="courier-message-input" placeholder="Type your message here" required>
        <button type="submit">Send</button>
      </form>
    </div>
  `;

  const messagesDiv = document.getElementById('courier-messages');
  const messageForm = document.getElementById('courier-message-form');
  const messageInput = document.getElementById('courier-message-input');

  const messagesCollection = collection(db, 'orders', orderId, 'messages');
  const messagesQuery = query(messagesCollection, orderBy('timestamp', 'asc'));

  onSnapshot(messagesQuery, (snapshot) => {
    messagesDiv.innerHTML = '';
    snapshot.forEach((doc) => {
      const message = doc.data();
      const messageElement = document.createElement('div');
      messageElement.className = `message ${message.senderType}`;
      messageElement.textContent = `${message.sender}: ${message.text}`;
      messagesDiv.appendChild(messageElement);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });

  messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = messageInput.value;
    const sender = await getCourierName(auth.currentUser.uid);
    const senderType = 'courier';

    if (message.trim() !== '') {
      await addDoc(messagesCollection, {
        text: message,
        sender,
        senderType,
        timestamp: new Date(),
      });
      messageInput.value = '';
    }
  });
}

async function getCourierName(userId) {
  const userDoc = await getDoc(doc(db, 'couriers', userId));
  return userDoc.data().name;
}