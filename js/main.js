// Main JS for multi-page site. Guards are added so pages without certain elements won't error.
document.addEventListener('DOMContentLoaded', () => {
    // Fill any footer year placeholders inserted via header/footer includes.
    function setFooterYear() {
        try {
            const els = document.querySelectorAll('.js-year');
            if (!els || els.length === 0) return false;
            els.forEach(el => { el.textContent = new Date().getFullYear(); });
            return true;
        } catch (e) { return false; }
    }
    // Try immediately, and also watch for dynamic inserts (header/footer fetched later)
    setFooterYear();
    try {
        const mo = new MutationObserver(() => { if (setFooterYear()) mo.disconnect(); });
        mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
    } catch (e) {}
    if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
        try { gsap.registerPlugin(ScrollTrigger); } catch(e) {}
    }

    const loader = document.getElementById('loader');
    if (loader) {
        if (typeof gsap !== 'undefined') {
            gsap.to(loader, {
                opacity: 0,
                duration: 0.8,
                onComplete: () => { loader.style.display = 'none'; initAnimations(); }
            });
        } else {
            loader.style.display = 'none';
        }
    }

    // (cookie bar removed)

    // Mobile menu toggle: header may be injected after this script runs,
    // so use event delegation on the document to handle clicks reliably.
    function toggleMobileMenu() {
        const mobileMenuEl = document.getElementById('mobile-menu');
        const toggleBtn = document.getElementById('menu-toggle');
        if (!mobileMenuEl) return;
        const isOpen = mobileMenuEl.classList.toggle('open');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            const burgerSvg = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>';
            const closeSvg = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
            toggleBtn.innerHTML = isOpen ? closeSvg : burgerSvg;
        }
    }

    document.addEventListener('click', (e) => {
        const toggle = e.target.closest && e.target.closest('#menu-toggle');
        if (toggle) { toggleMobileMenu(); return; }

        const mobileLink = e.target.closest && e.target.closest('.mobile-nav-link');
        if (mobileLink) {
            const mobileMenuEl = document.getElementById('mobile-menu');
            const toggleBtn = document.getElementById('menu-toggle');
            if (mobileMenuEl && mobileMenuEl.classList.contains('open')) {
                mobileMenuEl.classList.remove('open');
                if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
                // restore burger icon
                if (toggleBtn) toggleBtn.innerHTML = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>';
            }
        }
    });

    // Portfolio filtering (operates on live DOM nodes)
    const filterBtns = document.querySelectorAll('.filter-btn');

    function getPortCards() { return document.querySelectorAll('#portfolio-grid .portfolio-card'); }

    window.applyFilter = function(category) {
        const portCards = getPortCards();
        if (!portCards) return;
        // update active state on dynamic buttons
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-category') === category));

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
    }

    if (filterBtns && filterBtns.length > 0) {
        filterBtns.forEach(btn => btn.addEventListener('click', () => applyFilter(btn.getAttribute('data-category'))));
    }

    // GSAP scroll animations (only if GSAP is present)
    window.initAnimations = function() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        gsap.utils.toArray('.reveal-text').forEach(text => {
            gsap.from(text, {
                scrollTrigger: { trigger: text, start: 'top 90%' },
                y: 50, opacity: 0, duration: 1, ease: 'power4.out'
            });
        });

        gsap.utils.toArray('.reveal-item').forEach(item => {
            gsap.from(item, {
                scrollTrigger: { trigger: item, start: 'top 95%' },
                y: 30, opacity: 0, duration: 0.8, delay: 0.2
            });
        });

        // Sticky nav scroll effect
        if (document.getElementById('main-nav')) {
            ScrollTrigger.create({
                start: 'top -80',
                onUpdate: (self) => {
                    const nav = document.getElementById('main-nav');
                    if (!nav) return;
                    if (self.direction === 1) gsap.to(nav, { y: -100, duration: 0.3 });
                    else gsap.to(nav, { y: 0, duration: 0.3 });
                }
            });
        }
    };

    // Modal helpers
    const videoModal = document.getElementById('video-modal');
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn && videoModal) {
        closeModalBtn.addEventListener('click', () => {
            if (typeof gsap !== 'undefined') gsap.to(videoModal, { opacity: 0, duration: 0.3, onComplete: () => videoModal.classList.add('pointer-events-none') });
            else { videoModal.style.opacity = 0; videoModal.classList.add('pointer-events-none'); }
        });
    }

    // Contact form handling with EmailJS
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        async function ensureEmailJSSDK() {
            if (typeof emailjs !== 'undefined') return;
            const candidates = [
                'https://cdn.emailjs.com/sdk/3.2.0/email.min.js',
                'https://cdn.jsdelivr.net/npm/emailjs-com@3.2.0/dist/email.min.js',
                'https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js'
            ];
            for (const src of candidates) {
                try {
                    await new Promise((resolve, reject) => {
                        const s = document.createElement('script');
                        s.src = src;
                        s.async = true;
                        s.onload = () => resolve();
                        s.onerror = () => reject(new Error('Failed to load ' + src));
                        document.head.appendChild(s);
                    });
                    console.info('EmailJS SDK loaded from', src);
                    // give global a tick
                    await new Promise(r => setTimeout(r, 50));
                    if (typeof emailjs !== 'undefined') return;
                } catch (e) {
                    console.warn(e.message || e);
                    // try next
                }
            }
            throw new Error('All attempts to load EmailJS SDK failed');
        }

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            if (!btn) return;
            const originalText = btn.innerText;
            btn.disabled = true;
            btn.innerText = 'Sending...';

            // Configure these with your EmailJS Public Key / Service / Template IDs
            const EMAILJS_USER_ID = 'eUsNUmTQhBZ6R0gJJ'; // e.g. 'user_xxx' or public key
            const EMAILJS_SERVICE_ID = 'service_7qz7z3k';
            const EMAILJS_TEMPLATE_ID = 'template_w21noml';

            try {
                await ensureEmailJSSDK();
                if (EMAILJS_USER_ID && EMAILJS_USER_ID !== 'YOUR_EMAILJS_USER_ID') {
                    try { emailjs.init(EMAILJS_USER_ID); } catch (e) { /* ignore init errors */ }
                }

                if (typeof emailjs === 'undefined') throw new Error('EmailJS SDK not available');
                if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) throw new Error('EmailJS service/template IDs not configured');

                await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, contactForm);

                btn.innerText = "Sent! I'll be in touch.";
                btn.classList.add('bg-lime-green');
                contactForm.reset();
                setTimeout(() => { btn.innerText = originalText; btn.classList.remove('bg-lime-green'); btn.disabled = false; }, 5000);
            } catch (err) {
                console.error('EmailJS send error:', err);
                btn.innerText = 'Send failed';
                setTimeout(() => { btn.innerText = originalText; btn.disabled = false; }, 4000);
            }
        });
    }
});

