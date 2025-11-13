const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('./models/Job');
const Resource = require('./models/Resource');

dotenv.config();

const seedJobs = [
  {
    title: "Frontend Developer",
    company: "Tech Solutions Inc",
    location: "Remote",
    remote: true,
    requiredSkills: ["JavaScript", "React", "HTML", "CSS"],
    experienceLevel: "Junior",
    jobType: "Full-time",
    description: "Build and maintain dynamic user interfaces using React."
  },
  {
    title: "Data Analyst Intern",
    company: "Data Insights Co",
    location: "Chattogram",
    remote: false,
    requiredSkills: ["Python", "Excel", "SQL", "Statistics"],
    experienceLevel: "Fresher",
    jobType: "Internship",
    description: "Assist in analyzing large datasets and generating insights."
  },
  {
    title: "Backend Developer",
    company: "Cloudify Labs",
    location: "Dhaka",
    remote: true,
    requiredSkills: ["Node.js", "Express", "MongoDB", "REST APIs"],
    experienceLevel: "Mid-level",
    jobType: "Full-time",
    description: "Develop and maintain scalable backend APIs."
  },
  {
    title: "UI/UX Designer",
    company: "Creative Studio",
    location: "Syhlet",
    remote: false,
    requiredSkills: ["Figma", "Adobe XD", "Prototyping"],
    experienceLevel: "Junior",
    jobType: "Contract",
    description: "Design wireframes and user flows for modern web products."
  },
  {
    title: "DevOps Engineer",
    company: "NextGen Systems",
    location: "Remote",
    remote: false,
    requiredSkills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    experienceLevel: "Senior",
    jobType: "Full-time",
    description: "Implement and maintain scalable cloud infrastructure."
  },
  {
    title: "Mobile App Developer",
    company: "Appify Tech",
    location: "Gaibandha",
    remote: false,
    requiredSkills: ["Flutter", "Dart", "Firebase"],
    experienceLevel: "Mid-level",
    jobType: "Full-time",
    description: "Build cross-platform mobile apps using Flutter."
  },
  {
    title: "Machine Learning Engineer",
    company: "AIWorks",
    location: "Boston, MA",
    remote: true,
    requiredSkills: ["Python", "TensorFlow", "Scikit-learn", "Data Modeling"],
    experienceLevel: "Senior",
    jobType: "Full-time",
    description: "Develop ML models for predictive analytics and automation."
  },
  {
    title: "Cybersecurity Analyst",
    company: "SecureNet",
    location: "Rajshahi, WA",
    remote: false,
    requiredSkills: ["Network Security", "Penetration Testing", "SIEM Tools"],
    experienceLevel: "Mid-level",
    jobType: "Full-time",
    description: "Monitor systems and ensure network security compliance."
  },
  {
    title: "Technical Writer",
    company: "DocsHub",
    location: "Remote",
    remote: false,
    requiredSkills: ["Writing", "Markdown", "APIs", "Technical Documentation"],
    experienceLevel: "Junior",
    jobType: "Contract",
    description: "Write clear and concise documentation for APIs and SDKs."
  },
  {
    title: "Product Manager",
    company: "Visionary Apps",
    location: "Cummila, CA",
    remote: false,
    requiredSkills: ["Agile", "Scrum", "User Research", "Roadmaps"],
    experienceLevel: "Senior",
    jobType: "Full-time",
    description: "Lead cross-functional teams to deliver high-impact products."
  },
  {
    title: "Game Developer",
    company: "PixelForge Studios",
    location: "Remote",
    remote: false,
    requiredSkills: ["Unity", "C#", "3D Modeling"],
    experienceLevel: "Mid-level",
    jobType: "Full-time",
    description: "Develop interactive 3D games for multiple platforms."
  },
  {
    title: "Cloud Architect",
    company: "SkyNet Global",
    location: "Dhaka, CO",
    remote: false,
    requiredSkills: ["AWS", "Azure", "Terraform"],
    experienceLevel: "Senior",
    jobType: "Full-time",
    description: "Design and optimize cloud-based infrastructures."
  },
  {
    title: "QA Tester",
    company: "SoftWorks",
    location: "Chittagong, IL",
    remote: false,
    requiredSkills: ["Manual Testing", "Automation", "Selenium"],
    experienceLevel: "Junior",
    jobType: "Contract",
    description: "Test applications and ensure high-quality releases."
  },
  {
    title: "Full Stack Developer",
    company: "CodeSphere",
    location: "Dallas, TX",
    remote: true,
    requiredSkills: ["React", "Node.js", "MongoDB", "GraphQL"],
    experienceLevel: "Mid-level",
    jobType: "Full-time",
    description: "Develop both frontend and backend components for web apps."
  },
  {
    title: "Business Analyst",
    company: "FinServe",
    location: "EPZ , Chattogram",
    remote: false,
    requiredSkills: ["Excel", "Tableau", "SQL", "Communication"],
    experienceLevel: "Mid-level",
    jobType: "Full-time",
    description: "Analyze business processes and propose improvements."
  },
  {
    title: "Marketing Data Specialist",
    company: "GrowthWave",
    location: "Remote",
    remote: false,
    requiredSkills: ["Google Analytics", "Python", "Power BI"],
    experienceLevel: "Junior",
    jobType: "Full-time",
    description: "Analyze marketing data and help improve campaigns."
  },
  {
    title: "AR/VR Developer",
    company: "Immersion Labs",
    location: "San Jose, CA",
    remote: true,
    requiredSkills: ["Unity", "C#", "3D Modeling", "XR Toolkit"],
    experienceLevel: "Mid-level",
    jobType: "Full-time",
    description: "Create immersive augmented and virtual reality experiences."
  },
  {
    title: "Data Engineer",
    company: "DataBridge",
    location: "Boston",
    remote: true,
    requiredSkills: ["Python", "ETL", "Airflow", "SQL"],
    experienceLevel: "Senior",
    jobType: "Full-time",
    description: "Build and manage data pipelines for analytics systems."
  },
  {
    title: "Customer Support Engineer",
    company: "TechEase",
    location: "Gajipur, GA",
    remote: false,
    requiredSkills: ["Communication", "Technical Support", "CRM Tools"],
    experienceLevel: "Junior",
    jobType: "Full-time",
    description: "Assist customers with technical issues and solutions."
  },
  {
    title: "AI Research Intern",
    company: "DeepThink AI",
    location: "Chattogram, CA",
    remote: false,
    requiredSkills: ["Python", "Pandas", "TensorFlow", "Machine Learning"],
    experienceLevel: "Fresher",
    jobType: "Internship",
    description: "Work on experimental AI and ML research projects."
  }
];

