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

// Handle the first webhook
app.post('/webhook/first', (req, res) => {
    try {
        const rawData = req.body[''];
        const [name, email, phone] = rawData.split(',').map((item) => item.trim());

        const data = { name, email, phone, secondConfirmationSent: false };
        webhookData.push(data);

        io.emit('update', webhookData);
        console.log('First webhook data processed:', data);
        res.status(200).send('First webhook received.');
    } catch (error) {
        console.error('Error processing first webhook:', error.message);
        res.status(400).send('Invalid data format.');
    }
});

// Handle the second webhook
app.post('/webhook/second', (req, res) => {
    try {
        const email = req.body[''];

        webhookData = webhookData.map((entry) =>
            entry.email === email
                ? { ...entry, secondConfirmationSent: true }
                : entry
        );

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
