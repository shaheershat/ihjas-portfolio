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
        const { name, description } = JSON.parse(event.body);
        
        const result = await pool.query(`
            INSERT INTO categories (name, description, created_at, updated_at)
            VALUES ($1, $2, NOW(), NOW())
            RETURNING *
        `, [name, description]);
        
        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
                success: true,
                category: result.rows[0]
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
