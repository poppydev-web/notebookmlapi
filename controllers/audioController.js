const { v4: uuidv4 } = require('uuid');
const { newNotebook, addGoogleDocs, addTexts, addPrompt, clickGenerate, clickSmallGenerateButton, getSrc } = require('./browerController');
const { addJob, removeJob, loadJobData } = require('./jobConroller');
const fs = require('fs');
const path = require('path');

const audioDataFile = 'audioData.json';

let requestQueue = [];



const generateAudio = async (google_doc, text, prompt, audioId) => {
  console.log('generateAudio');
  await newNotebook();
  if (google_doc) {
    await addGoogleDocs(google_doc);
  }
  if (text) {
    await addTexts(text);
  }
  if (prompt) {
    await addPrompt(prompt);
    await clickSmallGenerateButton();
  } else {
    await clickGenerate();
  }
  await getSrc(audioId);
  return "success";
}

const saveAudioData = (audioId, audioSrc) => {
  const audioData = loadAudioData();
  audioData[audioId] = audioSrc;
  fs.writeFileSync(audioDataFile, JSON.stringify(audioData, null , 2));
}

const loadAudioData = () => {
  if(!fs.existsSync(audioDataFile)) {
    return {};
  }
  const data = fs.readFileSync(audioDataFile);
  return JSON.parse(data);
}

const processQueue = () => {
  console.log("processQueue");
  if (requestQueue.length > 0) {
    const { google_doc, text, prompt, audioId } = requestQueue[0];
    generateAudio(google_doc, text, prompt, audioId)
      .then(status => {
        saveAudioData(audioId, status);
        removeJob();
        requestQueue.shift();
        processQueue();
      });
  }
}

exports.generateAudio = async (req, res) => {
  const { google_doc, text, prompt } = req.body;
  const audioId = uuidv4();
  res.json({ audioId });
  saveAudioData(audioId, "Not Ready.");
  addJob({ google_doc, text, prompt });
  requestQueue.push({ google_doc, text, prompt, audioId });
  console.log('Request length', requestQueue.length);

  if (requestQueue.length === 1) {
    processQueue();
  }
};

// Controller for retrieving audio
exports.getAudio = async (req, res) => {
  const filename = req.params.filename;
    const filePath = path.join('/root/Downloads', filename + '.wav');
    
    res.download(filePath, (err) => {
        if (err) {
            console.error("Error downloading file:", err);
            res.status(404).send("File not found.");
        }
    });
};