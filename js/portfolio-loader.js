// Portfolio data loader - replaces Supabase with local JSON
window.loadPortfolioData = async function() {
    try {
        const response = await fetch('data/portfolio.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        return { videos: [], categories: [] };
    }
};

window.loadCategoriesSection = async function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const data = await window.loadPortfolioData();
    const categories = data.categories || [];
    
    container.innerHTML = categories.map(cat => `
        <div class="category-card bg-zinc-900 rounded-2xl p-8 hover:bg-zinc-800 transition-all duration-300 cursor-pointer group">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">${cat.name}</h3>
                <span class="text-sm text-zinc-500">${cat.count} projects</span>
            </div>
            <p class="text-zinc-400 mb-6">${cat.description}</p>
            <a href="portfolio.html?category=${cat.id}" class="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium">
                View Projects
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
            </a>
        </div>
    `).join('');
};

window.initPortfolioVideos = async function() {
    const data = await window.loadPortfolioData();
    const videos = data.videos || [];
    
    const portfolioGrid = document.getElementById('portfolio-grid');
    if (!portfolioGrid) return;

    // Get category from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const selectedCategory = urlParams.get('category') || 'all';

    // Filter videos based on category
    const filteredVideos = selectedCategory === 'all' 
        ? videos 
        : videos.filter(video => video.category === selectedCategory);

    portfolioGrid.innerHTML = filteredVideos.map(video => `
        <div class="portfolio-card bg-zinc-900 rounded-2xl overflow-hidden hover:bg-zinc-800 transition-all duration-300 group" data-cat="${video.category}">
            <div class="aspect-video bg-zinc-800 relative overflow-hidden">
                <img src="${video.thumbnail || 'images/placeholder.jpg'}" alt="${video.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button onclick="window.openVideoModal('${video.youtube_link}')" class="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-cyan-400 transition-colors">
                        Play Video
                    </button>
                </div>
            </div>
            <div class="p-6">
                <h3 class="text-xl font-bold text-white mb-2">${video.name}</h3>
                <p class="text-zinc-400 mb-4">${video.description}</p>
                <div class="flex items-center justify-between">
                    <span class="text-sm text-zinc-500">${new Date(video.date).toLocaleDateString()}</span>
                    <span class="text-xs px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full capitalize">${video.category}</span>
                </div>
            </div>
        </div>
    `).join('');

    // Initialize filter buttons
    window.initializeFilterButtons(videos);
};

window.initializeFilterButtons = function(videos) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            window.applyFilter(category);
        });
    });
};

window.openVideoModal = function(youtubeUrl) {
    const modal = document.getElementById('video-modal');
    if (!modal) return;

    // Convert YouTube URL to embed URL
    const videoId = youtubeUrl.split('v=')[1]?.split('&')[0];
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    modal.querySelector('.bg-zinc-900').innerHTML = `
        <iframe 
            src="${embedUrl}" 
            class="w-full h-full rounded-3xl" 
            frameborder="0" 
            allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        ></iframe>
    `;

    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100');
};

// Close modal functionality
document.addEventListener('click', (e) => {
    if (e.target.closest('#close-modal') || e.target.id === 'video-modal') {
        const modal = document.getElementById('video-modal');
        if (modal) {
            modal.classList.add('opacity-0', 'pointer-events-none');
            modal.classList.remove('opacity-100');
        }
    }
});
