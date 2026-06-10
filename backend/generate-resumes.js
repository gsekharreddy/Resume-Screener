const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateResume(filename, data) {
    const doc = new PDFDocument({ 
        size: 'A4',
        margin: 50 
    });
    
    const outputDir = path.join(__dirname, '../sample_resumes');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path.join(outputDir, filename);
    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    // Candidate Header: Name
    doc.font('Helvetica-Bold').fontSize(26).fillColor('#1e1b4b').text(data.name, { lineGap: 4 });
    
    // Candidate Subheader: Title & Contact
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#4f46e5').text(data.title, { lineGap: 2 });
    doc.font('Helvetica').fontSize(9).fillColor('#6b7280').text(data.contact);
    doc.moveDown(1.5);

    // Visual Separation line
    doc.moveTo(50, doc.y).lineTo(545, doc.y);
    doc.lineWidth(1.5);
    doc.strokeColor('#e2e8f0');
    doc.stroke();
    doc.moveDown(1.5);

    // Summary Section
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#1e1b4b').text('Professional Summary');
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10).fillColor('#374151').text(data.summary, { align: 'justify', lineGap: 3 });
    doc.moveDown(1.5);

    // Skills Section
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#1e1b4b').text('Skills & Expertise');
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10).fillColor('#374151').text(data.skills.join('   |   '), { lineGap: 4 });
    doc.moveDown(1.5);

    // Experience Section
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#1e1b4b').text('Work Experience');
    doc.moveDown(0.8);
    
    data.experience.forEach(exp => {
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#1e1b4b').text(`${exp.role}`);
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#4f46e5').text(`${exp.company}  |  ${exp.dates}`);
        doc.moveDown(0.4);
        exp.bullets.forEach(bullet => {
            doc.font('Helvetica').fontSize(9.5).fillColor('#4b5563').text(`• ${bullet}`, { indent: 12, lineGap: 2 });
        });
        doc.moveDown(1.2);
    });

    // Education Section
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#1e1b4b').text('Education');
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#1e1b4b').text(data.education.degree);
    doc.font('Helvetica').fontSize(10).fillColor('#4b5563').text(`${data.education.school} (${data.education.year})`);

    doc.end();
    console.log(`Successfully generated resume PDF: ${filename}`);
}

