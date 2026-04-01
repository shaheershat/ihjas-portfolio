# 📹 Video Upload Guide

## How to Add Your Videos to the Portfolio

### Step 1: Upload Videos to YouTube

1. **Upload your video to YouTube** (make sure it's public or unlisted)
2. **Get the video URL** from YouTube
3. **Extract the Video ID** from the URL

**Example:**
- YouTube URL: `https://www.youtube.com/watch?v=abc123xyz456`
- Video ID: `abc123xyz456`

### Step 2: Update portfolio.json

Edit `data/portfolio.json` and add your video information:

```json
{
  "id": 7,
  "name": "Your Video Title",
  "description": "Brief description of your video project",
  "category": "commercial",
  "youtube_link": "https://www.youtube.com/watch?v=YOUR_ACTUAL_VIDEO_ID",
  "date": "2024-01-20"
}
```

### Step 3: Update Category Counts

After adding videos, update the category counts in the `categories` section:

```json
{
  "id": "commercial",
  "name": "Commercial",
  "description": "Professional commercial video projects",
  "count": 3  // Update this number
}
```

## ✨ Automatic Thumbnails

**Good news!** Thumbnails are now **automatically generated** from your YouTube videos. You don't need to:

- ❌ Create manual thumbnail images
- ❌ Upload thumbnail files
- ❌ Specify thumbnail paths

The system automatically:
- ✅ Extracts the video ID from your YouTube URL
- ✅ Fetches high-quality thumbnails from YouTube
- ✅ Shows a play button overlay on each video
- ✅ Falls back to placeholder if thumbnail fails

## Available Categories

| Category ID | Display Name | Description |
|-------------|--------------|-------------|
| `commercial` | Commercial | Professional commercial video projects |
| `social` | Social Media | Engaging social media content |
| `music` | Music Videos | Creative music video productions |
| `documentary` | Documentary | Documentary and narrative films |

## Adding New Categories

If you need a new category:

1. **Add it to the categories section:**
```json
{
  "id": "your-category",
  "name": "Your Category Name",
  "description": "Description of your category",
  "count": 0
}
```

2. **Add filter button in portfolio.html:**
```html
<button class="filter-btn px-6 py-2 bg-zinc-800 text-white font-bold rounded-full hover:bg-cyan-400 transition-colors" data-category="your-category">Your Category</button>
```

## Quick Template

Copy this template for new videos:

```json
{
  "id": NEXT_NUMBER,
  "name": "Video Title",
  "description": "Your video description here",
  "category": "commercial",
  "youtube_link": "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
  "date": "2024-MM-DD"
}
```

## YouTube URL Formats Supported

The system works with these YouTube URL formats:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

## Thumbnail Quality

The system tries these thumbnail qualities in order:
1. **maxresdefault** (1280x720) - Highest quality
2. **hqdefault** (480x360) - High quality
3. **mqdefault** (320x180) - Medium quality
4. **default** (120x90) - Default quality

## Tips

- **Keep descriptions concise** (1-2 sentences)
- **Date format:** YYYY-MM-DD
- **ID numbers:** Increment by 1 for each new video
- **YouTube URLs:** Make sure videos are public or unlisted
- **No thumbnail management needed!** 🎉

## Testing Your Changes

1. Save the `portfolio.json` file
2. Refresh your browser at `http://localhost:8000`
3. Check the portfolio page to see your videos with auto-generated thumbnails
4. Test category filtering and video playback

---

🎬 **Your portfolio will automatically update with your new videos and thumbnails!**
