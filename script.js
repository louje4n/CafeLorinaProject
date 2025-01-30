document.addEventListener('DOMContentLoaded', () => {
    const heroImageContainer = document.querySelector('.hero-image-container');
    const nav = document.querySelector('.main-nav');
    const heroContent = document.querySelector('.hero-content');

    // Smooth Scroll Functionality
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if(targetSection) {
                const navHeight = nav.offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;
                
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
});

// Add to script.js
const locations = [
    {
        title: "Downtown Café",
        position: { lat: -37.8136, lng: 144.9631 }, // Melbourne coordinates
        address: "123 Laneway Street, Melbourne",
        hours: "Open daily 7am - 5pm",
        description: "Our flagship location in the heart of Melbourne's laneway culture"
    },
    {
        title: "Riverside Roastery",
        position: { lat: -37.8223, lng: 144.9568 },
        address: "45 Southbank Promenade, Melbourne",
        hours: "Open daily 6:30am - 4pm",
        description: "Waterfront location with panoramic views of the Yarra River"
    }
];

let map;

function initMap() {
    // Initialize map
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -37.8136, lng: 144.9631 },
        zoom: 13,
        styles: [] // Add custom map styles here if desired
    });

    // Add markers
    locations.forEach(location => {
        const marker = new google.maps.Marker({
            position: location.position,
            map: map,
            title: location.title
        });

        // Info window
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

        // Click event
        marker.addListener("click", () => {
            infoWindow.open(map, marker);
            updateLocationDetails(location);
        });
    });
}

function updateLocationDetails(selectedLocation) {
    const detailsContainer = document.getElementById("location-details");
    detailsContainer.innerHTML = `
        <div class="location-card">
            <h3>${selectedLocation.title}</h3>
            <p class="address">📍 ${selectedLocation.address}</p>
            <p class="hours">⏰ ${selectedLocation.hours}</p>
            <p class="description">${selectedLocation.description}</p>
        </div>
    `;
}

// Error handling
window.initMap = initMap;
window.addEventListener('error', (e) => {
    if (e.message.includes("google")) {
        console.error("Error loading Google Maps:", e);
        document.getElementById("map").innerHTML = 
            "<p class='error'>Map failed to load. Please try refreshing the page.</p>";
    }
});

