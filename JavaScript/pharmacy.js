// Elements
const mainContent = document.querySelector('main');
const cartTableBody = document.querySelector('#cart-table tbody');
const grandTotalElement = document.getElementById('grand-total');
const saveFavoriteButton = document.getElementById('save-favorite');
const applyFavoriteButton = document.getElementById('apply-favorite');
const buyNowButton = document.getElementById('buy-now');
const clearCartButton = document.getElementById('clear-cart');

// Cart data structure (using localStorage to persist across page reloads)
let cart = JSON.parse(localStorage.getItem('currentCart')) || [];

// Load Medicines from JSON File
document.addEventListener('DOMContentLoaded', () => {
    fetch('JSON/medicine.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(category => {
                const section = document.createElement('section');
                section.id = category.category;
                section.innerHTML = `
                    <h2>${category.category}</h2>
                    <div class="Medicines-grid">
                        ${category.medicines.map(medicine => `
                            <div class="Medicine">
                                <img src="${medicine.image}" alt="${medicine.name}">
                                <h3>${medicine.name}</h3>
                                <p>LKR. ${medicine.price.toFixed(2)} (per tablet)</p>
                                <label for="quantity-${medicine.name}" class="quantity-label">Quantity:</label>
                                <input type="number" min="1" id="quantity-${medicine.name}" data-name="${medicine.name}" data-price="${medicine.price}" placeholder="Qty" step="1" class="quantity-input">
                                <button type="button" class="add-to-cart">Add to Cart</button>
                            </div>
                        `).join('')}
                    </div>
                `;
                mainContent.appendChild(section);
            });

            // Add Event Listeners to dynamically loaded buttons
            setupAddToCartButtons();
        })
        .catch(error => console.error('Error loading medicines:', error));
});

// Add to Cart Functionality
function setupAddToCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const parentDiv = button.closest('.Medicine');
            const name = parentDiv.querySelector('h3').textContent;
            const price = parseFloat(parentDiv.querySelector('p').textContent.replace('LKR. ', ''));
            const quantityInput = parentDiv.querySelector('input[type="number"]');
            let quantity = parseFloat(quantityInput.value.trim());

            // Round up the quantity to the next whole number if it's decimal
            quantity = Math.ceil(quantity);

            // Validate input
            if (isNaN(quantity) || quantity <= 0) {
                alert(`Please enter a valid quantity for ${name}!`);
                return;
            }

            // Check if the item already exists in the cart
            const existingItem = cart.find(cartItem => cartItem.name === name);
            if (existingItem) {
                existingItem.quantity += quantity;
                existingItem.total = existingItem.quantity * existingItem.price;
            } else {
                cart.push({ name, price, quantity, total: price * quantity });
            }

            // Clear the input field after processing
            quantityInput.value = '';

            // Save updated cart to localStorage
            localStorage.setItem('currentCart', JSON.stringify(cart));

            // Update the cart table
            updateCartTable();
        });
    });
}

// Update Cart Table
function updateCartTable() {
    cartTableBody.innerHTML = '';
    let grandTotal = 0;

    cart.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>LKR. ${item.price.toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>
                LKR. ${item.total.toFixed(2)}
                <button type="button" class="remove-item" data-index="${cart.indexOf(item)}">Remove</button>
            </td>
        `;
        cartTableBody.appendChild(row);
        grandTotal += item.total;
    });

    grandTotalElement.textContent = `Total: LKR. ${grandTotal.toFixed(2)}`;

    // Add event listeners for the "Remove" buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemIndex = parseInt(e.target.dataset.index, 10);
            removeCartItem(itemIndex);
        });
    });
}

// Remove Item from Cart
function removeCartItem(index) {
    cart.splice(index, 1); // Remove the item at the given index
    localStorage.setItem('currentCart', JSON.stringify(cart)); // Update localStorage
    updateCartTable(); // Refresh the table
}

// Save to Favorites
saveFavoriteButton.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('There are no items in your cart to save!');
        return;
    }
    localStorage.setItem('favoriteCart', JSON.stringify(cart));
    alert('Favorite cart saved!');
});

// Apply Favorites
applyFavoriteButton.addEventListener('click', () => {
    const favoriteCart = JSON.parse(localStorage.getItem('favoriteCart'));
    if (favoriteCart && favoriteCart.length > 0) {
        const confirmApply = confirm('Are you sure you want to apply the saved favorite cart? This will overwrite the current cart.');
        if (confirmApply) {
            cart = favoriteCart;
            localStorage.setItem('currentCart', JSON.stringify(cart));
            updateCartTable();
        }
    } else {
        alert('No favorite cart found or saved cart is empty!');
    }
});

// Buy Now
buyNowButton.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    localStorage.setItem('currentCart', JSON.stringify(cart));
    window.location.href = 'payment.html';
});

// Clear Cart
clearCartButton.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is already empty!');
        return;
    }

    cart = [];
    localStorage.removeItem('currentCart');
    updateCartTable();

    alert('Cart has been cleared!');
});

// Ensure Cart is Loaded on Page Load
if (cart.length > 0) {
    updateCartTable();
}
