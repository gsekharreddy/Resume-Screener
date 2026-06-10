# AI Resume Screening System

A full-stack, responsive **AI Resume Screening System** powered by Gemini AI. The project is organized into dedicated frontend, backend, and sample resume directories. It parses uploaded PDF/DOCX resumes, queries Google Gemini AI for semantic evaluations, and presents a visual screening analysis.

---

## Directory Structure

```text
Resume Screener/
│
├── frontend/                   # Frontend assets
│   ├── index.html              # Markup skeleton (PDF.js / Mammoth.js loader)
│   ├── style.css               # Design variables, light/dark themes, animations
│   └── script.js               # UI controller & server API fetch requests
│
├── backend/                    # Backend server
│   ├── server.js               # Express API endpoints & document text extraction
│   ├── generate-resumes.js     # Script compiler to build formatted test PDFs
│   ├── package.json            # Node project requirements & scripts
│   └── .env                    # Port config & GEMINI_API_KEY
│
├── sample_resumes/             # Beautifully compiled real resume PDFs
│   ├── Sarah_Jenkins_Resume.pdf # Senior Frontend Developer resume
│   ├── John_Doe_CV.pdf          # Lead Data Scientist & ML Engineer CV
│   └── Jane_Smith_Resume.pdf    # Senior UX/UI Designer resume
│
└── README.md                   # Project instructions
```

---

## Setup and Running the App

### 1. Configure Gemini API Key
Configure your Gemini API key in the `backend/.env` file:
```env
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key
```

### 2. Run the Application (Windows)
Simply **double-click the `run.bat`** file in the root directory! 
It will automatically install any missing dependencies and start the backend server.

Alternatively, you can run manually via the command line:
```bash
npm run setup  # Runs setup (first time only)
npm start      # Starts backend server and hosts frontend on port 5000
```

Once started, open **[http://localhost:5000](http://localhost:5000)** in your web browser!

---

### (Optional) Rebuild Sample Resumes
To generate fresh resume PDF files in the `sample_resumes/` folder, run:
```bash
npm run generate
```

---

## Testing
1. Navigate to the web interface.
2. Drag and drop or browse to select any PDF resume from the `sample_resumes/` folder.
3. Click **Analyze Resume**.
4. The system will upload the file, parse its text, query Gemini AI, and display the candidate evaluation summary, core skills, strengths, and tools tags!

---

## Production Deployment

This project is fully structured and prepared for production-ready deployment with the **Frontend on AWS S3** and the **Backend on Vercel**.

### 1. Backend Deployment (Vercel)
The backend is configured as a serverless-friendly Express application.
1. Sign in to your [Vercel Account](https://vercel.com) and click **Add New Project**.
2. Import this repository.
3. In the project configuration, under **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `ALLOWED_ORIGINS`: Comma-separated list of allowed origins (e.g., `https://your-s3-bucket-website.amazonaws.com` or your custom domain).
4. Click **Deploy**. Vercel will build the project using the root `vercel.json` routing configurations and output a backend URL (e.g., `https://ai-resume-screener.vercel.app`).

### 2. Frontend Deployment (AWS S3)
The frontend is built using standard static HTML/CSS/JS and is ready for AWS S3 Static Website Hosting.
1. Open [frontend/config.js](frontend/config.js) and set `window.API_BASE_URL` to your Vercel deployment backend URL:
   ```javascript
   window.API_BASE_URL = "https://your-backend.vercel.app";
   ```
2. In the [AWS Console](https://aws.amazon.com/console/), navigate to **S3** and create a new bucket.
3. Under the bucket settings:
   - Disable **Block all public access**.
   - Enable **Static website hosting** (set Index document to `index.html`).
4. Upload all files from the `frontend/` directory (`index.html`, `style.css`, `script.js`, `config.js`) directly to the root of the S3 bucket.
5. Apply a **Bucket Policy** to make the static assets publicly readable:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```
6. Access your screening system using the S3 website endpoint!
