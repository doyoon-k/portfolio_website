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
        .order('created_at', { ascending: false });

    if (error) {
        projectsList.innerHTML = '<p>Error loading projects: ' + error.message + '</p>';
        return;
    }

    projectsList.innerHTML = '';

    data.forEach((project) => {
        const item = document.createElement('div');
        item.className = 'project-list-item';
        item.innerHTML = `
            <div>
                <h4>${project.title}</h4>
                <small>${project.stack}</small>
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
}

// Save Project (Add or Update)
projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('projectId').value;
    const title = document.getElementById('pTitle').value;
    const stack = document.getElementById('pStack').value;
    const desc = document.getElementById('pDesc').value;
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
        // Insert
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
        .eq('id', id);

    if (error) {
        alert("Error deleting: " + error.message);
    } else {
        loadProjects();
    }
}

// Edit Project
function handleEdit(id, projects) {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    document.getElementById('projectId').value = project.id;
    document.getElementById('pTitle').value = project.title;
    document.getElementById('pStack').value = project.stack;
    document.getElementById('pDesc').value = project.desc;
    document.getElementById('pImageUrl').value = project.image_url || '';

    document.getElementById('formTitle').textContent = 'Edit Project';
    projectFormContainer.classList.remove('hidden');
}
