// Elements
const orderSummaryBody = document.querySelector('#order-summary tbody');
const paymentGrandTotal = document.getElementById('payment-grand-total');
const paymentMethod = document.getElementById('payment-method');
const cardDetails = document.getElementById('card-details');
const payButton = document.getElementById('pay-button');

// Load cart details from local storage
let cart = JSON.parse(localStorage.getItem('currentCart')) || [];

// Populate Order Summary
function populateOrderSummary() {
    let grandTotal = 0;
    orderSummaryBody.innerHTML = '';
    cart.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>LKR. ${item.price.toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>LKR. ${item.total.toFixed(2)}</td>
        `;
        orderSummaryBody.appendChild(row);
        grandTotal += item.total;
    });

    paymentGrandTotal.textContent = `LKR. ${grandTotal.toFixed(2)}`;
}
populateOrderSummary();

// Show/Hide Card Details based on payment method
paymentMethod.addEventListener('change', () => {
    cardDetails.style.display = paymentMethod.value === 'card' ? 'block' : 'none';
});

// Validate phone number format (using regular expression)
function validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^\+?\d{1,4}?[\d\s\-]{7,15}$/;
    return phoneRegex.test(phoneNumber);
}

// Validate credit card number (16 digits)
function validateCardNumber(cardNumber) {
    const cardNumberRegex = /^\d{16}$/;
    return cardNumberRegex.test(cardNumber);
}

// Validate expiry date (MM/YYYY or Month YYYY format) and check if it's expired
function validateExpiryDate(expiryDate) {
    const monthNameToNumber = {
        'January': '01', 'February': '02', 'March': '03', 'April': '04',
        'May': '05', 'June': '06', 'July': '07', 'August': '08',
        'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };

    // If input is a month-name (e.g., "December 2025"), convert it to MM/YYYY format
    if (/^[a-zA-Z]+/.test(expiryDate)) {
        let parts = expiryDate.split(' ');
        let monthName = parts[0];
        let year = parts[1];

        if (monthNameToNumber[monthName]) {
            expiryDate = `${monthNameToNumber[monthName]}/${year}`;
        } else {
            return false;  // Invalid month name
        }
    }

    // If the input is coming from the <input type="month">, it will be in YYYY-MM format
    // In that case, we can directly validate the format like MM/YYYY
    const regex = /^(0[1-9]|1[0-2])\/\d{4}$/;

    // If the expiry date comes from the <input type="month">, format it as MM/YYYY
    if (expiryDate.includes("-")) {
        let [year, month] = expiryDate.split("-");
        expiryDate = `${month.padStart(2, '0')}/${year}`;
    }

    // Validate the expiry date format (MM/YYYY)
    if (!regex.test(expiryDate)) {
        return false;
    }

    // Get current date and compare with expiry date
    const [expiryMonth, expiryYear] = expiryDate.split('/');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed
    const currentYear = currentDate.getFullYear();

    // Check if the card is expired
    if (parseInt(expiryYear) < currentYear || (parseInt(expiryYear) === currentYear && parseInt(expiryMonth) < currentMonth)) {
        return false;  // Card has expired
    }

    return true;  // Valid and not expired
}

// Validate CVV (3 digits)
function validateCVV(cvv) {
    const cvvRegex = /^\d{3}$/;
    return cvvRegex.test(cvv);
}

// Handle Payment
payButton.addEventListener('click', () => {
    const fullName = document.getElementById('full-name').value.trim();
    const address = document.getElementById('address').value.trim();
    const phoneNumber = document.getElementById('phone-number').value.trim();
    const paymentType = paymentMethod.value;

    // Validate required fields
    if (!fullName || !address || !phoneNumber) {
        alert('Please fill in all required fields.');
        return;
    }

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
        alert('Please enter a valid phone number.');
        return;
    }

    // Validate payment method
    if (!paymentType) {
        alert('Please select a payment method.');
        return;
    }

    // Card payment validation
    if (paymentType === 'card') {
        const cardNumber = document.getElementById('card-number').value.trim();
        const expiryDate = document.getElementById('expiry-date').value.trim();
        const cvv = document.getElementById('cvv').value.trim();

        // Validate card details
        if (!cardNumber || !expiryDate || !cvv) {
            alert('Please fill in all card details.');
            return;
        }

        if (!validateCardNumber(cardNumber)) {
            alert('Please enter a valid 16-digit card number.');
            return;
        }

        if (!validateExpiryDate(expiryDate)) {
            alert('The card has expired. Please enter a valid expiry date.');
            return;
        }

        if (!validateCVV(cvv)) {
            alert('Please enter a valid 3-digit CVV.');
            return;
        }
    }

    // Show success message
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    alert(`Thank you for your purchase, ${fullName}! Your order will be delivered on ${deliveryDate.toDateString()}.`);

    localStorage.removeItem('currentCart'); // Clear the cart
    window.location.href = 'pharmacy.html'; // Redirect to the pharmacy page
});
