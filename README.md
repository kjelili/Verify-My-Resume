# VerifyIQ – Intelligent Resume Screening & Power Tools

A modern, AI-powered resume screening web app for **job seekers** and **recruiters**: ATS pass/fail, CV positioning, live job search, and **24 niche Power Tools** you won’t find in typical ATS checkers (Jobscan, Resume Worded, TopCV, LoopCV).

---

## What VerifyIQ Delivers

### Core analysis (per resume)

- **Upload & analyze** – PDF, DOC, DOCX (max 10MB). Client-side extraction and analysis.
- **ATS score & pass/fail** – Overall score plus three categories: Content, Sections, ATS Essentials.
- **Content checks** – Quantifiable achievements, repetition, parse rate, spelling/grammar cues.
- **Section checks** – Experience, Education, Skills detection and suggestions.
- **ATS essentials** – File format, email, hyperlink, design; actionable tips.
- **Strengths & tips** – What’s working and what to improve, including “bullets to improve” with rewrite hints.
- **Skill extraction** – 130+ skills (languages, frameworks, cloud, data, business, design, etc.).
- **CV positioning** – Auto-generated headline, summary snippet, and keywords to add for applications.
- **Match score & recommendation** – Per-file match score and status (Highly Recommended / Recommended / Consider).

### Job search & aggregator

- **Job search** – By keyword and country (Google Jobs via SerpAPI when `SERPAPI_KEY` is set).
- **Job cards** – Title, company, location, type, posted date, salary (when available), description snippet, Apply / View details.
- **CV positioning sidebar** – Headline, summary, and keywords to add, updated after you upload a resume.

### Power Tools (24 niche features)

After you upload and analyze a resume, the **Power Tools** panel appears with these tools:

| Tool | What it does |
|------|----------------|
| **Multi-ATS Simulator** | Shows how Workday-, Taleo-, and Greenhouse-style parsers might read your resume (side-by-side). |
| **Stress Test** | Simulates worst-case parsing (shuffled text) so you see why clear section headings matter. |
| **Outcome Tracker** | Record application outcomes (interview / rejected / no response) per role; view recent history. |
| **Company Playbooks** | Short ATS playbooks for Greenhouse, Workday, and Lever with format and keyword tips. |
| **Bias & Risk Scanner** | Flags possible age/gender/clarity signals (years, wording) and suggests neutral alternatives. |
| **Consistency Check** | Paste your LinkedIn text; compare with resume and see words in one but not the other. |
| **First 6 Seconds** | Shows headline + first 3 bullets as a recruiter would see them in a quick scan. |
| **STAR Stories** | Turn bullet points into Situation–Task–Action–Result style lines for interviews. |
| **Application Strategy** | Suggests how to split effort (applications vs resume polish) based on your ATS score. |
| **Redaction Profiles** | One-click redaction of email/phone for job-board–safe versions. |
| **Recruiter View** | Shareable link (e.g. `?recruiter=1`) for a simple recruiter view. |
| **Resume Library** | Save and name resume “tracks” (e.g. Product vs Data) and load them later. |
| **Rejection Autopsy** | Paste the JD (and optional rejection note); get likely reasons (missing keywords, overqualification, etc.). |
| **JD Fit** | Paste a job description; get a fit score vs that JD and “consider adding if true” keywords. |
| **Buzzword vs Substance** | Ratio of concrete terms (numbers, outcomes) vs buzzwords; suggestions to replace jargon. |
| **Salary & Level** | Infers level (Junior/Mid/Senior/Lead) and typical US band; tips to read as next level. |
| **1-Page vs 2-Page** | Recommends one or two pages from word count and experience; what to trim if too long. |
| **Stealth Applicant** | Checklist for applying without alerting current employer (confidential wording, LinkedIn, etc.). |
| **Resume Decay** | Optional “last updated” date; prompts to refresh by section if resume is stale. |
| **Referral Hints** | Optional company name; referral-friendly tweaks (location, alma mater, tech stack). |
| **Global Readability** | Score for non-native-English screeners; shorten long sentences, clear labels, date format. |
| **Version Diff** | Paste another resume version (B); compare word overlap and length vs current (A). |
| **Interview Bait** | Flags vague bullets and suggests one concrete detail so recruiters can ask “Tell me about when…”. |
| **Compliance Check** | Light integrity check: date gaps, mixed “led” vs “supported,” similar bullet starts. |

---

## Quick Start

### Prerequisites

- **Node.js** v14+ (optional; only for running the dev server and job API)
- Modern browser (Chrome, Firefox, Safari, Edge)

