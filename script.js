document.addEventListener('DOMContentLoaded', () => {
    const heroImageContainer = document.querySelector('.hero-image-container');
    const nav = document.querySelector('.main-nav');
    let lastScroll = 0;

    function updateAnimation() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Image scaling and positioning
        const scrollProgress = Math.min(scrollY / (windowHeight * 0.8), 1);
        const scale = 0.8 + (scrollProgress * 0.5);
        const translateY = -45 + (scrollProgress * 20);
        
        heroImageContainer.style.transform = `
            translate(-50%, ${translateY}%) 
            scale(${scale})
        `;

        // Navbar control
        if (scrollY > windowHeight * 0.6 && scrollY > lastScroll) {
            nav.classList.add('visible');
        } else {
            nav.classList.remove('visible');
        }
        lastScroll = scrollY;
    }

    function handleScroll() {
        requestAnimationFrame(updateAnimation);
    }

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();
});