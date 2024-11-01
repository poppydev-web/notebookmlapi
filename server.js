const express = require('express');
const audioRoutes = require('./routes/audioRoutes');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3004;

app.use(express.json());

app.use('/', audioRoutes);

const {launchBrowser, loginGoogle, newNotebook, addGoogleDoc, login} = require('./controllers/browerController');
const { startJobs } = require('./controllers/audioController');

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    await launchBrowser();
    await loginGoogle();    
    await new Promise(resolve => setTimeout(resolve, 5000));
    await startJobs();
});