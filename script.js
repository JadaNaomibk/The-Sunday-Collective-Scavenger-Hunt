// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    
    // Mobile menu toggle (e.g., for a "hamburger" menu)
    const menuButton = document.getElementById("menuButton"); // The button that toggles the menu
    const mobileMenu = document.getElementById("mobileMenu"); // The actual mobile menu

    // Add click event listener to the menu button
    if (menuButton) {
        menuButton.addEventListener("click", function() {
            // Toggle the 'open' class on the mobile menu to show/hide it
            mobileMenu.classList.toggle("open");
        });
    }

    // Example of handling a form submit for mobile responsiveness
    const form = document.getElementById("contactForm"); // Example form element
    if (form) {
        form.addEventListener("submit", function(event) {
            event.preventDefault(); // Prevent the form from refreshing the page
            alert("Form submitted!"); // You can replace this with real form handling logic
        });
    }

    // Example of handling dynamic resizing or layout adjustments
    window.addEventListener("resize", function() {
        const width = window.innerWidth;

        // Adjust layout or elements based on screen width (e.g., for mobile vs. desktop)
        if (width < 600) {
            document.body.style.backgroundColor = "lightblue"; // Change background color for small screens
        } else {
            document.body.style.backgroundColor = ""; // Reset for larger screens
        }
    });

});
