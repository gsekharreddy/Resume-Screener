# AI-Powered Resume Screening Website

A production-ready, full-stack **AI-Powered Resume Screening Website** designed with a modern, responsive user interface and powered by the **Google Gemini API**. 

This application parses uploaded candidate resumes (supporting both **PDF** and **DOCX** files), processes the text contents, queries the Gemini generative models, and presents clean, semantic evaluations directly to recruiters in real time.

---

## 📋 Requirements & Features Checklist

- [x] **Modern & User-Friendly UI**: Implements a minimal, responsive single-page web interface with a card-based layout, light/dark themes, clean spacing, Google Fonts (Outfit & Plus Jakarta Sans), and smooth transitions.
- [x] **Flexible Document Parsing**: Supports uploading resumes in **PDF** and **DOCX** formats up to 10MB.
- [x] **LLM-Based Evaluation (Gemini API)**:
  - **Candidate Summary**: A concise, 3-4 sentence AI evaluation of the candidate's background and suitability.
  - **Skills Extraction**: Identifies 8-12 core candidate skills, rendered visually as tags/chips.
  - **Strengths & Expertise**: Extracts key professional highlights and achievements.
  - **Technologies & Competencies**: Highlights technical tools, libraries, databases, and general competencies.
- [x] **Full-Stack Architecture**: Clean decoupling between frontend client files and the Express backend API.
- [x] **AWS & Production Deployment**: Ready to deploy online with **Frontend on AWS S3** static website hosting and **Backend on Vercel** serverless node functions.
- [x] **GitHub & Git Ready**: Pre-configured with a `.gitignore` to prevent leaking API keys or cache files.

---

## 📂 Project Directory Structure

```text
Resume Screener/
├── frontend/                   # Frontend Client Application
│   ├── index.html              # UI structure, PDF.js & Mammoth.js script parsers
│   ├── style.css               # Clean typography, dynamic progress bar & theme stylesheets
│   ├── script.js               # Event handlers, state controller, and backend fetch requests
│   └── config.js               # Frontend API URL configuration
│
├── backend/                    # Backend API Application
│   ├── server.js               # Express API endpoints & document text extraction routing
│   ├── vercel.json             # Vercel serverless functions configuration (subfolder)
│   ├── generate-resumes.js     # Script compiler to build formatted sample PDFs
│   ├── package.json            # Node project requirements & scripts
│   └── .env                    # Local port config & GEMINI_API_KEY secret
│
├── sample_resumes/             # Beautifully compiled realistic resume PDFs for testing
│   ├── Sarah_Jenkins_Resume.pdf 
│   ├── John_Doe_CV.pdf          
│   └── Jane_Smith_Resume.pdf    
│
├── vercel.json                 # Vercel routing configurations (root level)
├── .gitignore                  # Git tracking exclusion filters (node_modules, .env, logs)
├── run.bat                     # Double-clickable Windows script for automated setup and run
├── package.json                # Root package configuration mapping to the backend subdirectory
└── README.md                   # Complete project documentation
```

---

## ⚙️ Local Development Setup

### 1. Configure Gemini API Key
Create a `.env` file inside the `backend/` directory (or modify the existing one) and configure your credentials:
```env
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key
```

### 2. Run the Application (Windows)
Double-click the **`run.bat`** file in the project root folder. The script will automatically:
1. Detect and install any missing backend dependencies.
2. Start the Express backend server on port `5000`.
3. Host the frontend static interface.

Alternatively, execute manually in your terminal from the root folder:
```bash
npm run setup  # Installs backend dependencies (only needed once)
npm start      # Starts backend server and hosts frontend on http://localhost:5000
```

Once started, open **[http://localhost:5000](http://localhost:5000)** in your web browser.

---

## 🚀 Production Deployment

The project is configured for deployment with the **Frontend on AWS S3** (static hosting) and the **Backend on Vercel** (serverless API).

### 1. Backend Deployment (Vercel)
The Express backend is set up as a serverless-friendly application.
1. Sign in to your [Vercel Account](https://vercel.com) and import this repository.
2. Under **Project Settings ➡️ Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `ALLOWED_ORIGINS`: `https://sekhar-resume-screener.s3.ap-southeast-2.amazonaws.com` (Your AWS S3 website endpoint, without a trailing slash).
3. Click **Deploy**. Vercel will process the `vercel.json` instructions and output your backend endpoint (e.g. `https://your-backend.vercel.app`).

*Note: You can verify the health of your backend at any time by visiting `https://your-backend.vercel.app/api/health`.*

### 2. Frontend Deployment (AWS S3)
1. Open [frontend/config.js](frontend/config.js) and point the URL to your Vercel backend deployment:
   ```javascript
   window.API_BASE_URL = "https://your-backend.vercel.app";
   ```
2. In the [AWS Console](https://aws.amazon.com/console/), navigate to **S3** and create a new bucket.
3. Under the bucket settings:
   - Disable **Block all public access**.
   - Enable **Static website hosting** (set Index document to `index.html`).
4. Upload all files from the `frontend/` directory (`index.html`, `style.css`, `script.js`, `config.js`) directly to the S3 bucket root.
5. Add a **Bucket Policy** to make your hosted assets publicly readable:
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
6. Visit your static website hosting URL to access the live screening app!

---

## 📤 Pushing to GitHub

To push the complete source code and deployment documentation to GitHub:

1. Initialize Git in the project root directory:
   ```bash
   git init
   ```
2. Stage the changes (the `.gitignore` will automatically exclude `.env` files and `node_modules`):
   ```bash
   git add .
   ```
3. Commit the code:
   ```bash
   git commit -m "Initial commit: AI-Powered Resume Screener with AWS S3 and Vercel configs"
   ```
4. Create a new repository on GitHub, copy the repository URL, and link it:
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   git branch -M main
   ```
5. Push the code:
   ```bash
   git push -u origin main
   ```
