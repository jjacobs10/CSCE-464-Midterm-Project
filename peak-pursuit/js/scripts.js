// initialize cart from sessionStorage or start with an empty object
let cart = JSON.parse(sessionStorage.getItem('cart')) || {};

function logout() {
    sessionStorage.removeItem('cart'); // clear the session cart upon logout

    // clear cookies
    document.cookie = 'userToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    window.location.href = '/index.html'; // redirect to home page after logout
}

function getCookie(name) {
    let cookie = {};
    document.cookie.split(';').forEach(function (el) {
        let [k, v] = el.split('=');
        cookie[k.trim()] = v;
    })
    return cookie[name];
}

const cartCount = document.querySelector('.cart-count');

function addToCart(productId) {
    cart[productId] = cart[productId] ? cart[productId] + 1 : 1;
    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
    updateCartCount();

    let cartContainer = document.getElementById('cart-container');
    if (!cartContainer) {
        cartContainer = document.createElement('div');
        cartContainer.id = 'cart-container';
    }

    window.dispatchEvent(new Event('cartUpdated'));

    const userToken = getCookie('userToken');

    fetch('/addItemToCart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userToken: userToken,
            productId: productId,
            quantity: cart[productId]
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add item to cart');
            }
        })
        .catch(error => {
            console.error('Error adding item to cart:', error);
        });

}

function removeFromCart(productId) {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || {};
    if (cart[productId] > 1) {
        cart[productId]--;
    } else {
        delete cart[productId];  // remove the item from the cart if quantity is 0
    }
    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
    updateCartCount();

    const userToken = getCookie('userToken');

    fetch('/removeItemFromCart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userToken: userToken,
            productId: productId
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to remove item from cart');
            }
            return response.text();
        })
        .then(message => console.log(message))
        .catch(error => console.error('Error removing item from cart:', error));
}


function updateCart() {
    let cartContainer = document.getElementById('cart-container');
    if (!cartContainer) {
        cartContainer = document.createElement('div');
        cartContainer.id = 'cart-container';
    }

    const cartPageItems = document.getElementById('cart-items');
    if (!cartPageItems) {  // check if it exists
        return; // if doesn't exist, don't proceed with update
    }
    const cartPageTotal = document.getElementById('cart-total');
    let cart = JSON.parse(sessionStorage.getItem('cart')) || {};

    cartPageItems.innerHTML = '';
    let total = 0;

    Object.keys(cart).forEach(productId => {
        const product = products[productId];
        const quantity = cart[productId];
        total += product.price * quantity;

        const cartPageItem = document.createElement('div');
        cartPageItem.classList.add('cart-item');

        let imageElement = '';
        if (product.image) {
            imageElement = `<img src="${product.image}" alt="${product.title}" style="aspect-ratio: 1/1; max-width: 90px; max-height: 90px">`;
        }

        cartPageItem.innerHTML = `<div style="margin-top: 15px">${imageElement}</div>
                                  <p>${product.title}</p>
                                  <p>
                                    Quantity: 
                                    <button class="button.plain" id="decrease-${productId}">-</button>
                                    ${quantity}
                                    <button class="button.plain" id="increase-${productId}">+</button>
                                  </p>
                                  <p>Price: $${(product.price * quantity).toFixed(2)}</p>`;
        cartPageItems.appendChild(cartPageItem);
    });

    Object.keys(cart).forEach(productId => {
        document.getElementById(`increase-${productId}`).addEventListener('click', () => {
            addToCart(productId);
        });

        document.getElementById(`decrease-${productId}`).addEventListener('click', () => {
            removeFromCart(productId);
        });
    });

    cartPageTotal.textContent = `Total: $${total.toFixed(2)}`; // update total price display
}

function addToCart(productId) {
    cart[productId] = cart[productId] ? cart[productId] + 1 : 1;
    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
    updateCartCount();

    let cartContainer = document.getElementById('cart-container');
    if (!cartContainer) {
        cartContainer = document.createElement('div');
        cartContainer.id = 'cart-container';
    }

    window.dispatchEvent(new Event('cartUpdated'));

    const userToken = getCookie('userToken');

    fetch('/addItemToCart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userToken: userToken,
            productId: productId,
            quantity: cart[productId]
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add item to cart');
            }
        })
        .catch(error => {
            console.error('Error adding item to cart:', error);
        });

}

