document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('searchInput');
  const estado = document.getElementById('estadoSelect');
  const servicio = document.getElementById('servicioSelect');
  const fechaInicio = document.getElementById('fechaInicio');
  const fechaFin = document.getElementById('fechaFin');
  const container = document.getElementById('contactsContainer');

  // Asegurar estilos base del contenedor
  container.className = "w-full bg-white rounded-xl shadow-sm border border-gray-200";

  const fetchAndRender = async () => {
    const query = input.value.trim();
    const estadoVal = estado.value;
    const servicioVal = servicio.value;
    const fechaInicioVal = fechaInicio.value;
    const fechaFinVal = fechaFin.value;

    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (estadoVal) params.append('estado', estadoVal);
    if (servicioVal) params.append('servicio', servicioVal);
    if (fechaInicioVal) params.append('fechaInicio', fechaInicioVal);
    if (fechaFinVal) params.append('fechaFin', fechaFinVal);

    try {
      const res = await fetch(`/filterPayment?${params.toString()}`);
      const data = await res.json();

      if (!data.status || data.filterResult.length === 0) {
        container.innerHTML = `
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <div class="bg-gray-100 rounded-full p-6 mb-4 w-24 h-24 flex items-center justify-center mx-auto">
              <i class="fas fa-inbox text-4xl text-gray-400"></i>
            </div>
            <h3 class="text-xl font-medium text-gray-700 mb-2">No se encontraron pagos</h3>
            <p class="text-gray-500 max-w-md mx-auto">Intenta con otros filtros de búsqueda</p>
          </div>
        `;
        return;
      }

      // Vista para móviles (tarjetas)
      const mobileView = data.filterResult.map((payment, index) => `
        <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden animate-fade-in" 
             style="animation-delay: ${index * 50}ms">
          <div class="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                ${payment.nombreTitular.charAt(0).toUpperCase()}
              </div>
              <h3 class="font-medium text-gray-900">${payment.nombreTitular}</h3>
            </div>
            <span class="text-xs px-2 py-1 rounded-full ${
              payment.estado === 'aprobado' ? 'bg-green-100 text-green-800' :
              payment.estado === 'rechazado' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }">
              ${payment.estado.toUpperCase()}
            </span>
          </div>
          
          <div class="p-4 space-y-3">
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-24 flex-shrink-0">Correo:</span>
              <a href="mailto:${payment.correo}" class="text-sm text-blue-600 hover:underline">${payment.correo}</a>
            </div>
            
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-24 flex-shrink-0">Tarjeta:</span>
              <div class="flex items-center gap-2">
                ${payment.cardNumber.startsWith("4") ? 
                  '<i class="fab fa-cc-visa text-blue-600"></i>' :
                  payment.cardNumber.startsWith("5") ? 
                  '<i class="fab fa-cc-mastercard text-red-600"></i>' :
                  payment.cardNumber.startsWith("3") ? 
                  '<i class="fab fa-cc-amex text-blue-400"></i>' : 
                  '<i class="fas fa-credit-card text-gray-400"></i>'}
                <span class="text-sm text-gray-700">•••• •••• •••• ${payment.cardNumber.slice(-4)}</span>
              </div>
            </div>
            
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-24 flex-shrink-0">Expira:</span>
              <span class="text-sm text-gray-700">${payment.expMonth}/${payment.expYear.toString().slice(-2)}</span>
            </div>
            
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-24 flex-shrink-0">Monto:</span>
              <span class="text-sm font-medium text-gray-700">
                ${payment.amount}
                <span class="text-gray-500 ml-1">
                  ${payment.currency === 'USD' ? 'USD' :
                    payment.currency === 'EUR' ? 'EUR' :
                    payment.currency === 'GBP' ? 'GBP' : payment.currency}
                </span>
              </span>
            </div>
            
            <div class="flex items-start">
              <span class="text-sm text-gray-500 w-24 flex-shrink-0">Descripción:</span>
              <span class="text-sm text-gray-700 line-clamp-2">${payment.descripcion}</span>
            </div>
            
            <div class="flex items-start">
              <span class="text-sm text-gray-500 w-24 flex-shrink-0">Referencia:</span>
              <span class="text-sm text-gray-700 font-mono">${payment.reference}</span>
            </div>
          </div>
          
          <div class="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
            <div class="flex items-center">
              <i class="far fa-calendar-alt mr-1"></i>
              <span>${new Date(payment.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="flex items-center">
              <i class="far fa-clock mr-1"></i>
              <span>${new Date(payment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>
        </div>
      `).join('');

      // Vista para desktop (tabla)
      const desktopView = `
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full min-w-max">
            <thead class="bg-gray-50">
              <tr class="text-left text-gray-500 text-sm font-medium">
                <th class="px-6 py-3">Titular</th>
                <th class="px-6 py-3">Correo</th>
                <th class="px-6 py-3">Tarjeta</th>
                <th class="px-6 py-3">Expiración</th>
                <th class="px-6 py-3">Monto</th>
                <th class="px-6 py-3">Descripción</th>
                <th class="px-6 py-3">Referencia</th>
                <th class="px-6 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${data.filterResult.map(payment => `
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                        ${payment.nombreTitular.charAt(0).toUpperCase()}
                      </div>
                      <span class="font-medium text-gray-900">${payment.nombreTitular}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <a href="mailto:${payment.correo}" class="text-blue-600 hover:underline">${payment.correo}</a>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      ${payment.cardNumber.startsWith("4") ? 
                        '<i class="fab fa-cc-visa text-blue-600 text-xl"></i>' :
                        payment.cardNumber.startsWith("5") ? 
                        '<i class="fab fa-cc-mastercard text-red-600 text-xl"></i>' :
                        payment.cardNumber.startsWith("3") ? 
                        '<i class="fab fa-cc-amex text-blue-400 text-xl"></i>' : 
                        '<i class="fas fa-credit-card text-gray-400 text-xl"></i>'}
                      <span class="text-gray-700">•••• •••• •••• ${payment.cardNumber.slice(-4)}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-gray-600">
                    ${payment.expMonth}/${payment.expYear.toString().slice(-2)}
                  </td>
                  <td class="px-6 py-4">
                    <div class="font-medium">
                      ${payment.amount}
                      <span class="text-sm text-gray-500 ml-1">
                        ${payment.currency === 'USD' ? 'USD' :
                          payment.currency === 'EUR' ? 'EUR' :
                          payment.currency === 'GBP' ? 'GBP' : payment.currency}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-gray-600 line-clamp-2">
                    ${payment.descripcion}
                  </td>
                  <td class="px-6 py-4 text-gray-600 font-mono">
                    ${payment.reference}
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-500">
                      <div>${new Date(payment.createdAt).toLocaleDateString()}</div>
                      <div class="text-xs">${new Date(payment.createdAt).toLocaleTimeString()}</div>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      container.innerHTML = `
        <div class="w-full space-y-6">
          <!-- Header -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 sm:px-6 pt-4">
            <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <i class="fas fa-credit-card text-blue-500"></i>
              Registros de Pagos
            </h1>
            <div class="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
              <i class="fas fa-list-ol mr-1"></i> Total: ${data.filterResult.length}
            </div>
          </div>

          <!-- Contenido -->
          <div class="md:hidden grid grid-cols-1 gap-4 px-4 pb-4">
            ${mobileView}
          </div>
          
          ${desktopView}
        </div>
      `;

    } catch (err) {
      console.error('Error al filtrar pagos:', err);
      container.innerHTML = `
        <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg max-w-2xl mx-auto my-4">
          <div class="flex items-start">
            <i class="fas fa-exclamation-circle text-xl mr-3 mt-0.5 flex-shrink-0"></i>
            <div>
              <h3 class="font-medium mb-1">Error al cargar los pagos</h3>
              <p class="text-sm">Por favor intenta nuevamente más tarde.</p>
              ${process.env.NODE_ENV === 'development' ? 
                `<div class="mt-3 p-2 bg-red-100 rounded text-xs font-mono overflow-x-auto">${err.message}</div>` : ''}
            </div>
          </div>
        </div>
      `;
    }
  };

  // Event listeners con debounce
  let timeout;
  const debounceFetch = () => {
    clearTimeout(timeout);
    timeout = setTimeout(fetchAndRender, 300);
  };

  [input, estado, servicio, fechaInicio, fechaFin].forEach(el => {
    el.addEventListener('input', debounceFetch);
    el.addEventListener('change', debounceFetch);
  });

  // Carga inicial
  fetchAndRender();
});