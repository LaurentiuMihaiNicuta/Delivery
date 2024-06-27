// alert.js
export function showAlert(message, type = 'error') {
    const alertContainer = document.getElementById('alert-container');
  
    if (!alertContainer) {
      console.error('Alert container not found');
      return;
    }
  
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
      <span>${message}</span>
    `;
    alertContainer.appendChild(alert);
  
    // Afișează alerta cu o animație
    setTimeout(() => {
      alert.classList.add('show');
    }, 10);
  
    // Elimină alerta după 3 secunde
    setTimeout(() => {
      alert.classList.remove('show');
      setTimeout(() => {
        alert.remove();
      }, 300);
    }, 2000);
  }
  