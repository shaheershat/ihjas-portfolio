# PostgreSQL Setup Guide for Ihjas Portfolio

## 🚀 Quick Setup Commands

### 1. Install PostgreSQL (macOS)
```bash
# Install PostgreSQL using Homebrew
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create database user and database
psql postgres
CREATE USER ihjas_portfolio WITH PASSWORD 'your_secure_password';
CREATE DATABASE ihjas_portfolio_db;
GRANT ALL PRIVILEGES ON DATABASE ihjas_portfolio_db TO ihjas_portfolio;
\q
```

### 2. Update Database Configuration

Edit `/Users/apple/Desktop/Ihjas/api/videos.js` and update the database config:

```javascript
const dbConfig = {
    user: 'ihjas_portfolio',
    host: 'localhost',
    database: 'ihjas_portfolio_db',
    password: 'your_secure_password',
    port: 5432,
    ssl: false
};
```

### 3. Install Node.js Dependencies
```bash
cd /Users/apple/Desktop/Ihjas
npm install express cors pg
```

### 4. Create Database Table
```sql
-- Connect to your database
psql -h localhost -U ihjas_portfolio -d ihjas_portfolio_db

-- Create videos table
CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    youtube_link VARCHAR(500) NOT NULL,
    category VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories view
CREATE VIEW categories_with_counts AS
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
ORDER BY count DESC;

\q
```

### 5. Start Backend API
```bash
npm start
```

The API will run on: http://localhost:3001

### 6. Test Database Connection
```bash
# Test connection
node -e "
const { Pool } = require('pg');
const pool = new Pool({
    user: 'ihjas_portfolio',
    host: 'localhost',
    database: 'ihjas_portfolio_db',
    password: 'your_secure_password',
    port: 5432
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('✅ Database connected successfully!');
    }
});
"
```

### 7. Start Frontend
```bash
# In another terminal
python3 -m http.server 8000

# Or open directly
open http://localhost:8000
```

## 🗄️ Database Schema

### Videos Table
- `id` - Primary key (auto-increment)
- `name` - Video title
- `description` - Video description
- `youtube_link` - YouTube URL
- `category` - Video category
- `date` - Video date
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Categories View
- Dynamic category counts based on videos table
- No need to manually update counts

## 🌐 Full Stack

- **Frontend**: HTML/CSS/JavaScript
- **Backend**: Node.js + Express + PostgreSQL
- **Database**: PostgreSQL
- **API**: RESTful endpoints

## 🔧 Environment Variables (Optional)

Create `.env` file for production:
```env
DB_USER=ihjas_portfolio
DB_HOST=localhost
DB_DATABASE=ihjas_portfolio_db
DB_PASSWORD=your_secure_password
DB_PORT=5432
```

And update the API to use process.env variables.

## 🚀 Deployment

For production deployment:
1. **Railway**: Easy PostgreSQL deployment
2. **Heroku**: PostgreSQL add-on available
3. **DigitalOcean**: PostgreSQL database + Node.js server

---

*Follow these steps to set up your complete PostgreSQL portfolio system!*
