// backend/seed.js
const mongoose = require("mongoose");
require("dotenv").config();
const Project = require("./models/Project");

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected for seeding"))
.catch(err => console.log(err));

const projects = [
    { title: "AI Chatbot for Student Support", description: "A chatbot that answers common university questions.", technologies: ["Python", "Flask", "NLP"], difficulty: "Medium", categories: ["AI", "Web"], projectType: "AI system", features: "Chat interface, FAQ handling", learning: "AI, NLP, Web Development" },
    { title: "Web-based Course Recommendation System", description: "Recommends courses based on student preferences.", technologies: ["JavaScript", "Node.js", "MongoDB"], difficulty: "Easy", categories: ["Web", "Data"], projectType: "Web application", features: "Web forms, Recommendation logic", learning: "Web Development, Databases" },
    { title: "AI Image Classifier Web App", description: "A web application that classifies images using AI.", technologies: ["Python", "TensorFlow", "Flask"], difficulty: "Intermediate", categories: ["AI", "Web"], projectType: "Web application", features: "Image upload, AI classification", learning: "AI, Deep Learning, Web Integration" },
    { title: "Mobile Health Tracker App", description: "Track your daily health activities on mobile.", technologies: ["Flutter", "Firebase"], difficulty: "Easy", categories: ["Mobile"], projectType: "Mobile application", features: "Activity tracker, Notifications", learning: "Mobile Development, Databases" },
    { title: "Cybersecurity Vulnerability Scanner", description: "Scan networks and systems for security vulnerabilities.", technologies: ["Python", "Linux", "Network Tools"], difficulty: "Hard", categories: ["Security", "AI"], projectType: "Research project", features: "Scan, Reporting, Alerts", learning: "Cybersecurity, Networking, AI" },
    { title: "E-commerce Recommendation Engine", description: "Recommends products to users based on past behavior.", technologies: ["Python", "Pandas", "Scikit-learn"], difficulty: "Medium", categories: ["AI", "Web"], projectType: "AI system", features: "User analytics, Product suggestions", learning: "Machine Learning, Web Development" },
    { title: "Blockchain Voting System", description: "Secure voting using blockchain.", technologies: ["Solidity", "Ethereum", "Web3.js"], difficulty: "Hard", categories: ["Blockchain", "Web"], projectType: "Web application", features: "Secure voting, Blockchain ledger", learning: "Blockchain, Security" },
    { title: "Smart Home Automation", description: "Control home devices automatically using sensors.", technologies: ["Arduino", "Python", "MQTT"], difficulty: "Medium", categories: ["IoT", "AI"], projectType: "Hardware project", features: "Device automation, Sensor integration", learning: "IoT, AI, Hardware" },
    { title: "Personal Finance Tracker", description: "Manage expenses and incomes efficiently.", technologies: ["React", "Node.js", "MongoDB"], difficulty: "Easy", categories: ["Web", "Data"], projectType: "Web application", features: "Charts, Budget tracking", learning: "Web Development, Data Visualization" },
    { title: "AI-powered Resume Analyzer", description: "Analyze resumes and recommend improvements.", technologies: ["Python", "NLP"], difficulty: "Medium", categories: ["AI", "Web"], projectType: "AI system", features: "Resume parsing, Suggestions", learning: "NLP, AI, Web" },
    { title: "Fitness Mobile App with AI", description: "Recommends workouts based on user activity.", technologies: ["Flutter", "TensorFlow Lite"], difficulty: "Medium", categories: ["AI", "Mobile"], projectType: "Mobile application", features: "Activity tracking, AI suggestions", learning: "Mobile, AI" },
    { title: "Virtual Reality Museum Tour", description: "Explore museums in VR.", technologies: ["Unity", "C#", "VR SDK"], difficulty: "Hard", categories: ["VR", "Education"], projectType: "VR application", features: "3D models, VR navigation", learning: "VR, Unity" },
    { title: "IoT Weather Station", description: "Collects weather data using sensors.", technologies: ["Arduino", "Python"], difficulty: "Medium", categories: ["IoT", "Data"], projectType: "Hardware project", features: "Temperature, Humidity, Data visualization", learning: "IoT, Sensors" },
    { title: "AI Music Composer", description: "Generate music using AI.", technologies: ["Python", "TensorFlow", "MIDI"], difficulty: "Hard", categories: ["AI", "Entertainment"], projectType: "AI system", features: "Music generation, AI composition", learning: "AI, Music, Deep Learning" },
    { title: "Language Learning Chatbot", description: "Chatbot to practice foreign languages.", technologies: ["Python", "NLP", "Flask"], difficulty: "Easy", categories: ["AI", "Education"], projectType: "AI system", features: "Interactive chat, Feedback", learning: "NLP, Language Learning" }
];

const seedDB = async () => {
    await Project.deleteMany({});
    await Project.insertMany(projects);
    console.log("Database seeded with 15 projects!");
    mongoose.connection.close();
};

seedDB();
