// Portfolio Admin - PostgreSQL Database Integration
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin' // Updated to match PostgreSQL user
};

// API Configuration
const API_BASE_URL = 'https://your-site-name.netlify.app/.netlify/functions'; // Change to your Netlify URL

let portfolioData = {
    videos: [],
    categories: [
        { id: "commercial", name: "Commercial", description: "Professional commercial video projects", count: 0 },
        { id: "social", name: "Social Media", description: "Engaging social media content", count: 0 },
        { id: "music", name: "Music Videos", description: "Creative music video productions", count: 0 },
        { id: "documentary", name: "Documentary", description: "Documentary and narrative films", count: 0 }
    ]
};

// Check authentication on page load
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        showAdminInterface();
    } else {
        showLoginScreen();
    }
}

// Show login screen
function showLoginScreen() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('admin-interface').classList.add('hidden');
}

// Show admin interface
function showAdminInterface() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-interface').classList.remove('hidden');
    loadDataFromAPI();
}

// Load data from PostgreSQL API
async function loadDataFromAPI() {
    try {
        // Show loading state
        const videosList = document.getElementById('videos-list');
        const categoriesList = document.getElementById('categories-list');
        if (videosList) videosList.innerHTML = '<p class="text-zinc-400">Loading videos from database...</p>';
        if (categoriesList) categoriesList.innerHTML = '<p class="text-zinc-400">Loading categories from database...</p>';
        
        // Fetch data from API
        const response = await fetch(`${API_BASE_URL}/videos`);
        const data = await response.json();
        
        if (data.success) {
            portfolioData.videos = data.videos;
            portfolioData.categories = data.categories;
            displayVideos();
            displayCategories();
        } else {
            console.error('Error loading data:', data.error);
            showNotification('Error loading data from database', 'error');
        }
    } catch (error) {
        console.error('Network error:', error);
        showNotification('Network error. Please check your connection.', 'error');
    }
}

// Save data to PostgreSQL API
async function saveData() {
    try {
        // Get current videos from API first
        const getResponse = await fetch(`${API_BASE_URL}/videos`);
        const getData = await getResponse.json();
        
        if (!getData.success) {
            showNotification('Error loading current data', 'error');
            return;
        }
        
        // Update each video in the database
        for (const video of portfolioData.videos) {
            try {
                const response = await fetch(`${API_BASE_URL}/videos/${video.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(video)
                });
                
                const result = await response.json();
                if (!result.success) {
                    console.error('Error updating video:', result.error);
                }
            } catch (error) {
                console.error('Error updating video:', error);
            }
        }
        
        showNotification('All changes saved to PostgreSQL database!', 'success');
        
    } catch (error) {
        console.error('Save error:', error);
        showNotification('Error saving data to database', 'error');
    }
}

// Add or update video
async function addOrUpdateVideo(videoData) {
    try {
        const url = videoData.id ? 
            `${API_BASE_URL}/videos/${videoData.id}` : 
            `${API_BASE_URL}/videos`;
            
        const method = videoData.id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(videoData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(videoData.id ? 'Video updated successfully!' : 'Video added successfully!', 'success');
            await loadDataFromAPI(); // Reload data
        } else {
            showNotification(`Error: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('API error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// Delete video
async function deleteVideo(id) {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Video deleted successfully!', 'success');
            await loadDataFromAPI(); // Reload data
        } else {
            showNotification(`Error: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('API error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// Display current categories
function displayCategories() {
    const categoriesList = document.getElementById('categories-list');
    
    if (portfolioData.categories.length === 0) {
        categoriesList.innerHTML = '<p class="text-zinc-400">No categories added yet.</p>';
        return;
    }
    
    categoriesList.innerHTML = portfolioData.categories.map(category => `
        <div class="bg-zinc-800 rounded-lg p-4 flex items-center justify-between">
            <div class="flex-1">
                <h3 class="font-bold text-lg mb-1">${category.name}</h3>
                <p class="text-zinc-400 text-sm mb-2">${category.description}</p>
                <div class="flex gap-4 text-sm">
                    <span class="text-cyan-400">${category.count || 0} videos</span>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="editCategory(${category.id})" 
                        class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors">
                    Edit
                </button>
                <button onclick="deleteCategory(${category.id})" 
                        class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Edit video
function editVideo(id) {
    const video = portfolioData.videos.find(v => v.id === id);
    if (!video) return;
    
    document.getElementById('video-name').value = video.name;
    document.getElementById('video-description').value = video.description;
    document.getElementById('video-url').value = video.youtube_link;
    document.getElementById('video-category').value = video.category;
    document.getElementById('video-date').value = video.date;
    
    // Change button text
    document.querySelector('#add-video-form button[type="submit"]').textContent = 'Update Video';
    
    // Scroll to form
    document.getElementById('add-video-form').scrollIntoView({ behavior: 'smooth' });
}

// Handle login
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        showAdminInterface();
        showNotification('Login successful!', 'success');
    } else {
        document.getElementById('login-error').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('login-error').classList.add('hidden');
        }, 3000);
    }
});

// Handle form submission
document.getElementById('add-video-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const videoData = {
        id: document.getElementById('video-id')?.value || Date.now(),
        name: document.getElementById('video-name').value,
        description: document.getElementById('video-description').value,
        youtube_link: document.getElementById('video-url').value,
        category: document.getElementById('video-category').value,
        date: document.getElementById('video-date').value
    };
    
    addOrUpdateVideo(videoData);
});

// Add new category
document.getElementById('add-category-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const categoryData = {
        id: document.getElementById('category-id')?.value || Date.now(),
        name: document.getElementById('category-name').value,
        description: document.getElementById('category-description').value
    };
    
    addOrUpdateCategory(categoryData);
});

