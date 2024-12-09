const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');



const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(bodyParser.json());

// In-memory storage for webhook data
let webhookData = [];


const pool = new Pool({
    user: 'dbforme_user',          // Replace with your PostgreSQL username
    host: 'dpg-ct51dgalqhvc73a6dsb0-a',             // Replace with your PostgreSQL host (use localhost if running locally)
    database: 'dbforme',      // Replace with your database name
    password: 'eryWjNApbGNFWv33BCB6woCOD7wGgrds',  // Replace with your database password
    port: 5432,                    // Default PostgreSQL port
});


// Endpoint to fetch the current webhook data
app.get('/api/webhook-data', (req, res) => {
    const result = await pool.query('SELECT * FROM webhook_data');
    res.json(result.rows);  // Return the stored webhook data from the database
    console.log('Sending current webhook data');
    
    // res.json(webhookData);  // Return the stored webhook data
    // console.log('Sending current webhook data');
});

// Handle the first webhook
app.post('/webhook/first', (req, res) => {
    try {
        const rawData = req.body[''];
        const [name, email, phone] = rawData.split(',').map((item) => item.trim());

           const result = await pool.query(
            'INSERT INTO webhook_data (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
            [name, email, phone]
        );
        const data = result.rows[0]; // Get the inserted data
        io.emit('update', [data]);  // Emit the new data to connected clients
        console.log('First webhook data processed:', data);
        res.status(200).send('First webhook received.');
        
        // const data = { name, email, phone, secondConfirmationSent: false };
        // webhookData.push(data);

        // io.emit('update', webhookData);
        // console.log('First webhook data processed:', data);
        // res.status(200).send('First webhook received.');
    } catch (error) {
        console.error('Error processing first webhook:', error.message);
        res.status(400).send('Invalid data format.');
    }
});

// Handle the second webhook
app.post('/webhook/second', (req, res) => {
    try {
        const email = req.body[''];

           const result = await pool.query(
            'UPDATE webhook_data SET second_confirmation_sent = TRUE WHERE email = $1 RETURNING *',
            [email]
        );

        const updatedData = result.rows[0]; // Get the updated data
        io.emit('update', [updatedData]);  // Emit the updated data to connected clients

        // webhookData = webhookData.map((entry) =>
        //     entry.email === email
        //         ? { ...entry, secondConfirmationSent: true }
        //         : entry
        // );

        io.emit('update', webhookData);
        console.log('Second webhook data processed for email:', email);
        res.status(200).send('Second webhook received.');
    } catch (error) {
        console.error('Error processing second webhook:', error.message);
        res.status(400).send('Invalid data format.');
    }
});

// Serve the server
server.listen(5000, () => {
    console.log('Webhook server is running on http://localhost:5000');
});
