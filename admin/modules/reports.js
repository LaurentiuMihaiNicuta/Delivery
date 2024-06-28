import '../../styles/admin-styles/admin-reports.css';
import { renderCourierReport } from './reports-couriers.js';
import { renderClientsReport } from './reports-clients.js';
import { renderProductsReport} from './reports-products.js';
import { renderRevenueReport } from './reports-revenue.js';


export function renderReports() {
  const adminContentDiv = document.getElementById('admin-content');
  adminContentDiv.innerHTML = `
    <div id="reports-container">
      <div id="reports-sidebar">
        <h3>Rapoarte</h3>
        <ul id='reports-ul'>
          
          <li><a href="#" id="revenue-report-link">Venituri</a></li>
          <li><a href="#" id="products-report-link">Produse</a></li>
          <li><a href="#" id="couriers-report-link">Curieri</a></li>
          <li><a href="#" id="clients-report-link">Clienți</a></li>
        </ul>
      </div>
      <div id="report-content">
        <h2>Rapoarte</h2>
        <div id="report-result"></div>
      </div>
    </div>
  `;

  // Event listeners pentru butoanele din sidebar


  document.getElementById('products-report-link').addEventListener('click', renderProductsReport);

  document.getElementById('couriers-report-link').addEventListener('click', renderCourierReport);

  document.getElementById('clients-report-link').addEventListener('click', renderClientsReport);

  document.getElementById('revenue-report-link').addEventListener('click', renderRevenueReport);
}