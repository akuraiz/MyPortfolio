/* =========================================================
   HENG REAKSA PORTFOLIO — script.js
   Libraries:
   - GSAP + ScrollTrigger: scroll-driven animations
   - VanillaTilt: 3D tilt on cards (via HTML data-tilt attrs)
   - jQuery Terminal: interactive console
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ── REGISTER SCROLLTRIGGER ───────────────────────────────────
    gsap.registerPlugin(ScrollTrigger);

    // ── 1. DEFINE ALL ANIMATED ELEMENTS & SET INITIAL STATE ─────
    //
    // ONE source of truth: GSAP sets elements invisible here,
    // CSS never sets opacity:0 on these elements.
    //
    const heroEls = [
        { el: '.hero-eyebrow',  y: 20 },
        { el: '.hero-name',     y: 24 },
        { el: '.hero-sub',      y: 20 },
        { el: '.hero-cta',      y: 18 },
        { el: '.hero-tags',     y: 16 },
        { el: '.hero-visual',   x: 30, y: 0 },
    ];

    const scrollEls = [
        // About
        { el: '.about-img-col' },
        { el: '.about-text-col .section-eyebrow' },
        { el: '.about-text-col .section-title' },
        { el: '.about-body',         stagger: true },
        { el: '.about-stats' },
        // Now
        { el: '#now .section-eyebrow' },
        { el: '#now .section-title' },
        { el: '#now .section-desc' },
        { el: '#terminal-container' },
        // Projects
        { el: '#projects .section-eyebrow' },
        { el: '#projects .section-title' },
        { el: '.project-featured' },
        { el: '.project-card',        stagger: true },
        // Skills
        { el: '#skills .section-eyebrow' },
        { el: '#skills .section-title' },
        { el: '.skills-col',          stagger: true },
        // Goals
        { el: '#goals .section-eyebrow' },
        { el: '#goals .section-title' },
        { el: '.goal-item',           stagger: true },
        // Gaming
        { el: '#gaming .section-eyebrow' },
        { el: '#gaming .section-title' },
        { el: '.gaming-card',         stagger: true },
        // Contact
        { el: '#contact .section-eyebrow' },
        { el: '#contact .section-title' },
        { el: '#contact .section-desc' },
        { el: '.contact-link',        stagger: true },
    ];

    // Set all scroll elements invisible immediately (before paint)
    scrollEls.forEach(({ el }) => {
        const nodes = document.querySelectorAll(el);
        if (nodes.length) gsap.set(nodes, { opacity: 0, y: 22 });
    });

    // Set hero elements invisible
    heroEls.forEach(({ el, x = 0, y = 0 }) => {
        const nodes = document.querySelectorAll(el);
        if (nodes.length) gsap.set(nodes, { opacity: 0, x, y });
    });

    // ── 2. HERO ENTRANCE (runs once on load) ────────────────────
    const heroTl = gsap.timeline({ delay: 0.25 });
    heroEls.forEach(({ el, x = 0, y = 0 }, i) => {
        heroTl.to(el, {
            opacity: 1, x: 0, y: 0,
            duration: 0.75,
            ease: 'power2.out'
        }, i === 0 ? 0 : '-=0.45');
    });

    // ── 3. SCROLL REVEALS ────────────────────────────────────────
    scrollEls.forEach(({ el, stagger }) => {
        const nodes = document.querySelectorAll(el);
        if (!nodes.length) return;

        if (stagger && nodes.length > 1) {
            // Reveal group with stagger
            ScrollTrigger.create({
                trigger: nodes[0],
                start: 'top 90%',
                once: true,
                onEnter: () => {
                    gsap.to(nodes, {
                        opacity: 1, y: 0,
                        duration: 0.65,
                        stagger: 0.1,
                        ease: 'power2.out',
                    });
                },
            });
        } else {
            // Reveal each node individually
            nodes.forEach((node) => {
                ScrollTrigger.create({
                    trigger: node,
                    start: 'top 90%',
                    once: true,
                    onEnter: () => {
                        gsap.to(node, {
                            opacity: 1, y: 0,
                            duration: 0.7,
                            ease: 'power2.out',
                        });
                    },
                });
            });
        }
    });

    // ── 4. CANVAS PARTICLE BACKGROUND ───────────────────────────
    const canvas = document.getElementById('bg-canvas');
    const ctx    = canvas.getContext('2d');
    let W, H;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize, { passive: true });
    resize();

    const PARTICLE_COUNT = 55;
    const isLight = () => document.documentElement.classList.contains('light');

    class Particle {
        constructor() { this.reset(true); }
        reset(init = false) {
            this.x  = Math.random() * W;
            this.y  = init ? Math.random() * H : Math.random() * H;
            this.r  = Math.random() * 1.4 + 0.3;
            this.vx = (Math.random() - 0.5) * 0.18;
            this.vy = (Math.random() - 0.5) * 0.18;
            this.alpha = Math.random() * 0.4 + 0.05;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = isLight()
                ? `rgba(180,130,10,${this.alpha})`
                : `rgba(255,215,0,${this.alpha})`;
            ctx.fill();
        }
    }

    const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

    function drawConnections() {
        const MAX_DIST = 130;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST) {
                    const a = (1 - dist / MAX_DIST) * 0.07;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = isLight() ? `rgba(180,130,10,${a})` : `rgba(255,215,0,${a})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function renderCanvas() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConnections();
        requestAnimationFrame(renderCanvas);
    }

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        renderCanvas();
    } else {
        canvas.style.display = 'none';
    }

    // ── 5. CURSOR GLOW ──────────────────────────────────────────
    const cursorGlow = document.getElementById('cursor-glow');
    let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorGlow.style.opacity = '1';
    });
    document.addEventListener('mouseleave', () => { cursorGlow.style.opacity = '0'; });

    (function animateCursor() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top  = glowY + 'px';
        requestAnimationFrame(animateCursor);
    })();

    // ── 6. NAVBAR SCROLL STATE ───────────────────────────────────
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    // ── 7. HAMBURGER MENU ────────────────────────────────────────
    const hamburger = document.getElementById('nav-hamburger');
    const drawer    = document.getElementById('nav-drawer');
    hamburger.addEventListener('click', () => drawer.classList.toggle('open'));
    drawer.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => drawer.classList.remove('open'));
    });

    // ── 8. THEME TOGGLE ──────────────────────────────────────────
    const themeBtn = document.getElementById('theme-toggle');
    const iconMoon = document.getElementById('icon-moon');
    const iconSun  = document.getElementById('icon-sun');
    const html     = document.documentElement;

    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
        html.classList.add('light');
        iconMoon.style.display = 'none';
        iconSun.style.display  = 'block';
    }

    themeBtn.addEventListener('click', () => {
        html.classList.toggle('light');
        const light = html.classList.contains('light');
        localStorage.setItem('theme', light ? 'light' : 'dark');
        iconMoon.style.display = light ? 'none'  : 'block';
        iconSun.style.display  = light ? 'block' : 'none';
    });

    // ── 9. ORB MOUSE PARALLAX ───────────────────────────────────
    const orbWrapper = document.getElementById('orb-wrapper');
    if (orbWrapper) {
        document.addEventListener('mousemove', (e) => {
            const xRatio = (e.clientX / window.innerWidth  - 0.5) * 2;
            const yRatio = (e.clientY / window.innerHeight - 0.5) * 2;
            orbWrapper.style.transform = `rotateY(${xRatio * 10}deg) rotateX(${-yRatio * 8}deg)`;
        }, { passive: true });
    }

    // ── 10. BEFORE/AFTER SLIDER ──────────────────────────────────
    const sliderContainer = document.getElementById('ba-slider');
    if (sliderContainer) {
        const afterImg  = sliderContainer.querySelector('.ba-after');
        const divider   = document.getElementById('ba-divider');
        let isDragging  = false;

        function updateSlider(clientX) {
            const rect = sliderContainer.getBoundingClientRect();
            let pct = ((clientX - rect.left) / rect.width) * 100;
            pct = Math.max(2, Math.min(98, pct));
            afterImg.style.clipPath  = `inset(0 0 0 ${pct}%)`;
            divider.style.left       = `${pct}%`;
        }

        sliderContainer.addEventListener('mousedown',  (e) => { isDragging = true; updateSlider(e.clientX); });
        window.addEventListener('mouseup',   () => { isDragging = false; });
        window.addEventListener('mousemove', (e) => { if (isDragging) updateSlider(e.clientX); });
        sliderContainer.addEventListener('touchstart', (e) => { isDragging = true; updateSlider(e.touches[0].clientX); }, { passive: true });
        window.addEventListener('touchend',  () => { isDragging = false; });
        window.addEventListener('touchmove', (e) => { if (isDragging) updateSlider(e.touches[0].clientX); }, { passive: true });
    }

    // ── 11. INTERACTIVE TERMINAL ─────────────────────────────────
    $('#terminal-container').terminal(function(command, term) {
        const cmd = command.trim().toLowerCase();
        if (!cmd) { term.echo(''); return; }
        switch (cmd) {
            case 'help':
                term.echo('\n  [[;#FFD700;]Available Commands:]\n  [[;#888;]whoami ]  — About me\n  [[;#888;]ls     ]  — Current focuses\n  [[;#888;]skills ]  — Tech stack\n  [[;#888;]goals  ]  — Where I\'m headed\n  [[;#888;]clear  ]  — Clear terminal\n');
                break;
            case 'whoami':
                term.echo('\n  [[;#FFD700;]Heng Reaksa] — IT Student & Developer\n  Phnom Penh, Cambodia 🇰🇭\n\n  Curious, disciplined, and analytical. I build things to\n  understand them, and share what I learn with clarity.\n');
                break;
            case 'ls':
                term.echo('\n  [[;#FFD700;]Current Focuses:]\n  → Mastering full-stack web development (UX/UI design)\n  → Automating daily tasks with scripts\n  → Researching next-gen GPUs\n  → Building this very portfolio 🛠️\n');
                break;
            case 'skills':
                term.echo('\n  [[;#FFD700;]Tech Stack:]\n  Web   → HTML, CSS, JavaScript\n  Back  → PHP, Laravel, MySQL\n  Style → Tailwind CSS, Bootstrap\n  HW    → System builds, optimization, thermal mgmt\n');
                break;
            case 'goals':
                term.echo('\n  [[;#FFD700;]Where I\'m Headed:]\n  [01] Master full-stack dev & UX/UI\n  [02] Ship real-world impactful projects\n  [03] Become a well-rounded IT professional\n');
                break;
            case 'clear':
                term.clear();
                break;
            default:
                term.echo(`  Command not found: [[;#ff6b6b;]${command}]. Type [[;#FFD700;]help] for available commands.`);
        }
    }, {
        greetings: '[[;#FFD700;]┌─────────────────────────────────────┐]\n[[;#FFD700;]│   reaksa.dev — Interactive Console  │]\n[[;#FFD700;]└─────────────────────────────────────┘]\n\n  Type [[;#FFD700;]help] to get started.\n',
        name:   'reaksa_console',
        height: 220,
        width:  '100%',
        prompt: '[[;#FFD700;]visitor@reaksa.dev]:~$ ',
    });

    // ── 12. SMOOTH ANCHOR SCROLLING ──────────────────────────────
    const navH = navbar.offsetHeight;
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ── 13. NAV ACTIVE STATE ─────────────────────────────────────
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a, .nav-drawer a');
    new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
            }
        });
    }, { rootMargin: `-${navH}px 0px -50% 0px` }).observe(...sections) ;
    // observe each section
    sections.forEach(s => {
        new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
                }
            });
        }, { rootMargin: `-${navH}px 0px -50% 0px` }).observe(s);
    });

});