// --- Supabase: fetch and render videos (call with your project creds)
// Robust YouTube ID extractor (handles watch, youtu.be, embed, shorts, and messy/embed-prefixed URLs)
window.extractYouTubeID = function(urlOrId) {
    if (!urlOrId) return '';
    const s = String(urlOrId).trim();
    // direct id
    if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
    // try to normalize weird embed-prefixed strings
    let candidate = s.replace(/https?:\/\/(www\.)?youtube\.com\/embed\/https?:\/\//i, 'https://');
    try {
        const parsed = new URL(candidate, 'https://example.com');
        // v param
        if (parsed.searchParams && parsed.searchParams.get('v')) return parsed.searchParams.get('v');
        // youtu.be short links
        if (parsed.hostname && parsed.hostname.includes('youtu.be')) {
            const p = parsed.pathname.replace(/^\//, '').split(/[/?#]/)[0];
            if (/^[a-zA-Z0-9_-]{11}$/.test(p)) return p;
        }
        // path segments (embed, shorts, etc.) - check for 11-char segment
        const segs = parsed.pathname.split('/');
        for (let i = segs.length - 1; i >= 0; i--) {
            const seg = segs[i];
            if (/^[a-zA-Z0-9_-]{11}$/.test(seg)) return seg;
        }
    } catch (e) {
        // not a URL, fall back to regex search
    }
    // final fallback: first 11-char id anywhere
    const m = s.match(/([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : '';
};

// Load YouTube IFrame API once and provide a promise
window._loadYouTubeAPI = function() {
    if (window._ytApiReadyPromise) return window._ytApiReadyPromise;
    window._ytApiReadyPromise = new Promise((resolve) => {
        if (window.YT && window.YT.Player) return resolve(window.YT);
        window.onYouTubeIframeAPIReady = function() { resolve(window.YT); };
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        s.async = true;
        document.head.appendChild(s);
    });
    return window._ytApiReadyPromise;
};

// Create a YT player with host fallbacks. hosts: array of host strings.
window._createYouTubePlayerWithFallback = async function(container, youtubeId, hosts) {
    if (!container) return null;
    // cleanup
    container.innerHTML = '';
    // try using the IFrame API first
    try {
        const YT = await window._loadYouTubeAPI();
        let lastError = null;
        for (let i = 0; i < hosts.length; i++) {
            const host = hosts[i];
            try {
                // create a div for the player
                const playerDiv = document.createElement('div');
                const pid = 'yt-player-' + youtubeId + '-' + Date.now();
                playerDiv.id = pid;
                playerDiv.style.width = '100%';
                playerDiv.style.height = '100%';
                container.appendChild(playerDiv);

                const player = new YT.Player(pid, {
                    host: host,
                    height: '100%',
                    width: '100%',
                    videoId: youtubeId,
                    playerVars: { autoplay: 1, playsinline: 1, rel: 0, origin: location.origin, enablejsapi: 1 },
                    events: {
                        onReady: function(ev) { try { ev.target.playVideo(); } catch(e){} },
                        onError: function(ev) { lastError = ev; try { player.destroy(); } catch(e){} }
                    }
                });

                // wait a small period to see if player errors immediately
                const ok = await new Promise((res) => {
                    let done = false;
                    const t = setTimeout(() => { if (!done) { done = true; res(true); } }, 1500);
                    // also listen for onError via polling of lastError
                    const poll = setInterval(() => {
                        if (lastError) { clearTimeout(t); clearInterval(poll); if (!done) { done = true; res(false); } }
                    }, 200);
                });
                if (ok) {
                    // save current player to allow cleanup
                    window._currentYTPlayer = player;
                    return player;
                }
                // failed quickly, try next host
            } catch (e) {
                lastError = e;
                container.innerHTML = '';
                continue;
            }
        }
    } catch (e) {
        // API load failed; fall back to iframe embedding below
    }
    // fallback to iframe embed with first host
    container.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.className = 'w-full h-full';
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('playsinline', '');
    iframe.setAttribute('referrerpolicy', 'no-referrer');
    iframe.src = hosts[0] + '/embed/' + youtubeId + '?autoplay=1&rel=0&origin=' + encodeURIComponent(location.origin) + '&playsinline=1';
    container.appendChild(iframe);
    return null;
};
// Load a horizontal categories scroller into a container by id
window.loadCategoriesSection = async function(supabaseUrl, supabaseKey, containerId) {
    if (!supabaseUrl || !supabaseKey) return;
    try {
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        const supabase = createClient(supabaseUrl, supabaseKey);
        const container = document.getElementById(containerId);
        if (!container) return;

        // Fetch recent videos and pick the newest per category to act as the category cover
        const { data, error } = await supabase.from('videos').select('id,name,category,youtube_link,date').order('date', { ascending: false }).limit(200);
        if (error) { console.warn('Error fetching categories', error); return; }

        const seen = new Set();
        const reps = [];
        for (const row of (data || [])) {
            if (!row.category) continue;
            if (seen.has(row.category)) continue;
            seen.add(row.category);
            // derive cover url from youtube id if possible
            const yt = window.extractYouTubeID(row.youtube_link || row.youtube_id || '');
            row.cover_url = yt ? `https://img.youtube.com/vi/${yt}/hqdefault.jpg` : null;
            row.youtube_id = yt;
            reps.push(row);
        }

        container.innerHTML = '';
        const scroller = document.createElement('div');
        // Use two-row horizontal grid on all sizes (mobile and desktop)
        scroller.className = 'grid grid-flow-col grid-rows-2 auto-cols-max gap-6 overflow-x-auto py-6 px-2 md:px-0';

        const accentClasses = [
            {bg: 'bg-cyan-400 text-black'},
            {bg: 'bg-pink-500 text-white'},
            {bg: 'bg-lime-400 text-black'}
        ];
        reps.sort((a,b) => (a.category||'').localeCompare(b.category||'')).forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'relative min-w-[220px] md:min-w-[260px] bg-zinc-900 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer hover:scale-105 transition-transform';

            const imgWrap = document.createElement('div');
            imgWrap.className = 'w-full h-44 md:h-56 bg-zinc-800 overflow-hidden';
            if (item.cover_url) {
                const img = document.createElement('img');
                img.src = item.cover_url; img.alt = item.category||'';
                img.className = 'w-full h-full object-cover';
                img.style.objectFit = 'cover'; img.style.objectPosition = 'center';
                imgWrap.appendChild(img);
            } else {
                imgWrap.innerHTML = '<div class="w-full h-full flex items-center justify-center text-zinc-500">No cover</div>';
            }

            // badge overlay with category name (styled like reference)
            const accent = accentClasses[idx % accentClasses.length];
            const badge = document.createElement('div');
            badge.className = `absolute left-6 bottom-6 ${accent.bg} ${accent.text} rounded-sm px-4 py-2`; 
            badge.style.backdropFilter = 'saturate(120%)';
            badge.innerHTML = `<div class="font-bold uppercase tracking-tight text-xl md:text-2xl leading-tight">${item.category}</div>`;

            card.appendChild(imgWrap);
            card.appendChild(badge);

            card.addEventListener('click', () => { location.href = 'categories.html?category=' + encodeURIComponent(item.category); });
            scroller.appendChild(card);
        });

        container.appendChild(scroller);
    } catch (e) { console.warn('loadCategoriesSection failed', e); }
};
window.initSupabaseVideos = async function(supabaseUrl, supabaseKey) {
    if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase URL/key missing. Skipping video fetch.');
        return;
    }

    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // warm up YouTube IFrame API load early to reduce latency when opening videos
    try { window._loadYouTubeAPI(); } catch (e) {}

    const grid = document.getElementById('portfolio-grid');
    const videoModal = document.getElementById('video-modal');
    const closeModalBtn = document.getElementById('close-modal');

    async function getPublicUrl(path) {
        if (!path) return null;
        try {
            const { data } = supabase.storage.from('covers').getPublicUrl(path);
            return data?.publicUrl || null;
        } catch (e) { return null; }
    }

    function createCard(item) {
        const div = document.createElement('div');
        div.className = 'portfolio-card group bg-zinc-900 rounded-3xl overflow-hidden aspect-[4/5] relative';
        div.dataset.cat = item.category || '';

        const cover = document.createElement('div');
        cover.className = 'absolute inset-0 flex items-center justify-center text-zinc-700 font-bold';

        // prefer cover_url (from storage); otherwise use YouTube thumbnail if possible
        if (item.cover_url) {
            const img = document.createElement('img');
            img.src = item.cover_url;
            img.alt = item.name || '';
            img.className = 'w-full h-full object-cover';
            img.style.objectFit = 'cover'; img.style.objectPosition = 'center';
            cover.innerHTML = '';
            cover.appendChild(img);
        } else {
            // try YouTube thumbnail
            const ytId = item.youtube_id || item.youtube_link || '';
            const id = (ytId && ytId.length === 11) ? ytId : null;
            if (!item.cover_url && item.youtube_link) {
                // extract id if needed
                    const extracted = window.extractYouTubeID(item.youtube_id || item.youtube_link || '');
                const thumb = extracted ? `https://img.youtube.com/vi/${extracted}/hqdefault.jpg` : null;
                if (thumb) {
                    const img = document.createElement('img');
                    img.src = thumb;
                    img.alt = item.name || '';
                    img.className = 'w-full h-full object-cover';
                    img.style.objectFit = 'cover'; img.style.objectPosition = 'center';
                    cover.innerHTML = '';
                    cover.appendChild(img);
                } else {
                    cover.textContent = 'NO COVER';
                }
            } else {
                cover.textContent = 'NO COVER';
            }
        }

        const overlay = document.createElement('div');
        overlay.className = 'absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80';

        function formatDateStr(d) {
            if (!d) return '';
            const dt = new Date(d);
            if (isNaN(dt)) return d;
            return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        }

        const meta = document.createElement('div');
        meta.className = 'absolute bottom-0 left-0 p-8 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform';
        const formattedDate = formatDateStr(item.date || item.created_at || item.createdAt || '');
        meta.innerHTML = `<span class="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2 block">${item.category || ''}</span><h4 class="text-2xl font-bold">${item.name || ''}</h4>${formattedDate ? `<div class="text-sm text-zinc-400 mt-2">${formattedDate}</div>` : ''}`;

        div.appendChild(cover);
        div.appendChild(overlay);
        div.appendChild(meta);

        // click -> open modal with youtube embed (use IFrame API with fallbacks)
        div.addEventListener('click', async () => {
            if (!videoModal) return;
            const youtubeId = window.extractYouTubeID(item.youtube_id || item.youtube_link || '');
            if (!youtubeId) {
                console.warn('Invalid YouTube ID for item', item);
                return;
            }
            const container = videoModal.querySelector('.w-full.max-w-6xl');
            if (!container) return;
            // choose host order: prefer www on mobile (some mobile browsers have issues with nocookie)
            const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || '');
            const hosts = isMobile ? ['https://www.youtube.com', 'https://www.youtube-nocookie.com'] : ['https://www.youtube-nocookie.com', 'https://www.youtube.com'];
            // show modal immediately with spinner while player initializes
            videoModal.classList.remove('pointer-events-none');
            if (typeof window.gsap !== 'undefined') window.gsap.to(videoModal, { opacity: 1, duration: 0.15 });
            else videoModal.style.opacity = 1;
            // spinner markup
            container.innerHTML = '<div class="absolute inset-0 flex items-center justify-center"><div class="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>';
            try {
                await window._createYouTubePlayerWithFallback(container, youtubeId, hosts);
            } catch (e) { console.warn('Player fallback failed', e); }
        });

        return div;
    }

    async function loadVideos() {
        if (!grid) return;
        grid.innerHTML = '';
        const { data, error } = await supabase.from('videos').select('id,name,description,category,youtube_link,date').order('date', { ascending: false });
        if (error) { console.error('Supabase fetch error', error); return; }
        const categories = new Set();
        for (const row of data || []) {
            if (row.cover_path) {
                const publicUrl = await getPublicUrl(row.cover_path);
                row.cover_url = publicUrl;
            } else if (row.youtube_link) {
                const extracted = window.extractYouTubeID(row.youtube_link || row.youtube_id || '');
                if (extracted) row.cover_url = `https://img.youtube.com/vi/${extracted}/hqdefault.jpg`;
            }
            row.youtube_id = window.extractYouTubeID(row.youtube_link || row.youtube_id || '');
            row.created_at = row.date || null;
            if (row.category) categories.add(row.category);
            const card = createCard(row);
            grid.appendChild(card);
        }

        // build filter buttons dynamically from categories
        const filterBar = document.getElementById('filter-bar');
        if (filterBar) {
            filterBar.innerHTML = '';
            const allBtn = document.createElement('button');
            allBtn.className = 'filter-btn active px-6 py-2 rounded-full border border-white/20 text-sm font-bold uppercase transition-all';
            allBtn.setAttribute('data-category', 'all');
            allBtn.textContent = 'All';
            filterBar.appendChild(allBtn);
            allBtn.addEventListener('click', () => applyFilter('all'));

            Array.from(categories).sort().forEach(cat => {
                const b = document.createElement('button');
                b.className = 'filter-btn px-6 py-2 rounded-full border border-white/20 text-sm font-bold uppercase transition-all';
                b.setAttribute('data-category', cat);
                b.textContent = cat;
                b.addEventListener('click', () => applyFilter(cat));
                filterBar.appendChild(b);
            });
        }
    }

    // initial load
    await loadVideos();

    // realtime subscription to INSERTs
    try {
        const channel = supabase.channel('public:videos')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'videos' }, payload => {
                const row = payload.new;
                (async () => {
                    if (row.cover_path) row.cover_url = (await getPublicUrl(row.cover_path));
                    else if (row.youtube_link) {
                        const extracted = window.extractYouTubeID(row.youtube_link || row.youtube_id || '');
                        if (extracted) row.cover_url = `https://img.youtube.com/vi/${extracted}/hqdefault.jpg`;
                    }
                    row.youtube_id = window.extractYouTubeID(row.youtube_link || row.youtube_id || '');
                    row.created_at = row.date || null;
                    const card = createCard(row);
                    if (grid) grid.prepend(card);
                })();
            })
            .subscribe();
    } catch (e) {
        console.warn('Realtime subscription failed', e);
    }

    // close modal handler: destroy player and hide modal
    if (closeModalBtn && videoModal) {
        closeModalBtn.addEventListener('click', () => {
            // hide immediately (prevent any visible spinner) then clean up after animation
            videoModal.classList.add('pointer-events-none');
            if (typeof window.gsap !== 'undefined') {
                window.gsap.to(videoModal, {
                    opacity: 0,
                    duration: 0.25,
                    onComplete: () => {
                        try { if (window._currentYTPlayer && typeof window._currentYTPlayer.destroy === 'function') window._currentYTPlayer.destroy(); } catch (e) {}
                        window._currentYTPlayer = null;
                        const container = videoModal.querySelector('.w-full.max-w-6xl');
                        if (container) container.innerHTML = '';
                    }
                });
            } else {
                try { if (window._currentYTPlayer && typeof window._currentYTPlayer.destroy === 'function') window._currentYTPlayer.destroy(); } catch (e) {}
                window._currentYTPlayer = null;
                videoModal.style.opacity = 0;
                const container = videoModal.querySelector('.w-full.max-w-6xl');
                if (container) container.innerHTML = '';
            }
        });
    }
};