const seedResources = [
  {
    title: "React Crash Course",
    platform: "YouTube",
    url: "https://youtube.com/react-course",
    relatedSkills: ["React", "JavaScript"],
    cost: "Free",
    description: "Learn React in 5 hours."
  },
  {
    title: "Python for Data Science",
    platform: "Coursera",
    url: "https://coursera.org/python-data-science",
    relatedSkills: ["Python", "Data Analysis"],
    cost: "Paid",
    description: "Comprehensive data science course."
  },
  {
    title: "Node.js Fundamentals",
    platform: "Udemy",
    url: "https://udemy.com/nodejs-fundamentals",
    relatedSkills: ["Node.js", "Express"],
    cost: "Paid",
    description: "Master backend development with Node.js and Express."
  },
  {
    title: "Introduction to SQL",
    platform: "Kaggle",
    url: "https://kaggle.com/learn/sql",
    relatedSkills: ["SQL", "Databases"],
    cost: "Free",
    description: "Practice SQL with real datasets."
  },
  {
    title: "Git & GitHub Crash Course",
    platform: "YouTube",
    url: "https://youtube.com/git-github-course",
    relatedSkills: ["Git", "Version Control"],
    cost: "Free",
    description: "Learn version control essentials."
  },
  {
    title: "Docker Mastery",
    platform: "Udemy",
    url: "https://udemy.com/docker-mastery",
    relatedSkills: ["Docker", "DevOps"],
    cost: "Paid",
    description: "Learn containerization and deployment strategies."
  },
  {
    title: "HTML & CSS Basics",
    platform: "freeCodeCamp",
    url: "https://freecodecamp.org/html-css",
    relatedSkills: ["HTML", "CSS"],
    cost: "Free",
    description: "Beginner's guide to web design fundamentals."
  },
  {
    title: "Data Structures in JavaScript",
    platform: "Frontend Masters",
    url: "https://frontendmasters.com/javascript-data-structures",
    relatedSkills: ["JavaScript", "Algorithms"],
    cost: "Paid",
    description: "Learn how to use and implement data structures in JS."
  },
  {
    title: "Machine Learning Crash Course",
    platform: "Google Developers",
    url: "https://developers.google.com/machine-learning/crash-course",
    relatedSkills: ["Machine Learning", "Python"],
    cost: "Free",
    description: "Hands-on introduction to ML with TensorFlow."
  },
  {
    title: "Figma for Beginners",
    platform: "YouTube",
    url: "https://youtube.com/figma-tutorial",
    relatedSkills: ["Figma", "UI/UX Design"],
    cost: "Free",
    description: "Design beautiful interfaces in Figma."
  },
  {
    title: "Cybersecurity Basics",
    platform: "edX",
    url: "https://edx.org/cybersecurity-basics",
    relatedSkills: ["Cybersecurity", "Networking"],
    cost: "Free",
    description: "Understand core cybersecurity principles."
  },
  {
    title: "AWS Cloud Practitioner Essentials",
    platform: "AWS Training",
    url: "https://aws.amazon.com/training/cloud-practitioner/",
    relatedSkills: ["AWS", "Cloud Computing"],
    cost: "Free",
    description: "Introductory course for AWS cloud fundamentals."
  },
  {
    title: "Tableau Data Visualization",
    platform: "Coursera",
    url: "https://coursera.org/tableau-course",
    relatedSkills: ["Tableau", "Data Visualization"],
    cost: "Paid",
    description: "Create interactive dashboards using Tableau."
  },
  {
    title: "Kubernetes for Developers",
    platform: "Pluralsight",
    url: "https://pluralsight.com/kubernetes-developers",
    relatedSkills: ["Kubernetes", "DevOps"],
    cost: "Paid",
    description: "Learn to deploy and manage apps in Kubernetes."
  },
  {
    title: "RESTful APIs with Express",
    platform: "Udemy",
    url: "https://udemy.com/restful-apis-express",
    relatedSkills: ["Node.js", "Express", "APIs"],
    cost: "Paid",
    description: "Build RESTful APIs from scratch using Node.js."
  },
  {
    title: "Excel for Data Analysis",
    platform: "LinkedIn Learning",
    url: "https://linkedin.com/learning/excel-data-analysis",
    relatedSkills: ["Excel", "Data Analysis"],
    cost: "Paid",
    description: "Learn how to use Excel for professional data insights."
  },
  {
    title: "Prompt Engineering for Developers",
    platform: "DeepLearning.AI",
    url: "https://www.deeplearning.ai/short-courses/prompt-engineering/",
    relatedSkills: ["AI", "Prompt Engineering"],
    cost: "Free",
    description: "Learn how to design effective prompts for LLMs."
  },
  {
    title: "GraphQL Basics",
    platform: "Apollo GraphQL",
    url: "https://apollographql.com/tutorials/",
    relatedSkills: ["GraphQL", "API Design"],
    cost: "Free",
    description: "Learn the fundamentals of GraphQL with Apollo."
  },
  {
    title: "Power BI Essential Training",
    platform: "LinkedIn Learning",
    url: "https://linkedin.com/learning/power-bi-essentials",
    relatedSkills: ["Power BI", "Data Visualization"],
    cost: "Paid",
    description: "Create dashboards and visual reports using Power BI."
  },
  {
    title: "Intro to Computer Science (CS50)",
    platform: "edX (Harvard)",
    url: "https://cs50.harvard.edu/x/",
    relatedSkills: ["C", "Algorithms", "Computer Science"],
    cost: "Free",
    description: "World-renowned intro to computer science course."
  }
];

const seedDB = async () => {
  try {
    // Use MONGODB_URI from .env
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Job.deleteMany({});
    await Resource.deleteMany({});
    console.log("🧹 Cleared existing data");

    // Insert new data
    await Job.insertMany(seedJobs);
    await Resource.insertMany(seedResources);
    console.log("🌱 Seed data inserted successfully!");
    console.log(`📊 Added ${seedJobs.length} jobs and ${seedResources.length} resources`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔒 Connection closed");
    process.exit(0);
  }
};

seedDB();