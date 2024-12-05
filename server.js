const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the CORS middleware

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Temporary storage for webhook data
let webhookData = [];

// Endpoint to receive webhook
app.post('/webhook', (req, res) => {
    console.log('Webhook received:', req.body);
    // Save data to memory
    webhookData.push(req.body);

    res.status(200).send('Webhook received');
});

// Endpoint to fetch webhook data
app.get('/webhook-data', (req, res) => {
    res.status(200).json(webhookData);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
