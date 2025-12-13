// ==================== INTRO SCREEN ====================
const introScreen = document.getElementById('intro');
const enterBtn = document.getElementById('enterBtn');
const logo3d = document.getElementById('logo3d');

let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;
let rotationX = 10;
let rotationY = 0;

// 3D Logo Drag Rotation
if (logo3d) {
    const container = document.querySelector('.logo-3d-container');
    
    // Mouse events
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
        logo3d.classList.add('dragging');
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - previousMouseX;
        const deltaY = e.clientY - previousMouseY;
        
        rotationY += deltaX * 0.5;
        rotationX -= deltaY * 0.5;
        
        logo3d.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
        
        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        logo3d.classList.remove('dragging');
    });
    
    // Touch events
    container.addEventListener('touchstart', (e) => {
        isDragging = true;
        previousMouseX = e.touches[0].clientX;
        previousMouseY = e.touches[0].clientY;
        logo3d.classList.add('dragging');
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.touches[0].clientX - previousMouseX;
        const deltaY = e.touches[0].clientY - previousMouseY;
        
        rotationY += deltaX * 0.5;
        rotationX -= deltaY * 0.5;
        
        logo3d.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
        
        previousMouseX = e.touches[0].clientX;
        previousMouseY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', () => {
        isDragging = false;
        logo3d.classList.remove('dragging');
    });
}

// Enter button click
if (enterBtn) {
    enterBtn.addEventListener('click', startLoading);
    
    // Also allow Enter key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && introScreen && !introScreen.classList.contains('hidden')) {
            startLoading();
        }
    });
}

function startLoading() {
    // Hide intro
    introScreen.classList.add('hidden');
    
    // Show and start loading animation
    const loader = document.querySelector('.loader');
    loader.style.display = 'flex';
    loader.style.opacity = '1';
    loader.style.pointerEvents = 'auto';
    
    // After loading, show main content
    setTimeout(() => {
        loader.classList.add('hidden');
        document.body.classList.add('loaded');
        initAnimations();
    }, 2000);
}

// ==================== LOADING SCREEN ====================
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');
    // Initially hide loader until intro is clicked
    loader.style.opacity = '0';
    loader.style.pointerEvents = 'none';
});

// ==================== PARTICLE SYSTEM ====================
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
let mouseX = 0;
let mouseY = 0;
let isTouch = false;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = Math.random() > 0.5 ? '#00f5d4' : '#7b2cbf';
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Mouse interaction (only on desktop)
        if (!isTouch) {
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                this.x -= dx * force * 0.02;
                this.y -= dy * force * 0.02;
            }
        }
        
        // Wrap around screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Create particles (fewer on mobile for performance)
const particleCount = window.innerWidth < 768 ? 30 : 60;
for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 120) {
                ctx.beginPath();
                ctx.strokeStyle = '#00f5d4';
                ctx.globalAlpha = 0.1 * (1 - distance / 120);
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    connectParticles();
    requestAnimationFrame(animateParticles);
}

animateParticles();

// Track mouse position
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Detect touch device
document.addEventListener('touchstart', () => {
    isTouch = true;
}, { once: true });

// ==================== CUSTOM CURSOR ====================
// Custom cursor is now handled via CSS cursor property
// This provides a cursor that cannot be blocked by 3D transforms or z-index issues

// ==================== NAVIGATION ====================
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-link');
const mobileOverlay = document.querySelector('.mobile-menu-overlay');

// Scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
    updateActiveNavLink();
});

// Mobile menu toggle
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
}

hamburger.addEventListener('click', toggleMobileMenu);

// Keyboard accessibility for hamburger
hamburger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMobileMenu();
    }
});

// Close menu on overlay click
mobileOverlay.addEventListener('click', toggleMobileMenu);

// Close mobile menu when clicking a link
navLinksItems.forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) {
            toggleMobileMenu();
        }
    });
});

// Close menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        toggleMobileMenu();
    }
});

