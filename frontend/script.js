document.addEventListener('DOMContentLoaded', () => {
    // Read API_BASE_URL from config.js or fallback to relative routing
    const API_BASE_URL = typeof window.API_BASE_URL !== 'undefined' ? window.API_BASE_URL : '';

    // ==========================================================================
    // DOM Elements Selection
    // ==========================================================================
    const body = document.body;
    const themeToggleBtn = document.getElementById('theme-toggle');
    const dropZone = document.getElementById('drop-zone');
    const browseBtn = document.getElementById('browse-btn');
    const fileInput = document.getElementById('file-input');
    const filePreview = document.getElementById('file-preview');
    const fileNameEl = document.getElementById('file-name');
    const fileSizeEl = document.getElementById('file-size');
    const removeFileBtn = document.getElementById('remove-file-btn');
    const fileIconWrapper = document.getElementById('file-icon-wrapper');
    const analyzeBtn = document.getElementById('analyze-btn');
    
    // Panels
    const uploadPanel = document.getElementById('upload-panel');
    const loadingPanel = document.getElementById('loading-panel');
    const resultsPanel = document.getElementById('results-panel');
    const loadingStatusText = document.getElementById('loading-status-text');
    
    // Error Display
    const errorDisplay = document.getElementById('error-display');
    const errorMessageText = document.getElementById('error-message-text');
    
    // Progress Bar Elements
    const progressBar = document.getElementById('progress-bar');
    const progressPercent = document.getElementById('progress-percent');
    const progressTime = document.getElementById('progress-time');
    
    // Results DOM Elements
    const candidateMetaText = document.getElementById('candidate-meta-text');
    const candidateSummary = document.getElementById('candidate-summary');
    const candidateStrengths = document.getElementById('candidate-strengths');
    const candidateSkills = document.getElementById('candidate-skills');
    const candidateTech = document.getElementById('candidate-tech');
    const resetBtn = document.getElementById('reset-btn');

    // ==========================================================================
    // Application State
    // ==========================================================================
    let currentFile = null;

    // ==========================================================================
    // Theme Management
    // ==========================================================================
    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            body.classList.add('dark-theme');
        } else {
            body.classList.remove('dark-theme');
        }
    };

    const toggleTheme = () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        }
    };

    themeToggleBtn.addEventListener('click', toggleTheme);
    initTheme();

    // ==========================================================================
    // Drag & Drop / File Selection Logic
    // ==========================================================================
    
    // Click on drop zone triggers file browse dialog
    dropZone.addEventListener('click', (e) => {
        if (e.target !== browseBtn) {
            fileInput.click();
        }
    });

    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Dragover visual highlights
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        handleFiles(dt.files);
    });

    const handleFiles = (files) => {
        if (files.length === 0) return;
        
        const file = files[0];
        const extension = file.name.split('.').pop().toLowerCase();
        
        // Validate File format & size
        if (extension !== 'pdf' && extension !== 'docx') {
            alert('Unsupported file type. Please upload a PDF or DOCX file.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert('File size exceeds the 10MB limit. Please upload a smaller file.');
            return;
        }

        currentFile = file;
        
        // Hide old errors if any
        errorDisplay.style.display = 'none';
        
        displayFilePreview(file);
    };

    const displayFilePreview = (file) => {
        const extension = file.name.split('.').pop().toLowerCase();
        fileNameEl.textContent = file.name;
        
        const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
        fileSizeEl.textContent = `${sizeInMb} MB`;
        
        // Class and icon updates
        fileIconWrapper.className = `file-icon ${extension}`;
        if (extension === 'pdf') {
            fileIconWrapper.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <path d="M12 18v-6"/>
                    <path d="M9 15h6"/>
                </svg>
            `;
        } else {
            fileIconWrapper.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <path d="M8 13h8"/>
                    <path d="M8 17h8"/>
                </svg>
            `;
        }

        dropZone.style.display = 'none';
        filePreview.style.display = 'flex';
        analyzeBtn.disabled = false;
    };

    const removeFile = () => {
        currentFile = null;
        fileInput.value = '';
        
        filePreview.style.display = 'none';
        dropZone.style.display = 'block';
        analyzeBtn.disabled = true;
    };

    removeFileBtn.addEventListener('click', removeFile);

    // ==========================================================================
    // API Call & Response Handler (No Local Mock Fallbacks)
    // ==========================================================================
    analyzeBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        // Transition to Loading State
        uploadPanel.style.display = 'none';
        loadingPanel.style.display = 'flex';
        loadingStatusText.textContent = "Uploading resume to server...";
        
        // Reset Progress Bar
        progressBar.style.width = '0%';
        progressPercent.textContent = '0%';
        progressTime.textContent = 'Est. remaining: 20s';

        const formData = new FormData();
        formData.append('file', currentFile);

        // Status update simulation timers
        const statusTimeouts = [];
        const updateStatus = (text, delay) => {
            const timeoutId = setTimeout(() => {
                loadingStatusText.textContent = text;
            }, delay);
            statusTimeouts.push(timeoutId);
        };

        updateStatus("Extracting document content...", 800);
        updateStatus("Running semantic matching with Gemini AI...", 4000);
        updateStatus("Finalizing analysis screening parameters...", 9000);
        updateStatus("Formulating candidate report summary...", 15000);

        // Dynamic progress calculation over ~20 seconds
        let progressVal = 0;
        const totalDuration = 20000; // 20 seconds estimate
        const tickInterval = 100; // update every 100ms
        const incrementPerTick = (100 / (totalDuration / tickInterval)); // ~0.5% per tick

        const progressInterval = setInterval(() => {
            if (progressVal < 88) {
                progressVal += incrementPerTick;
            } else if (progressVal < 98) {
                // Decelerate asymptotically as it crawls between 88% and 99%
                progressVal += (99 - progressVal) * 0.04;
            }
            
            const roundedVal = Math.round(progressVal);
            progressBar.style.width = `${roundedVal}%`;
            progressPercent.textContent = `${roundedVal}%`;

            const estRemaining = Math.max(0, Math.round((totalDuration - (progressVal / 100 * totalDuration)) / 1000));
            if (estRemaining > 0) {
                progressTime.textContent = `Est. remaining: ${estRemaining}s`;
            } else {
                progressTime.textContent = `Wrapping up...`;
            }
        }, tickInterval);

        try {
            // Server request to Vercel or local backend using API_BASE_URL
            const response = await fetch(`${API_BASE_URL}/api/analyze`, {
                method: 'POST',
                body: formData
            }).catch(networkError => {
                // Catch actual network/fetch-level errors (like CORS, server down, DNS issues)
                throw new Error("Network connection error: Failed to reach the API server. Please check your network connection, verify the backend URL in config.js, and ensure CORS is enabled on the server.");
            });

            let responseData;
            try {
                responseData = await response.json();
            } catch (jsonParseError) {
                throw new Error(`Server returned an invalid non-JSON response (Status code: ${response.status}).`);
            }

            if (!response.ok) {
                throw new Error(responseData.error || `Server responded with status ${response.status}`);
            }
            
            // Clear progress timers
            clearInterval(progressInterval);
            statusTimeouts.forEach(clearTimeout);

            // Set progress to 100% instantly on success
            progressBar.style.width = '100%';
            progressPercent.textContent = '100%';
            progressTime.textContent = 'Analysis complete!';

            // Render Results after a small transition delay
            setTimeout(() => {
                renderResults(responseData);
            }, 400);

        } catch (err) {
            console.error("Analysis failed:", err);
            clearInterval(progressInterval);
            statusTimeouts.forEach(clearTimeout);
            
            // Hide loading panel and show upload panel with error banner
            loadingPanel.style.display = 'none';
            uploadPanel.style.display = 'block';
            
            errorMessageText.textContent = err.message || "An unexpected error occurred during resume analysis. Please try again.";
            errorDisplay.style.display = 'flex';
        }
    });

    const renderResults = (report) => {
        // Update candidate meta and summary text
        candidateMetaText.textContent = `${report.candidateName} • ${report.profileTitle}`;
        candidateSummary.textContent = report.summary;

        // Render Strengths list items
        candidateStrengths.innerHTML = "";
        if (report.strengths && Array.isArray(report.strengths)) {
            report.strengths.forEach(strength => {
                const li = document.createElement('li');
                li.textContent = strength;
                candidateStrengths.appendChild(li);
            });
        }

        // Render Core Skills chips
        candidateSkills.innerHTML = "";
        if (report.skills && Array.isArray(report.skills)) {
            report.skills.forEach(skill => {
                const span = document.createElement('span');
                span.className = "chip";
                span.textContent = skill;
                candidateSkills.appendChild(span);
            });
        }

        // Render Technologies chips
        candidateTech.innerHTML = "";
        const techList = report.technologies || report.tech || [];
        if (techList && Array.isArray(techList)) {
            techList.forEach(techItem => {
                const span = document.createElement('span');
                span.className = "chip";
                span.textContent = techItem;
                candidateTech.appendChild(span);
            });
        }

        // Switch panels to results view
        loadingPanel.style.display = 'none';
        resultsPanel.style.display = 'block';
    };

    // Reset button logic
    resetBtn.addEventListener('click', () => {
        removeFile();
        resultsPanel.style.display = 'none';
        uploadPanel.style.display = 'block';
    });
});
