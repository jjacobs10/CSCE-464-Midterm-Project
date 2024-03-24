document.addEventListener('DOMContentLoaded', function () {      // "DOMContentLoaded" allows scripts to run as soon as HTML is fully parsed, allowing quicker interaction
    var navToggle = document.getElementById('nav-toggle');
    var navMenu = document.querySelector('.nav-menu');
    const cartCount = document.querySelector('.cart-count');

    // initialize cart from sessionStorage or start with an empty object
    let cart = JSON.parse(sessionStorage.getItem('cart')) || {};

    function updateCartCount() {
        const totalItems = Object.values(cart).reduce((acc, curr) => acc + curr, 0);
        cartCount.textContent = totalItems;
    }

    function addToCart(productId) {
        cart[productId] = cart[productId] ? cart[productId] + 1 : 1;
        sessionStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-product-id');
            addToCart(productId);
        });
    });

    // initial update in case there are items in the cart from a previous session
    updateCartCount();

    navToggle.addEventListener('click', function () {
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.toggle-description').forEach(button => {
        button.addEventListener('click', function() {
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
});
