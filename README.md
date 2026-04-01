# Ihjas Ahammad - Video Editor Portfolio

Professional video portfolio website with admin interface for managing content.

## 🌐 **Live Site**
- **URL**: https://ihjasahammad.vercel.app
- **Admin**: https://ihjasahammad.vercel.app/admin.html

## 🎛️ **Admin Access**
- **Username**: ihjas
- **Password**: ahammad123

## 📹 **Features**
- Responsive design for all devices
- Video portfolio with filtering by category
- Automatic YouTube thumbnail generation
- Password-protected admin interface
- Add/Edit/Delete videos without code editing
- Export/Import functionality for backups

## 🚀 **Deployment**
- **Platform**: Vercel
- **Repository**: https://github.com/shaheershat/ihjas-portfolio
- **Branch**: main
- **Framework**: Static HTML/CSS/JavaScript

## 📁 **Project Structure**
```
ihjas-portfolio/
├── index.html          # Main homepage
├── portfolio.html       # Portfolio grid page
├── admin.html          # Admin interface (password protected)
├── sync-data.html      # Data sync utility
├── data/
│   └── portfolio.json  # Video and category data
├── js/
│   ├── main.js
│   ├── portfolio-loader.js
│   └── admin.js
├── css/
│   └── style.css
└── images/
    └── thumbnails/      # Video thumbnails
    └── videos/             # Video files
    └── header.html         # Header component
    └── footer.html         # Footer component
```

## 🎯 **Usage**
1. **Visit admin panel**: Add/edit/delete videos
2. **Export data**: Download portfolio.json backup
3. **Update portfolio.json**: Replace file with exported data
4. **Push to GitHub**: Auto-deploys to Vercel

## Tech Stack

- **HTML5**: Semantic markup
- **Tailwind CSS**: Utility-first CSS framework
- **JavaScript ES6+**: Modern JavaScript features
- **GSAP**: Animation library
- **JSON Data**: Local JSON for portfolio management (no database required)

└── README.md           # This file
```

## Getting Started

### Local Development

1. Clone the repository
2. Navigate to the project directory
3. Start a local server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (if installed)
npx serve .

# Using PHP (if installed)
php -S localhost:8000
```

4. Open `http://localhost:8000` in your browser

### Adding Portfolio Items

To add new portfolio items, edit `data/portfolio.json`:

```json
{
  "videos": [
    {
      "id": 1,
      "name": "Project Name",
      "description": "Project description",
      "category": "commercial",
      "youtube_link": "https://www.youtube.com/watch?v=VIDEO_ID",
      "date": "2024-01-15",
      "thumbnail": "images/thumbnails/project1.jpg"
    }
  ]
}
```

### Categories

Available categories:
- `commercial` - Commercial projects
- `social` - Social media content
- `music` - Music videos
- `documentary` - Documentary films

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Vercel
3. Deploy automatically

The `vercel.json` file is pre-configured for optimal deployment.

### Manual Deployment

The site is static and can be deployed to any static hosting service:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

## Customization

### Colors

Edit the CSS variables in `css/styles.css` to customize the color scheme:

```css
:root {
  --primary-color: #00ffff;  /* Cyan */
  --background: #000000;     /* Black */
  --surface: #18181b;        /* Dark gray */
  --text-primary: #ffffff;   /* White */
  --text-secondary: #a1a1aa; /* Gray */
}
```

### Fonts

The site uses:
- **Plus Jakarta Sans**: Primary font family
- **Caveat**: Accent font for special elements

## Performance

- Optimized for fast loading
- Minimal dependencies
- Efficient image loading
- GSAP animations for smooth interactions

## Browser Support

- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

For inquiries about this portfolio or video editing services:
- Email: [your-email@example.com]
- Website: [your-website.com]

---

Built with ❤️ for creative professionals