const resumes = [
    {
        name: 'Sarah Jenkins',
        title: 'Senior Frontend Developer',
        contact: 'Email: sarah.jenkins@example.com  |  Phone: (555) 019-2834  |  Location: San Francisco, CA  |  GitHub: sjenkins-dev',
        summary: 'Dedicated Frontend Developer with over 6 years of experience specializing in constructing responsive, modern, and highly accessible user interfaces. Proven track record of spearheading state management overhauls using Redux and optimizing Webpack configurations for 30%+ speeds. Strong focus on design fidelity and search engine optimization guidelines.',
        skills: ['React.js', 'JavaScript (ES6+)', 'TypeScript', 'Redux Toolkit', 'HTML5 & CSS3', 'Tailwind CSS', 'Sass / SCSS', 'Web Accessibility (WCAG 2.1 AA)', 'RESTful APIs', 'Vite & Webpack', 'Jest', 'Git'],
        experience: [
            {
                role: 'Lead Frontend Architect',
                company: 'WebFlow Technologies Inc.',
                dates: '2023 - Present',
                bullets: [
                    'Led a team of 4 frontend engineers to rebuild the enterprise dashboard, increasing page load speed by 35% using Vite and code splitting.',
                    'Engineered a custom responsive design system in React aligned with modern Web Accessibility (a11y) standards, reaching 100% WCAG 2.1 AA compliance.',
                    'Implemented global state optimization with Redux Toolkit, resolving asynchronous data race conditions.'
                ]
            },
            {
                role: 'Senior UI Developer',
                company: 'PixelCraft Systems',
                dates: '2020 - 2023',
                bullets: [
                    'Developed pixel-perfect user interface designs based on Figma templates for key client portals using HTML5, SCSS, and JavaScript.',
                    'Established testing pipelines using Jest and React Testing Library, boosting code coverage from 45% to 88%.'
                ]
            }
        ],
        education: {
            degree: 'Bachelor of Science in Computer Science',
            school: 'University of California, Berkeley',
            year: '2019'
        }
    },
    {
        name: 'John Doe',
        title: 'Lead Data Scientist & Machine Learning Engineer',
        contact: 'Email: john.doe@example.com  |  Phone: (555) 234-8976  |  Location: Seattle, WA  |  LinkedIn: jdoe-data',
        summary: 'Analytical Data Scientist and ML Specialist with a passion for designing predictive models, natural language processing pipelines, and deep neural networks. Experienced in processing large-scale, multi-dimensional sensor and transaction data structures. Adept at translating mathematical formulas into clean, production-ready Python architectures.',
        skills: ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-Learn', 'SQL', 'PostgreSQL', 'Natural Language Processing (NLP)', 'Data Visualization', 'Tableau', 'Docker'],
        experience: [
            {
                role: 'Senior Machine Learning Specialist',
                company: 'Apex Intelligence Corp',
                dates: '2022 - Present',
                bullets: [
                    'Designed and deployed deep learning text recommendation engines in PyTorch, resulting in a 14% increase in user retention rates.',
                    'Engineered large ETL pipelines in Pandas and SQL to clean, normalize, and index unstructured telemetry log streams containing millions of points.',
                    'Constructed statistical predictive models using Scikit-Learn to detect financial transaction anomalies, reducing fraud occurrences by 22%.'
                ]
            },
            {
                role: 'Data Science Associate',
                company: 'NovaAnalytics LLC',
                dates: '2019 - 2022',
                bullets: [
                    'Built automated data extraction scripts in Python and SQL databases, decreasing reporting preparation delays by 40%.',
                    'Created interactive Tableau reports and visualizations to communicate regression modeling parameters to VP-level stakeholders.'
                ]
            }
        ],
        education: {
            degree: 'Master of Science in Statistics & Data Analytics',
            school: 'University of Washington',
            year: '2019'
        }
    },
    {
        name: 'Jane Smith',
        title: 'Senior UX/UI Designer',
        contact: 'Email: jane.smith@example.com  |  Phone: (555) 456-7890  |  Location: New York, NY  |  Portfolio: jsmithdesign.co',
        summary: 'Creative UX/UI Designer with 7 years of industry experience crafting user-centric design systems, clickable prototypes, and complex wireframes. Focuses on information architecture, responsive guidelines, and accessibility standards to build intuitive products. Deep experience conducting usability tests and managing developmental handover processes.',
        skills: ['UX Design', 'UI Design', 'Wireframing', 'High-Fidelity Prototyping', 'Information Architecture', 'Figma', 'Adobe Creative Suite', 'Photoshop', 'Illustrator', 'Design Systems', 'Usability Testing', 'User Journey Mapping'],
        experience: [
            {
                role: 'Principal Design System Designer',
                company: 'Vanguard Digital Solutions',
                dates: '2022 - Present',
                bullets: [
                    'Architected a comprehensive visual design system in Figma, scaling design output by 50% across 6 cross-functional product departments.',
                    'Conducted 30+ iterative usability tests and customer journey mapping cycles to optimize signup layouts, resulting in an 18% lift in user signup conversions.',
                    'Developed high-fidelity prototypes and interface handoff parameters using Figma token configurations for the engineering team.'
                ]
            },
            {
                role: 'UX Designer & Researcher',
                company: 'Modus Creative Group',
                dates: '2018 - 2022',
                bullets: [
                    'Designed comprehensive wireframes, typography layouts, and information structures for multi-tenant mobile applications.',
                    'Collaborated closely with frontend developers using basic HTML/CSS knowledge to ensure absolute layout spacing and typography compliance.'
                ]
            }
        ],
        education: {
            degree: 'Bachelor of Fine Arts in Graphic & Interaction Design',
            school: 'School of Visual Arts, New York',
            year: '2018'
        }
    }
];

resumes.forEach(res => {
    // Save files directly with clean names
    let filename = res.name.replace(/\s+/g, '_') + (res.name === 'John Doe' ? '_CV.pdf' : '_Resume.pdf');
    generateResume(filename, res);
});
