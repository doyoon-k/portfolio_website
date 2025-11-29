// Import Supabase client
import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Game Dev Portfolio Loaded');

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href === '#') return; // Ignore empty anchors

            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Intersection Observer for Animations
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add fade-in animation to sections
    document.querySelectorAll('.section, .project-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Add visible class styles
    const style = document.createElement('style');
    style.innerHTML = `.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
    document.head.appendChild(style);

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(10, 10, 12, 0.95)';
            navbar.style.padding = '1rem 5%';
        } else {
            navbar.style.background = 'rgba(10, 10, 12, 0.9)';
            navbar.style.padding = '1.5rem 5%';
        }
    });

    // Modal Setup
    const modal = document.getElementById('projectModal');
    console.log('Modal element found:', modal); // Debug log
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.querySelector('.modal-close');

    function openModal(project) {
        const modal = document.getElementById('projectModal');
        const modalBody = document.getElementById('modalBody');

        if (!modal) {
            alert('Error: Modal element not found in DOM!');
            console.error('Modal element is missing');
            return;
        }

        console.log('Opening modal for:', project.title);
        // alert('Opening modal: ' + project.title); // Uncomment if needed

        modalBody.innerHTML = `
            ${project.image_url ? `<img src="${project.image_url}" alt="${project.title}" class="modal-image">` : ''}
            <h2>${project.title}</h2>
            <p class="tech-stack">${project.stack}</p>
            <p>${project.desc}</p>
        `;

        // Remove hidden class AND set display flex to ensure visibility
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
            closeModal();
        }
    });

    // Load Projects from Supabase
    const projectsContainer = document.querySelector('.projects-grid');

    async function loadProjects() {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;

            if (data && data.length > 0) {
                console.log('Projects loaded:', data.length);
                projectsContainer.innerHTML = '';

                data.forEach((project) => {
                    console.log('Rendering project:', project.title);
                    const card = document.createElement('article');
                    card.className = 'project-card';
                    card.innerHTML = `
                        <div class="card-image">
                            ${project.image_url ? `<img src="${project.image_url}" alt="${project.title}" style="width:100%; height:100%; object-fit:cover;">` : '<div class="placeholder-img"></div>'}
                        </div>
                        <div class="card-content">
                            <h3>${project.title}</h3>
                            <p class="tech-stack">${project.stack}</p>
                            <p>${project.desc}</p>
                            <a href="#" class="btn secondary-btn view-details-btn">View Details</a>
                        </div>
                    `;

                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';

                    projectsContainer.appendChild(card);
                    observer.observe(card);

                    // Add click event to button
                    const btn = card.querySelector('.view-details-btn');
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        console.log('View Details clicked for:', project.title); // Debug log
                        openModal(project);
                    });
                });
            }
        } catch (error) {
            console.log("Using static projects:", error.message);
        }
    }

    // Initialize
    if (projectsContainer) {
        loadProjects();
    }
});
