document.addEventListener('DOMContentLoaded', () => {
    const heroImageContainer = document.querySelector('.hero-image-container');
    const nav = document.querySelector('.main-nav');
    const heroContent = document.querySelector('.hero-content');
    let activeInfoWindow = null; // Track the currently active InfoWindow

    // Smooth Scroll Functionality
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if(targetSection) {
                const navHeight = nav.offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight - 20; // Adjusted for padding
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Scroll Animation Logic
    function updateAnimation() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const scrollProgress = Math.min(scrollY / (windowHeight * 0.6), 1);

        // Image Animation
        heroImageContainer.style.transform = `
            scale(${0.85 + (scrollProgress * 0.6)})
            translateY(${scrollProgress * -25}px)
        `;

        // Content Fade
        heroContent.style.opacity = 1 - (scrollProgress * 1.5);
        heroContent.style.transform = `translateY(${scrollProgress * 50}px)`;

        // Navbar Control
        nav.classList.toggle('visible', scrollY > windowHeight * 0.4);
    }

    // Scroll Handler
    window.addEventListener('scroll', () => {
        requestAnimationFrame(updateAnimation);
    });

    // Initial Call
    updateAnimation();

    // Card Tap Flip Logic for Mobile
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            // Reset other cards
            cards.forEach(c => {
                if (c !== card) c.querySelector('.card-inner').style.transform = 'rotateY(0)';
            });

            // Toggle current card
            const cardInner = card.querySelector('.card-inner');
            cardInner.style.transform = 
                cardInner.style.transform === 'rotateY(180deg)' ? 'rotateY(0)' : 'rotateY(180deg)';
        });
    });

    // Map Initialization
    let map;
    function initMap() {
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: -37.8136, lng: 144.9631 },
            zoom: 13,
            styles: []
        });

        // Add markers
        locations.forEach(location => {
            const marker = new google.maps.Marker({
                position: location.position,
                map: map,
                title: location.title // Display title on hover
            });

            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div class="map-info">
                        <h3>${location.title}</h3>
                        <p>${location.address}</p>
                        <p>${location.hours}</p>
                        <p><em>${location.description}</em></p>
                    </div>
                `
            });

            marker.addListener("click", () => {
                // Close the previous InfoWindow, if any
                if (activeInfoWindow) {
                    activeInfoWindow.close();
                }
                infoWindow.open(map, marker); // Open the current InfoWindow
                activeInfoWindow = infoWindow; // Update the active InfoWindow

                updateLocationDetails(location);
            });
        });
    }

    // Dynamic Location Details
    function updateLocationDetails(selectedLocation) {
        const notesContent = document.getElementById("notes-content");
        const stars = '★'.repeat(selectedLocation.personalStars) + 
                    '☆'.repeat(5 - selectedLocation.personalStars);

        notesContent.innerHTML = `
            <div class="landmark-notes">
                <h2>${selectedLocation.title}</h2> <!-- Display location title -->
                <div class="star-rating">${stars}</div>
                
                <div class="note-category">
                    <img src="images/love.png" class="category-icon" alt="Atmosphere">
                    <strong>Atmosphere:</strong> ${selectedLocation.personalNotes.atmosphere}
                </div>
                
                <div class="note-category">
                    <img src="images/danger.png" class="category-icon" alt="Must Try">
                    <strong>Must Try:</strong> ${selectedLocation.personalNotes.mustTry}
                </div>
                
                <div class="note-category">
                    <img src="images/idea.png" class="category-icon" alt="Pro Tip">
                    <strong>Pro Tip:</strong> ${selectedLocation.personalNotes.tip}
                </div>
                
                <div class="personal-notes">
                    ${selectedLocation.personalNotes.vibe}
                </div>
            </div>
        `;
    }

    window.initMap = initMap;

    window.addEventListener('error', (e) => {
        if (e.message.includes("google")) {
            console.error("Error loading Google Maps:", e);
            document.getElementById("map").innerHTML = 
                "<p class='error'>Map failed to load. Please try refreshing the page.</p>";
        }
    });

    const locations = [
        {
            title: "Riverside Roastery",
            position: { lat: -37.8223, lng: 144.9568 },
            address: "123 River St",
            hours: "9 AM - 9 PM",
            description: "Industrial-chic space with great river views",
            personalStars: 4,
            personalNotes: {
                atmosphere: "Industrial-chic space with great river views",
                mustTry: "Cold brew flight",
                tip: "Ask for the seasonal special",
                vibe: "🏙️ Urban • ☕ Coffee-centric • 🎨 Local art displays"
            }
        },
        {
            title: "Downtown Café",
            position: { lat: -37.8136, lng: 144.9631 },
            address: "456 Downtown Ln",
            hours: "7 AM - 8 PM",
            description: "Cozy laneway hideaway",
            personalStars: 5,
            personalNotes: {
                atmosphere: "Cozy laneway hideaway",
                mustTry: "Matcha croissant",
                tip: "Try the hidden courtyard",
                vibe: "🌿 Plant-filled • 📚 Book nooks • 🎶 Jazz nights"
            }
        }
    ];

    initMap();
});