// Update active navigation link
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const scrollPos = window.scrollY + 150;
    
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        
        if (scrollPos >= top && scrollPos < top + height) {
            navLinksItems.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ==================== BACK TO TOP BUTTON ====================
const backToTop = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ==================== TYPEWRITER EFFECT ====================
const dynamicText = document.querySelector('.dynamic-text');
const words = ['Creative', 'Developer', 'Designer', 'Innovator', 'Tech Enthusiast', 'Problem Solver'];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 100;

function typeWriter() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
        dynamicText.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50;
    } else {
        dynamicText.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 100;
    }
    
    if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        typeSpeed = 2000;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500;
    }
    
    setTimeout(typeWriter, typeSpeed);
}

// ==================== COUNTER ANIMATION ====================
const statNumbers = document.querySelectorAll('.stat-number');
let countersAnimated = false;

function animateCounters() {
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                stat.textContent = Math.floor(current) + '+';
                requestAnimationFrame(updateCounter);
            } else {
                stat.textContent = target + '+';
            }
        };
        
        updateCounter();
    });
}

// ==================== SKILL PROGRESS BARS ====================
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
        const progress = bar.getAttribute('data-progress');
        bar.style.width = progress + '%';
    });
}

// ==================== SCROLL ANIMATIONS ====================
function initAnimations() {
    // Start typewriter after loading
    setTimeout(typeWriter, 500);
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Counter animation
                if (entry.target.classList.contains('about') && !countersAnimated) {
                    countersAnimated = true;
                    setTimeout(animateCounters, 300);
                }
                
                // Progress bars animation
                if (entry.target.classList.contains('skills')) {
                    setTimeout(animateProgressBars, 500);
                }
                
                // Terminal animation
                if (entry.target.classList.contains('terminal')) {
                    animateTerminal();
                }
            }
        });
    }, observerOptions);

    // Elements to observe
    const animatedElements = document.querySelectorAll(
        '.skill-card, .contact-link, .about-content, .section-header, .stat, .terminal, .about, .skills, .hero-text > *, .hero-image'
    );
    
    animatedElements.forEach(el => {
        if (!el.classList.contains('animate')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        }
        observer.observe(el);
    });

    // Add animate styles
    const style = document.createElement('style');
    style.textContent = `
        .animate {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// ==================== TERMINAL TYPING EFFECT ====================
const terminalCommands = document.querySelectorAll('.terminal-body p');
let terminalAnimated = false;

function animateTerminal() {
    if (terminalAnimated) return;
    terminalAnimated = true;
    
    terminalCommands.forEach((cmd, index) => {
        cmd.style.opacity = '0';
        cmd.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            cmd.style.opacity = '1';
        }, index * 200);
    });
}

// ==================== SMOOTH SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ==================== MAGNETIC BUTTON EFFECT (Desktop) ====================
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const magneticElements = document.querySelectorAll('.magnetic');
    
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
        });
    });
}

// ==================== TILT EFFECT ON CARDS (Desktop) ====================
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const tiltElements = document.querySelectorAll('[data-tilt]');
    
    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const maxTilt = parseFloat(el.getAttribute('data-tilt-max')) || 10;
            const rotateX = ((y - centerY) / centerY) * maxTilt;
            const rotateY = ((centerX - x) / centerX) * maxTilt;
            
            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

// ==================== BUTTON RIPPLE EFFECT ====================
const rippleButtons = document.querySelectorAll('.btn-secondary');

rippleButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
        const ripple = this.querySelector('.btn-ripple');
        if (!ripple) return;
        
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.transform = 'scale(0)';
        
        setTimeout(() => {
            ripple.style.transition = 'transform 0.6s ease';
            ripple.style.transform = 'scale(4)';
        }, 10);
        
        setTimeout(() => {
            ripple.style.transform = 'scale(0)';
            ripple.style.transition = 'none';
        }, 600);
    });
});

// ==================== TOUCH FEEDBACK ====================
if ('ontouchstart' in window) {
    const touchElements = document.querySelectorAll('.btn, .contact-link, .skill-card, .social-link, .social-icon');
    
    touchElements.forEach(el => {
        el.addEventListener('touchstart', () => {
            el.style.transform = 'scale(0.98)';
        }, { passive: true });
        
        el.addEventListener('touchend', () => {
            el.style.transform = '';
        }, { passive: true });
    });
}

// ==================== PARALLAX ON SCROLL ====================
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.scrollY;
            
            // Parallax for floating shapes
            const shapes = document.querySelectorAll('.floating-shapes span');
            shapes.forEach((shape, index) => {
                const speed = 0.03 * (index + 1);
                shape.style.transform = `translateY(${scrolled * speed}px)`;
            });
            
            ticking = false;
        });
        ticking = true;
    }
});

// ==================== EASTER EGG - KONAMI CODE ====================
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.code === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateEasterEgg();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateEasterEgg() {
    // Rainbow mode!
    document.body.style.animation = 'rainbow 2s linear infinite';
    
    // Confetti effect
    for (let i = 0; i < 50; i++) {
        createConfetti();
    }
    
    setTimeout(() => {
        document.body.style.animation = '';
    }, 5000);
}

function createConfetti() {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${['#00f5d4', '#7b2cbf', '#f72585'][Math.floor(Math.random() * 3)]};
        left: ${Math.random() * 100}vw;
        top: -10px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        pointer-events: none;
        z-index: 10003;
        animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
    `;
    document.body.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 4000);
}

