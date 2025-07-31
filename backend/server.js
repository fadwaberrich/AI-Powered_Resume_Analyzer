const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const axios = require('axios');


const app = express();
app.use(cors({
    origin: '*'
  }));
app.use(express.json());

const upload = multer({ dest: 'uploads/' });
app.get('/', (req, res) => {
    res.send('Server is running 🚀');
  });

app.post('/upload', upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');

  const pdfBuffer = fs.readFileSync(req.file.path);
  try {
    const data = await pdfParse(pdfBuffer);
    res.json({ text: data.text });
  } catch (err) {
    res.status(500).send('Error reading PDF');
  }
});

//**********************************   Implementing python ai to analyse the user's resume and returns the results     //**********************************

app.post('/analyze', async (req, res) => {
    const { resumeText, jobDescription } = req.body;
  
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: "Missing resumeText or jobDescription" });
    }
  
    try {
      const response = await axios.post('http://127.0.0.1:6000/analyze', {
        resumeText,
        jobDescription
      });
  
      // Forward the AI microservice response to the frontend
      res.json(response.data);
    } catch (err) {
      console.error('Python AI error:', err.message);
      res.status(500).json({ error: 'Failed to analyze resume with AI service' });
    }
  });

app.listen(5500, () => console.log('Backend running on port 5500'));
