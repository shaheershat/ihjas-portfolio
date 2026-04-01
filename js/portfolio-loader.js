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

// Function to get YouTube thumbnail URL from video URL
window.getYouTubeThumbnail = function(youtubeUrl, quality = 'maxresdefault') {
    console.log('Getting thumbnail for URL:', youtubeUrl);
    
    // Extract video ID from YouTube URL
    let videoId = null;
    
    if (youtubeUrl.includes('youtu.be/')) {
        videoId = youtubeUrl.split('youtu.be/')[1]?.split('?')[0];
    } else if (youtubeUrl.includes('youtube.com/shorts/')) {
        videoId = youtubeUrl.split('shorts/')[1]?.split('?')[0];
    } else if (youtubeUrl.includes('youtube.com/watch?v=')) {
        videoId = youtubeUrl.split('v=')[1]?.split('&')[0];
    } else if (youtubeUrl.includes('youtube.com/embed/')) {
        videoId = youtubeUrl.split('embed/')[1]?.split('?')[0];
    }
    
    console.log('Extracted video ID for thumbnail:', videoId);
    
    if (!videoId) {
        console.warn('Could not extract video ID, using placeholder');
        return 'images/placeholder.jpg'; // Fallback image
    }
    
    // YouTube thumbnail URLs (in order of preference)
    const thumbnailUrls = {
        'maxresdefault': `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        'hqdefault': `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        'mqdefault': `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        'default': `https://img.youtube.com/vi/${videoId}/default.jpg`
    };
    
    const thumbnailUrl = thumbnailUrls[quality] || thumbnailUrls['hqdefault'];
    console.log('Generated thumbnail URL:', thumbnailUrl);
    
    return thumbnailUrl;
};

window.loadCategoriesSection = async function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Only run on homepage (index.html), not portfolio page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage === 'portfolio.html' || currentPage.includes('portfolio')) {
        console.log('Skipping loadCategoriesSection on portfolio page');
        return;
    }

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
    // Prevent multiple initializations
    if (window.portfolioInitialized) {
        console.log('Portfolio already initialized, skipping...');
        return;
    }
    
    const data = await window.loadPortfolioData();
    const videos = data.videos || [];
    
    const portfolioGrid = document.getElementById('portfolio-grid');
    if (!portfolioGrid) return;

    // Get category from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const selectedCategory = urlParams.get('category') || 'all';

    console.log('Initializing portfolio with category:', selectedCategory);

    // Load ALL videos initially (not filtered)
    portfolioGrid.innerHTML = videos.map(video => {
        // Generate thumbnail URL from YouTube link
        const thumbnailUrl = window.getYouTubeThumbnail(video.youtube_link);
        
        return `
        <div class="portfolio-card bg-zinc-900 rounded-2xl overflow-hidden hover:bg-zinc-800 transition-all duration-300 group" data-cat="${video.category}">
            <div class="aspect-video bg-zinc-800 relative overflow-hidden">
                <img src="${thumbnailUrl}" alt="${video.name}" 
                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                     onerror="this.src='images/placeholder.jpg'">
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button onclick="window.openVideoModal('${video.youtube_link}')" class="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-cyan-400 transition-colors">
                        Play Video
                    </button>
                </div>
                <!-- Play button overlay -->
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div class="bg-black/60 rounded-full p-4 opacity-80">
                        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
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
    `;
}).join('');

    // Mark as initialized
    window.portfolioInitialized = true;

    // Simple approach: directly set up filters and apply
    window.setupFilters(selectedCategory);
};

window.setupFilters = function(activeCategory) {
    console.log('Setting up filters with active category:', activeCategory);
    
    // Remove all existing event listeners first
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });
    
    // Get fresh reference to buttons
    const freshBtns = document.querySelectorAll('.filter-btn');
    
    // COMPLETELY CLEAR all button states first - remove ALL possible classes
    freshBtns.forEach(btn => {
        btn.classList.remove('bg-white', 'text-black', 'bg-zinc-800', 'text-white');
        // Force clear any inline styles
        btn.setAttribute('style', '');
    });
    
    // Wait a moment to ensure clear is complete
    setTimeout(() => {
        // Set ALL buttons to inactive state first
        freshBtns.forEach(btn => {
            btn.classList.add('bg-zinc-800', 'text-white');
        });
        
        // Then set ONLY the active button
        freshBtns.forEach(btn => {
            const category = btn.getAttribute('data-category');
            if (category === activeCategory) {
                btn.classList.remove('bg-zinc-800', 'text-white');
                btn.classList.add('bg-white', 'text-black');
                console.log('Set initial active button:', category);
            }
        });
        
        // Add click listeners with a completely new approach
        freshBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const category = this.getAttribute('data-category');
                console.log('Clicked category:', category);
                
                // IMMEDIATELY and COMPLETELY reset all buttons
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('bg-white', 'text-black', 'bg-zinc-800', 'text-white');
                    b.setAttribute('style', '');
                    b.classList.add('bg-zinc-800', 'text-white');
                });
                
                // Set clicked button as active
                this.classList.remove('bg-zinc-800', 'text-white');
                this.classList.add('bg-white', 'text-black');
                console.log('Set clicked active button:', category);
                
                // Apply filter
                window.applyFilter(category);
            });
        });
        
        // Apply initial filter
        window.applyFilter(activeCategory);
    }, 50);
};

