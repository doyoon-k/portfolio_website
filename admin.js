import { supabase } from './supabase-config.js';

const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const projectsList = document.getElementById('projectsList');
const projectFormContainer = document.getElementById('projectFormContainer');
const projectForm = document.getElementById('projectForm');
const showAddFormBtn = document.getElementById('showAddFormBtn');
const cancelBtn = document.getElementById('cancelBtn');

// -------------------------------------------------------
// Jodit WYSIWYG editor — preserves raw HTML faithfully
// -------------------------------------------------------
let jodit;
document.addEventListener('DOMContentLoaded', () => {
    jodit = Jodit.make('#pDescEditor', {
        theme: 'dark',
        language: 'en',
        height: 520,
        toolbarButtonSize: 'middle',
        askBeforePasteHTML: false,
        askBeforePasteFromWord: false,
        defaultActionOnPaste: 'insert_as_html',
        buttons: [
            'source', '|',
            'bold', 'italic', 'underline', 'strikethrough', '|',
            'ul', 'ol', '|',
            'font', 'fontsize', 'brush', '|',
            'image', 'link', 'video', '|',
            'align', '|',
            'undo', 'redo', '|',
            'hr', 'eraser', 'fullsize'
        ],
        uploader: { insertImageAsBase64URI: true },
        style: {
            background: '#0a0a0c',
            color: '#e0e0e0',
        },
        editorCssClass: 'admin-jodit-editor',
    });

    // Live preview: sync on every change
    const livePreview = document.getElementById('livePreview');
    jodit.events.on('change', () => {
        const html = jodit.value;
        function convertDriveLinksToIframes(htmlStr) {
            if (!htmlStr) return '';
            const div = document.createElement('div');
            div.innerHTML = htmlStr;
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
            const walk = document.createTreeWalker(div, NodeFilter.SHOW_TEXT, null, false);
            const nodesToReplace = [];
            let n;
            while(n = walk.nextNode()) {
                if (n.parentNode && n.parentNode.tagName === 'A') continue;
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

        livePreview.innerHTML = html && html.trim()
            ? convertDriveLinksToIframes(html)
            : '<em style="color:#555">Start editing to see a preview…</em>';
            
        // Apply syntax highlighting
        if (typeof hljs !== 'undefined') {
            livePreview.querySelectorAll('pre').forEach((block) => {
                if (!block.querySelector('code')) {
                    const code = document.createElement('code');
                    code.className = block.className;
                    code.innerHTML = block.innerHTML;
                    block.innerHTML = '';
                    block.appendChild(code);
                }
            });
            livePreview.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    });
});

function getEditorValue() {
    return jodit ? jodit.value : '';
}

function convertDriveLinksToIframes(htmlStr) {
    if (!htmlStr) return '';
    const div = document.createElement('div');
    div.innerHTML = htmlStr;
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
    const walk = document.createTreeWalker(div, NodeFilter.SHOW_TEXT, null, false);
    const nodesToReplace = [];
    let n;
    while(n = walk.nextNode()) {
        if (n.parentNode && n.parentNode.tagName === 'A') continue;
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

function setEditorValue(html) {
    if (jodit) {
        jodit.value = html || '';
        // Also update live preview
        const livePreview = document.getElementById('livePreview');
        if (livePreview) {
            livePreview.innerHTML = html && html.trim()
                ? convertDriveLinksToIframes(html)
                : '<em style="color:#555">Start editing to see a preview…</em>';
                
            // Apply syntax highlighting
            if (typeof hljs !== 'undefined') {
                livePreview.querySelectorAll('pre').forEach((block) => {
                    if (!block.querySelector('code')) {
                        const code = document.createElement('code');
                        code.className = block.className;
                        code.innerHTML = block.innerHTML;
                        block.innerHTML = '';
                        block.appendChild(code);
                    }
                });
                livePreview.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }
        }
    }
}

function clearEditor() {
    if (jodit) {
        jodit.value = '';
        const livePreview = document.getElementById('livePreview');
        if (livePreview) livePreview.innerHTML = '<em style="color:#555">Start editing to see a preview…</em>';
    }
}

// -------------------------------------------------------
// Auth
// -------------------------------------------------------

// Check Auth State on Load
supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
        loadProjects();
    } else {
        loginSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
        logoutBtn.classList.add('hidden');
    }
});

// Check current session on page load
(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Initial session check:', session);
})();

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        alert('Login failed: ' + error.message);
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
});

