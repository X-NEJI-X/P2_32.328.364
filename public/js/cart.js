// Cart.js - Manejo del carrito de compras

const API_BASE = '/api';

// Load cart
async function loadCart() {
    if (!requireAuth()) return;

    try {
        const response = await fetch(`${API_BASE}/cart`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Error al cargar el carrito');
        }

        const data = await response.json();
        displayCart(data.items, data.total);
    } catch (error) {
        console.error('Error loading cart:', error);
        showError('Error al cargar el carrito');
    }
}

// Display cart
function displayCart(items, total) {
    const loading = document.getElementById('loading');
    const cartContent = document.getElementById('cartContent');
    const emptyCart = document.getElementById('emptyCart');
    const cartItems = document.getElementById('cartItems');
    const totalElement = document.getElementById('total');
    const subtotalElement = document.getElementById('subtotal');

    if (loading) loading.style.display = 'none';

    if (items.length === 0) {
        if (cartContent) cartContent.style.display = 'none';
        if (emptyCart) emptyCart.style.display = 'block';
        return;
    }

    if (cartContent) cartContent.style.display = 'block';
    if (emptyCart) emptyCart.style.display = 'none';

    if (cartItems) {
        cartItems.innerHTML = items.map(item => `
            <div class="cart-item">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <img src="https://picsum.photos/seed/${item.codigo}/80/80.jpg" alt="${item.nombre}" class="img-fluid rounded">
                    </div>
                    <div class="col-md-4">
                        <h6 class="mb-1">${item.nombre}</h6>
                        <small class="text-muted">Código: ${item.codigo}</small>
                    </div>
                    <div class="col-md-2">
                        <div class="input-group input-group-sm">
                            <button class="btn btn-outline-secondary" onclick="updateQuantity(${item.id}, ${item.cantidad - 1})">-</button>
                            <input type="number" class="form-control text-center" value="${item.cantidad}" min="1" readonly>
                            <button class="btn btn-outline-secondary" onclick="updateQuantity(${item.id}, ${item.cantidad + 1})">+</button>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <span class="fw-bold">$${item.precio.toFixed(2)}</span>
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${item.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    if (subtotalElement) subtotalElement.textContent = `$${total.toFixed(2)}`;
}

// Update quantity
async function updateQuantity(cartId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(cartId);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/cart/update/${cartId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ cantidad: newQuantity }),
        });

        if (!response.ok) {
            throw new Error('Error al actualizar cantidad');
        }

        loadCart();
    } catch (error) {
        console.error('Error updating quantity:', error);
        showError('Error al actualizar cantidad');
    }
}

// Remove from cart
async function removeFromCart(cartId) {
    if (!confirm('¿Estás seguro de eliminar este producto del carrito?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/cart/remove/${cartId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Error al eliminar del carrito');
        }

        loadCart();
        showSuccess('Producto eliminado del carrito');
    } catch (error) {
        console.error('Error removing from cart:', error);
        showError('Error al eliminar del carrito');
    }
}

// Clear cart
async function clearCart() {
    if (!confirm('¿Estás seguro de vaciar todo el carrito?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/cart/clear`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Error al vaciar el carrito');
        }

        loadCart();
        showSuccess('Carrito vaciado');
    } catch (error) {
        console.error('Error clearing cart:', error);
        showError('Error al vaciar el carrito');
    }
}

// Proceed to payment
async function proceedToPayment() {
    if (!requireAuth()) return;

    try {
        // Get cart total first
        const response = await fetch(`${API_BASE}/cart`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Error al verificar el carrito');
        }

        const cartData = await response.json();

        if (cartData.items.length === 0) {
            showError('El carrito está vacío');
            return;
        }

        // Create Stripe checkout session
        const checkoutResponse = await fetch(`${API_BASE}/payments/create-checkout-session`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                success_url: `${window.location.origin}/orders`,
                cancel_url: `${window.location.origin}/cart`
            }),
        });

        if (!checkoutResponse.ok) {
            const error = await checkoutResponse.json();
            throw new Error(error.error || 'Error al procesar el pago');
        }

        const checkoutData = await checkoutResponse.json();

        // Redirect to Stripe checkout
        const stripe = Stripe('pk_test_51234567890abcdef'); // Replace with actual key from env
        await stripe.redirectToCheckout({
            sessionId: checkoutData.sessionId
        });

    } catch (error) {
        console.error('Error proceeding to payment:', error);
        showError(error.message);
    }
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

// Show success message
function showSuccess(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
});
