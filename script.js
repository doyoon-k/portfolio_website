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

    // Helper to strip HTML tags for card preview
    const extractText = (html) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

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
            return;
        }

        console.log('Opening modal for:', project.title);

        function convertDriveLinksToIframes(htmlStr) {
            if (!htmlStr) return '';
            const div = document.createElement('div');
            div.innerHTML = htmlStr;

            // 1. Replace <a> tags
            div.querySelectorAll('a').forEach(a => {
                const match = a.href.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
                if (match) {
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://drive.google.com/file/d/${match[1]}/preview`;
                    iframe.width = "100%";
                    iframe.height = "480";
                    iframe.style.border = "none";
                    iframe.style.borderRadius = "8px";
                    iframe.style.margin = "1rem 0";
                    iframe.allowFullscreen = true;
                    a.replaceWith(iframe);
                }
            });

            // 2. Replace plain text URLs
            const walk = document.createTreeWalker(div, NodeFilter.SHOW_TEXT, null, false);
            const nodesToReplace = [];
            let n;
            while(n = walk.nextNode()) {
                if (n.parentNode && n.parentNode.tagName === 'A') continue; // Skip if inside anchor just in case
                const text = n.nodeValue;
                const regex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/[^\s&<"']*/g;
                if (regex.test(text)) {
                    nodesToReplace.push(n);
                }
            }

            nodesToReplace.forEach(n => {
                const wrapper = document.createElement('span');
                wrapper.innerHTML = n.nodeValue.replace(/https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/[^\s&<"']*/g, 
                    '<iframe src="https://drive.google.com/file/d/$1/preview" width="100%" height="480" allowfullscreen style="border:none; border-radius:8px; margin: 1rem 0;"></iframe>'
                );
                n.replaceWith(...wrapper.childNodes);
            });

            return div.innerHTML;
        }

        modalBody.innerHTML = `
            ${project.image_url ? `<img src="${project.image_url}" alt="${project.title}" class="modal-image">` : ''}
            <h2>${project.title}</h2>
            <p class="tech-stack">${project.stack}</p>
            <div class="rich-content">${convertDriveLinksToIframes(project.desc)}</div>
        `;

        // Apply syntax highlighting
        modalBody.querySelectorAll('pre').forEach((block) => {
            // Check if Tistory gave us a bare <pre> without <code>
            if (!block.querySelector('code')) {
                const code = document.createElement('code');
                code.className = block.className; // inherit language class if any
                code.innerHTML = block.innerHTML;
                block.innerHTML = '';
                block.appendChild(code);
            }
        });
        
        // Let highlight.js process all code blocks
        if (typeof hljs !== 'undefined') {
            modalBody.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }

        // Force styles directly via JS to bypass CSS issues
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
        modal.style.zIndex = '10000';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';

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
                    let thumbnailHtml = '<div class="placeholder-img"></div>';
                    
                    if (project.image_url) {
                        thumbnailHtml = `<img src="${project.image_url}" alt="${project.title}" style="width:100%; height:100%; object-fit:cover;">`;
                    } else if (project.desc) {
                        // Check for Google Drive links in description
                        const driveMatch = project.desc.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
                        if (driveMatch) {
                            thumbnailHtml = `<img src="https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w800" alt="${project.title}" style="width:100%; height:100%; object-fit:cover;">`;
                        } else {
                            // Check for YouTube links just in case
                            const ytMatch = project.desc.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)/);
                            if (ytMatch) {
                                thumbnailHtml = `<img src="https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg" alt="${project.title}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg';">`;
                            }
                        }
                    }

                    const plainTextDesc = extractText(project.desc);
                    card.innerHTML = `
                        <div class="card-image">
                            ${thumbnailHtml}
                        </div>
                        <div class="card-content">
                            <h3>${project.title}</h3>
                            <p class="tech-stack">${project.stack}</p>
                            <p class="card-desc">${plainTextDesc}</p>
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
