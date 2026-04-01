const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    try {
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                body: JSON.stringify({ error: 'Method not allowed' })
            };
        }
        
        const data = JSON.parse(event.body);
        
        // Write to the portfolio.json file
        const filePath = path.join(__dirname, '../data/portfolio.json');
        await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                success: true,
                message: 'Data saved successfully! Changes are now visible to all visitors.'
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                success: false, 
                error: error.message 
            })
        };
    }
};
