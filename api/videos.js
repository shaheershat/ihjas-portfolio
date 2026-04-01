// PostgreSQL API for Video Management
// This is a Node.js backend API for your PostgreSQL database

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Database configuration - replace with your actual PostgreSQL credentials
const dbConfig = {
    user: 'your_postgres_user',
    host: 'localhost',
    database: 'your_database_name',
    password: 'your_postgres_password',
    port: 5432,
    ssl: false
};

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool(dbConfig);

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Database connected successfully');
    }
});

// API Routes

// Get all videos
app.get('/api/videos', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT v.*, 
                   (SELECT COUNT(*) FROM videos WHERE category = v.category) as video_count
            FROM videos v
            ORDER BY v.date DESC
        `);
        
        // Get categories with counts
        const categoriesResult = await pool.query(`
            SELECT 
                'commercial' as id,
                'Commercial' as name,
                'Professional commercial video projects' as description,
                (SELECT COUNT(*) FROM videos WHERE category = 'commercial') as count
            UNION ALL
            SELECT 
                'social' as id,
                'Social Media' as name,
                'Engaging social media content' as description,
                (SELECT COUNT(*) FROM videos WHERE category = 'social') as count
            UNION ALL
            SELECT 
                'music' as id,
                'Music Videos' as name,
                'Creative music video productions' as description,
                (SELECT COUNT(*) FROM videos WHERE category = 'music') as count
            UNION ALL
            SELECT 
                'documentary' as id,
                'Documentary' as name,
                'Documentary and narrative films' as description,
                (SELECT COUNT(*) FROM videos WHERE category = 'documentary') as count
        `);
        
        const videos = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            youtube_link: row.youtube_link,
            category: row.category,
            date: row.date,
            video_count: parseInt(row.video_count)
        }));
        
        const categories = categoriesResult.rows;
        
        res.json({
            success: true,
            videos,
            categories
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add new video
app.post('/api/videos', async (req, res) => {
    try {
        const { name, description, youtube_link, category, date } = req.body;
        
        const result = await pool.query(`
            INSERT INTO videos (name, description, youtube_link, category, date, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            RETURNING *
        `, [name, description, youtube_link, category, date]);
        
        res.json({
            success: true,
            video: result.rows[0]
        });
    } catch (error) {
        console.error('Error adding video:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update video
app.put('/api/videos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, youtube_link, category, date } = req.body;
        
        const result = await pool.query(`
            UPDATE videos 
            SET name = $1, description = $2, youtube_link = $3, category = $4, date = $5, updated_at = NOW()
            WHERE id = $6
            RETURNING *
        `, [name, description, youtube_link, category, date, id]);
        
        res.json({
            success: true,
            video: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete video
app.delete('/api/videos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await pool.query('DELETE FROM videos WHERE id = $1', [id]);
        
        res.json({
            success: true,
            message: 'Video deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get categories with counts
app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                category as id,
                CASE category
                    WHEN 'commercial' THEN 'Commercial'
                    WHEN 'social' THEN 'Social Media'
                    WHEN 'music' THEN 'Music Videos'
                    WHEN 'documentary' THEN 'Documentary'
                    ELSE 'Other'
                END as name,
                CASE category
                    WHEN 'commercial' THEN 'Professional commercial video projects'
                    WHEN 'social' THEN 'Engaging social media content'
                    WHEN 'music' THEN 'Creative music video productions'
                    WHEN 'documentary' THEN 'Documentary and narrative films'
                    ELSE 'Other projects'
                END as description,
                COUNT(*) as count
            FROM videos
            GROUP BY category
            ORDER BY count DESC
        `);
        
        res.json({
            success: true,
            categories: result.rows
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`PostgreSQL API server running on port ${port}`);
    console.log('API endpoints:');
    console.log('  GET  /api/videos - Get all videos');
    console.log('  POST /api/videos - Add video');
    console.log('  PUT  /api/videos/:id - Update video');
    console.log('  DELETE /api/videos/:id - Delete video');
    console.log('  GET  /api/categories - Get categories');
});