### Install & run

1. Clone or download the repo and go to the project folder:
   ```bash
   cd "Verify My Resume"
   ```

2. **Option A – Static only (no real jobs)**  
   ```bash
   npm start
   ```
   Opens `http://localhost:3000`. Upload works; job search uses sample listings.

3. **Option B – With real job search (Google Jobs)**  
   - Create a `.env` in the project root:
     ```
     SERPAPI_KEY=your_serpapi_key_here
     ```
   - Install and run the dev server that serves the app + API:
     ```bash
     npm install
     npm run dev-api
     ```
   - Open **http://localhost:3000**. Job search uses Google Jobs via SerpAPI.

4. **Option C – Open file**  
   Open `index.html` in the browser (some features may be limited by CORS).

### Real job search (production)

- Get a key at [serpapi.com](https://serpapi.com) (Google Jobs).
- Deploy `api/jobs.js` as a serverless function (e.g. Vercel, Netlify) and set **`SERPAPI_KEY`** (or `SERPAPI_API_KEY`).
- In your deployed app, set the job API URL before loading the script, e.g.:
  ```html
  <script>window.VerifyIQ_JOB_API_URL = 'https://your-app.vercel.app/api/jobs';</script>
  <script src="scripts/main.js"></script>
  ```

---

## Project Structure

```
Verify My Resume/
├── index.html          # Single-page app
├── api/
│   └── jobs.js         # Job search API (Google Jobs via SerpAPI)
├── server.js           # Local dev server (static + /api/jobs)
├── styles/
│   └── main.css        # Design system and layout
├── scripts/
│   └── main.js         # App logic (upload, ATS, Power Tools, job search)
├── package.json
├── .env                 # Optional: SERPAPI_KEY
└── README.md
```

---

## Usage

### Upload & analyze

1. Go to **Upload & Analyze**.
2. Drag and drop or click to select **PDF, DOC, or DOCX** (max 10MB per file).
3. Wait for analysis; then review:
   - Match score and recommendation
   - Skills detected
   - Experience and education
   - **Detailed ATS Analysis** (overall + Content, Sections, ATS Essentials)
   - **CV Positioning** (headline, summary, keywords)
   - **Power Tools** (24 tabs; use any tool on the analyzed resume).

### Job search

1. Use the **Job Search** section (keyword + country).
2. Submit; results appear in the aggregator (or sample jobs if no API key).
3. Use **Apply Now** / **View details** on each card.
4. Upload your CV to see **match scores** and **CV positioning** in the sidebar.

### Power Tools

1. After at least one resume is analyzed, the **Power Tools** section appears below the ATS report.
2. Switch tabs to use any of the 24 tools; many use the current resume text automatically; some ask for extra input (e.g. job description, LinkedIn text, version B, company name, last update date).

---

## Design System

- **Typography:** Inter (Google Fonts); scale 12px–48px; weights 300–700.
- **Colors:** Primary #2563EB, accent #10B981, neutrals #F8FAFC–#0F172A; success/error/warning semantics.
- **Spacing:** 4px–96px (8px base).
- **Components:** Rounded corners, light shadows, 150–300ms transitions; touch-friendly min 44px targets.

---

## Technologies

- **HTML5** – Semantic markup, ARIA where needed.
- **CSS3** – Custom properties, Grid, Flexbox, responsive and high-contrast friendly.
- **Vanilla JavaScript** – No framework; PDF.js and JSZip for PDF/DOCX extraction.
- **Optional:** Node (dev server), SerpAPI (live job search).

---

## Responsive & accessibility

- **Breakpoints:** Desktop (1280px+), tablet (768–1024px), mobile (320–768px).
- **Mobile:** Touch-friendly controls, collapsible nav, stacked layouts.
- **A11y:** Semantic structure, ARIA, keyboard navigation, focus styles, reduced-motion support where appropriate.

---

## Privacy & security

- **Processing:** Resume content is processed in the browser; no upload to VerifyIQ servers in the default setup.
- **Storage:** Optional use of `localStorage` for Outcome Tracker and Resume Library (outcomes, track names and metadata).
- **Safe output:** User-generated content is escaped when rendered to avoid XSS.

---

## Browser support

- Chrome, Firefox, Safari, Edge (current versions).
- Mobile: iOS Safari, Chrome Mobile.

---

## License

MIT – use for personal or commercial projects.

---

## Contributing & support

- Contributions: open a Pull Request.
- Issues or ideas: open an issue on the repository.

---

**VerifyIQ – Resume screening and 24 Power Tools for job seekers and recruiters.**
