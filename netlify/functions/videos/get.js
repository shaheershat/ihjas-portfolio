const { Pool } = require('pg');

// Database configuration
const dbConfig = {
    user: 'admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'ihjas_portfolio_db',
    password: process.env.DB_PASSWORD || 'admin',
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_SSL === 'true'
};

exports.handler = async (event, context) => {
    const pool = new Pool(dbConfig);
    
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
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
                success: true,
                videos,
                categories
            })
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