// -------------------------------------------------------
// UI Toggles
// -------------------------------------------------------

const tabProjects = document.getElementById('tabProjects');
const tabSettings = document.getElementById('tabSettings');
const projectsView = document.getElementById('projectsView');
const settingsView = document.getElementById('settingsView');

tabProjects.addEventListener('click', () => {
    tabProjects.classList.replace('secondary-btn', 'primary-btn');
    tabSettings.classList.replace('primary-btn', 'secondary-btn');
    projectsView.classList.remove('hidden');
    settingsView.classList.add('hidden');
});

tabSettings.addEventListener('click', () => {
    tabSettings.classList.replace('secondary-btn', 'primary-btn');
    tabProjects.classList.replace('primary-btn', 'secondary-btn');
    settingsView.classList.remove('hidden');
    projectsView.classList.add('hidden');
    loadSettings(); // load settings when tab is clicked
});

showAddFormBtn.addEventListener('click', () => {
    projectFormContainer.classList.remove('hidden');
    projectForm.reset();
    document.getElementById('projectId').value = '';
    document.getElementById('formTitle').textContent = 'Add Project';
    clearEditor();
});

cancelBtn.addEventListener('click', () => {
    projectFormContainer.classList.add('hidden');
});

// -------------------------------------------------------
// Load Projects
// -------------------------------------------------------
async function loadProjects() {
    projectsList.innerHTML = '<p>Loading...</p>';

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        projectsList.innerHTML = '<p>Error loading projects: ' + error.message + '</p>';
        return;
    }

    projectsList.innerHTML = '';

    data.forEach((project, index) => {
        const item = document.createElement('div');
        item.className = 'project-list-item';
        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    <button class="btn secondary-btn move-btn" data-id="${project.id}" data-dir="up" ${index === 0 ? 'disabled' : ''} style="padding: 2px 8px; font-size: 0.8em;">↑</button>
                    <button class="btn secondary-btn move-btn" data-id="${project.id}" data-dir="down" ${index === data.length - 1 ? 'disabled' : ''} style="padding: 2px 8px; font-size: 0.8em;">↓</button>
                </div>
                <div>
                    <h4>${project.title}</h4>
                    <small>${project.stack}</small>
                </div>
            </div>
            <div>
                <button class="btn secondary-btn edit-btn" data-id="${project.id}">Edit</button>
                <button class="btn secondary-btn delete-btn" data-id="${project.id}" style="border-color: red; color: red;">Delete</button>
            </div>
        `;
        projectsList.appendChild(item);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleDelete(e.target.getAttribute('data-id')));
    });
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleEdit(e.target.getAttribute('data-id'), data));
    });
    document.querySelectorAll('.move-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleMove(e.target.getAttribute('data-id'), e.target.getAttribute('data-dir')));
    });
}

// -------------------------------------------------------
// Reorder
// -------------------------------------------------------
async function handleMove(id, direction) {
    const { data: projects, error } = await supabase
        .from('projects')
        .select('id, sort_order')
        .order('sort_order', { ascending: true });

    if (error) { console.error('Error fetching projects for reorder:', error); return; }

    const targetId = parseInt(id);
    const currentIndex = projects.findIndex(p => p.id === targetId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= projects.length) return;

    const item = projects.splice(currentIndex, 1)[0];
    projects.splice(newIndex, 0, item);

    const updates = projects.map((p, index) => ({ id: p.id, sort_order: index }));
    const { error: updateError } = await supabase.from('projects').upsert(updates);

    if (updateError) {
        alert('Error reordering: ' + updateError.message);
    } else {
        loadProjects();
    }
}

// -------------------------------------------------------
// Save Project (Add or Update)
// -------------------------------------------------------
projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('projectId').value;
    const title = document.getElementById('pTitle').value;
    const stack = document.getElementById('pStack').value;
    const desc = getEditorValue();
    let imageUrl = document.getElementById('pImageUrl').value;
    const imageFile = document.getElementById('pImageFile').files[0];

    if (imageFile) {
        const fileName = `${Date.now()}_${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('project-images')
            .upload(fileName, imageFile);

        if (uploadError) {
            alert('Image upload failed: ' + uploadError.message);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('project-images')
            .getPublicUrl(fileName);

        imageUrl = publicUrl;
    }

    const projectData = { title, stack, desc, image_url: imageUrl };

    let result;
    if (id) {
        result = await supabase.from('projects').update(projectData).eq('id', id);
    } else {
        const { data: maxData } = await supabase
            .from('projects')
            .select('sort_order')
            .order('sort_order', { ascending: false })
            .limit(1);

        const nextOrder = (maxData && maxData.length > 0) ? maxData[0].sort_order + 1 : 0;
        projectData.sort_order = nextOrder;

        result = await supabase.from('projects').insert([projectData]);
    }

    if (result.error) {
        alert('Error saving project: ' + result.error.message);
    } else {
        projectFormContainer.classList.add('hidden');
        projectForm.reset();
        loadProjects();
    }
});

// -------------------------------------------------------
// Delete
// -------------------------------------------------------
async function handleDelete(id) {
    if (!confirm('Are you sure?')) return;

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', parseInt(id));

    if (error) {
        alert('Error deleting: ' + error.message);
    } else {
        loadProjects();
    }
}

// -------------------------------------------------------
// Edit – load project HTML directly into Jodit (no stripping!)
// -------------------------------------------------------
function handleEdit(id, projects) {
    const targetId = parseInt(id);
    const project = projects.find(p => p.id === targetId);
    if (!project) return;

    document.getElementById('projectId').value = project.id;
    document.getElementById('pTitle').value = project.title;
    document.getElementById('pStack').value = project.stack;
    document.getElementById('pImageUrl').value = project.image_url || '';

    setEditorValue(project.desc || '');

    document.getElementById('formTitle').textContent = 'Edit Project';
    projectFormContainer.classList.remove('hidden');
    // Scroll to form
    projectFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// -------------------------------------------------------
// Site Settings
// -------------------------------------------------------

const settingsForm = document.getElementById('settingsForm');

async function loadSettings() {
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    if (error) {
        console.error("Error loading settings:", error);
        return;
    }
    
    if (data) {
        document.getElementById('sHeroT1').value = data.hero_title1 || '';
        document.getElementById('sHeroT2').value = data.hero_title2 || '';
        document.getElementById('sHeroSub').value = data.hero_subtitle || '';
        document.getElementById('sAboutText').value = data.about_text || '';
        document.getElementById('sContactTitle').value = data.contact_title || '';
        document.getElementById('sContactText').value = data.contact_text || '';

        // Convert skills_json array to comma-separated string
        const skills = Array.isArray(data.skills_json) ? data.skills_json : [];
        const skillNames = skills.map(s => (typeof s === 'string' ? s : s.name)).join(', ');
        document.getElementById('sSkillsInput').value = skillNames;
    }
}

settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Parse comma-separated skills into an array of strings
    const rawSkills = document.getElementById('sSkillsInput').value;
    const skillsArray = rawSkills.split(',').map(s => s.trim()).filter(Boolean);

    const updatedSettings = {
        id: 1,
        hero_title1: document.getElementById('sHeroT1').value,
        hero_title2: document.getElementById('sHeroT2').value,
        hero_subtitle: document.getElementById('sHeroSub').value,
        about_text: document.getElementById('sAboutText').value,
        contact_title: document.getElementById('sContactTitle').value,
        contact_text: document.getElementById('sContactText').value,
        skills_json: skillsArray
    };
    
    const { error } = await supabase.from('site_settings').upsert(updatedSettings);
    if (error) {
        alert('Failed to save settings: ' + error.message);
    } else {
        alert('Site Settings updated successfully! Refresh the portfolio to see changes.');
    }
});
