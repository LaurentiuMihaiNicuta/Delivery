export function showConfirm(message) {
    return new Promise((resolve) => {
      const confirmContainer = document.getElementById('alert-container');
  
      if (!confirmContainer) {
        console.error('Alert container not found');
        return;
      }
  
      const confirm = document.createElement('div');
      confirm.className = 'alert alert-confirm';
      confirm.innerHTML = `
        <span>${message}</span>
        <div class="confirm-buttons">
          <button id="confirm-yes">Yes</button>
          <button id="confirm-no">No</button>
        </div>
      `;
      confirmContainer.appendChild(confirm);
  
      // Afișează confirmarea cu o animație
      setTimeout(() => {
        confirm.classList.add('show');
      }, 10);
  
      document.getElementById('confirm-yes').addEventListener('click', () => {
        confirm.classList.remove('show');
        setTimeout(() => {
          confirm.remove();
          resolve(true);
        }, 300);
      });
  
      document.getElementById('confirm-no').addEventListener('click', () => {
        confirm.classList.remove('show');
        setTimeout(() => {
          confirm.remove();
          resolve(false);
        }, 300);
      });
    });
  }
  