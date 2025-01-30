document.addEventListener('DOMContentLoaded', () => {
    const heroImageContainer = document.querySelector('.hero-image-container');
    const nav = document.querySelector('.main-nav');
    const heroContent = document.querySelector('.hero-content');
    let lastScroll = 0;

    function updateAnimation() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Calculate scroll progress
        const scrollProgress = Math.min(scrollY / (windowHeight * 0.6), 1);
        
        // Image transformation
        const scale = 0.85 + (scrollProgress * 0.6);
        const translateY = scrollProgress * -25;
        
        heroImageContainer.style.transform = `
            scale(${scale})
            translateY(${translateY}px)
        `;

        // Content fade out
        heroContent.style.opacity = 1 - (scrollProgress * 1.5);
        heroContent.style.transform = `translateY(${scrollProgress * 50}px)`;

        // Navbar control
        if (scrollY > windowHeight * 0.4) {
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