// --- Local (client-only) videos using localStorage
window.initLocalVideos = function() {
    const STORAGE_KEY = 'local_videos';
    const grid = document.getElementById('portfolio-grid');
    const videoModal = document.getElementById('video-modal');
    const closeModalBtn = document.getElementById('close-modal');

    function extractYouTubeID(urlOrId) {
        return window.extractYouTubeID ? window.extractYouTubeID(urlOrId) : (urlOrId || '');
    }

    function loadItems() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (e) { return []; }
    }

    function saveItems(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    function createCard(item) {
        const div = document.createElement('div');
        div.className = 'portfolio-card group bg-zinc-900 rounded-3xl overflow-hidden aspect-[4/5] relative';
        div.dataset.cat = item.category || '';

        const cover = document.createElement('div');
        cover.className = 'absolute inset-0 flex items-center justify-center text-zinc-700 font-bold';

        if (item.cover_url) {
            const img = document.createElement('img');
            img.src = item.cover_url;
            img.alt = item.name || '';
            img.className = 'w-full h-full object-cover';
            img.style.objectFit = 'cover'; img.style.objectPosition = 'center';
            cover.innerHTML = '';
            cover.appendChild(img);
        } else {
            cover.textContent = 'NO COVER';
        }

        const overlay = document.createElement('div');
        overlay.className = 'absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80';

        function formatDateStr(d) {
            if (!d) return '';
            const dt = new Date(d);
            if (isNaN(dt)) return d;
            return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        }

        const meta = document.createElement('div');
        meta.className = 'absolute bottom-0 left-0 p-8 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform';
        const formattedDate = formatDateStr(item.date || item.created_at || item.createdAt || '');
        meta.innerHTML = `<span class="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2 block">${item.category || ''}</span><h4 class="text-2xl font-bold">${item.name || ''}</h4>${formattedDate ? `<div class="text-sm text-zinc-400 mt-2">${formattedDate}</div>` : ''}`;

        div.appendChild(cover);
        div.appendChild(overlay);
        div.appendChild(meta);

        div.addEventListener('click', async () => {
            if (!videoModal) return;
            const youtubeId = extractYouTubeID(item.youtube_id || item.youtube || '');
            if (!youtubeId) {
                console.warn('Invalid YouTube ID for local item', item);
                return;
            }
            const container = videoModal.querySelector('.w-full.max-w-6xl');
            if (!container) return;
            const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || '');
            const hosts = isMobile ? ['https://www.youtube.com', 'https://www.youtube-nocookie.com'] : ['https://www.youtube-nocookie.com', 'https://www.youtube.com'];
            // show modal immediately and spinner
            videoModal.classList.remove('pointer-events-none');
            if (typeof window.gsap !== 'undefined') window.gsap.to(videoModal, { opacity: 1, duration: 0.15 });
            else videoModal.style.opacity = 1;
            container.innerHTML = '<div class="absolute inset-0 flex items-center justify-center"><div class="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>';
            try {
                await window._createYouTubePlayerWithFallback(container, youtubeId, hosts);
            } catch (e) { console.warn('Player fallback failed', e); }
        });

        return div;
    }

    function render() {
        if (!grid) return;
        const items = loadItems();
        grid.innerHTML = '';
        const categories = new Set();
        items.forEach(i => {
            if (i.category) categories.add(i.category);
            grid.appendChild(createCard(i));
        });

        // build filter buttons from local items
        const filterBar = document.getElementById('filter-bar');
        if (filterBar) {
            filterBar.innerHTML = '';
            const allBtn = document.createElement('button');
            allBtn.className = 'filter-btn active px-6 py-2 rounded-full border border-white/20 text-sm font-bold uppercase transition-all';
            allBtn.setAttribute('data-category', 'all');
            allBtn.textContent = 'All';
            filterBar.appendChild(allBtn);
            allBtn.addEventListener('click', () => applyFilter('all'));

            Array.from(categories).sort().forEach(cat => {
                const b = document.createElement('button');
                b.className = 'filter-btn px-6 py-2 rounded-full border border-white/20 text-sm font-bold uppercase transition-all';
                b.setAttribute('data-category', cat);
                b.textContent = cat;
                b.addEventListener('click', () => applyFilter(cat));
                filterBar.appendChild(b);
            });
        }
    }

    // Admin form handling (visible when ?admin=1)
    const adminForm = document.getElementById('video-admin');
    if (adminForm) {
        adminForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(adminForm);
            const name = fd.get('name');
            const description = fd.get('description');
            const category = fd.get('category');
            const youtube = fd.get('youtube');
            const date = fd.get('date') || new Date().toISOString();

            // Use YouTube thumbnail when no cover is supplied — keeps admin flow simple.
            const ytId = extractYouTubeID(youtube);
            const defaultThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

            const items = loadItems();
            items.unshift({ id: Date.now(), name, description, category, youtube_id: ytId, cover_url: defaultThumb, created_at: date });
            saveItems(items);
            render();
            adminForm.reset();
        });

        // Export/import buttons
        const exportBtn = document.getElementById('export-videos');
        const importInput = document.getElementById('import-videos');
        if (exportBtn) exportBtn.addEventListener('click', () => {
            const data = loadItems();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'videos.json'; a.click(); URL.revokeObjectURL(url);
        });
        if (importInput) importInput.addEventListener('change', (ev) => {
            const f = ev.target.files[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const imported = JSON.parse(reader.result);
                    if (Array.isArray(imported)) {
                        saveItems(imported.concat(loadItems()));
                        render();
                    }
                } catch (e) { alert('Invalid JSON'); }
            };
            reader.readAsText(f);
        });
    }

    // modal close behavior
    if (closeModalBtn && videoModal) {
        closeModalBtn.addEventListener('click', () => {
            try { if (window._currentYTPlayer && typeof window._currentYTPlayer.destroy === 'function') window._currentYTPlayer.destroy(); } catch (e) {}
            window._currentYTPlayer = null;
            const container = videoModal.querySelector('.w-full.max-w-6xl');
            if (container) container.innerHTML = '';
            if (typeof window.gsap !== 'undefined') window.gsap.to(videoModal, { opacity: 0, duration: 0.3, onComplete: () => videoModal.classList.add('pointer-events-none') });
            else { videoModal.style.opacity = 0; videoModal.classList.add('pointer-events-none'); }
        });
    }

    // initial render
    render();
};

