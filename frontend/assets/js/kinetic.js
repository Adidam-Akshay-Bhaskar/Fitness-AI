/*
   FITFUTURE KINETIC ENGINE
   Lightweight observer for scroll fades and nav styling
*/

document.addEventListener('DOMContentLoaded', () => {

    // 1. Navigation Scroll Effect
    const nav = document.getElementById('mainNav');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    // 2. Scroll Fade Observers
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.15
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Unobserve after showing so it stays visible
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in-scroll');
    fadeElements.forEach(el => fadeObserver.observe(el));

    // 3. Smooth Anchor Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // 4. AUTH SIDE DRAWER LOGIC
    window.openAuthDrawer = function(type) {
        const drawer = document.getElementById('authDrawer');
        const overlay = document.getElementById('authOverlay');
        const frame = document.getElementById('authFrame');
        
        // Load the correct page into iframe
        frame.src = (type === 'login') ? 'login.html' : 'register.html';
        
        // Show the drawer
        overlay.classList.add('active');
        drawer.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent main page scrolling
    }

    window.closeAuthDrawer = function() {
        const drawer = document.getElementById('authDrawer');
        const overlay = document.getElementById('authOverlay');
        const frame = document.getElementById('authFrame');
        
        overlay.classList.remove('active');
        drawer.classList.remove('active');
        document.body.style.overflow = 'auto'; // Re-enable main page scrolling
        
        // Clear frame after transition to avoid old content flash next time
        setTimeout(() => { frame.src = ''; }, 500);
    }

    // Escape key listener to close drawer
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAuthDrawer();
        }
    });

});
