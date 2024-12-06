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

// Endpoint to receive webhook
app.post('/webhook', (req, res) => {
    console.log('Webhook received:', req.body);

    // Process webhook data
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
        webhookData.push(processedData);
    }

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
