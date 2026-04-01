// Portfolio Admin - Authentication and Video Management
const ADMIN_CREDENTIALS = {
    username: 'ihjas',
    password: 'ahammad123' // Change this to your preferred password
};

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
    loadData();
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

// Logout function
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    showLoginScreen();
    showNotification('Logged out successfully!', 'info');
}

// Load existing data
async function loadData() {
    try {
        const response = await fetch('data/portfolio.json');
        const data = await response.json();
        portfolioData = data;
        updateCategoryCounts();
        displayVideos();
    } catch (error) {
        console.error('Error loading data:', error);
        displayVideos();
    }
}

// Save data to localStorage AND try to save to actual file
function saveData() {
    updateCategoryCounts();
    
    // For local development, save to localStorage
    localStorage.setItem('portfolioData', JSON.stringify(portfolioData, null, 2));
    
    // Also try to save to actual portfolio.json file
    const dataStr = JSON.stringify(portfolioData, null, 2);
    
    // Create a downloadable file for the user
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'portfolio.json';
    link.click();
    
    URL.revokeObjectURL(url);
    
    // Show success message with instructions
    showNotification('Data saved! Download portfolio.json and replace the file in your data folder to make changes visible on your site.', 'success');
}

// Update category counts based on videos
function updateCategoryCounts() {
    // Reset counts
    portfolioData.categories.forEach(cat => cat.count = 0);
    
    // Count videos per category
    portfolioData.videos.forEach(video => {
        const category = portfolioData.categories.find(cat => cat.id === video.category);
        if (category) {
            category.count++;
        }
    });
}

// Display current videos
function displayVideos() {
    const videosList = document.getElementById('videos-list');
    
    if (portfolioData.videos.length === 0) {
        videosList.innerHTML = '<p class="text-zinc-400">No videos added yet.</p>';
        return;
    }
    
    // Sort videos by date (newest first)
    const sortedVideos = [...portfolioData.videos].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    videosList.innerHTML = sortedVideos.map(video => `
        <div class="bg-zinc-800 rounded-lg p-4 flex items-center justify-between">
            <div class="flex-1">
                <h3 class="font-bold text-lg mb-1">${video.name}</h3>
                <p class="text-zinc-400 text-sm mb-2">${video.description}</p>
                <div class="flex gap-4 text-sm">
                    <span class="text-cyan-400">${video.category}</span>
                    <span class="text-zinc-500">${new Date(video.date).toLocaleDateString()}</span>
                    <a href="${video.youtube_link}" target="_blank" class="text-blue-400 hover:underline">View Video</a>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="editVideo(${video.id})" 
                        class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors">
                    Edit
                </button>
                <button onclick="deleteVideo(${video.id})" 
                        class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Add or update video
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
    
    // Check if editing existing video
    const existingIndex = portfolioData.videos.findIndex(v => v.id == videoData.id);
    
    if (existingIndex !== -1) {
        portfolioData.videos[existingIndex] = videoData;
        showNotification('Video updated successfully!', 'success');
    } else {
        portfolioData.videos.push(videoData);
        showNotification('Video added successfully!', 'success');
    }
    
    saveData();
    displayVideos();
    resetForm();
});

// Edit video
function editVideo(id) {
    const video = portfolioData.videos.find(v => v.id === id);
    if (!video) return;
    
    document.getElementById('video-id').value = video.id;
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

// Delete video
function deleteVideo(id) {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    portfolioData.videos = portfolioData.videos.filter(v => v.id !== id);
    saveData();
    displayVideos();
    showNotification('Video deleted successfully!', 'success');
}

// Reset form
function resetForm() {
    document.getElementById('add-video-form').reset();
    document.getElementById('video-id')?.remove();
    document.querySelector('#add-video-form button[type="submit"]').textContent = 'Add Video';
}

// Export data
function exportData() {
    updateCategoryCounts();
    const dataStr = JSON.stringify(portfolioData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'portfolio.json';
    link.click();
    
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
const form = document.getElementById('add-video-form');
if (!document.getElementById('video-id')) {
    const idField = document.createElement('input');
    idField.type = 'hidden';
    idField.id = 'video-id';
    form.appendChild(idField);
}

// Check authentication on page load
checkAuth();

// Set today's date as default
document.getElementById('video-date').valueAsDate = new Date();
