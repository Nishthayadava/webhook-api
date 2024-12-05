const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Endpoint to receive webhook
app.post('/webhook', (req, res) => {
    console.log('Webhook received:', req.body);

    // Process the webhook payload
    const { event, data } = req.body;

    // Example: Save data to a database or log it
    // saveToDatabase(data);

    res.status(200).send('Webhook received');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