function loadCartFromServer() {
    fetch('/getCart.php', {
        method: 'GET',
        credentials: 'include' // ensure cookies are sent with request
    })
        .then(response => response.json())
        .then(data => {
            sessionStorage.setItem('cart', JSON.stringify(data));
            updateCart();
            window.dispatchEvent(new Event('cartUpdated'));
        })
        .catch(error => console.error('Failed to load cart from server', error));
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = Object.values(cart).reduce((acc, curr) => acc + curr, 0);
        cartCount.textContent = totalItems;
    }
}

document.addEventListener('DOMContentLoaded', function () {      // "DOMContentLoaded" allows scripts to run as soon as HTML is fully parsed, allowing quicker interaction
    var navToggle = document.getElementById('nav-toggle');
    var navMenu = document.querySelector('.nav-menu');
    const loginButton = document.getElementById('loginButton');

    updateProductDisplay();

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', event => {
            const productId = button.getAttribute('data-product-id');
            updateProductDisplay();
        });
    });

    function updateProductDisplay() {
        const cart = JSON.parse(sessionStorage.getItem('cart')) || {};
        document.querySelectorAll('.flex-item').forEach(item => {
            const productId = item.querySelector('.add-to-cart').getAttribute('data-product-id');
            const quantity = cart[productId] || 0;
            let cartButtonContainer = item.querySelector('.cart-button-container');

            if (!cartButtonContainer) {
                cartButtonContainer = document.createElement('div');
                cartButtonContainer.classList.add('cart-button-container');
                item.appendChild(cartButtonContainer);
            }

            if (quantity > 0) {
                cartButtonContainer.innerHTML = `
                    <button class="button cart-decrease" data-product-id="${productId}">-</button>
                    <span class="quantity-display">${quantity}</span>
                    <button class="button cart-increase" data-product-id="${productId}">+</button>
                `;
                item.querySelector('.add-to-cart').style.display = 'none'; // hide the Add to Cart button
                cartButtonContainer.querySelector('.cart-decrease').addEventListener('click', function () {
                    removeFromCart(productId);
                    updateProductDisplay();
                    updateCartCount();
                });
                cartButtonContainer.querySelector('.cart-increase').addEventListener('click', function () {
                    addToCart(productId);
                    updateProductDisplay();
                    updateCartCount();
                });
            } else {
                item.querySelector('.add-to-cart').style.display = ''; // show the Add to Cart button
                cartButtonContainer.innerHTML = ''; // hide quantity modifiers
            }

            item.appendChild(cartButtonContainer);
        });
    }

    document.getElementById('cart-link').addEventListener('click', function (event) {
        event.preventDefault();
        window.location.href = '/pages/cart.html';
    });

    document.addEventListener('cartUpdated', function () {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = Object.values(cart).reduce((acc, curr) => acc + curr, 0);
            cartCount.textContent = totalItems;
        }
    });

    // update login button based on user's login status
    function updateLoginButton() {
        var userEmail = getCookie('userEmail');
        if (userEmail) {
            userEmail = decodeURIComponent(userEmail); // decode the email so the "@" isn't displayed as "%40"
            var atIndex = userEmail.indexOf('@');
            var dotIndex = userEmail.lastIndexOf('.');
            var maskedEmail = userEmail[0] + '***' + userEmail.substring(atIndex, atIndex + 2) + "***" + userEmail.substring(dotIndex);
            loginButton.textContent = 'Log out ' + maskedEmail;
            loginButton.href = 'javascript:logout()';
        } else {
            loginButton.textContent = 'Login/Register';
            loginButton.href = '/pages/login.html';
        }
    }

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-product-id');
            addToCart(productId);
            button.style.display = 'none'; // hide the button after it's clicked
            updateProductDisplay();
            
            const userEmail = getCookie('userEmail');
        });
    });

    // initial update in case there are items in the cart from a previous session
    updateCartCount();

    navToggle.addEventListener('click', function () {
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.toggle-description').forEach(button => {
        button.addEventListener('click', function () {
            let descriptionDiv = this.nextElementSibling; // nextElementSibling gets the element right after
            if (descriptionDiv.style.display === "none") {
                descriptionDiv.style.display = "block";
                descriptionDiv.classList.add('scrollable'); // make it scrollable
                this.textContent = "Hide Description"; // change button text
            } else {
                descriptionDiv.style.display = "none";
                descriptionDiv.classList.remove('scrollable'); // remove scrollable class
                this.textContent = "Learn More"; // reset button text
            }
        });
    });
    updateLoginButton();
});
