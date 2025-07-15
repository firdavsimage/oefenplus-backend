const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.post('/translate', (req, res) => {
    // Example response
    res.json({ success: true, data: 'Mock result from translate' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
