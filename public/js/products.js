// Products.js - Manejo de productos

const API_BASE = '/api';

// Load products
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Error al cargar productos');
        }

        const data = await response.json();
        displayProducts(data.products);
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Error al cargar productos');
    }
}

// Display products
function displayProducts(products) {
    const loading = document.getElementById('loading');
    const productsGrid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');

    if (loading) loading.style.display = 'none';

    if (products.length === 0) {
        if (productsGrid) productsGrid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (productsGrid) {
        productsGrid.style.display = 'flex';
        productsGrid.innerHTML = products.map(product => `
            <div class="col-md-4 mb-4">
                <div class="card product-card h-100">
                    <img src="https://picsum.photos/seed/${product.codigo}/400/300.jpg" class="card-img-top" alt="${product.nombre}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.nombre}</h5>
                        <p class="card-text text-muted small">Código: ${product.codigo}</p>
                        <p class="card-text">${product.descripcion || 'Sin descripción'}</p>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="h5 text-primary">$${product.precio.toFixed(2)}</span>
                                <button class="btn btn-primary btn-sm" onclick="addToCart(${product.id})">
                                    <i class="bi bi-cart-plus"></i> Agregar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    if (emptyState) emptyState.style.display = 'none';
}

// Add product to cart
async function addToCart(productId) {
    if (!requireAuth()) return;

    try {
        const response = await fetch(`${API_BASE}/cart/add`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                product_id: productId,
                cantidad: 1
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al agregar al carrito');
        }

        showSuccess('Producto agregado al carrito');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showError(error.message);
    }
}

// Show add product modal
function showAddProductModal() {
    const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
    modal.show();
}

// Add new product (admin only)
async function addProduct() {
    if (!requireAuth()) return;

    const nombre = document.getElementById('productName').value;
    const codigo = document.getElementById('productCode').value;
    const precio = parseFloat(document.getElementById('productPrice').value);
    const descripcion = document.getElementById('productDescription').value;

    if (!nombre || !codigo || !precio) {
        showError('Todos los campos obligatorios deben ser completados');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                nombre,
                codigo,
                precio,
                descripcion
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al agregar producto');
        }

        // Close modal and reload products
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('addProductForm').reset();
        
        // Reload products
        loadProducts();
        
        showSuccess('Producto agregado exitosamente');
    } catch (error) {
        console.error('Error adding product:', error);
        showError(error.message);
    }
}

// Show error message
function showError(message) {
    // Create toast or alert
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
    // Check if user is admin to show add product button
    if (isAdmin()) {
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.style.display = 'block';
        }
    }

    // Load products
    loadProducts();
});