// Add or update category
async function addOrUpdateCategory(categoryData) {
    try {
        const url = categoryData.id ? 
            `${API_BASE_URL}/categories/${categoryData.id}` : 
            `${API_BASE_URL}/categories`;
            
        const method = categoryData.id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(categoryData.id ? 'Category updated successfully!' : 'Category added successfully!', 'success');
            await loadDataFromAPI(); // Reload data
        } else {
            showNotification(`Error: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('API error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// Delete category
async function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Category deleted successfully!', 'success');
            await loadDataFromAPI(); // Reload data
        } else {
            showNotification(`Error: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('API error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// Edit category
function editCategory(id) {
    const category = portfolioData.categories.find(c => c.id === id);
    if (!category) return;
    
    document.getElementById('category-id').value = category.id;
    document.getElementById('category-name').value = category.name;
    document.getElementById('category-description').value = category.description;
    
    // Change button text
    document.querySelector('#add-category-form button[type="submit"]').textContent = 'Update Category';
    
    // Scroll to form
    document.getElementById('add-category-form').scrollIntoView({ behavior: 'smooth' });
}

// Reset form
function resetForm() {
    document.getElementById('add-video-form').reset();
    document.getElementById('video-id')?.remove();
    document.querySelector('#add-video-form button[type="submit"]').textContent = 'Add Video';
    document.getElementById('add-category-form').reset();
    document.getElementById('category-id')?.remove();
    document.querySelector('#add-category-form button[type="submit"]').textContent = 'Add Category';
}

// Add hidden ID field to form
const form = document.getElementById('add-video-form');
if (!document.getElementById('video-id')) {
    const idField = document.createElement('input');
    idField.type = 'hidden';
    idField.id = 'video-id';
    form.appendChild(idField);
    
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully!', 'success');
}

// Import data
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            portfolioData = importedData;
            saveData();
            displayVideos();
            showNotification('Data imported successfully!', 'success');
        } catch (error) {
            showNotification('Error importing data. Please check the file format.', 'error');
        }
    };
    reader.readAsText(file);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-medium z-50 max-w-md ${
        type === 'success' ? 'bg-green-600' : 
        type === 'error' ? 'bg-red-600' : 'bg-blue-600'
    }`;
    notification.innerHTML = `
        <div class="font-semibold mb-2">${type === 'success' ? '✅ Success!' : type === 'error' ? '❌ Error!' : 'ℹ️ Info'}</div>
        <div>${message}</div>
        ${type === 'success' ? `
            <div class="mt-3 pt-3 border-t border-green-500 text-sm">
                <p class="text-green-200"><strong>Next Steps:</strong></p>
                <ol class="list-decimal list-inside text-green-200 mt-2">
                    <li>Download the portfolio.json file</li>
                    <li>Replace the file in: <code class="bg-green-800 px-1 rounded">data/portfolio.json</code></li>
                    <li>Push to GitHub to update your live site</li>
                </ol>
            </div>
        ` : ''}
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 8 seconds for success messages (longer for instructions)
    setTimeout(() => {
        notification.remove();
    }, type === 'success' ? 8000 : 3000);
}

// Add hidden ID field to form
const adminForm = document.getElementById('add-video-form');
if (!document.getElementById('video-id')) {
    const idField = document.createElement('input');
    idField.type = 'hidden';
    idField.id = 'video-id';
    adminForm.appendChild(idField);
}

// Check authentication on page load
checkAuth();

// Set today's date as default
document.getElementById('video-date').valueAsDate = new Date();