// Add confetti animation
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
    @keyframes confetti-fall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(confettiStyle);

// ==================== VIBRATION FEEDBACK (Mobile) ====================
function vibrate(duration = 10) {
    if ('vibrate' in navigator) {
        navigator.vibrate(duration);
    }
}

// Add vibration to buttons on mobile
if ('ontouchstart' in window) {
    const vibrateElements = document.querySelectorAll('.btn, .social-link, .social-icon');
    vibrateElements.forEach(el => {
        el.addEventListener('touchstart', () => vibrate(10), { passive: true });
    });
}

// ==================== 3D SCENE PARALLAX ====================
const scene3D = document.querySelector('.scene-3d');

if (scene3D && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        
        // Move 3D elements based on mouse position
        const cubes = scene3D.querySelectorAll('.floating-cube');
        const pyramid = scene3D.querySelector('.floating-pyramid');
        const rings = scene3D.querySelectorAll('.floating-ring');
        const sphere = scene3D.querySelector('.floating-sphere');
        
        cubes.forEach((cube, index) => {
            const depth = (index + 1) * 0.5;
            cube.style.transform = `
                translateX(${mouseX * 30 * depth}px)
                translateY(${mouseY * 30 * depth}px)
                rotateX(${mouseY * 10}deg)
                rotateY(${mouseX * 10}deg)
            `;
        });
        
        if (pyramid) {
            pyramid.style.transform = `
                translateX(${mouseX * 20}px)
                translateY(${mouseY * 20}px)
                rotateY(${mouseX * 20}deg)
            `;
        }
        
        rings.forEach((ring, index) => {
            const depth = (index + 1) * 0.3;
            ring.style.transform = `
                rotateX(70deg)
                rotateZ(${mouseX * 30 * depth}deg)
                translateX(${mouseX * 15}px)
                translateY(${mouseY * 15}px)
            `;
        });
        
        if (sphere) {
            sphere.style.transform = `
                translateX(${mouseX * 40}px)
                translateY(${mouseY * 40}px)
            `;
        }
    });
}

// ==================== 3D CARD TILT EFFECT ENHANCEMENT ====================
// Simplified to prevent glitchy behavior
const cards3D = document.querySelectorAll('.card-3d');

cards3D.forEach(card => {
    card.addEventListener('mouseenter', () => {
        const glow = card.querySelector('.card-glow');
        if (glow) {
            glow.style.opacity = '0.4';
        }
    });
    
    card.addEventListener('mouseleave', () => {
        const glow = card.querySelector('.card-glow');
        if (glow) {
            glow.style.opacity = '';
        }
    });
});

// ==================== 3D TEXT DEPTH EFFECT ====================
const text3DElements = document.querySelectorAll('.text-3d');

text3DElements.forEach(text => {
    text.addEventListener('mousemove', (e) => {
        const rect = text.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        text.style.transform = `
            translateZ(30px)
            rotateX(${-y / 20}deg)
            rotateY(${x / 20}deg)
        `;
    });
    
    text.addEventListener('mouseleave', () => {
        text.style.transform = '';
    });
});

