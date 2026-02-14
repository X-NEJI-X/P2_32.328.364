// Orders.js - Manejo de órdenes y historial de compras

const API_BASE = '/api';

// Load orders
async function loadOrders() {
    if (!requireAuth()) return;

    try {
        const response = await fetch(`${API_BASE}/payments/orders`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Error al cargar las órdenes');
        }

        const data = await response.json();
        displayOrders(data.orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('Error al cargar las órdenes');
    }
}

// Display orders
function displayOrders(orders) {
    const loading = document.getElementById('loading');
    const ordersList = document.getElementById('ordersList');
    const emptyOrders = document.getElementById('emptyOrders');

    if (loading) loading.style.display = 'none';

    if (orders.length === 0) {
        if (ordersList) ordersList.style.display = 'none';
        if (emptyOrders) emptyOrders.style.display = 'block';
        return;
    }

    if (ordersList) {
        ordersList.style.display = 'block';
        ordersList.innerHTML = orders.map(order => `
            <div class="card order-card mb-3">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h6 class="mb-1">Orden #${order.id}</h6>
                                    <small class="text-muted">Fecha: ${new Date(order.created_at).toLocaleDateString()}</small>
                                </div>
                                <span class="order-status ${order.estado}">${order.estado}</span>
                            </div>
                            <div class="mb-2">
                                <strong>Total:</strong> $${order.total.toFixed(2)}
                            </div>
                            <div class="mb-2">
                                <small class="text-muted">ID de Pago: ${order.payment_intent_id || 'N/A'}</small>
                            </div>
                        </div>
                        <div class="col-md-4 text-end">
                            <button class="btn btn-outline-primary btn-sm" onclick="viewOrderDetails(${order.id})">
                                <i class="bi bi-eye"></i> Ver Detalles
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    if (emptyOrders) emptyOrders.style.display = 'none';
}

// View order details
async function viewOrderDetails(orderId) {
    try {
        const response = await fetch(`${API_BASE}/payments/orders/${orderId}`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Error al cargar detalles de la orden');
        }

        const data = await response.json();
        showOrderDetailsModal(data.order, data.items);
    } catch (error) {
        console.error('Error loading order details:', error);
        showError('Error al cargar detalles de la orden');
    }
}

// Show order details modal
function showOrderDetailsModal(order, items) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('orderDetailsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'orderDetailsModal';
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Detalles de la Orden</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="orderDetailsContent">
                            <!-- Content will be loaded here -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Update modal content
    const content = document.getElementById('orderDetailsContent');
    if (content) {
        content.innerHTML = `
            <div class="row mb-3">
                <div class="col-md-6">
                    <strong>Orden #${order.id}</strong>
                </div>
                <div class="col-md-6 text-end">
                    <span class="order-status ${order.estado}">${order.estado}</span>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <small class="text-muted">Fecha: ${new Date(order.created_at).toLocaleDateString()}</small>
                </div>
                <div class="col-md-6 text-end">
                    <small class="text-muted">ID de Pago: ${order.payment_intent_id || 'N/A'}</small>
                </div>
            </div>
            <hr>
            <h6>Productos:</h6>
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Código</th>
                            <th>Cantidad</th>
                            <th>Precio Unit.</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td>${item.nombre}</td>
                                <td><small>${item.codigo}</small></td>
                                <td>${item.cantidad}</td>
                                <td>$${item.precio_unitario.toFixed(2)}</td>
                                <td>$${(item.cantidad * item.precio_unitario).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colspan="4" class="text-end">Total:</th>
                            <th class="text-primary">$${order.total.toFixed(2)}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
    }

    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Show error message
function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
});
