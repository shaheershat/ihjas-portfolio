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
        const { id } = event.pathParameters;
        const { name, description } = JSON.parse(event.body);
        
        const result = await pool.query(`
            UPDATE categories 
            SET name = $1, description = $2, updated_at = NOW()
            WHERE id = $3
            RETURNING *
        `, [name, description, id]);
        
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
