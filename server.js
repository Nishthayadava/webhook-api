const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());
app.use(bodyParser.json());

// Temporary storage for webhook data
let webhookData = [];

// Create HTTP server and Socket.IO server
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Adjust the origin as per your frontend
        methods: ['GET', 'POST']
    }
});

// Endpoint to receive the first webhook
app.post('/webhook/first', (req, res) => {
    console.log('First Webhook received:', req.body);

    const rawData = req.body[''];
    const processedData = {};

    if (rawData) {
        const parts = rawData.split(','); // Split the string by commas
        if (parts.length >= 3) {
            processedData.name = parts[0].trim(); // Extract name
            processedData.email = parts[1].trim(); // Extract email
            processedData.phone = parts[2].trim(); // Extract phone
            processedData.secondConfirmationSent = false; // Default status to "Pending"
        }
    }

    // Add processed data to webhookData array
    if (Object.keys(processedData).length > 0) {
        webhookData.push(processedData);
    }

    res.status(200).send('First Webhook received');
});

// Endpoint to receive the second webhook
app.post('/webhook/second', (req, res) => {
    console.log('Second Webhook received:', req.body);

    const email = req.body['']; // Extract email from the second webhook data

    // Find the entry that matches the email and update the status
    const entry = webhookData.find(item => item.email === email);
    if (entry) {
        entry.secondConfirmationSent = true; // Update status to "Agreed"

        // Emit real-time updates to the frontend via WebSocket
        io.emit('update', webhookData);
    }

    res.status(200).send('Second Webhook received and status updated');
});

// Endpoint to fetch webhook data (for frontend)
app.get('/webhook-data', (req, res) => {
    res.status(200).json(webhookData); // Return the webhook data array
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
