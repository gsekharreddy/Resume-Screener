require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Setup allowed origins from environment variables
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim().toLowerCase())
    : [];

// Enable dynamic CORS for frontend requests
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like server-to-server, curl, mobile apps, or local file runs)
        if (!origin) return callback(null, true);
        
        const originLower = origin.toLowerCase();
        
        // Dynamically allow localhost and loopback origins for ease of development
        const isLocalHost = originLower.startsWith('http://localhost:') || 
                            originLower.startsWith('http://127.0.0.1:') || 
                            originLower === 'http://localhost' || 
                            originLower === 'http://127.0.0.1';
                            
        if (isLocalHost || allowedOrigins.includes('*') || allowedOrigins.includes(originLower)) {
            callback(null, true);
        } else {
            console.warn(`CORS block: Origin ${origin} not in ALLOWED_ORIGINS`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static frontend files from /frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Set up Multer for in-memory file buffers (keeps disk clean)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ==========================================================================
// Express API Endpoint: Health Check
// ==========================================================================
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend service is online' });
});

// ==========================================================================
// Express API Endpoint: Analyze Resume
// ==========================================================================
app.post('/api/analyze', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const filename = req.file.originalname;
    const extension = filename.split('.').pop().toLowerCase();
    let extractedText = '';

    console.log(`Received file: ${filename} for extraction.`);

    // Step 1: Parse the file to extract plain text
    try {
        if (extension === 'pdf') {
            const pdfData = await pdfParse(req.file.buffer);
            extractedText = pdfData.text;
        } else if (extension === 'docx') {
            const docxResult = await mammoth.extractRawText({ buffer: req.file.buffer });
            extractedText = docxResult.value;
        } else {
            return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or DOCX file.' });
        }
    } catch (parseError) {
        console.error('Document parsing error:', parseError);
        return res.status(500).json({ error: `Failed to extract text from document: ${parseError.message}` });
    }

    if (!extractedText || extractedText.trim() === '') {
        return res.status(400).json({ error: 'The uploaded document appeared empty or text extraction yielded no characters.' });
    }

    // Step 2: Query the real Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'abc' || apiKey.trim() === '') {
        console.error('Invalid Gemini API Key in .env configuration.');
        return res.status(500).json({ 
            error: 'Gemini API Key is not configured on the backend. Please add a valid GEMINI_API_KEY in the server\'s .env file.' 
        });
    }
    try {
        console.log('Initiating Gemini AI analysis...');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-3.5-flash',
            generationConfig: {
                responseMimeType: 'application/json'
            }
        });

        const systemPrompt = `You are a professional AI Resume Screening Assistant. 
Analyze the following resume text and extract candidate insights. 
You must respond with a JSON object matching this schema:
{
  "candidateName": "First and Last Name of the candidate (extracted from resume. If not found, use a plausible name like 'John Doe' or extract from filename)",
  "profileTitle": "A professional standard job title indicating their profile (e.g. 'Senior Frontend Engineer', 'Data Scientist', 'UX/UI Designer', 'Product Manager')",
  "summary": "A concise, professional 3-4 sentence AI-generated summary evaluating the candidate's background, core focus, and suitability.",
  "skills": ["Array of 8-12 core skills (e.g. 'React', 'TypeScript', 'Node.js', 'Python', 'A/B Testing')"],
  "strengths": ["Array of 4 key professional highlights or strengths based on their achievements"],
  "technologies": ["Array of 6-10 specific technologies, libraries, databases, or tools they use (e.g. 'Git', 'Webpack', 'PostgreSQL', 'Figma', 'Docker')"]
}

Resume Text:
${extractedText}
`;

        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text();
        
        // Return raw parsed JSON data from the model response
        const parsedData = JSON.parse(responseText);
        console.log(`Successfully analyzed resume for candidate: ${parsedData.candidateName || 'Unknown'}`);
        return res.json(parsedData);
        
    } catch (apiError) {
        console.error('Gemini AI API call failed:', apiError);
        return res.status(500).json({ 
            error: `Gemini AI service error: ${apiError.message || 'The API request failed. Please check your network connection and API key.'}` 
        });
    }
});

// Start Express listener only during manual local startup, not under Vercel serverless environment
if (process.env.NODE_ENV !== 'production' && require.main === module) {
    app.listen(PORT, () => {
        console.log(`Express server is running on port ${PORT}`);
    });
}

// Export the Express app for Vercel Serverless Function hosting
module.exports = app;
