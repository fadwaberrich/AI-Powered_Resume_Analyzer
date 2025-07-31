const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
require('dotenv').config();
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


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

//**********************************   Implementing openai to analyse the user's resume and returns the results     //**********************************

app.post('/analyze', async (req, res) => {
    const { resumeText, jobDescription } = req.body;
  
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: "Missing resumeText or jobDescription" });
    }
  
    try {
      const prompt = `
  You are an AI resume reviewer. Analyze the following resume against the job description.
  Return:
  1. ATS match score out of 100
  2. Missing technical keywords
  3. Suggestions for improvement
  
  Resume:
  ${resumeText}
  
  Job Description:
  ${jobDescription}
      `;
  
      const response = await openai.chat.completions.create({
        model:  "gpt-3.5-turbo",

        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      });
  
      const aiResponse = response.choices[0].message.content;
      res.json({ analysis: aiResponse });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'AI analysis failed' });
    }
  });
  

app.listen(5500, () => console.log('Backend running on port 5500'));
