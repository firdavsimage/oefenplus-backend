const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/convert', (req, res) => {
    // Example response
    res.json({ success: true, data: 'Mock result from convert' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
