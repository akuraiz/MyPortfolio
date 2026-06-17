/* =========================================================
   HENG REAKSA PORTFOLIO — script.js
   Libraries used:
   - GSAP + ScrollTrigger: scroll-driven reveal animations
   - VanillaTilt: 3D tilt on project/skill cards (already initialized via HTML attrs)
   - jQuery Terminal: interactive terminal in the "Now" section
   ========================================================= */

/* ── WAIT FOR DOM ── */
document.addEventListener('DOMContentLoaded', () => {

    // ── 1. CURSOR GLOW ──────────────────────────────────────────
    const cursorGlow = document.getElementById('cursor-glow');
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorGlow.style.opacity = '1';
    });
    document.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
    });

    // Smooth cursor glow follow
    function animateCursor() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top  = glowY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // ── 2. CANVAS PARTICLE BACKGROUND ───────────────────────────
    const canvas = document.getElementById('bg-canvas');
    const ctx    = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const PARTICLE_COUNT = 55;
    const isLight = () => document.documentElement.classList.contains('light');

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x  = Math.random() * W;
            this.y  = Math.random() * H;
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
            const col = isLight() ? `rgba(180,130,10,${this.alpha})` : `rgba(255,215,0,${this.alpha})`;
            ctx.fillStyle = col;
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    function drawConnections() {
        const MAX_DIST = 130;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST) {
                    const alpha = (1 - dist / MAX_DIST) * 0.08;
                    const col = isLight() ? `rgba(180,130,10,${alpha})` : `rgba(255,215,0,${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = col;
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
    renderCanvas();

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        canvas.style.display = 'none';
    }

    // ── 3. NAVBAR SCROLL EFFECT ──────────────────────────────────
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    // ── 4. HAMBURGER MENU ────────────────────────────────────────
    const hamburger = document.getElementById('nav-hamburger');
    const drawer    = document.getElementById('nav-drawer');
    hamburger.addEventListener('click', () => {
        drawer.classList.toggle('open');
    });
    drawer.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => drawer.classList.remove('open'));
    });

    // ── 5. THEME TOGGLE ──────────────────────────────────────────
    const themeBtn  = document.getElementById('theme-toggle');
    const iconMoon  = document.getElementById('icon-moon');
    const iconSun   = document.getElementById('icon-sun');
    const html      = document.documentElement;

    // Restore saved theme
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
        html.classList.add('light');
        iconMoon.style.display = 'none';
        iconSun.style.display  = 'block';
    }

    themeBtn.addEventListener('click', () => {
        html.classList.toggle('light');
        const isLight = html.classList.contains('light');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        iconMoon.style.display = isLight ? 'none' : 'block';
        iconSun.style.display  = isLight ? 'block' : 'none';
    });

    // ── 6. ORB MOUSE PARALLAX ───────────────────────────────────
    const orbWrapper = document.getElementById('orb-wrapper');
    if (orbWrapper) {
        document.addEventListener('mousemove', (e) => {
            const { innerWidth: W, innerHeight: H } = window;
            const xRatio = (e.clientX / W - 0.5) * 2;
            const yRatio = (e.clientY / H - 0.5) * 2;
            orbWrapper.style.transform = `rotateY(${xRatio * 10}deg) rotateX(${-yRatio * 8}deg)`;
        });
    }

    // ── 7. GSAP + SCROLLTRIGGER ANIMATIONS ──────────────────────
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance sequence
    const heroTl = gsap.timeline({ delay: 0.3 });
    heroTl
        .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' })
        .to('.hero-name',    { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4')
        .to('.hero-sub',     { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4')
        .to('.hero-cta',     { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.35')
        .to('.hero-tags',    { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
        .to('.hero-visual',  { opacity: 1, x: 0, duration: 0.9, ease: 'power2.out' }, '-=0.6');

    // Generic scroll-triggered reveal for all [data-gsap] elements
    // (excluding hero elements already animated above)
    const scrollEls = document.querySelectorAll('[data-gsap]:not(.hero [data-gsap])');

    scrollEls.forEach(el => {
        const delay = parseFloat(el.dataset.delay || '0');
        const dir   = el.dataset.gsap;

        let fromVars = { opacity: 0, duration: 0.75, delay, ease: 'power2.out' };
        if (dir === 'fade-up')    fromVars.y = 24;
        if (dir === 'fade-left')  fromVars.x = 30;
        if (dir === 'fade-right') fromVars.x = -30;

        ScrollTrigger.create({
            trigger: el,
            start: 'top 88%',
            once: true,
            onEnter: () => gsap.to(el, fromVars),
        });
    });

    // Stats count-up on scroll into view
    const statNums = document.querySelectorAll('.stat-num');
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.textContent;
                const num = parseFloat(text);
                if (!isNaN(num) && !el.dataset.counted) {
                    el.dataset.counted = true;
                    gsap.from({ val: 0 }, {
                        val: num,
                        duration: 1.2,
                        ease: 'power2.out',
                        onUpdate: function() {
                            el.textContent = Math.round(this.targets()[0].val) + (text.includes('+') ? '+' : (text.includes('th') ? 'th' : ''));
                        }
                    });
                }
                statObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    statNums.forEach(el => statObserver.observe(el));

    // Project featured card reveal
    ScrollTrigger.create({
        trigger: '.project-featured',
        start: 'top 88%',
        once: true,
        onEnter: () => gsap.to('.project-featured', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }),
    });

    // Gaming cards
    document.querySelectorAll('.gaming-card').forEach((el, i) => {
        ScrollTrigger.create({
            trigger: el,
            start: 'top 88%',
            once: true,
            onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.7, delay: i * 0.12, ease: 'power2.out' }),
        });
    });

    // Terminal container
    ScrollTrigger.create({
        trigger: '#terminal-container',
        start: 'top 88%',
        once: true,
        onEnter: () => gsap.to('#terminal-container', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }),
    });

    // About stats
    ScrollTrigger.create({
        trigger: '.about-stats',
        start: 'top 88%',
        once: true,
        onEnter: () => gsap.to('.about-stats', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }),
    });
    document.querySelectorAll('.about-body').forEach((el, i) => {
        ScrollTrigger.create({
            trigger: el,
            start: 'top 88%',
            once: true,
            onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.65, delay: i * 0.1, ease: 'power2.out' }),
        });
    });

    // Project cards
    document.querySelectorAll('.project-card').forEach((el, i) => {
        ScrollTrigger.create({
            trigger: el,
            start: 'top 88%',
            once: true,
            onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.7, delay: i * 0.12, ease: 'power2.out' }),
        });
    });

    // Goal items
    document.querySelectorAll('.goal-item').forEach((el, i) => {
        ScrollTrigger.create({
            trigger: el,
            start: 'top 88%',
            once: true,
            onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.65, delay: i * 0.1, ease: 'power2.out' }),
        });
    });

    // ── 8. BEFORE / AFTER SLIDER ─────────────────────────────────
    const sliderContainer = document.getElementById('ba-slider');
    if (sliderContainer) {
        const afterImg  = sliderContainer.querySelector('.ba-after');
        const divider   = document.getElementById('ba-divider');
        let isDragging  = false;

        function updateSlider(clientX) {
            const rect = sliderContainer.getBoundingClientRect();
            let pct = ((clientX - rect.left) / rect.width) * 100;
            pct = Math.max(2, Math.min(98, pct));
            afterImg.style.clipPath = `inset(0 0 0 ${pct}%)`;
            divider.style.left      = `${pct}%`;
        }

        sliderContainer.addEventListener('mousedown', (e) => { isDragging = true; updateSlider(e.clientX); });
        window.addEventListener('mouseup',   () => { isDragging = false; });
        window.addEventListener('mousemove', (e) => { if (isDragging) updateSlider(e.clientX); });

        // Touch events
        sliderContainer.addEventListener('touchstart', (e) => { isDragging = true; updateSlider(e.touches[0].clientX); }, { passive: true });
        window.addEventListener('touchend',   () => { isDragging = false; });
        window.addEventListener('touchmove',  (e) => { if (isDragging) updateSlider(e.touches[0].clientX); }, { passive: true });
    }

    // ── 9. INTERACTIVE TERMINAL ──────────────────────────────────
    $('#terminal-container').terminal(function(command, term) {
        const cmd = command.trim().toLowerCase();
        if (!cmd) { term.echo(''); return; }

        switch (cmd) {
            case 'help':
                term.echo([
                    '',
                    '  [[;#FFD700;]Available Commands:]',
                    '  [[;#888;]whoami ]   — About me',
                    '  [[;#888;]ls      ]   — Current focuses',
                    '  [[;#888;]skills  ]   — My tech stack',
                    '  [[;#888;]goals   ]   — Where I\'m headed',
                    '  [[;#888;]clear   ]   — Clear terminal',
                    '',
                ].join('\n'));
                break;

            case 'whoami':
                term.echo([
                    '',
                    '  [[;#FFD700;]Heng Reaksa] — IT Student & Developer',
                    '  Phnom Penh, Cambodia 🇰🇭',
                    '',
                    '  Curious, disciplined, and analytical. I build things to',
                    '  understand them, and share what I learn with clarity.',
                    '',
                ].join('\n'));
                break;

            case 'ls':
                term.echo([
                    '',
                    '  [[;#FFD700;]Current Focuses:]',
                    '  → Mastering full-stack web development (UX/UI design)',
                    '  → Automating daily tasks with scripts',
                    '  → Researching next-gen GPUs',
                    '  → Building this very portfolio 🛠️',
                    '',
                ].join('\n'));
                break;

            case 'skills':
                term.echo([
                    '',
                    '  [[;#FFD700;]Tech Stack:]',
                    '  Web   → HTML, CSS, JavaScript',
                    '  Back  → PHP, Laravel, MySQL',
                    '  Style → Tailwind CSS, Bootstrap',
                    '  HW    → System builds, optimization, thermal mgmt',
                    '',
                ].join('\n'));
                break;

            case 'goals':
                term.echo([
                    '',
                    '  [[;#FFD700;]Where I\'m Headed:]',
                    '  [01] Master full-stack dev & UX/UI',
                    '  [02] Ship real-world impactful projects',
                    '  [03] Become a well-rounded IT professional',
                    '',
                ].join('\n'));
                break;

            case 'clear':
                term.clear();
                break;

            default:
                term.echo(`  Command not found: [[;#ff6b6b;]${command}]. Type [[;#FFD700;]help] to see available commands.`);
        }
    }, {
        greetings: [
            '[[;#FFD700;]┌─────────────────────────────────────┐]',
            '[[;#FFD700;]│   reaksa.dev — Interactive Console  │]',
            '[[;#FFD700;]└─────────────────────────────────────┘]',
            '',
            "  Type [[;#FFD700;]help] to see what's available.",
            '',
        ].join('\n'),
        name:    'reaksa_console',
        height:  220,
        width:   '100%',
        prompt:  '[[;#FFD700;]visitor@reaksa.dev]:~$ ',
    });

    // ── 10. SMOOTH ANCHOR LINKS ──────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const navH = document.getElementById('navbar').offsetHeight;
                const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ── 11. NAV LINK ACTIVE STATE ────────────────────────────────
    const sections  = document.querySelectorAll('section[id]');
    const navLinks  = document.querySelectorAll('.nav-links a, .nav-drawer a');
    const navH      = document.getElementById('navbar').offsetHeight;

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(a => {
                    a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
                });
                if (entry.target.dataset.title) {
                    document.title = entry.target.dataset.title;
                }
            }
        });
    }, { rootMargin: `-${navH}px 0px -50% 0px` });

    sections.forEach(s => sectionObserver.observe(s));

    // ── 12. BUTTON HOVER MICRO-INTERACTION ───────────────────────
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            gsap.to(this, { scale: 1.03, duration: 0.2, ease: 'power1.out' });
        });
        btn.addEventListener('mouseleave', function() {
            gsap.to(this, { scale: 1, duration: 0.25, ease: 'power1.out' });
        });
    });

});
