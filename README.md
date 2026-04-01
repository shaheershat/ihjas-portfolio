# Ihjas Ahammad - Video Editor Portfolio

A modern, responsive portfolio website for Ihjas Ahammad, professional video editor and motion designer.

## Features

- **Dark Theme Design**: Modern black and cyan color scheme
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Video Portfolio**: Showcases video projects with category filtering
- **Contact Form**: Integrated contact form for client inquiries
- **Smooth Animations**: GSAP-powered animations and transitions
- **Static Hosting**: Optimized for Vercel deployment

## Tech Stack

- **HTML5**: Semantic markup
- **Tailwind CSS**: Utility-first CSS framework
- **JavaScript ES6+**: Modern JavaScript features
- **GSAP**: Animation library
- **JSON Data**: Local JSON for portfolio management (no database required)

## Project Structure

```
ihjas-portfolio/
├── index.html          # Homepage
├── portfolio.html      # Portfolio page
├── about.html          # About page
├── contact.html        # Contact page
├── categories.html     # Categories page
├── resources.html      # Resources page
├── css/
│   └── styles.css      # Custom styles
├── js/
│   ├── main.js         # Main JavaScript functionality
│   └── portfolio-loader.js  # Portfolio data management
├── data/
│   └── portfolio.json  # Portfolio data (videos, categories)
├── images/
│   └── thumbnails/      # Video thumbnails
├── videos/             # Video files
├── header.html         # Header component
├── footer.html         # Footer component
├── vercel.json         # Vercel configuration
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
