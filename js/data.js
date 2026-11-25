/* ==========================================================================
   data.js — single source of truth for content used by several sections
   (project cards, terminal, skill graph, learning list).
   Edit here; the page rebuilds itself.
   ========================================================================== */
window.DATA = {
  me: {
    name: "Sudipto Acharjee Dhrubo",
    short: "Sudipto",
    school: "University of Liberal Arts Bangladesh (ULAB)",
    program: "B.Sc. in Computer Science & Engineering · Major in Data Science · Minor in Electrical & Electronic Engineering",
    status: "final semester",
    github: "https://github.com/Sudipto-Acharjee-Dhrubo",
    linkedin: "https://www.linkedin.com/in/sudiptoacharjeedhrubo/",
    email: "sudipto200a2@gmail.com",
    phone: "01537355017",
    address: "11 Satish Sarker Road, Gandaria, Dhaka-1204"
  },

  /* demo: put a live URL string to show a "Live demo" link on that card.
     repo: GitHub repo name, or null when there is no public repo to link.
     Descriptions marked (check) were written from the repo name alone —
     replace them with your own wording. */
  projects: [
    {
      id: "dermovlm", cat: "ml", visual: "derm", featured: true,
      title: "DermoVLM-C",
      kind: "Capstone · CSE 4098",
      desc: "An explainable vision-language framework for skin-lesion classification. An ensemble of ResNet-50, Swin-T and EfficientNet-B0 makes the call, BiomedCLIP retrieves similar cases, and the system abstains when it is not confident enough to answer.",
      fact: "Abstention lifts melanoma sensitivity to as much as 0.943 on the cases it chooses to answer.",
      tags: ["Deep learning", "BiomedCLIP", "MedSAM", "Qwen2-VL", "Gradio"],
      repo: "DermoVLM-C-Capstone", demo: null
    },
    {
      id: "aalopoth", visual: "path", cat: "", latest: true,
      title: "AaloPoth",
      kind: "Newest repo",
      desc: "My most recent project. The write-up is still to come, so the repository is the best place to see what it does. (check)",
      tags: ["New"],
      repo: "AaloPoth", demo: null
    },
    {
      id: "signlens", cat: "ml", visual: "hand",
      title: "SignLens",
      kind: "Browser app",
      desc: "Sign language recognition and translation in the browser. It tracks hand landmarks from your webcam with MediaPipe, turns signs into text and speaks them aloud. A built-in k-NN trainer lets you teach it your own signs. Nothing is uploaded.",
      tags: ["JavaScript", "MediaPipe", "k-NN", "On-device"],
      repo: "signlens", demo: null
    },
    {
      id: "faceroll", cat: "ml", visual: "face",
      title: "FaceRoll",
      kind: "Browser app",
      desc: "Face-recognition attendance. Enrol someone with five webcam samples, then it recognises faces live and marks attendance once per session per day. Blink detection blocks photo spoofing, and reports export to CSV or PDF.",
      tags: ["JavaScript", "face-api.js", "Anti-spoofing", "On-device"],
      repo: "faceroll", demo: null
    },
    {
      id: "heart", cat: "ml", visual: "ecg",
      title: "Heart Disease API",
      kind: "ML service",
      desc: "A heart-disease prediction model served through a FastAPI endpoint and packaged with Docker, so it runs the same on any machine. (check)",
      tags: ["Python", "FastAPI", "Docker"],
      repo: "heart-disease-fastapi-docker", demo: null
    },
    {
      id: "nasa", cat: "event", visual: "orbit",
      title: "NASA Space Apps",
      kind: "Hackathon",
      desc: "A project built for the NASA Space Apps Challenge. (check)",
      tags: ["Hackathon", "Space data"],
      repo: "nasa_sapce_apps", demo: null
    },
    {
      id: "url", cat: "web", visual: "link",
      title: "URL Shortener",
      kind: "Web service",
      desc: "Paste a long link, share a short one. A classic second-year CSE service, built as a website. (check)",
      tags: ["Web app", "Routing"],
      repo: "url-shortener", demo: null
    },
    {
      id: "club", cat: "web", visual: "club",
      title: "ULAB Club",
      kind: "Community site",
      desc: "A website for a club at ULAB. (check)",
      tags: ["Web app", "HTML · CSS · JS"],
      repo: "Ulab-Club", demo: null
    }
  ],

  /* Certificates, newest first. `img` is the base name in assets/certs/ (-thumb.jpg for the card). */
  certs: [
    { img: "nasa-space-apps", cat: "event", title: "Galactic Problem Solver", issuer: "NASA Space Apps Challenge", date: "Nov 14–15, 2026", note: "Outstanding participation and effort in the 2026 challenge." },
    { img: "iioe-ai-medicine", cat: "ai", title: "AI + Medicine: Applications and Breakthroughs", issuer: "IIOE · UNESCO-ICHEI · SUSTech", date: "2026", note: "Micro-certification, certificate of competency." },
    { img: "iioe-fluvial-hydraulics", cat: "ai", title: "AI and ML Applications in Fluvial Hydraulics", issuer: "IIOE · UNESCO-ICHEI · IIITDM Jabalpur", date: "2026", note: "Micro-certification, all courses and examinations passed." },
    { img: "google-cloud-ai-ml", cat: "ai", title: "Introduction to AI and Machine Learning on Google Cloud", issuer: "NetCom Learning", date: "Aug 20, 2026", note: "8 hours.", pdf: true },
    { img: "ulab-workshop", cat: "uni", title: "Navigating Grief and Loss: Building Resilience and Promoting Well-being", issuer: "ULAB Student Affairs Office", date: "Jun 18, 2026", note: "Workshop participation.", pdf: true },
    { img: "forage-mastercard", cat: "sim", title: "Cybersecurity Job Simulation", issuer: "Mastercard · Forage", date: "May 29, 2026", note: "Designed a phishing email simulation and interpreted the results." },
    { img: "forage-deloitte", cat: "sim", title: "Data Analytics Job Simulation", issuer: "Deloitte · Forage", date: "May 29, 2026", note: "Data analysis and forensic technology tasks." },
    { img: "ulab-coderhunt", cat: "uni", title: "Coderhunt: Enter the Competitive Programming Arena", issuer: "ULAB Computer Programming Club", date: "", note: "Completed the competitive programming workshop." },
    { img: "linkedin-generative-ai", cat: "ai", title: "What Is Generative AI?", issuer: "LinkedIn Learning", date: "May 28, 2026", note: "Generative AI tools and fundamentals.", pdf: true }
  ],

  /* Skill graph: hubs, their skills, and a few cross-links. */
  skills: {
    hubs: [
      { id: "lang", label: "Languages", x: 0.2, y: 0.24,
        items: [
          { id: "py", label: "Python", note: "Capstone pipeline, ML experiments, the FastAPI service" },
          { id: "js", label: "JavaScript", note: "SignLens, FaceRoll, and the page you are on" },
          { id: "web", label: "HTML & CSS", note: "Responsive layouts and the occasional animation" },
          { id: "tex", label: "LaTeX", note: "Reports and assignments that need to compile cleanly" }
        ] },
      { id: "ml", label: "Machine learning", x: 0.8, y: 0.22,
        items: [
          { id: "dl", label: "Deep learning", note: "ResNet-50, Swin-T and EfficientNet-B0 ensemble" },
          { id: "cv", label: "Computer vision", note: "Landmarks, face recognition, lesion segmentation" },
          { id: "vlm", label: "Vision-language models", note: "BiomedCLIP retrieval, Qwen2-VL explanations" },
          { id: "mp", label: "MediaPipe", note: "Hand tracking behind SignLens" },
          { id: "fa", label: "face-api.js", note: "In-browser face recognition for FaceRoll" }
        ] },
      { id: "ship", label: "Shipping", x: 0.78, y: 0.8,
        items: [
          { id: "fast", label: "FastAPI", note: "Serves the heart-disease model" },
          { id: "dock", label: "Docker", note: "Same container on every machine" },
          { id: "gh", label: "Git & GitHub", note: "Version control, GitHub Pages" },
          { id: "vc", label: "Vercel", note: "Deploying web projects" },
          { id: "grad", label: "Gradio", note: "Turning a model into a demo anyone can click" }
        ] },
      { id: "hw", label: "Beyond software", x: 0.2, y: 0.8,
        items: [
          { id: "circ", label: "Electronic circuits", note: "EEE coursework alongside CSE" },
          { id: "pwr", label: "Power systems", note: "Simulated in PowerWorld" },
          { id: "col", label: "Colab & Jupyter", note: "Where most experiments start" }
        ] }
    ],
    links: [["py", "dl"], ["js", "mp"], ["js", "fa"], ["py", "fast"], ["fast", "dock"], ["dl", "vlm"], ["grad", "vlm"], ["col", "py"], ["web", "js"], ["gh", "vc"]]
  },

  /* status: done | run | next — no invented percentages. */
  learning: [
    { status: "done", text: "Machine learning that runs in the browser", detail: "MediaPipe, face-api.js, k-NN" },
    { status: "run", text: "Fine-tuning vision-language models", detail: "Qwen2-VL-2B for the capstone, align first, then diagnose" },
    { status: "run", text: "Shipping ML as a service", detail: "FastAPI and Docker, then somewhere it can stay online" },
    { status: "next", text: "Graduate study in AI and data science", detail: "Reading up on programmes and what they expect" }
  ]
};
