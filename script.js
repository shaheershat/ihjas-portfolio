// --- INITIALIZATION ---
window.addEventListener('load', () => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Remove Loader
    gsap.to('#loader', {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
            document.getElementById('loader').style.display = 'none';
            initAnimations();
        }
    });

    // Show Cookie Bar
    setTimeout(() => {
        const cb = document.getElementById('cookie-bar');
        cb.classList.remove('hidden');
        gsap.from(cb, { y: 100, opacity: 0, duration: 0.5 });
    }, 2000);
});

// --- NAVIGATION ROUTING ---
const sections = document.querySelectorAll('.page-section');
const navLinks = document.querySelectorAll('[data-page]');
const mobileMenu = document.getElementById('mobile-menu');
const menuToggle = document.getElementById('menu-toggle');

function navigateTo(pageId, filter = null) {
    // Smooth transition
    gsap.to('main', { opacity: 0, y: 20, duration: 0.3, onComplete: () => {
        sections.forEach(s => s.classList.remove('active'));
        const target = document.getElementById(pageId);
        if (target) {
            target.classList.add('active');
            window.scrollTo(0, 0);
            
            // Handle Navigation Active State
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.toggle('active', link.getAttribute('data-page') === pageId);
            });

            // If filter provided for portfolio
            if (pageId === 'portfolio' && filter) {
                applyFilter(filter);
            }
        }
        
        gsap.to('main', { opacity: 1, y: 0, duration: 0.5 });
        closeMobileMenu();
        ScrollTrigger.refresh();
    }});
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('data-page');
        const filter = link.getAttribute('data-filter');
        navigateTo(pageId, filter);
    });
});

// --- MOBILE MENU LOGIC ---
function toggleMobileMenu() {
    mobileMenu.classList.toggle('open');
}
function closeMobileMenu() {
    mobileMenu.classList.remove('open');
}
menuToggle.addEventListener('click', toggleMobileMenu);

// --- PORTFOLIO FILTERING ---
const filterBtns = document.querySelectorAll('.filter-btn');
const portCards = document.querySelectorAll('.portfolio-card');

function applyFilter(category) {
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-category') === category);
    });

    gsap.to(portCards, {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        stagger: 0.05,
        onComplete: () => {
            portCards.forEach(card => {
                const cat = card.getAttribute('data-cat');
                if (category === 'all' || cat === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
            gsap.to(portCards, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.05 });
        }
    });
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        applyFilter(btn.getAttribute('data-category'));
    });
});

// --- GSAP SCROLL ANIMATIONS ---
function initAnimations() {
    // Text Highlight Animations
    gsap.utils.toArray('.reveal-text').forEach(text => {
        gsap.from(text, {
            scrollTrigger: {
                trigger: text,
                start: "top 90%",
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power4.out"
        });
    });

    gsap.utils.toArray('.reveal-item').forEach(item => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: "top 95%",
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            delay: 0.2
        });
    });

    // Sticky Nav Scroll effect
    ScrollTrigger.create({
        start: 'top -80',
        onUpdate: (self) => {
            const nav = document.getElementById('main-nav');
            if (self.direction === 1) {
                gsap.to(nav, { y: -100, duration: 0.3 });
            } else {
                gsap.to(nav, { y: 0, duration: 0.3 });
            }
        }
    });
}

// --- MODAL & COOKIE HELPERS ---
function closeCookie() {
    gsap.to('#cookie-bar', { y: 100, opacity: 0, duration: 0.5, onComplete: () => {
        document.getElementById('cookie-bar').style.display = 'none';
    }});
}

const videoModal = document.getElementById('video-modal');
const closeModalBtn = document.getElementById('close-modal');

portCards.forEach(card => {
    card.addEventListener('click', () => {
        videoModal.classList.remove('pointer-events-none');
        gsap.to(videoModal, { opacity: 1, duration: 0.4 });
    });
});

closeModalBtn.addEventListener('click', () => {
    gsap.to(videoModal, { opacity: 0, duration: 0.3, onComplete: () => {
        videoModal.classList.add('pointer-events-none');
    }});
});

// --- FORM SUBMISSION ---
document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;

    // UI feedback
    const btn = form.querySelector('button');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = 'Sending...';

    // EmailJS configuration - REPLACE these placeholders with your actual IDs
    const EMAILJS_USER_ID = 'eUsNUmTQhBZ6R0gJJ'; // e.g. 'user_xxxxx' or public key
    const EMAILJS_SERVICE_ID = 'service_7qz7z3k';
    const EMAILJS_TEMPLATE_ID = 'template_w21noml';

    if (typeof emailjs === 'undefined') {
        console.error('EmailJS SDK not loaded. Make sure the EmailJS script is included.');
        btn.innerText = 'Unable to send';
        setTimeout(() => { btn.innerText = originalText; btn.disabled = false; }, 3000);
        return;
    }

    try {
        // Initialize EmailJS (safe to call multiple times)
        if (EMAILJS_USER_ID && EMAILJS_USER_ID !== 'YOUR_EMAILJS_USER_ID') {
            emailjs.init(EMAILJS_USER_ID);
        }

        // Send the form using EmailJS. The form field names must match the template variables.
        emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
            .then(() => {
                btn.innerText = "Sent! I'll be in touch.";
                btn.classList.add('bg-lime-green');
                form.reset();
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.classList.remove('bg-lime-green');
                    btn.disabled = false;
                }, 5000);
            }, (err) => {
                console.error('EmailJS error:', err);
                btn.innerText = 'Send failed';
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                }, 4000);
            });
    } catch (err) {
        console.error('Unexpected error while sending email:', err);
        btn.innerText = 'Send failed';
        setTimeout(() => { btn.innerText = originalText; btn.disabled = false; }, 3000);
    }
});

/* Minimal client-side app: Supabase init, fetch videos, render cards, realtime subscribe, like updates,
   modal open/close, filter buttons, mobile menu toggle, cookie close.
   Replace SUPABASE_URL and SUPABASE_ANON_KEY with your credentials.
*/
document.addEventListener('DOMContentLoaded', () => {
	// Safe selector helpers
	const qs = (sel) => document.querySelector(sel);
	const qsa = (sel) => Array.from(document.querySelectorAll(sel));

	// Menu toggle: show target section, hide others
	const menuButtons = qsa('.menu-btn');
	const sections = qsa('.menu-section');

	if (menuButtons.length === 0 || sections.length === 0) {
		console.warn('Menu buttons or sections missing');
		return;
	}

	menuButtons.forEach(btn => {
		btn.addEventListener('click', (e) => {
			const target = btn.dataset.target;
			if (!target) return;
			sections.forEach(s => {
				if (s.id === target) s.classList.remove('hidden');
				else s.classList.add('hidden');
			});
			// Optional: animate if gsap available
			if (typeof gsap !== 'undefined') {
				const el = document.getElementById(target);
				if
