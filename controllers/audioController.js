const { v4: uuidv4 } = require('uuid');
const { newNotebook, addGoogleDocs, addTexts, addPrompt, clickGenerate, clickSmallGenerateButton, setNotebookName, getSrc } = require('./browerController');
const { addJob, removeJob, loadJobData } = require('./jobConroller');
const fs = require('fs');
const path = require('path');

const audioDataFile = 'audioData.json';

let requestQueue = [];



const _generateAudio = async (google_doc, text, prompt, audioId) => {
  console.log('generateAudio');
  await newNotebook();
  if (google_doc) {
    console.log('parameter has google doc');
    await addGoogleDocs(google_doc);
  }
  if (text) {
    console.log('parameter has text');
    await addTexts(text);
  }
  await setNotebookName(audioId);
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
    _generateAudio(google_doc, text, prompt, audioId)
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
  const filename = req.params.id;
  const filePath = path.join('/root/Downloads', filename + '.wav');

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
          console.error("File not found:", err);
          return res.status(404).send("File not found.");
      }
      
      // Set headers for serving audio in the browser
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Disposition', 'inline');
      
      // Stream the audio file to the response
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
  });
};

exports.startJobs = async () => {
  requestQueue = loadJobData();
  if(requestQueue){
    processQueue();
  }
}