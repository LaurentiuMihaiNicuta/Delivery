import { db, auth } from '../../firebase-config.js';
import { collection, addDoc, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import '/styles/client-styles/client-chat.css';

export async function renderClientChat(orderId) {
  const chatContainer = document.getElementById('chat-container');
  chatContainer.innerHTML = `
    <div id="client-chat-box">
      <div id="client-messages"></div>
      <form id="client-message-form">
        <input type="text" id="client-message-input" placeholder="Type your message here" required>
        <button type="submit">Send</button>
      </form>
    </div>
  `;

  const messagesDiv = document.getElementById('client-messages');
  const messageForm = document.getElementById('client-message-form');
  const messageInput = document.getElementById('client-message-input');

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
    const sender = await getUserName(auth.currentUser.uid);
    const senderType = 'client';

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

async function getUserName(userId) {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.data().name;
}