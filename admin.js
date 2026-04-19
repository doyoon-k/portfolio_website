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
// Sanitize HTML for the dark-theme editor
// Tistory inlines black/near-black colors → convert to light grey
// White backgrounds → transparent
// -------------------------------------------------------
function sanitizeHtmlForEditor(html) {
    const div = document.createElement('div');
    div.innerHTML = html;

    div.querySelectorAll('[style]').forEach(el => {
        let style = el.getAttribute('style') || '';

        // rgb(r,g,b) dark colors → light grey
        style = style.replace(
            /color:\s*rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi,
            (match, r, g, b) => {
                if (+r + +g + +b < 200) return 'color: #e0e0e0';
                return match;
            }
        );

        // hex dark colors: #000000 – #2a2a2a style
        style = style.replace(
            /color:\s*#([0-9a-f]{3,6})\b/gi,
            (match, hex) => {
                const full = hex.length === 3
                    ? hex.split('').map(c => c + c).join('')
                    : hex;
                const r = parseInt(full.substring(0,2),16);
                const g = parseInt(full.substring(2,4),16);
                const b = parseInt(full.substring(4,6),16);
                if (r + g + b < 200) return 'color: #e0e0e0';
                return match;
            }
        );

        // Named black
        style = style.replace(/\bcolor:\s*(black|#000)\b/gi, 'color: #e0e0e0');

        // Very light/white backgrounds → transparent
        style = style.replace(
            /background(?:-color)?:\s*rgb\(\s*(2[0-4]\d|25[0-5])\s*,\s*(2[0-4]\d|25[0-5])\s*,\s*(2[0-4]\d|25[0-5])\s*\)/gi,
            'background-color: transparent'
        );
        style = style.replace(/background(?:-color)?:\s*(white|#fff(fff)?)\b/gi, 'background-color: transparent');

        el.setAttribute('style', style);
    });

    return div.innerHTML;
}

// Initialize Quill
let quill;
document.addEventListener('DOMContentLoaded', () => {
    quill = new Quill('#pDescEditor', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image', 'video'],
                ['clean']
            ]
        }
    });

    // Live preview: update on every text change (show raw saved HTML as site would)
    const livePreview = document.getElementById('livePreview');
    quill.on('text-change', () => {
        const html = quill.root.innerHTML;
        livePreview.innerHTML = html === '<p><br></p>'
            ? '<em style="color:#555">Start typing to see your preview here…</em>'
            : html;
    });
});



// Check Auth State on Load
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    if (session) {
        console.log('User logged in:', session.user.email);
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
        loadProjects();
    } else {
        console.log('User not logged in');
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
    console.log('Login form submitted');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Attempting login with:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('Login error:', error);
        alert("Login failed: " + error.message);
    } else {
        console.log('Login successful:', data);
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
});

// UI Toggles
showAddFormBtn.addEventListener('click', () => {
    projectFormContainer.classList.remove('hidden');
    projectForm.reset();
    document.getElementById('projectId').value = '';
    document.getElementById('formTitle').textContent = 'Add Project';
    if (quill) quill.setContents([]);
});

cancelBtn.addEventListener('click', () => {
    projectFormContainer.classList.add('hidden');
});

// Load Projects
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

    // Attach Event Listeners
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

// Handle Move (Reorder)
async function handleMove(id, direction) {
    // 1. Fetch ALL projects ordered by current sort_order
    const { data: projects, error } = await supabase
        .from('projects')
        .select('id, sort_order')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching projects for reorder:', error);
        return;
    }

    // 2. Find index of current project (convert id to number for comparison)
    const targetId = parseInt(id);
    const currentIndex = projects.findIndex(p => p.id === targetId);
    if (currentIndex === -1) return;

    // 3. Calculate new index
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    // 4. Check bounds
    if (newIndex < 0 || newIndex >= projects.length) return;

    // 5. Reorder array in memory
    const item = projects.splice(currentIndex, 1)[0];
    projects.splice(newIndex, 0, item);

    // 6. Prepare updates with normalized sort_order (0, 1, 2...)
    const updates = projects.map((p, index) => ({
        id: p.id,
        sort_order: index
    }));

    // 7. Batch update (Upsert)
    const { error: updateError } = await supabase
        .from('projects')
        .upsert(updates);

    if (updateError) {
        alert("Error reordering: " + updateError.message);
    } else {
        loadProjects();
    }
}

// Save Project (Add or Update)
projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('projectId').value;
    const title = document.getElementById('pTitle').value;
    const stack = document.getElementById('pStack').value;
    const desc = quill ? quill.root.innerHTML : '';
    let imageUrl = document.getElementById('pImageUrl').value;
    const imageFile = document.getElementById('pImageFile').files[0];

    // If a file is selected, upload it first
    if (imageFile) {
        console.log('Uploading image:', imageFile.name);
        const fileName = `${Date.now()}_${imageFile.name}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('project-images')
            .upload(fileName, imageFile);

        if (uploadError) {
            alert("Image upload failed: " + uploadError.message);
            console.error('Upload error:', uploadError);
            return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('project-images')
            .getPublicUrl(fileName);

        imageUrl = publicUrl;
        console.log('Image uploaded successfully:', imageUrl);
    }

    const projectData = { title, stack, desc, image_url: imageUrl };

    let result;
    if (id) {
        // Update
        result = await supabase
            .from('projects')
            .update(projectData)
            .eq('id', id);
    } else {
        // Insert - Calculate new sort_order
        const { data: maxData } = await supabase
            .from('projects')
            .select('sort_order')
            .order('sort_order', { ascending: false })
            .limit(1);

        const nextOrder = (maxData && maxData.length > 0) ? maxData[0].sort_order + 1 : 0;
        projectData.sort_order = nextOrder;

        result = await supabase
            .from('projects')
            .insert([projectData]);
    }

    if (result.error) {
        alert("Error saving project: " + result.error.message);
    } else {
        projectFormContainer.classList.add('hidden');
        projectForm.reset();
        loadProjects();
    }
});

// Delete Project
async function handleDelete(id) {
    if (!confirm("Are you sure?")) return;

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', parseInt(id));

    if (error) {
        alert("Error deleting: " + error.message);
    } else {
        loadProjects();
    }
}

// Edit Project
function handleEdit(id, projects) {
    const targetId = parseInt(id);
    const project = projects.find(p => p.id === targetId);
    if (!project) return;

    document.getElementById('projectId').value = project.id;
    document.getElementById('pTitle').value = project.title;
    document.getElementById('pStack').value = project.stack;
    if (quill) {
        // Sanitize for editor visibility (dark bg compat), but keep original in preview
        quill.root.innerHTML = sanitizeHtmlForEditor(project.desc || '');
        // sync initial preview with original (unsanitized) HTML so it matches site appearance
        const livePreview = document.getElementById('livePreview');
        if (livePreview) livePreview.innerHTML = project.desc || '<em style="color:#555">Start typing to see your preview here…</em>';
    }
    document.getElementById('pImageUrl').value = project.image_url || '';

    document.getElementById('formTitle').textContent = 'Edit Project';
    projectFormContainer.classList.remove('hidden');
}
