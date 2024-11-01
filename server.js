const express = require('express');
const audioRoutes = require('./routes/audioRoutes');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3003;

app.use(express.json());

app.use('/', audioRoutes);

let requestQueue = [];
const {launchBrowser, loginGoogle, newNotebook, addGoogleDoc, login} = require('./controllers/browerController');

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    await launchBrowser();
    await loginGoogle();
 //   await newNotebook();
   // await addGoogleDoc();
});