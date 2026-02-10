document.addEventListener('DOMContentLoaded', () => {
    // --- MicroCMS Configuration ---
    const MICROCMS_SERVICE_DOMAIN = 'YOUR_SERVICE_DOMAIN';
    const MICROCMS_API_KEY = 'YOUR_API_KEY';

    // GSAP Registration
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger, TextPlugin);
    }

    const loader = document.getElementById('loader');
    const loaderText = document.querySelector('.loader-text');
    const path = window.location.pathname;
    const isHomePage = path.endsWith('index.html') || path === '/' || path.endsWith('nigra_inc_lp/') || path === '';

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('nav');
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('open');
            nav.classList.toggle('open');
            document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : 'visible';
        });
    }

    // Header Scroll
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });

    // Reveal Logic
    const startScrollAnimations = () => {
        if (typeof gsap === 'undefined') return;
        document.querySelectorAll('.reveal').forEach((el) => {
            gsap.to(el, {
                scrollTrigger: {
                    trigger: el,
                    start: "top 90%",
                    toggleActions: "play none none none"
                },
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out"
            });
        });
    };

    const forceShow = () => {
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }
        document.querySelectorAll('.reveal').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        document.body.style.overflow = 'visible';
    };
    window.onload = () => setTimeout(forceShow, 2000);

    // Initial Animation
    if (isHomePage && loader && loaderText && typeof gsap !== 'undefined') {
        const tl = gsap.timeline();
        tl.to(loaderText, {
            duration: 1.2,
            text: { value: "可能性を加速させる", delimiter: "" },
            ease: "none",
            delay: 0.3
        });
        tl.to(loader, {
            duration: 0.8,
            opacity: 0,
            delay: 0.5,
            ease: "power2.inOut",
            onComplete: () => {
                loader.style.display = 'none';
                startScrollAnimations();
                loadNews();
            }
        });
    } else {
        forceShow();
        startScrollAnimations();
        if (isHomePage) loadNews();
        if (path.includes('sportslink')) loadStudents();
    }

    // CMS: Fetch News
    async function loadNews() {
        const container = document.getElementById('home-news-list');
        if (!container) return;
        try {
            const res = await fetch(`https://${MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/news?limit=3`, {
                headers: { 'X-MICROCMS-API-KEY': MICROCMS_API_KEY }
            });
            const data = await res.json();
            if (data.contents) {
                container.innerHTML = '';
                data.contents.forEach(item => {
                    const date = new Date(item.date || item.createdAt).toLocaleDateString('ja-JP').replace(/\//g, '.');
                    const a = document.createElement('a');
                    a.href = `https://www.nigura.site/news-detail?id=${item.id}`;
                    a.className = 'news-item-link reveal';
                    a.innerHTML = `<div class="news-date">${date}</div><div class="news-title">${item.title}</div>`;
                    container.appendChild(a);
                });
                startScrollAnimations();
            }
        } catch (e) { console.error(e); }
    }

    // CMS: Fetch Students
    async function loadStudents() {
        const grid = document.getElementById('students-grid');
        if (!grid) return;
        try {
            const res = await fetch(`https://${MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/students`, {
                headers: { 'X-MICROCMS-API-KEY': MICROCMS_API_KEY }
            });
            const data = await res.json();
            if (data.contents) {
                grid.innerHTML = '';
                data.contents.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'student-card reveal';
                    card.innerHTML = `
                        <div class="student-img-wrap"><img src="${item.photo.url}" alt=""></div>
                        <div class="student-info">
                            <span class="student-sport">${item.sport}</span>
                            <h3>${item.name}</h3>
                            <p>${item.comment}</p>
                        </div>
                    `;
                    grid.appendChild(card);
                });
                startScrollAnimations();
            }
        } catch (e) { console.error(e); }
    }

    // SportsLink Tab Switcher
    const tabBtns = document.querySelectorAll('.sl-tab-btn');
    const tabContents = document.querySelectorAll('.sl-tab-content');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === target) {
                    content.classList.add('active');
                    gsap.fromTo(content, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 });
                }
            });
        });
    });
});
