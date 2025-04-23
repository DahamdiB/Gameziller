// Initialize cart from localStorage or empty object
const cart = JSON.parse(localStorage.getItem('cart')) || {};


// Load and display products
document.addEventListener('DOMContentLoaded', () => {
    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            // Display products for each category
            Object.entries(products).forEach(([category, items]) => {
                const container = document.getElementById(category);
                if (!container) return;

                const scrollContainer = document.createElement('div');
                scrollContainer.className = 'scroll-container';
                
                // Create product cards
                items.forEach(item => {
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    productCard.innerHTML = `
                        <img src="${item.image}" alt="${item.name}" class="product-image">
                        <h4 class="product-name">${item.name}</h4>
                        <div class="flex justify-between items-center">
                            <span class="product-price">$${item.price.toFixed(2)}</span>
                            <input type="number" min="0" value="${cart[item.id]?.quantity || 0}" 
                                   class="quantity-input" data-id="${item.id}">
                        </div>
                    `;

                    // Add quantity change listener
                    const quantityInput = productCard.querySelector('input');
                    quantityInput.addEventListener('change', (e) => {
                        const quantity = parseInt(e.target.value) || 0;
                        if (quantity > 0) {
                            cart[item.id] = { name: item.name, price: item.price, quantity };
                        } else {
                            delete cart[item.id];
                        }
                        localStorage.setItem('cart', JSON.stringify(cart));
                        updateOrderTable();
                    });

                    scrollContainer.appendChild(productCard);
                });
                container.appendChild(scrollContainer);
            });

            // Initial order table update
            updateOrderTable();
        })
        .catch(error => console.error('Error loading products:', error));
});  

// Update order summary table
function updateOrderTable() {
    const tableBody = document.getElementById('orderTable');
    const totalElement = document.getElementById('totalPrice');
    if (!tableBody || !totalElement) return;

    tableBody.innerHTML = '';
    let total = 0;

    Object.entries(cart).forEach(([itemId, item]) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>$${itemTotal.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    });

    totalElement.textContent = `$${total.toFixed(2)}`;
}


//Show Favorite button
function showFavoriteSummary() {
    const savedOrder = localStorage.getItem('favoriteOrder');
    const summaryContainer = document.getElementById('favoriteSummary');
    const tableBody = document.getElementById('favoriteTableBody');

    //checks for non-existency
    if (!savedOrder || !summaryContainer || !tableBody) return;
    const favorites = JSON.parse(savedOrder);
    //Clear the rows
    tableBody.innerHTML = ''; 

    Object.entries(favorites).forEach(([id, item]) => {
        const total = item.quantity * item.price;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>$${total.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    });

    summaryContainer.style.display = 'block';
}
    


// Button event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Save to favorites
    const saveButton = document.getElementById('saveToFavorites');
    //if functions used to check for existence and prevent errors
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            localStorage.setItem('favoriteOrder', JSON.stringify(cart));
            alert('Order saved to favorites!');
        });
    }

    
    // Load favorites
    const loadButton = document.getElementById('loadFavorites');
    if (loadButton) {
        loadButton.addEventListener('click', () => {
            const savedOrder = localStorage.getItem('favoriteOrder');
            if (savedOrder) {
                Object.assign(cart, JSON.parse(savedOrder));
                localStorage.setItem('cart', JSON.stringify(cart));
                
                // Update quantity inputs
                document.querySelectorAll('.quantity-input').forEach(input => {
                    const itemId = input.dataset.id;
                    input.value = cart[itemId]?.quantity || 0;
                });
                
                updateOrderTable();
            }
        });
    }

    // Buy now
    const buyButton = document.getElementById('buyNow');
    if (buyButton) {
        buyButton.addEventListener('click', () => {
            if (Object.keys(cart).length === 0) {
                alert('Please add items to your cart first!');
                return;
            }
            localStorage.setItem('currentOrder', JSON.stringify({ items: cart, total: calculateTotal() }));
            window.location.href = 'checkout.html';
        });
    }


    // // Show Favorites Button — fixed to use existing summary table
    // const showButton = document.getElementById('showFavorites');

    // if (showButton) {
    //     showButton.addEventListener('click', () => {
    //         showFavoriteSummary();  // ✅ Use the function you already wrote
    //     });
    // }





    // Checkout form
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        // Initialize checkout page
        const savedOrder = localStorage.getItem('currentOrder');
        //no order takes back to main pg
        if (!savedOrder) {
            window.location.href = 'index.html';
            return;
        }

        const order = JSON.parse(savedOrder);
        const tableBody = document.getElementById('checkoutOrderTable');
        const totalElement = document.getElementById('checkoutTotal');
        
        //extracts the data and fills in the summary of the order
        if (tableBody && totalElement) {
            tableBody.innerHTML = '';
            Object.entries(order.items).forEach(([itemId, item]) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>$${(item.price * item.quantity).toFixed(2)}</td>
                `;
                tableBody.appendChild(row);
            });
            totalElement.textContent = `$${order.total.toFixed(2)}`;
        }


        // Handle form submission
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            //prevents refreshing the page
            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate() + 5);// set to in-5-days
            
            alert(`Thank you, Your order will be delivered by ${deliveryDate.toLocaleDateString()}.`);
            //remoes the order so that its not there after purchase
            localStorage.removeItem('currentOrder');
            localStorage.removeItem('cart');
            window.location.href = 'index.html';
        });
    }
});

// Fnction to calculate total price of the order
function calculateTotal() {
    return Object.values(cart).reduce((total, item) => total + (item.price * item.quantity), 0);
}