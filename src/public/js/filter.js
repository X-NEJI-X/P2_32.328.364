document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('searchInput');
  const container = document.getElementById('contactsContainer');

  // Asegurarnos de que el contenedor tenga estilos base
  container.className = "w-full";

  input.addEventListener('input', async () => {
    const query = input.value.trim();

    if (query === '') {
      window.location.reload();
      return;
    }

    try {
      const res = await fetch(`/filter?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!data.status || data.filterResult.length === 0) {
        container.innerHTML = `
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <div class="bg-gray-100 rounded-full p-6 mb-4 w-24 h-24 flex items-center justify-center mx-auto">
              <i class="fas fa-inbox text-4xl text-gray-400"></i>
            </div>
            <h3 class="text-xl font-medium text-gray-700 mb-2">No se encontraron resultados</h3>
            <p class="text-gray-500 max-w-md mx-auto">Intenta con otro término de búsqueda o ajusta tus filtros</p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="w-full space-y-6 px-4 sm:px-0">
          <!-- Header mejorado -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
            <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <i class="fas fa-address-book text-blue-500 text-2xl"></i>
              Registros de Contactos
            </h1>
            <div class="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">
              <i class="fas fa-users mr-1"></i> Total: ${data.filterResult.length} contactos
            </div>
          </div>

          <!-- Grid mejorado -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            ${data.filterResult.map((contact, index) => `
              <!-- Tarjeta mejorada -->
              <div class="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg hover:transform hover:-translate-y-1 animate-fade-in h-full flex flex-col" 
                   style="animation-delay: ${index * 50}ms">
                
                <!-- Header de tarjeta -->
                <div class="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="bg-blue-100 text-blue-600 rounded-lg w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                      ${contact.nombre.charAt(0).toUpperCase()}
                    </div>
                    <h3 class="font-semibold text-gray-800 truncate">${contact.nombre}</h3>
                  </div>
                  <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap">
                    <i class="fas fa-user-tag mr-1"></i>Contacto
                  </span>
                </div>

                <!-- Cuerpo de tarjeta -->
                <div class="p-4 flex-grow space-y-3">
                  <div class="flex items-start">
                    <span class="text-sm text-gray-500 w-24 flex-shrink-0">Correo:</span>
                    <a href="mailto:${contact.email}" class="text-sm text-blue-600 hover:underline break-all">${contact.email}</a>
                  </div>

                  <div class="flex items-start">
                    <span class="text-sm text-gray-500 w-24 flex-shrink-0">Comentario:</span>
                    <p class="text-sm text-gray-700 line-clamp-3">${contact.comentario}</p>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div class="flex items-center">
                      <span class="text-sm text-gray-500 w-20 flex-shrink-0">País:</span>
                      <span class="text-sm text-gray-700 truncate">${contact.pais}</span>
                    </div>
                    <div class="flex items-center">
                      <span class="text-sm text-gray-500 w-16 flex-shrink-0">IP:</span>
                      <span class="text-sm font-mono text-gray-700 truncate">${contact.ip}</span>
                    </div>
                  </div>
                </div>

                <!-- Pie de tarjeta -->
                <div class="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                  <div class="flex items-center">
                    <i class="far fa-calendar-alt mr-1.5"></i>
                    <span>${new Date(contact.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div class="flex items-center">
                    <i class="far fa-clock mr-1.5"></i>
                    <span>${new Date(contact.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    } catch (err) {
      console.error('Error al filtrar contactos:', err);
      container.innerHTML = `
        <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg max-w-2xl mx-auto">
          <div class="flex items-start">
            <i class="fas fa-exclamation-circle text-xl mr-3 mt-0.5 flex-shrink-0"></i>
            <div>
              <h3 class="font-medium mb-1">Error al cargar los resultados</h3>
              <p class="text-sm">Por favor intenta nuevamente. Si el problema persiste, contacta al soporte técnico.</p>
              ${process.env.NODE_ENV === 'development' ? 
                `<div class="mt-3 p-2 bg-red-100 rounded text-xs font-mono overflow-x-auto">${err.message}</div>` : ''}
            </div>
          </div>
        </div>
      `;
    }
  });
});