window.initializeFilterButtons = function(videos, activeCategory = 'all') {
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (!filterBtns.length) return;

    // Remove existing event listeners by cloning buttons
    filterBtns.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });

    // Get fresh reference to buttons after cloning
    const freshFilterBtns = document.querySelectorAll('.filter-btn');

    // Set active state based on URL parameter
    freshFilterBtns.forEach(btn => {
        const category = btn.getAttribute('data-category');
        if (category === activeCategory) {
            btn.classList.add('bg-white', 'text-black');
            btn.classList.remove('bg-zinc-800', 'text-white');
        } else {
            btn.classList.remove('bg-white', 'text-black');
            btn.classList.add('bg-zinc-800', 'text-white');
        }
    });

    // Add click event listeners
    freshFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            window.applyFilter(category);
        });
    });
};

window.applyFilter = function(category) {
    console.log('Applying filter for category:', category);
    
    const portCards = document.querySelectorAll('#portfolio-grid .portfolio-card');
    if (!portCards) return;

    if (typeof gsap !== 'undefined') {
        gsap.to(portCards, {
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            stagger: 0.05,
            onComplete: () => {
                portCards.forEach(card => {
                    const cat = card.getAttribute('data-cat');
                    if (category === 'all' || cat === category) card.style.display = 'block';
                    else card.style.display = 'none';
                });
                gsap.to(portCards, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.05 });
            }
        });
    } else {
        portCards.forEach(card => {
            const cat = card.getAttribute('data-cat');
            card.style.display = (category === 'all' || cat === category) ? 'block' : 'none';
        });
    }
    
    // NO button state update here - handled by click event
};

window.updateButtonStates = function(activeCategory) {
    console.log('=== UPDATING BUTTON STATES ===');
    console.log('Active category:', activeCategory);
    
    const allButtons = document.querySelectorAll('.filter-btn');
    console.log('Total buttons found:', allButtons.length);
    
    // AGGRESSIVE RESET: Remove ALL possible classes from ALL buttons first
    allButtons.forEach(btn => {
        const btnCategory = btn.getAttribute('data-category');
        console.log(`Aggressively resetting button: ${btnCategory}`);
        
        // Remove all possible active/inactive classes
        btn.classList.remove('bg-white', 'text-black', 'bg-zinc-800', 'text-white');
        
        // Force inline style reset
        btn.style.backgroundColor = '';
        btn.style.color = '';
    });
    
    // DELAY before setting active to ensure reset is complete
    setTimeout(() => {
        // Set ALL buttons to inactive state first
        allButtons.forEach(btn => {
            btn.classList.add('bg-zinc-800', 'text-white');
        });
        
        // Then set ONLY the active button
        allButtons.forEach(btn => {
            const btnCategory = btn.getAttribute('data-category');
            if (btnCategory === activeCategory) {
                console.log(`Setting active: ${btnCategory}`);
                // Remove inactive classes
                btn.classList.remove('bg-zinc-800', 'text-white');
                // Add active classes
                btn.classList.add('bg-white', 'text-black');
            }
        });
        
        // Log final state
        console.log('=== FINAL BUTTON STATES ===');
        allButtons.forEach(btn => {
            const btnCategory = btn.getAttribute('data-category');
            const isActive = btn.classList.contains('bg-white');
            console.log(`Button ${btnCategory}: ${isActive ? 'ACTIVE' : 'INACTIVE'}`);
        });
        console.log('=== END BUTTON UPDATE ===');
    }, 10);
};

window.openVideoModal = function(youtubeUrl) {
    const modal = document.getElementById('video-modal');
    if (!modal) {
        console.error('Video modal not found');
        return;
    }

    console.log('Opening video modal with URL:', youtubeUrl);

    // Extract video ID from different YouTube URL formats
    let videoId = null;
    
    if (youtubeUrl.includes('youtu.be/')) {
        videoId = youtubeUrl.split('youtu.be/')[1]?.split('?')[0];
    } else if (youtubeUrl.includes('youtube.com/shorts/')) {
        videoId = youtubeUrl.split('shorts/')[1]?.split('?')[0];
    } else if (youtubeUrl.includes('youtube.com/watch?v=')) {
        videoId = youtubeUrl.split('v=')[1]?.split('&')[0];
    } else if (youtubeUrl.includes('youtube.com/embed/')) {
        videoId = youtubeUrl.split('embed/')[1]?.split('?')[0];
    }

    console.log('Extracted video ID:', videoId);

    if (!videoId) {
        console.error('Could not extract video ID from URL:', youtubeUrl);
        modal.querySelector('.bg-zinc-900').innerHTML = `
            <div class="text-center text-white">
                <p class="text-xl mb-4">Error: Could not load video</p>
                <p class="text-zinc-400">Invalid YouTube URL format</p>
            </div>
        `;
    } else {
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        console.log('Embed URL:', embedUrl);

        modal.querySelector('.bg-zinc-900').innerHTML = `
            <iframe 
                src="${embedUrl}" 
                class="w-full h-full rounded-3xl" 
                frameborder="0" 
                allowfullscreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
        `;
    }

    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100');
    
    // Add event listener to stop video when modal is closed
    modal.addEventListener('click', function(e) {
        // Only close if clicking outside the iframe or on close button
        if (e.target === modal || e.target.classList.contains('close-modal')) {
            closeVideoModal();
        }
    });
    
    // Add keyboard listener to close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeVideoModal();
        }
    });
};

// Function to close video modal and stop playback
window.closeVideoModal = function() {
    const modal = document.getElementById('video-modal');
    if (!modal) return;
    
    // Find the iframe and remove it to stop video
    const iframe = modal.querySelector('iframe');
    if (iframe) {
        // Set src to empty to stop video
        iframe.src = '';
        // Remove the iframe completely
        iframe.remove();
    }
    
    // Hide modal
    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.classList.remove('opacity-100');
    
    console.log('Video modal closed and playback stopped');
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
