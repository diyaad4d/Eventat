const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();


const app=express();

app.use(cors());
app.use(express.json());

// database connection :
// const pool = new Pool({
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     database: process.env.DB_NAME
// });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect()
    .then(() => console.log('Connected to PostgreSQL Database!'))
    .catch(err => console.error('Database Connection Error:', err.stack));



app.get('/',(req,res)=>{
    res.send('Eventat Backend is Running!');
});

app.get('/api/categories',async (req,res)=>{
    try{
        const result=await pool.query('SELECT * FROM categories');
        res.json(result.rows);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.get('/api/services', async (req, res) => {
    try {
        const query =
            ` SELECT s.service_id, s.title, s.description, s.base_price, s.service_location, s.image_url, 
                   c.name as category_name, u.full_name as vendor_name
            FROM services s
            JOIN categories c ON s.category_id = c.category_id
            JOIN users u ON s.vendor_id = u.user_id`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



app.post('/api/bookings', async (req, res) => {
    try {
        const { customer_id, service_id, event_date, estimated_total_cost } = req.body;


        if (!event_date || !service_id) {
            return res.status(400).json({ error: 'Date and Service are required' });
        }

        const newBooking = await pool.query(
            'INSERT INTO event_plans (customer_id, service_id, event_date, estimated_total_cost) VALUES ($1, $2, $3, $4) RETURNING *',
            [customer_id, service_id, event_date, estimated_total_cost]
        );

        res.json(newBooking.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



//    login and signup :

app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, full_name, role, phone } = req.body;

        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(401).json({ error: "User already exists!" });
        }


        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash, full_name, role, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [username, email, password, full_name, role, phone]
        );

        res.json(newUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;


        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(401).json({ error: "User not found" });
        }

        // this is for mvp in second will improve it to encrypted
        if (password !== user.rows[0].password_hash) {
            return res.status(401).json({ error: "Incorrect password" });
        }


        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});















const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});