const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.post('/pdf', (req, res) => {
    // Example response
    res.json({ success: true, data: 'Mock result from pdf' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
