const scrollContainer = document.querySelector('.scroll-container');
const imageWrapper = document.querySelector('.image-wrapper');

function updateScale() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Calculate scroll progress (0 to 1)
    const scrollProgress = Math.min(scrollY / windowHeight, 1);
    
    // Scale from 0.5 to 1
    const scale = 0.5 + (scrollProgress * 0.5);
    
    // Horizontal movement
    const translateX = -50 * (1 - scrollProgress);
    
    imageWrapper.style.transform = `
        translate(-50%, -50%) 
        translateX(${translateX}%) 
        scale(${scale})
    `;

    // Fade in container
    scrollContainer.style.opacity = Math.min(scrollY / 100, 1);
}

function debounce(func) {
    let ticking = false;
    return function() {
        if (!ticking) {
            requestAnimationFrame(() => {
                func();
                ticking = false;
            });
        }
        ticking = true;
    };
}

window.addEventListener('scroll', debounce(updateScale));
window.addEventListener('resize', debounce(updateScale));
updateScale();