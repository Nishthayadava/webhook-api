const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const EventEmitter = require('events'); // For real-time updates via SSE

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Temporary storage for webhook data
let webhookData = [];
const webhookEmitter = new EventEmitter(); // Event emitter for SSE

// Function to parse the received webhook data
const parseWebhookData = (data) => {
    const rawData = data[''];
    if (!rawData) return null;

    const [name, email, phone] = rawData.split(',').map((item) => item.trim());
    return { name, email, phone };
};

// Endpoint to receive webhook
app.post('/webhook', (req, res) => {
    console.log('Webhook received:', req.body);

    const parsedData = parseWebhookData(req.body);

    if (parsedData) {
        // Check if it's the first or second webhook
        const existingWebhookIndex = webhookData.findIndex(
            (webhook) => webhook.data?.email === parsedData.email
        );

        if (existingWebhookIndex !== -1) {
            // Update the secondReceived status for an existing entry
            webhookData[existingWebhookIndex].secondReceived = true;

            // Emit event for real-time updates
            webhookEmitter.emit('webhookReceived', webhookData[existingWebhookIndex]);
        } else {
            // Add new webhook entry
            webhookData.push({
                id: webhookData.length + 1,
                data: parsedData,
                secondReceived: false,
            });
        }
    } else {
        console.log("Received an empty webhook.");
    }

    res.status(200).send('Webhook processed');
});

// Endpoint to fetch webhook data
app.get('/webhook-data', (req, res) => {
    res.status(200).json(webhookData);
});

// SSE endpoint for real-time updates
app.get('/webhooks/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const onWebhookReceived = (webhook) => {
        res.write(`data: ${JSON.stringify(webhook)}\n\n`);
    };

    // Register the event listener
    webhookEmitter.on('webhookReceived', onWebhookReceived);

    // Cleanup when connection is closed
    req.on('close', () => {
        webhookEmitter.removeListener('webhookReceived', onWebhookReceived);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
