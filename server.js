const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());
app.use(bodyParser.json());

// Temporary storage for webhook data
let webhookData = [];

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
            processedData.secondReceived = false; // Default status
        }
    }

    // Add processed data to webhookData array
    if (Object.keys(processedData).length > 0) {
        processedData.event_id = "first-webhook"; // Tag with event ID
        webhookData.push(processedData);
    }

    res.status(200).send('First Webhook received');
});

// Endpoint to receive the second webhook
app.post('/webhook/second', (req, res) => {
    console.log('Second Webhook received:', req.body);

    const rawData = req.body[''];
    const processedData = {};

    if (rawData) {
        const parts = rawData.split(','); // Split the string by commas
        if (parts.length >= 3) {
            processedData.name = parts[0].trim(); // Extract name
            processedData.email = parts[1].trim(); // Extract email
            processedData.phone = parts[2].trim(); // Extract phone
            processedData.secondReceived = true; // Status for second webhook
        }
    }

    // Add processed data to webhookData array
    if (Object.keys(processedData).length > 0) {
        processedData.event_id = "second-webhook"; // Tag with event ID
        webhookData.push(processedData);
    }

    res.status(200).send('Second Webhook received');
});

// Endpoint to fetch webhook data
app.get('/webhook-data', (req, res) => {
    res.status(200).json(webhookData);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
