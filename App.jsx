import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, query, onSnapshot, orderBy, serverTimestamp, getDocs, addDoc } from 'firebase/firestore';

// Lucide Icons for aesthetic and functionality
import { Sprout, LogIn, UserPlus, Home, Info, Mail, Sun, TrendingUp, DollarSign, Cloud, History, BarChart, Wheat, X, ArrowLeftRight, Loader2, Menu, Check, Lock, MapPin, Phone, MessageSquare, Briefcase, ChevronDown, FlaskConical, Globe, Ruler, Droplet, Thermometer, Handshake, Barcode, User, Gauge } from 'lucide-react';

// External Library for Charts (using react-chartjs-2 for the dashboard analytics)
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend
);

// --- 1. FIREBASE & AUTH SETUP (Mandatory Globals) ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
// IMPORTANT: initialAuthToken is only used for the initial setup.
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null; 

let app, db, auth;
if (firebaseConfig) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
}

// --- 2. TRANSLATION DATA (English and Hindi) ---
const translations = {
  en: {
    APP_NAME: "AgriOptima",
    SLOGAN: "Your Smart Farming Advisor",
    LOGIN: "Login",
    SIGNUP: "Sign Up",
    LOGOUT: "Logout",
    HOME: "Home",
    ABOUT: "About Us",
    CONTACT: "Contact",
    DASHBOARD: "Dashboard",
    PREDICTION: "Prediction",
    CROPS: "Crops",
    ANALYTICS: "Analytics",
    PROFILE: "Profile",
    FNAME: "First Name",
    LNAME: "Last Name",
    CITY: "City",
    STATE: "State",
    COUNTRY: "Country",
    MOBILE: "Mobile Number",
    EMAIL: "Email",
    PASSWORD: "Password",
    CAPTCHA_PROMPT: "Type 'AGRI' below",
    SUCCESS_SIGNUP: "Account created successfully! Redirecting to login...",
    ERROR_LOGIN: "Login failed. Check your email and password.",
    ERROR_SIGNUP: "Sign up failed. Please try again.",
    WELCOME: "Welcome back to your Smart Farming Dashboard",
    HUMIDITY: "Humidity",
    MOST_SUGGESTED: "Most Suggested Crop",
    TOTAL_PREDICTIONS: "Total Predictions",
    LAST_PROFIT: "Last Profit Estimate",
    RECOMMENDED: "Recommended Crops",
    VIEW_DETAILS: "View Crop Details",
    HISTORY: "Prediction History",
    KNOWLEDGE: "Knowledge Base",
    PROFIT_TREND: "Profit Trend",
    CROP_FREQUENCY: "Crop Frequency",
    HELLO: "Hello,",
    ABOUT_TEXT: "AgriOptima uses AI to analyze climate, soil data, and future weather forecasts to provide farmers with optimal crop suggestions and detailed profit estimates. Our goal is to maximize yield and minimize risk.",
    CONTACT_TEXT: "We are here to help you succeed. Reach out for technical support or partnership inquiries.",
    CONTACT_US: "Contact Us",
    SEND: "Send Message",
    MESSAGE: "Message",
    // New Translations for Modal & Prediction
    CROP_DETAILS_TITLE: "Crop Details & Requirements",
    BOTANY: "Botany & Breed",
    OPTIMAL_CONDITIONS: "Optimal Conditions",
    ESTIMATED_PROFIT: "Estimated Profit / Acre",
    N_LEVEL: "Nitrogen (N)",
    P_LEVEL: "Phosphorus (P)",
    K_LEVEL: "Potassium (K)",
    RAINFALL: "Rainfall (mm)",
    PH_LEVEL: "pH Level",
    INPUT_PARAMS: "Manual Prediction Input",
    PREDICT: "Get Crop Suggestion",
    PREDICTION_RESULT: "Prediction Result",
    CROP_SUGGESTED: "Suggested Crop",
    WEATHER_FORECAST: "Weather Forecast",
    RISK_LEVEL: "Risk Level",
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    FETCHING_DATA: "Analyzing data and generating prediction...",
    ERROR_API: "Failed to fetch prediction or data.",
    SOIL_TYPES: ["Sandy", "Clay", "Loam", "Silt", "Peat", "Red"],
    SOIL_TYPE_FILTER: "Filter by Soil Type",
    ALL_SOILS: "All Soil Types",
    PROFILE_DETAILS: "Account & Profile Details",
    CROP_CATALOG: "Crop Catalog",
    ANALYTICS_OVERVIEW: "System Analytics Overview",
    WIP_MESSAGE: "Content for this section is currently under development. Please check back later!",
    LANG_NAME: "English",
  },
  hi: {
    APP_NAME: "एग्रीऑप्टिमा",
    SLOGAN: "आपका स्मार्ट खेती सलाहकार",
    LOGIN: "लॉग इन",
    SIGNUP: "साइन अप",
    LOGOUT: "लॉग आउट",
    HOME: "होम",
    ABOUT: "हमारे बारे में",
    CONTACT: "संपर्क",
    DASHBOARD: "डैशबोर्ड",
    PREDICTION: "भविष्यवाणी",
    CROPS: "फसलें",
    ANALYTICS: "विश्लेषण",
    PROFILE: "प्रोफ़ाइल",
    FNAME: "पहला नाम",
    LNAME: "अंतिम नाम",
    CITY: "शहर",
    STATE: "राज्य",
    COUNTRY: "देश",
    MOBILE: "मोबाइल नंबर",
    EMAIL: "ईमेल",
    PASSWORD: "पासवर्ड",
    CAPTCHA_PROMPT: "नीचे 'AGRI' टाइप करें",
    SUCCESS_SIGNUP: "खाता सफलतापूर्वक बनाया गया! लॉग इन पर रीडायरेक्ट कर रहा है...",
    ERROR_LOGIN: "लॉग इन विफल। अपना ईमेल और पासवर्ड जांचें।",
    ERROR_SIGNUP: "साइन अप विफल। कृपया फिर से प्रयास करें।",
    WELCOME: "आपके स्मार्ट फार्मिंग डैशबोर्ड पर आपका स्वागत है",
    HUMIDITY: "नमी",
    MOST_SUग्GEजTED: "सबसे अधिक सुझाई गई फसल",
    TOTAL_PREDICTIONS: "कुल भविष्यवाणियाँ",
    LAST_PROFIT: "अंतिम लाभ अनुमान",
    RECOMMENDED: "अनुशंसित फसलें",
    VIEW_DETAILS: "फसल विवरण देखें",
    HISTORY: "भविष्यवाणी इतिहास",
    KNOWLEDGE: "ज्ञान आधार",
    PROFIT_TREND: "लाभ रुझान",
    CROP_FREQUENCY: "फसल आवृत्ति",
    HELLO: "नमस्ते,",
    ABOUT_TEXT: "एग्रीऑप्टिमा किसानों को इष्टतम फसल सुझाव और विस्तृत लाभ अनुमान प्रदान करने के लिए जलवायु, मिट्टी डेटा और भविष्य के मौसम पूर्वानुमान का विश्लेषण करने के लिए एआई का उपयोग करता है। हमारा लक्ष्य उपज को अधिकतम करना और जोखिम को कम करना है।",
    CONTACT_TEXT: "हम आपकी सफलता में मदद करने के लिए यहां हैं। तकनीकी सहायता या साझेदारी पूछताछ के लिए संपर्क करें।",
    CONTACT_US: "हमसे संपर्क करें",
    SEND: "संदेश भेजें",
    MESSAGE: "संदेश",
    // New Translations for Modal & Prediction
    CROP_DETAILS_TITLE: "फसल विवरण और आवश्यकताएँ",
    BOTANY: "वनस्पति और नस्ल",
    OPTIMAL_CONDITIONS: "इष्टतम शर्तें",
    ESTIMATED_PROFIT: "अनुमानित लाभ / एकड़",
    N_LEVEL: "नाइट्रोजन (N)",
    P_LEVEL: "फास्फोरस (P)",
    K_LEVEL: "पोटेशियम (K)",
    RAINFALL: "वर्षा (मिमी)",
    PH_LEVEL: "पीएच स्तर",
    INPUT_PARAMS: "मैनुअल भविष्यवाणी इनपुट",
    PREDICT: "फसल सुझाव प्राप्त करें",
    PREDICTION_RESULT: "अनुमान परिणाम",
    CROP_SUGGESTED: "सुझाई गई फसल",
    WEATHER_FORECAST: "मौसम पूर्वानुमान",
    RISK_LEVEL: "जोखिम स्तर",
    LOW: "कम",
    MEDIUM: "मध्यम",
    HIGH: "उच्च",
    FETCHING_DATA: "डेटा का विश्लेषण और भविष्यवाणी उत्पन्न करना...",
    ERROR_API: "अनुमान या डेटा लाने में विफल।",
    SOIL_TYPES: ["रेतीली", "चिकनी मिट्टी", "दोमट", "गाद", "पीट", "लाल"],
    SOIL_TYPE_FILTER: "मिट्टी के प्रकार से फ़िल्टर करें",
    ALL_SOILS: "सभी मिट्टी के प्रकार",
    PROFILE_DETAILS: "खाता और प्रोफ़ाइल विवरण",
    CROP_CATALOG: "फसल कैटलॉग",
    ANALYTICS_OVERVIEW: "सिस्टम विश्लेषण अवलोकन",
    WIP_MESSAGE: "इस खंड की सामग्री पर वर्तमान में काम चल रहा है। कृपया बाद में जांच करें!",
    LANG_NAME: "हिन्दी",
  },
};

// --- 3. MOCK DATA (For Dashboard Visualization) ---
const mockDashboardData = {
  // Matches the image structure
  user: {
    name: "Saloni",
    temperature: 32,
    humidity: 75,
    mostSuggestedCrop: "Rice",
    totalPredictions: 24,
    lastProfitEstimate: "₹18,300",
  },
  recommendedCrops: [
    { name: "Rice", profit: "₹200 / acre", image: 'https://placehold.co/100x70/228B22/FFFFFF?text=Rice', soil: 'Clay' },
    { name: "Wheat", profit: "₹30.00 / acre", image: 'https://placehold.co/100x70/B8860B/FFFFFF?text=Wheat', soil: 'Loam' },
    { name: "Maize", profit: "₹55.00 / acre", image: 'https://placehold.co/100x70/FFD700/000000?text=Maize', soil: 'Silt' },
    { name: "Sugarcane", profit: "₹120 / acre", image: 'https://placehold.co/100x70/808000/FFFFFF?text=Cane', soil: 'Clay' },
    { name: "Cotton", profit: "₹85 / acre", image: 'https://placehold.co/100x70/4682B4/FFFFFF?text=Cotton', soil: 'Red' },
    { name: "Potato", profit: "₹70 / acre", image: 'https://placehold.co/100x70/CD853F/FFFFFF?text=Potato', soil: 'Sandy' },
    { name: "Soybean", profit: "₹95 / acre", image: 'https://placehold.co/100x70/3CB371/FFFFFF?text=Soy', soil: 'Loam' },
    { name: "Barley", profit: "₹40 / acre", image: 'https://placehold.co/100x70/D2B48C/000000?text=Barley', soil: 'Silt' },
    { name: "Coffee", profit: "₹150 / acre", image: 'https://placehold.co/100x70/8B4513/FFFFFF?text=Coffee', soil: 'Peat' },
    { name: "Lentil", profit: "₹45 / acre", image: 'https://placehold.co/100x70/6B8E23/FFFFFF?text=Lentil', soil: 'Sandy' },
  ],
  predictionHistory: [
    { date: '18 Nov 2025', crop: 'Rice', profit: '₹22,000', inputs: 'Loamy' },
    { date: '10 Nov 2025', crop: 'Wheat', profit: '₹19,000', inputs: 'Sandy' },
  ],
  knowledgeBase: [
    { name: "Wheat", image: 'https://placehold.co/100x70/B8860B/FFFFFF?text=Wheat' },
    { name: "Rice", image: 'https://placehold.co/100x70/228B22/FFFFFF?text=Rice' },
    { name: "Maize", image: 'https://placehold.co/100x70/FFD700/000000?text=Maize' },
    { name: "Cotton", image: 'https://placehold.co/100x70/4682B4/FFFFFF?text=Cotton' },
    { name: "Soybean", image: 'https://placehold.co/100x70/3CB371/FFFFFF?text=Soy' },
  ],
  analytics: {
    profitTrend: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Profit Trend (₹)',
        data: [15000, 18000, 17500, 22000, 25000, 28000],
        borderColor: '#10B981',
        tension: 0.4,
        pointBackgroundColor: '#059669',
      }],
    },
    cropFrequency: {
      labels: ['Rice', 'Wheat', 'Maize', 'Lentil'],
      datasets: [{
        label: 'Crop Frequency',
        data: [10, 8, 4, 2],
        backgroundColor: ['#059669', '#F59E0B', '#FCD34D', '#10B981'],
        hoverOffset: 4,
      }]
    }
  }
};

// --- MOCK CROP DETAILS (Expanded to over 60 varieties - CLEANED FOR DUPLICATES) ---
const mockCropDetails = {
    "Rice": { botany: "Oryza sativa. Semi-aquatic grass, staple food. Requires high heat and heavy rain.", breed: "Basmati, Sona Masuri.", profit: "₹75,000", requirements: { temp: "25-35", rainfall: "1200-1500", ph: "5.5-6.5", n: "60-90", p: "30-40", k: "30-40" }, image: 'https://placehold.co/600x400/228B22/FFFFFF?text=Rice+Paddy' },
    "Wheat": { botany: "Triticum aestivum. Temperate cereal, needs cool, dry weather.", breed: "Durum Wheat, Bread Wheat.", profit: "₹60,000", requirements: { temp: "15-25", rainfall: "500-1000", ph: "6.0-7.5", n: "80-120", p: "40-60", k: "20-40" }, image: 'https://placehold.co/600x400/B8860B/FFFFFF?text=Wheat+Crop' },
    "Maize": { botany: "Zea mays. Tropical cereal, highly adaptable. Requires warm temp and deep soil.", breed: "Sweet Corn, Dent Corn.", profit: "₹55,000", requirements: { temp: "20-30", rainfall: "600-900", ph: "6.0-7.0", n: "100-150", p: "50-70", k: "50-70" }, image: 'https://placehold.co/600x400/FFD700/000000?text=Maize+Corn' },
    "Jowar (Sorghum)": { botany: "Sorghum bicolor. Drought-tolerant millet.", breed: "CSH Series.", profit: "₹30,000", requirements: { temp: "25-35", rainfall: "300-600", ph: "6.0-7.5", n: "50-80", p: "20-30", k: "20-30" }, image: 'https://placehold.co/600x400/8B4513/FFFFFF?text=Jowar+Sorghum' },
    "Bajra (Pearl Millet)": { botany: "Pennisetum glaucum. Hardy, short-duration millet.", breed: "Hybrid.", profit: "₹28,000", requirements: { temp: "25-35", rainfall: "250-500", ph: "6.0-7.5", n: "40-60", p: "20-30", k: "20-30" }, image: 'https://placehold.co/600x400/D2B48C/000000?text=Pearl+Millet+Bajra' },
    "Ragi (Finger Millet)": { botany: "Eleusine coracana. Highly nutritious, resilient millet.", breed: "Indaf series.", profit: "₹35,000", requirements: { temp: "20-30", rainfall: "500-1000", ph: "5.0-6.5", n: "40-60", p: "20-30", k: "20-30" }, image: 'https://placehold.co/600x400/A9A9A9/FFFFFF?text=Finger+Millet+Ragi' },
    "Gram": { botany: "Cicer arietinum. Cool season pulse crop.", breed: "Kabuli, Desi.", profit: "₹50,000", requirements: { temp: "15-25", rainfall: "400-600", ph: "6.0-7.5", n: "20-30", p: "40-60", k: "20-30" }, image: 'https://placehold.co/600x400/BDB76B/000000?text=Chickpea+Gram' },
    "Tur/Arhar": { botany: "Cajanus cajan. Pigeon pea, long-duration pulse.", breed: "ICPL-87, Pusa 992.", profit: "₹65,000", requirements: { temp: "25-35", rainfall: "600-1000", ph: "6.0-7.5", n: "20-40", p: "40-60", k: "20-40" }, image: 'https://placehold.co/600x400/F4A460/FFFFFF?text=Pigeon+Pea' },
    "Urad": { botany: "Vigna mungo. Black gram, requires warm, humid climate.", breed: "T-9, Pant U-19.", profit: "₹48,000", requirements: { temp: "25-35", rainfall: "600-900", ph: "6.0-7.5", n: "20-30", p: "40-60", k: "20-30" }, image: 'https://placehold.co/600x400/556B2F/FFFFFF?text=Black+Gram+Urad' },
    "Moong": { botany: "Vigna radiata. Green gram, short-duration summer crop.", breed: "Pusa Vishal.", profit: "₹45,000", requirements: { temp: "25-35", rainfall: "600-900", ph: "6.0-7.5", n: "20-30", p: "40-60", k: "20-30" }, image: 'https://placehold.co/600x400/3CB371/FFFFFF?text=Green+Gram+Moong' },
    "Masur": { botany: "Lens culinaris. Lentil, Rabi season pulse.", breed: "Masoor.", profit: "₹52,000", requirements: { temp: "18-30", rainfall: "400-600", ph: "6.0-8.0", n: "10-20", p: "40-60", k: "20-40" }, image: 'https://placehold.co/600x400/6B8E23/FFFFFF?text=Lentil+Masur' },
    "Sugarcane": { botany: "Saccharum officinarum. Tall grass for sugar. Needs long, hot season.", breed: "Co-86032, CoC-671.", profit: "₹1,20,000", requirements: { temp: "20-32", rainfall: "1000-1500", ph: "6.0-7.5", n: "150-250", p: "50-80", k: "100-150" }, image: 'https://placehold.co/600x400/808000/FFFFFF?text=Sugarcane+Stalks' },
    "Cotton": { botany: "Gossypium spp. Grown for fiber. Needs high temp and moderate rain.", breed: "Bt Cotton, Hybrid.", profit: "₹85,000", requirements: { temp: "21-30", rainfall: "500-1000", ph: "5.5-8.5", n: "60-120", p: "30-60", k: "30-60" }, image: 'https://placehold.co/600x400/4682B4/FFFFFF?text=Cotton+Bolls' },
    "Jute": { botany: "Corchorus olitorius. Fibre crop. Needs heavy rainfall and high humidity.", breed: "JRO-524, JRC-212.", profit: "₹70,000", requirements: { temp: "24-37", rainfall: "1500-2000", ph: "6.0-7.5", n: "50-80", p: "20-40", k: "30-60" }, image: 'https://placehold.co/600x400/D2B48C/000000?text=Jute+Fibre' },
    "Groundnut": { botany: "Arachis hypogaea. Peanut, oilseed and pulse. Requires sandy soil.", breed: "ICGS-11, TGV-1.", profit: "₹90,000", requirements: { temp: "21-30", rainfall: "500-700", ph: "6.0-7.0", n: "10-20", p: "30-50", k: "30-50" }, image: 'https://placehold.co/600x400/FFA07A/000000?text=Groundnut+Peanut' },
    "Mustard": { botany: "Brassica spp. Oilseed, Rabi crop. Requires cool, dry weather.", breed: "Pusa Jaikisan.", profit: "₹50,000", requirements: { temp: "15-25", rainfall: "300-500", ph: "6.0-7.5", n: "80-120", p: "40-60", k: "20-40" }, image: 'https://placehold.co/600x400/FFD700/000000?text=Mustard+Flower' },
    "Soybean": { botany: "Glycine max. High-protein legume. Requires rich, well-drained soil.", breed: "JS 335, Bragg.", profit: "₹95,000", requirements: { temp: "20-30", rainfall: "600-1000", ph: "6.0-7.5", n: "20-40", p: "60-80", k: "40-60" }, image: 'https://placehold.co/600x400/3CB371/FFFFFF?text=Soybean+Pod' },
    "Sunflower": { botany: "Helianthus annuus. Oilseed. Tolerant of drought and temperature.", breed: "Hybrid.", profit: "₹60,000", requirements: { temp: "25-30", rainfall: "500-800", ph: "6.0-7.5", n: "60-90", p: "40-60", k: "40-60" }, image: 'https://placehold.co/600x400/FFD700/000000?text=Sunflower+Head' },
    "Sesame": { botany: "Sesamum indicum. Oilseed. Drought tolerant.", breed: "T-13.", profit: "₹45,000", requirements: { temp: "25-35", rainfall: "500-800", ph: "5.5-7.5", n: "40-60", p: "20-30", k: "20-30" }, image: 'https://placehold.co/600x400/F0E68C/000000?text=Sesame+Seed' },
    "Tobacco": { botany: "Nicotiana spp. Commercial leaf crop. Highly specialized.", breed: "FCV, Natu.", profit: "₹1,10,000", requirements: { temp: "20-30", rainfall: "500-1000", ph: "5.0-6.0", n: "80-120", p: "40-60", k: "100-150" }, image: 'https://placehold.co/600x400/8B0000/FFFFFF?text=Tobacco+Leaf' },
    "Tea": { botany: "Camellia sinensis. Evergreen shrub. Needs acidic soil and high rainfall.", breed: "Assam type.", profit: "₹1,50,000", requirements: { temp: "13-28", rainfall: "1500-2500", ph: "4.5-5.5", n: "150-250", p: "50-80", k: "100-150" }, image: 'https://placehold.co/600x400/006400/FFFFFF?text=Tea+Leaves' },
    "Coffee": { botany: "Coffea spp. Requires specific tropical climate and high altitudes.", breed: "Arabica, Robusta.", profit: "₹1,80,000", requirements: { temp: "18-24", rainfall: "1500-2000", ph: "6.0-6.5", n: "50-80", p: "10-20", k: "50-80" }, image: 'https://placehold.co/600x400/8B4513/FFFFFF?text=Coffee+Beans' },
    "Rubber": { botany: "Hevea brasiliensis. Tree crop. Needs high rainfall and humidity.", breed: "RRII 105.", profit: "₹2,00,000", requirements: { temp: "25-34", rainfall: "2000-3000", ph: "4.5-6.0", n: "50-80", p: "20-40", k: "50-80" }, image: 'https://placehold.co/600x400/3CB371/FFFFFF?text=Rubber+Tapping' },
    "Coconut": { botany: "Cocos nucifera. Palm tree. Coastal regions, sandy soil.", breed: "Dwarf, Tall.", profit: "₹1,30,000", requirements: { temp: "25-35", rainfall: "1000-2500", ph: "5.5-7.0", n: "50-100", p: "30-50", k: "100-200" }, image: 'https://placehold.co/600x400/008080/FFFFFF?text=Coconut+Palm' },
    "Mangoes": { botany: "Mangifera indica. Tropical fruit tree. Requires warm, frost-free climate.", breed: "Alphonso, Dasheri.", profit: "₹2,50,000", requirements: { temp: "24-30", rainfall: "800-1200", ph: "6.0-7.5", n: "50-100", p: "20-40", k: "80-120" }, image: 'https://placehold.co/600x400/FF8C00/000000?text=Mango+Fruit' },
    "Bananas": { botany: "Musa spp. Herbaceous plant. Needs high heat and humidity.", breed: "Cavendish, Robusta.", profit: "₹1,80,000", requirements: { temp: "20-30", rainfall: "1500-2500", ph: "6.0-7.5", n: "150-300", p: "50-100", k: "300-500" }, image: 'https://placehold.co/600x400/FFD700/000000?text=Banana+Bunch' },
    "Citrus fruits": { botany: "Citrus spp. Includes orange, lemon. Requires moderate climate.", breed: "Nagpur orange, Lemon.", profit: "₹1,60,000", requirements: { temp: "10-35", rainfall: "700-1200", ph: "6.0-7.5", n: "80-120", p: "40-60", k: "80-120" }, image: 'https://placehold.co/600x400/F4A460/000000?text=Orange+Lemon' },
    "Apples": { botany: "Malus domestica. Temperate fruit. Requires chilling hours.", breed: "Fuji, Gala.", profit: "₹3,00,000", requirements: { temp: "15-25", rainfall: "1000-1500", ph: "5.5-6.5", n: "50-80", p: "20-40", k: "50-80" }, image: 'https://placehold.co/600x400/FF0000/FFFFFF?text=Red+Apple' },
    "Grapes": { botany: "Vitis vinifera. Vine fruit. Requires dry, warm summers.", breed: "Thompson Seedless.", profit: "₹2,20,000", requirements: { temp: "15-40", rainfall: "500-900", ph: "6.0-7.0", n: "60-100", p: "30-50", k: "100-150" }, image: 'https://placehold.co/600x400/800080/FFFFFF?text=Grape+Vine' },
    "Potatoes": { botany: "Solanum tuberosum. Tuber crop. Needs cool weather, well-drained soil.", breed: "Kufri Jyoti.", profit: "₹70,000", requirements: { temp: "15-20", rainfall: "500-800", ph: "5.0-6.5", n: "100-150", p: "80-100", k: "120-150" }, image: 'https://placehold.co/600x400/CD853F/FFFFFF?text=Potato+Tuber' },
    "Onions": { botany: "Allium cepa. Bulb vegetable. Requires moderate temperature.", breed: "Pusa Red.", profit: "₹65,000", requirements: { temp: "15-25", rainfall: "600-900", ph: "6.0-7.5", n: "80-120", p: "40-60", k: "80-120" }, image: 'https://placehold.co/600x400/FFFFFF/000000?text=Onion+Bulb' },
    "Tomatoes": { botany: "Solanum lycopersicum. Fruit vegetable. Wide adaptability.", breed: "Pusa Ruby.", profit: "₹75,000", requirements: { temp: "20-30", rainfall: "600-1000", ph: "6.0-7.0", n: "100-150", p: "50-80", k: "80-120" }, image: 'https://placehold.co/600x400/FF6347/FFFFFF?text=Tomato+Fruit' },
    "Brinjal (Eggplant)": { botany: "Solanum melongena. Warm season vegetable.", breed: "Pusa Purple.", profit: "₹60,000", requirements: { temp: "25-35", rainfall: "600-1000", ph: "6.0-7.0", n: "80-120", p: "40-60", k: "60-90" }, image: 'https://placehold.co/600x400/800080/FFFFFF?text=Brinjal+Eggplant' },
    "Cauliflower": { botany: "Brassica oleracea. Cool season vegetable.", breed: "Pusa Snowball.", profit: "₹55,000", requirements: { temp: "15-25", rainfall: "600-900", ph: "6.0-7.0", n: "120-150", p: "60-80", k: "80-100" }, image: 'https://placehold.co/600x400/F5F5DC/000000?text=Cauliflower+Head' },
    "Cabbage": { botany: "Brassica oleracea. Cool season leafy vegetable.", breed: "Golden Acre.", profit: "₹50,000", requirements: { temp: "15-25", rainfall: "600-900", ph: "6.0-7.0", n: "120-150", p: "60-80", k: "80-100" }, image: 'https://placehold.co/600x400/D3D3D3/000000?text=Cabbage+Head' },
    "Peas": { botany: "Pisum sativum. Cool season pulse/vegetable.", breed: "Arkel.", profit: "₹40,000", requirements: { temp: "10-20", rainfall: "400-600", ph: "6.0-7.5", n: "20-30", p: "40-60", k: "20-40" }, image: 'https://placehold.co/600x400/008000/FFFFFF?text=Peas+Pod' },
    "Black pepper": { botany: "Piper nigrum. Spice vine. Needs hot, humid tropical climate.", breed: "Panniyur 1.", profit: "₹3,50,000", requirements: { temp: "20-30", rainfall: "2000-3000", ph: "5.5-6.5", n: "100-150", p: "50-80", k: "150-200" }, image: 'https://placehold.co/600x400/000000/FFFFFF?text=Black+Pepper+Crop' },
    "Cardamom": { botany: "Elettaria cardamomum. Spice. Needs humid, shaded environment.", breed: "Njallani.", profit: "₹4,00,000", requirements: { temp: "15-30", rainfall: "2500-4000", ph: "5.0-6.5", n: "100-150", p: "50-80", k: "100-150" }, image: 'https://placehold.co/600x400/8B4513/FFFFFF?text=Cardamom+Pods' },
    "Dry chillies": { botany: "Capsicum annuum. Spice/vegetable. Needs warm, dry climate.", breed: "Teja.", profit: "₹1,00,000", requirements: { temp: "20-30", rainfall: "600-1200", ph: "6.0-7.0", n: "80-120", p: "40-60", k: "60-90" }, image: 'https://placehold.co/600x400/FF0000/FFFFFF?text=Red+Chilli' },
    "Turmeric": { botany: "Curcuma longa. Spice rhizome. Needs warm, humid conditions.", breed: "Alleppey.", profit: "₹80,000", requirements: { temp: "20-30", rainfall: "1000-2000", ph: "6.0-7.5", n: "60-90", p: "30-50", k: "90-120" }, image: 'https://placehold.co/600x400/FFD700/000000?text=Turmeric+Root' },
    "Ginger": { botany: "Zingiber officinale. Spice rhizome. Needs warm, humid conditions.", breed: "Nadia.", profit: "₹75,000", requirements: { temp: "25-35", rainfall: "1500-3000", ph: "6.0-7.5", n: "80-120", p: "40-60", k: "100-150" }, image: 'https://placehold.co/600x400/DAA520/000000?text=Ginger+Root' },
    "Coriander": { botany: "Coriandrum sativum. Spice/herb. Cool season crop.", breed: "Rajendra Swati.", profit: "₹30,000", requirements: { temp: "15-25", rainfall: "300-500", ph: "6.0-8.0", n: "40-60", p: "20-30", k: "20-30" }, image: 'https://placehold.co/600x400/3CB371/FFFFFF?text=Coriander+Leaf' },
    "Berseem": { botany: "Trifolium alexandrinum. Fodder crop. Rabi season.", breed: "Mescavi.", profit: "₹25,000", requirements: { temp: "15-25", rainfall: "300-500", ph: "6.0-7.5", n: "20-30", p: "40-60", k: "20-30" }, image: 'https://placehold.co/600x400/7CFC00/000000?text=Berseem+Clover' },
    "Oats": { botany: "Avena sativa. Cereal/Fodder. Cool season crop.", breed: "Kent.", profit: "₹35,000", requirements: { temp: "10-20", rainfall: "500-800", ph: "6.0-7.5", n: "60-90", p: "30-50", k: "30-50" }, image: 'https://placehold.co/600x400/D2B48C/000000?text=Oats+Stalk' },
    "Sudan grass": { botany: "Sorghum sudanense. Fodder grass.", breed: "SSG-59-3.", profit: "₹20,000", requirements: { temp: "25-35", rainfall: "400-800", ph: "6.0-7.5", n: "80-120", p: "40-60", k: "40-60" }, image: 'https://placehold.co/600x400/3CB371/FFFFFF?text=Sudan+Grass' },
    "Napier grass": { botany: "Pennisetum purpureum. Perennial fodder grass.", breed: "Hybrid Napier.", profit: "₹30,000", requirements: { temp: "25-35", rainfall: "1000-2000", ph: "5.5-7.0", n: "100-150", p: "50-80", k: "80-120" }, image: 'https://placehold.co/600x400/008000/FFFFFF?text=Napier+Grass' },
    "Lucerne": { botany: "Medicago sativa. Alfalfa, perennial fodder.", breed: "Anand-2.", profit: "₹35,000", requirements: { temp: "15-30", rainfall: "400-800", ph: "6.5-7.5", n: "0-20", p: "50-80", k: "50-80" }, image: 'https://placehold.co/600x400/FFA07A/000000?text=Lucerne+Alfalfa' },
    "Castor": { botany: "Ricinus communis. Non-edible oilseed.", breed: "GCH-7.", profit: "₹65,000", requirements: { temp: "20-30", rainfall: "500-800", ph: "6.0-7.5", n: "60-90", p: "30-50", k: "30-50" }, image: 'https://placehold.co/600x400/B8860B/FFFFFF?text=Castor+Oilseed' },
    "Linseed": { botany: "Linum usitatissimum. Flaxseed, oilseed.", breed: "Neelam.", profit: "₹50,000", requirements: { temp: "15-25", rainfall: "400-600", ph: "6.0-7.5", n: "40-60", p: "20-30", k: "20-30" }, image: 'https://placehold.co/600x400/F0E68C/000000?text=Linseed+Flax' },
    "Safflower": { botany: "Carthamus tinctorius. Oilseed. Drought tolerant.", breed: "Bima.", profit: "₹40,000", requirements: { temp: "15-25", rainfall: "300-500", ph: "6.0-8.0", n: "40-60", p: "20-30", k: "20-30" }, image: 'https://placehold.co/600x400/DAA520/000000?text=Safflower+Flower' },
    "Niger seed": { botany: "Guizotia abyssinica. Oilseed. Hardy crop.", breed: "RCR-18.", profit: "₹35,000", requirements: { temp: "20-30", rainfall: "500-1000", ph: "5.0-7.0", n: "30-50", p: "20-30", k: "20-30" }, image: 'https://placehold.co/600x400/696969/FFFFFF?text=Niger+Seed' },
    "Rapeseed": { botany: "Brassica napus. Oilseed.", breed: "Hybrid.", profit: "₹55,000", requirements: { temp: "15-25", rainfall: "400-600", ph: "6.0-7.5", n: "80-120", p: "40-60", k: "20-40" }, image: 'https://placehold.co/600x400/FFD700/000000?text=Rapeseed+Plant' },
    "Kusum seed": { botany: "Schleichera oleosa. Minor oilseed.", breed: "Local.", profit: "₹25,000", requirements: { temp: "25-35", rainfall: "800-1500", ph: "6.0-7.5", n: "30-50", p: "20-30", k: "30-50" }, image: 'https://placehold.co/600x400/A0522D/FFFFFF?text=Kusum+Tree' },
    "Pongam seeds": { botany: "Millettia pinnata. Minor oilseed.", breed: "Local.", profit: "₹30,000", requirements: { temp: "25-35", rainfall: "800-1500", ph: "6.0-7.5", n: "30-50", p: "20-30", k: "30-50" }, image: 'https://placehold.co/600x400/BDB76B/000000?text=Pongam+Seeds' },
    "Cowpeas (Lobia)": { botany: "Vigna unguiculata. Pulse/vegetable. Warm season.", breed: "Pusa Komal.", profit: "₹40,000", requirements: { temp: "25-35", rainfall: "500-800", ph: "6.0-7.5", n: "20-30", p: "40-60", k: "20-30" }, image: 'https://placehold.co/600x400/3CB371/FFFFFF?text=Cowpeas+Lobia' },
    "Horse gram": { botany: "Macrotyloma uniflorum. Drought-tolerant pulse.", breed: "GPM-6.", profit: "₹35,000", requirements: { temp: "25-35", rainfall: "300-500", ph: "6.0-7.5", n: "20-30", p: "30-50", k: "20-30" }, image: 'https://placehold.co/600x400/A0522D/FFFFFF?text=Horse+Gram' },
    "Rajma (Kidney beans)": { botany: "Phaseolus vulgaris. Pulse. Needs cooler temperature.", breed: "PDR-14.", profit: "₹55,000", requirements: { temp: "15-25", rainfall: "600-1000", ph: "6.0-7.5", n: "20-40", p: "40-60", k: "30-50" }, image: 'https://placehold.co/600x400/B22222/FFFFFF?text=Rajma+Kidney+Beans' },
    "Moth": { botany: "Vigna aconitifolia. Moth bean. Drought tolerant pulse.", breed: "RMO-40.", profit: "₹30,000", requirements: { temp: "30-40", rainfall: "200-500", ph: "6.0-8.0", n: "20-30", p: "30-50", k: "20-30" }, image: 'https://placehold.co/600x400/DAA520/000000?text=Moth+Bean' },
    "Khesari dal": { botany: "Lathyrus sativus. Grass pea. Resilient pulse.", breed: "Bio-L-212.", profit: "₹40,000", requirements: { temp: "15-25", rainfall: "400-600", ph: "6.0-7.5", n: "20-30", p: "40-60", k: "20-30" }, image: 'https://placehold.co/600x400/87CEFA/000000?text=Khesari+Dal' },
    "Foxtail millet (Kangni)": { botany: "Setaria italica. Minor millet.", breed: "Sia 3085.", profit: "₹30,000", requirements: { temp: "25-35", rainfall: "400-600", ph: "5.5-7.0", n: "30-50", p: "20-30", k: "20-30" }, image: 'https://placehold.co/600x400/F0E68C/000000?text=Foxtail+Millet' },
    "Kodo millet": { botany: "Paspalum scrobiculatum. Minor millet.", breed: "JK-48.", profit: "₹32,000", requirements: { temp: "25-35", rainfall: "500-900", ph: "5.5-7.0", n: "30-50", p: "20-30", k: "20-30" }, image: 'https://placehold.co/600x400/DAA520/000000?text=Kodo+Millet' },
    "Little millet": { botany: "Panicum sumatrense. Minor millet.", breed: "Olm 203.", profit: "₹30,000", requirements: { temp: "25-35", rainfall: "500-900", ph: "5.5-7.0", n: "30-50", p: "20-30", k: "20-30" }, image: 'https://placehold.co/600x400/8B4513/FFFFFF?text=Little+Millet' },
    "Barnyard millet": { botany: "Echinochloa frumentacea. Minor millet.", breed: "VL 172.", profit: "₹28,000", requirements: { temp: "25-35", rainfall: "400-800", ph: "5.5-7.0", n: "30-50", p: "20-30", k: "20-30" }, image: 'https://placehold.co/600x400/A0522D/FFFFFF?text=Barnyard+Millet' },
    "Buckwheat": { botany: "Fagopyrum esculentum. Pseudo-cereal.", breed: "Sweet Buckwheat.", profit: "₹45,000", requirements: { temp: "15-25", rainfall: "500-800", ph: "5.0-6.5", n: "20-40", p: "30-50", k: "30-50" }, image: 'https://placehold.co/600x400/BDB76B/000000?text=Buckwheat' },
    "Amaranth seed": { botany: "Amaranthus spp. Pseudo-cereal.", breed: "Annapurna.", profit: "₹40,000", requirements: { temp: "20-30", rainfall: "600-1000", ph: "6.0-7.5", n: "40-60", p: "20-40", k: "30-50" }, image: 'https://placehold.co/600x400/FFD700/000000?text=Amaranth+Seed' },
    "Cucumber": { botany: "Cucumis sativus. Vine vegetable.", breed: "Pusa Sanyog.", profit: "₹50,000", requirements: { temp: "20-30", rainfall: "600-1000", ph: "6.0-7.0", n: "80-120", p: "40-60", k: "60-90" }, image: 'https://placehold.co/600x400/90EE90/000000?text=Cucumber' },
    "Bitter gourd": { botany: "Momordica charantia. Vine vegetable.", breed: "Pusa Do Mausami.", profit: "₹45,000", requirements: { temp: "25-35", rainfall: "600-1000", ph: "6.0-7.0", n: "80-120", p: "40-60", k: "60-90" }, image: 'https://placehold.co/600x400/3CB371/FFFFFF?text=Bitter+Gourd' },
    "Muskmelon": { botany: "Cucumis melo. Fruit.", breed: "Pusa Rasraj.", profit: "₹70,000", requirements: { temp: "25-35", rainfall: "500-800", ph: "6.0-7.0", n: "80-120", p: "40-60", k: "60-90" }, image: 'https://placehold.co/600x400/FFA07A/000000?text=Muskmelon' },
    "Watermelon": { botany: "Citrullus lanatus. Fruit. Needs warm weather.", breed: "Sugar Baby.", profit: "₹80,000", requirements: { temp: "25-35", rainfall: "500-800", ph: "6.0-7.0", n: "80-120", p: "40-60", k: "60-90" }, image: 'https://placehold.co/600x400/B22222/FFFFFF?text=Watermelon' },
    "Pumpkin": { botany: "Cucurbita moschata. Vegetable/fruit.", breed: "Arka Suryamukhi.", profit: "₹60,000", requirements: { temp: "20-30", rainfall: "600-1000", ph: "6.0-7.0", n: "80-120", p: "40-60", k: "60-90" }, image: 'https://placehold.co/600x400/FF8C00/000000?text=Pumpkin' },
    "Garlic": { botany: "Allium sativum. Spice/vegetable. Cool season.", breed: "Yamuna Safed.", profit: "₹90,000", requirements: { temp: "10-25", rainfall: "500-800", ph: "6.0-7.5", n: "80-120", p: "40-60", k: "80-120" }, image: 'https://placehold.co/600x400/FFFFFF/000000?text=Garlic' },
    "Carrots": { botany: "Daucus carota. Root vegetable. Cool season.", breed: "Pusa Kesar.", profit: "₹55,000", requirements: { temp: "15-20", rainfall: "500-800", ph: "6.0-7.0", n: "80-120", p: "40-60", k: "60-90" }, image: 'https://placehold.co/600x400/FF8C00/000000?text=Carrots' },
    "Spinach": { botany: "Spinacia oleracea. Leafy vegetable. Cool season.", breed: "Pusa Jyoti.", profit: "₹35,000", requirements: { temp: "15-25", rainfall: "400-600", ph: "6.0-7.5", n: "80-120", p: "40-60", k: "40-60" }, image: 'https://placehold.co/600x400/008000/FFFFFF?text=Spinach' },
    "Lady's finger (Okra/Bhindi)": { botany: "Abelmoschus esculentus. Warm season vegetable.", breed: "Pusa A-4.", profit: "₹65,000", requirements: { temp: "25-35", rainfall: "600-1000", ph: "6.0-7.0", n: "80-120", p: "40-60", k: "60-90" }, image: 'https://placehold.co/600x400/3CB371/FFFFFF?text=Okra+Bhindi' },
    "Apricot": { botany: "Prunus armeniaca. Temperate fruit.", breed: "Kaisha.", profit: "₹2,00,000", requirements: { temp: "15-30", rainfall: "800-1200", ph: "6.0-7.0", n: "50-80", p: "20-40", k: "50-80" }, image: 'https://placehold.co/600x400/FF8C00/000000?text=Apricot+Fruit' },
    "Peach": { botany: "Prunus persica. Temperate fruit.", breed: "Flordasun.", profit: "₹2,10,000", requirements: { temp: "15-30", rainfall: "800-1200", ph: "6.0-7.0", n: "50-80", p: "20-40", k: "50-80" }, image: 'https://placehold.co/600x400/FFA07A/000000?text=Peach+Fruit' },
    "Pear": { botany: "Pyrus spp. Temperate fruit.", breed: "Patharnakh.", profit: "₹1,90,000", requirements: { temp: "15-25", rainfall: "800-1200", ph: "6.0-7.0", n: "50-80", p: "20-40", k: "50-80" }, image: 'https://placehold.co/600x400/D3D3D3/000000?text=Pear+Fruit' },
    "Plum": { botany: "Prunus domestica. Temperate fruit.", breed: "Satsuma.", profit: "₹1,70,000", requirements: { temp: "15-30", rainfall: "800-1200", ph: "6.0-7.0", n: "50-80", p: "20-40", k: "50-80" }, image: 'https://placehold.co/600x400/800080/FFFFFF?text=Plum+Fruit' },
    "Pineapple": { botany: "Ananas comosus. Tropical fruit.", breed: "Kew.", profit: "₹1,50,000", requirements: { temp: "22-32", rainfall: "1000-1500", ph: "5.5-6.5", n: "80-120", p: "40-60", k: "80-120" }, image: 'https://placehold.co/600x400/FFD700/000000?text=Pineapple+Fruit' },
    "Guava": { botany: "Psidium guajava. Tropical fruit.", breed: "Allahabad Safeda.", profit: "₹1,60,000", requirements: { temp: "20-30", rainfall: "800-1500", ph: "6.0-7.0", n: "50-100", p: "30-50", k: "50-100" }, image: 'https://placehold.co/600x400/BDB76B/000000?text=Guava+Fruit' },
    "Papaya": { botany: "Carica papaya. Tropical fruit.", breed: "Pusa Delicious.", profit: "₹1,20,000", requirements: { temp: "25-35", rainfall: "600-1000", ph: "6.0-7.0", n: "100-150", p: "50-80", k: "100-150" }, image: 'https://placehold.co/600x400/FFA07A/000000?text=Papaya+Fruit' },
    "Litchi": { botany: "Litchi chinensis. Tropical fruit.", breed: "Shahi.", profit: "₹2,30,000", requirements: { temp: "25-35", rainfall: "1000-1500", ph: "5.5-7.0", n: "80-120", p: "40-60", k: "80-120" }, image: 'https://placehold.co/600x400/FF6347/FFFFFF?text=Litchi+Fruit' },
    "Cumin": { botany: "Cuminum cyminum. Spice. Cool, dry weather.", breed: "RZ-19.", profit: "₹80,000", requirements: { temp: "15-25", rainfall: "300-500", ph: "6.0-7.5", n: "30-50", p: "20-30", k: "20-30" }, image: 'https://placehold.co/600x400/D2B48C/000000?text=Cumin+Seed' },
    "Fennel seed": { botany: "Foeniculum vulgare. Spice. Cool season.", breed: "Gujarat Fennel-1.", profit: "₹70,000", requirements: { temp: "15-25", rainfall: "400-600", ph: "6.0-7.5", n: "40-60", p: "20-30", k: "20-30" }, image: 'https://placehold.co/600x400/F0E68C/000000?text=Fennel+Seed' },
    "Fenugreek seed": { botany: "Trigonella foenum-graecum. Spice/herb. Cool season.", breed: "RMT-143.", profit: "₹65,000", requirements: { temp: "15-25", rainfall: "300-500", ph: "6.0-7.5", n: "30-50", p: "20-30", k: "20-30" }, image: 'https://placehold.co/600x400/FFA07A/000000?text=Fenugreek+Seed' },
    "Cloves": { botany: "Syzygium aromaticum. Spice tree. Needs tropical, high humidity.", breed: "Local.", profit: "₹4,50,000", requirements: { temp: "20-30", rainfall: "1500-2500", ph: "6.0-7.0", n: "100-150", p: "50-80", k: "150-200" }, image: 'https://placehold.co/600x400/8B4513/FFFFFF?text=Cloves' },
    "Tulsi (Holy Basil)": { botany: "Ocimum tenuiflorum. Medicinal herb.", breed: "Rama Tulsi.", profit: "₹40,000", requirements: { temp: "20-30", rainfall: "500-1000", ph: "6.0-7.5", n: "30-50", p: "20-30", k: "20-30" }, image: 'https://placehold.co/600x400/3CB371/FFFFFF?text=Tulsi+Basil' },
    "Aloe Vera": { botany: "Aloe barbadensis miller. Medicinal plant. Drought tolerant.", breed: "Local.", profit: "₹50,000", requirements: { temp: "20-30", rainfall: "300-500", ph: "6.0-8.0", n: "20-40", p: "20-30", k: "20-30" }, image: 'https://placehold.co/600x400/90EE90/000000?text=Aloe+Vera' },
    "Mentha": { botany: "Mentha spp. Mint oil. Water intensive.", breed: "Mentha arvensis.", profit: "₹60,000", requirements: { temp: "20-30", rainfall: "800-1200", ph: "6.0-7.5", n: "80-120", p: "40-60", k: "60-90" }, image: 'https://placehold.co/600x400/008000/FFFFFF?text=Mentha+Mint' },
    "Chandan (Sandalwood)": { botany: "Santalum album. Tree crop. Highly valuable.", breed: "Local.", profit: "₹5,00,000", requirements: { temp: "15-35", rainfall: "600-1500", ph: "6.5-7.5", n: "10-20", p: "10-20", k: "10-20" }, image: 'https://placehold.co/600x400/B8860B/FFFFFF?text=Sandalwood+Chandan' },
    "Saffron": { botany: "Crocus sativus. Spice. Needs extreme cold and specific soil.", breed: "Kashmir.", profit: "₹10,00,000", requirements: { temp: "5-20", rainfall: "300-500", ph: "6.0-8.0", n: "20-30", p: "40-60", k: "40-60" }, image: 'https://placehold.co/600x400/800080/FFFFFF?text=Saffron+Flower' },
};

// --- MOCK PREDICTION LOGIC (Needs replacement with actual ML backend) ---
const simulateCropPrediction = (params) => {
  const { temperature, humidity, nLevel, pLevel, kLevel, soilType, rainfall, phLevel } = params;

  // 1. HIGH VALUE CASH CROPS (Requires specific conditions)
  if (rainfall > 2000 && temperature > 25 && phLevel < 6.5) return "Black pepper";
  if (rainfall > 2500 && temperature > 20 && phLevel < 5.5) return "Tea";
  if (rainfall > 1000 && temperature > 20 && nLevel > 150) return "Bananas";
  if (rainfall < 600 && temperature < 20 && phLevel > 7.5) return "Saffron"; // Extreme cold/specific
  
  // 2. CEREALS (Staple foods)
  if (soilType === 'Clay' && temperature > 25 && humidity > 60 && nLevel > 60) return "Rice";
  if (soilType === 'Loam' && temperature < 20 && nLevel > 80) return "Wheat";
  if (soilType === 'Silt' && temperature > 20 && pLevel > 50) return "Maize";
  if (temperature < 25 && nLevel > 60 && phLevel > 6.0) return "Barley";
  
  // 3. PULSES (Nitrogen fixers, lower N requirement)
  if (nLevel < 40 && pLevel > 40 && temperature < 30) return "Gram";
  if (nLevel < 30 && temperature > 25 && rainfall < 800) return "Moth";
  if (nLevel < 30 && temperature > 25 && soilType === 'Loam') return "Soybean";
  
  // 4. VEGETABLES/TUBERS (Specific temp windows)
  if (temperature < 20 && kLevel > 100) return "Potatoes";
  if (temperature < 25 && kLevel > 80 && phLevel > 6.0) return "Onions";
  if (temperature > 20 && temperature < 30 && nLevel > 100) return "Tomatoes";

  // 5. MILLETS (Drought tolerant)
  if (rainfall < 500 && temperature > 30) return "Jowar (Sorghum)";
  if (rainfall < 400 && temperature > 30) return "Bajra (Pearl Millet)";

  // Default fallback for general conditions
  return "Maize";
};


const simulateExternalAPIs = async (cropName, location) => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency

  const weatherSummary = `Forecast for ${location || 'N/A'}: Next 7 days expect avg high of 28°C and 60% humidity. Light rainfall expected on Day 3.`;

  const details = mockCropDetails[cropName] || mockCropDetails['Rice']; // Default to Rice if new crop is missing

  return {
    weather: weatherSummary,
    profit: details.profit,
    // Risk is higher for very high profit or specialized crops
    risk: details.profit.includes('3,50,000') || details.profit.includes('10,00,000') ? 'High' : (details.profit.includes('2,00,000') ? 'Medium' : 'Low'),
  };
};

// --- 4. SHARED COMPONENTS ---

const AgriOptimaLogo = () => (
  <div className="flex items-center space-x-2">
    <Sprout className="w-8 h-8 text-white md:text-green-600" fill="currentColor" />
    <span className="text-xl font-extrabold tracking-wider text-white md:text-gray-800">AgriOptima</span>
  </div>
);

const AuthFormInput = ({ label, name, type = 'text', value, onChange, placeholder, icon: Icon, isCaptcha = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {isCaptcha && <p className="text-xs text-red-500 mb-1 font-semibold">({placeholder})</p>}
    <div className="relative rounded-md shadow-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-green-500" />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="block w-full rounded-lg border-gray-300 pl-10 pr-3 py-2 text-base focus:border-green-500 focus:ring-green-500 transition"
      />
    </div>
  </div>
);

// --- Crop Details Modal ---
const CropDetailsModal = ({ T, cropName, onClose }) => {
    // Safely look up the crop details
    const cropData = mockCropDetails[cropName] || mockCropDetails["Rice"]; 
    
    // Convert property names back to display strings (using the T object for translation)
    const displayRequirements = useMemo(() => {
        const req = cropData.requirements;
        return [
            { label: "Temperature", value: req.temp, unit: "°C", Icon: Sun },
            { label: T.RAINFALL, value: req.rainfall, unit: "mm", Icon: Cloud },
            { label: T.PH_LEVEL, value: req.ph, unit: "", Icon: FlaskConical },
            { label: T.N_LEVEL, value: req.n, unit: "kg/ha", Icon: Sprout },
            { label: T.P_LEVEL, value: req.p, unit: "kg/ha", Icon: Sprout },
            { label: T.K_LEVEL, value: req.k, unit: "kg/ha", Icon: Sprout },
        ];
    }, [cropData, T]);

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300">
                <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center z-10 rounded-t-xl">
                    <h2 className="text-3xl font-bold text-green-700 flex items-center">
                        <Sprout className="w-7 h-7 mr-3" />
                        {cropName} - {T.CROP_DETAILS_TITLE}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                    {/* Image and Profit - Made image section more prominent */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        <div className="md:col-span-2 p-3 bg-gray-100 rounded-xl shadow-inner border">
                            <img
                                src={cropData.image}
                                alt={`${cropName} Field`}
                                className="w-full h-auto rounded-lg shadow-md object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/CCCCCC/333333?text=Crop+Image"; }}
                            />
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg shadow-inner">
                            <div className="flex items-center space-x-3 mb-2">
                                <DollarSign className="w-6 h-6 text-green-700" />
                                <h3 className="text-xl font-semibold text-gray-800">{T.ESTIMATED_PROFIT}</h3>
                            </div>
                            <p className="text-3xl font-bold text-green-600">{cropData.profit}</p>
                            <p className="text-sm text-gray-500 mt-2">This is an estimate based on average market prices.</p>
                        </div>
                    </div>

                    {/* Botany Section */}
                    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center">
                            <FlaskConical className="w-6 h-6 mr-2 text-blue-600" /> {T.BOTANY}
                        </h3>
                        <p className="text-gray-700 mb-4 font-medium">{cropData.botany}</p>
                        <p className="text-sm text-gray-600">**Breed Varieties:** {cropData.breed}</p>
                    </div>

                    {/* Optimal Conditions Section */}
                    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                            <Globe className="w-6 h-6 mr-2 text-orange-600" /> {T.OPTIMAL_CONDITIONS}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
                            {displayRequirements.map((req, index) => (
                                <ConditionCard key={index} Icon={req.Icon} label={req.label} value={req.value} unit={req.unit} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const ConditionCard = ({ Icon, label, value, unit }) => (
    <div className="p-3 bg-gray-50 rounded-lg border">
        <Icon className="w-5 h-5 text-green-600 mx-auto mb-1" />
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-lg font-semibold text-gray-800">{value} <span className="text-sm font-normal">{unit}</span></p>
    </div>
);


// --- 5. AUTHENTICATION MODAL (Login/Signup) ---

const AuthModal = ({ T, isModalOpen, setIsModalOpen, setAuthType, authType, handleAuthAction }) => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');

  const isSignup = authType === 'signup';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCaptchaChange = (e) => {
    setCaptchaInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (captchaInput.toUpperCase() !== 'AGRI') {
      setError("Incorrect Captcha. Please type 'AGRI'.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const success = await handleAuthAction(formData, isSignup);
    setIsSubmitting(false);

    if (success) {
      if (isSignup) {
        alert(T.SUCCESS_SIGNUP);
        setAuthType('login');
      }
      setIsModalOpen(false);
      setFormData({});
      setCaptchaInput('');
    } else {
      setError(isSignup ? T.ERROR_SIGNUP : T.ERROR_LOGIN);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-green-700 flex items-center">
              {isSignup ? T.SIGNUP : T.LOGIN}
            </h2>
            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="grid grid-cols-2 gap-x-4">
                <AuthFormInput label={T.FNAME} name="firstName" value={formData.firstName || ''} onChange={handleChange} icon={UserPlus} />
                <AuthFormInput label={T.LNAME} name="lastName" value={formData.lastName || ''} onChange={handleChange} icon={UserPlus} />
                <AuthFormInput label={T.CITY} name="city" value={formData.city || ''} onChange={handleChange} icon={MapPin} />
                <AuthFormInput label={T.STATE} name="state" value={formData.state || ''} onChange={handleChange} icon={MapPin} />
                <AuthFormInput label={T.COUNTRY} name="country" value={formData.country || ''} onChange={handleChange} icon={MapPin} />
                <AuthFormInput label={T.MOBILE} name="mobile" type="tel" value={formData.mobile || ''} onChange={handleChange} icon={Phone} />
              </div>
            )}
            <AuthFormInput label={T.EMAIL} name="email" type="email" value={formData.email || ''} onChange={handleChange} icon={Mail} />
            <AuthFormInput label={T.PASSWORD} name="password" type="password" value={formData.password || ''} onChange={handleChange} icon={Lock} />

            <AuthFormInput
              label="Captcha"
              name="captcha"
              value={captchaInput}
              onChange={handleCaptchaChange}
              placeholder={T.CAPTCHA_PROMPT}
              icon={MessageSquare}
              isCaptcha={true}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              {isSignup ? T.SIGNUP : T.LOGIN}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            {isSignup ? T.LOGIN : T.SIGNUP} Instead?
            <button
              onClick={() => setAuthType(isSignup ? 'login' : 'signup')}
              className="text-green-600 font-medium ml-1 hover:text-green-700 transition"
            >
              Click Here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// --- 6. USER DASHBOARD (After Login - Matches Image) ---

const UserDashboard = ({ T, handleLogout, userId, userProfile, setCurrentPage, toggleLanguage }) => {
  const data = mockDashboardData;
  const username = userProfile?.firstName || data.user.name;
  
  // State for the Crop Details Modal
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedSoilFilter, setSelectedSoilFilter] = useState(T.ALL_SOILS);
  
  const handleViewDetails = (cropName) => {
      setSelectedCrop(cropName);
  };
  
  const handleCloseDetails = () => {
      setSelectedCrop(null);
  };
  
  // Filter recommended crops based on soil selection
  const filteredCrops = useMemo(() => {
    if (selectedSoilFilter === T.ALL_SOILS) {
        return data.recommendedCrops;
    }
    // Match against the English soil name stored in mock data
    const soilFilterEnglish = translations.en.SOIL_TYPES[T.SOIL_TYPES.indexOf(selectedSoilFilter)];
    
    return data.recommendedCrops.filter(crop => crop.soil === soilFilterEnglish);
  }, [selectedSoilFilter, data.recommendedCrops, T.ALL_SOILS, T.SOIL_TYPES]);


  const RecommendedCropCard = ({ name, profit, image, soil }) => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition">
      <img src={image} alt={name} className="w-full h-24 object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x70/B8860B/FFFFFF?text=Crop"; }}/>
      <div className="p-4">
        <p className="font-semibold text-lg text-gray-800">{name}</p>
        <p className="text-sm text-green-600 font-medium">{profit}</p>
        <p className="text-xs text-gray-500 mt-1">Soil: {soil}</p>
        <button 
            onClick={() => handleViewDetails(name)}
            className="mt-2 w-full text-center py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800 transition">
          {T.VIEW_DETAILS}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header/Navigation - FIXED NAVIGATION */}
      <div className="bg-green-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-3">
          {/* NAVIGATION ITEMS */}
          <div className="flex items-center space-x-6 text-white text-sm font-medium">
            <button onClick={() => setCurrentPage('dashboard')} className="hover:text-green-200 transition">
              <Briefcase className="w-5 h-5 inline mr-1" /> {T.DASHBOARD}
            </button>
            <button onClick={() => setCurrentPage('prediction')} className="hover:text-green-200 transition">
              <TrendingUp className="w-5 h-5 inline mr-1" /> {T.PREDICTION} {/* DIRECT LINK */}
            </button>
            <button onClick={() => setCurrentPage('crops')} className="hover:text-green-200 transition">
              <Wheat className="w-5 h-5 inline mr-1" /> {T.CROPS}
            </button>
            <button onClick={() => setCurrentPage('analytics')} className="hover:text-green-200 transition">
              <BarChart className="w-5 h-5 inline mr-1" /> {T.ANALYTICS}
            </button>
             <button onClick={() => setCurrentPage('profile')} className="hover:text-green-200 transition">
              <UserPlus className="w-5 h-5 inline mr-1" /> {T.PROFILE}
            </button>
          </div>
          
          {/* LOGOUT AND LANGUAGE */}
          <div className="flex items-center space-x-4">
            <button
                onClick={toggleLanguage}
                className="flex items-center text-white hover:text-green-200 transition text-sm"
                title="Change Language"
            >
                {T.LANG_NAME}
                <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            
            <button onClick={handleLogout} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-medium transition">
              {T.LOGOUT}
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-cover bg-center h-64" style={{ backgroundImage: "url(https://placehold.co/1200x256/228B22/FFFFFF?text=Smart+Farming+Field)", clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0% 100%)' }}>
        <div className="absolute inset-0 bg-green-800 opacity-80"></div>
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 text-white">
          <div className="flex items-center mb-4">
            {/* Avatar Placeholder */}
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden mr-4">
              <img src="https://placehold.co/64x64/E0E0E0/333333?text=S" alt="Profile" className="object-cover w-full h-full" />
            </div>
            <div>
              <p className="text-xl font-semibold">{T.HELLO} {username}</p>
              <h2 className="text-4xl font-bold">{T.WELCOME}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-12">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-lg flex items-center space-x-3">
            <Sun className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{data.user.temperature}°C</p>
              <p className="text-sm text-gray-500">{data.user.humidity}% {T.HUMIDITY}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-lg flex items-center space-x-3">
            <Sprout className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">{T.MOST_SUGGESTED}</p>
              <p className="text-xl font-bold text-gray-800">{data.user.mostSuggestedCrop}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-lg flex items-center space-x-3">
            <BarChart className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">{T.TOTAL_PREDICTIONS}</p>
              <p className="text-xl font-bold text-gray-800">{data.user.totalPredictions}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-lg flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-lime-600" />
            <div>
              <p className="text-sm text-gray-500">{T.LAST_PROFIT}</p>
              <p className="text-xl font-bold text-gray-800">{data.user.lastProfitEstimate}</p>
            </div>
          </div>
        </div>

        {/* Recommended Crops */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-800">{T.RECOMMENDED}</h3>
            <div className="flex items-center space-x-3">
                <label className="text-sm text-gray-700 font-medium hidden sm:block">{T.SOIL_TYPE_FILTER}:</label>
                <select
                    value={selectedSoilFilter}
                    onChange={(e) => setSelectedSoilFilter(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
                >
                    <option value={T.ALL_SOILS}>{T.ALL_SOILS}</option>
                    {T.SOIL_TYPES.map(soil => (
                        <option key={soil} value={soil}>{soil}</option>
                    ))}
                </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCrops.length > 0 ? (
                filteredCrops.map((crop, index) => (
                  <RecommendedCropCard key={index} {...crop} />
                ))
            ) : (
                <p className="text-gray-500 col-span-full p-4 text-center border rounded-lg bg-white">No recommended crops found for the selected soil type ({selectedSoilFilter}).</p>
            )}
          </div>
        </div>

        {/* History and Knowledge Base Grid (Analytics section moved to dedicated page) */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 space-y-8">
            {/* Prediction History */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{T.HISTORY}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Date', 'Crop', 'Profit', 'Inputs'].map(header => (
                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.predictionHistory.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.crop}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{item.profit}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.inputs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Knowledge Base */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{T.KNOWLEDGE}</h3>
              <div className="grid grid-cols-3 gap-4">
                {data.knowledgeBase.map((item, index) => (
                  <div key={index} className="rounded-lg overflow-hidden border border-gray-200 text-center hover:shadow-md transition">
                    {/* Use mockCropDetails image for Knowledge Base */}
                    <img 
                      src={mockCropDetails[item.name]?.image || item.image} 
                      alt={item.name} 
                      className="w-full h-24 object-cover" 
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/B8860B/FFFFFF?text=Crop"; }}
                    />
                    <p className="py-2 text-sm font-medium text-gray-700">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Dashboard Footer (matches image) */}
      <footer className="bg-green-900 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-center space-x-6 text-xs text-white">
          <p>About us</p>
          <p>Contact</p>
          <p>Privacy</p>
          <p>Support</p>
        </div>
      </footer>
      
      {/* Crop Details Modal */}
      {selectedCrop && (
          <CropDetailsModal T={T} cropName={selectedCrop} onClose={handleCloseDetails} />
      )}
    </div>
  );
};

// --- 7. DEDICATED VIEWS (Prediction, Analytics, Crops, Profile) ---

const AnalyticsSection = ({ T }) => (
    <div className="col-span-12 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
        <BarChart className="w-6 h-6 mr-2 text-green-600" /> {T.ANALYTICS_OVERVIEW}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{T.PROFIT_TREND}</h3>
          <Line data={mockDashboardData.analytics.profitTrend} options={{ responsive: true, plugins: { legend: { display: true } } }} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{T.CROP_FREQUENCY}</h3>
          <div className="h-64 flex justify-center items-center">
            <Doughnut data={mockDashboardData.analytics.cropFrequency} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
      
      <div className="p-6 bg-yellow-50 text-yellow-800 rounded-lg shadow-inner flex items-center">
          <Gauge className="w-6 h-6 mr-3" />
          <p>{T.WIP_MESSAGE}</p>
      </div>
    </div>
  );


const AnalyticsView = ({ T }) => (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <AnalyticsSection T={T} />
    </div>
);

const CropsView = ({ T, handleViewDetails }) => ( // Added handleViewDetails prop
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-green-700 mb-8 flex items-center">
            <Wheat className="w-8 h-8 mr-3" />
            {T.CROP_CATALOG}
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Object.keys(mockCropDetails).map(cropName => {
                const data = mockCropDetails[cropName];
                return (
                    <div key={cropName} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                        <img src={data.image} alt={cropName} className="w-full h-32 object-cover" />
                        <div className="p-4">
                            <h3 className="text-xl font-semibold text-gray-800">{cropName}</h3>
                            <p className="text-sm text-gray-600 mt-1 truncate">{data.botany}</p>
                            <button 
                                onClick={() => handleViewDetails(cropName)} // Fixed button action
                                className="mt-3 w-full text-center py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition">
                                {T.VIEW_DETAILS}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
        
        <div className="mt-8 p-6 bg-yellow-50 text-yellow-800 rounded-lg shadow-inner flex items-center">
          <Gauge className="w-6 h-6 mr-3" />
          <p>{T.WIP_MESSAGE}</p>
        </div>
    </div>
);

const ProfileView = ({ T, userProfile }) => (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-green-700 mb-8 flex items-center">
            <User className="w-8 h-8 mr-3" />
            {T.PROFILE_DETAILS}
        </h1>
        
        <div className="bg-white p-8 rounded-xl shadow-2xl space-y-6">
            <div className="flex items-center space-x-6 border-b pb-4">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl text-green-700 font-bold">
                    {userProfile?.firstName?.charAt(0) || 'F'}
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-800">{userProfile?.firstName} {userProfile?.lastName}</p>
                    <p className="text-md text-gray-500">{userProfile?.email}</p>
                </div>
            </div>
            
            <ProfileDetailRow Icon={Mail} label={T.EMAIL} value={userProfile?.email || 'N/A'} />
            <ProfileDetailRow Icon={Phone} label={T.MOBILE} value={userProfile?.mobile || 'N/A'} />
            <ProfileDetailRow Icon={MapPin} label={T.CITY} value={userProfile?.city || 'N/A'} />
            <ProfileDetailRow Icon={Globe} label={T.COUNTRY} value={userProfile?.country || 'N/A'} />
        </div>
        <div className="mt-8 p-6 bg-yellow-50 text-yellow-800 rounded-lg shadow-inner flex items-center">
          <Gauge className="w-6 h-6 mr-3" />
          <p>{T.WIP_MESSAGE}</p>
        </div>
    </div>
);

const ProfileDetailRow = ({ Icon, label, value }) => (
    <div className="grid grid-cols-3 gap-4 border-b border-gray-100 pb-3">
        <div className="flex items-center text-gray-600 font-medium space-x-2">
            <Icon className="w-5 h-5 text-green-600" />
            <span>{label}</span>
        </div>
        <div className="col-span-2 text-gray-800">{value}</div>
    </div>
);


const PredictionView = ({ T, userId, isAuthReady }) => {
    const [params, setParams] = useState({
        temperature: 25,
        humidity: 65,
        soilType: T.SOIL_TYPES[0],
        nLevel: 90,
        pLevel: 42,
        kLevel: 40,
        phLevel: 6.5,
        rainfall: 1000,
        location: 'Current Area',
    });
    const [prediction, setPrediction] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setParams(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value,
        }));
    };

    const savePredictionToHistory = useCallback(async (input, result) => {
        if (!userId || !db) return; 

        try {
            const historyRef = collection(db, 'artifacts', appId, 'users', userId, 'predictions');
            await addDoc(historyRef, {
                input,
                result,
                timestamp: serverTimestamp(),
            });
        } catch (e) {
            console.error("Error adding prediction history: ", e);
        }
    }, [userId]);

    const handlePredict = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setPrediction(null);

        try {
            // 1. Core ML Prediction (Simulated backend call)
            const suggestedCrop = simulateCropPrediction(params);

            // 2. Fetch External Data (Simulated backend call)
            const externalData = await simulateExternalAPIs(suggestedCrop, params.location);

            const result = {
                crop: suggestedCrop,
                weather: externalData.weather,
                profit: externalData.profit,
                risk: externalData.risk,
            };

            setPrediction(result);
            if (isAuthReady && userId) {
                savePredictionToHistory(params, result);
            }
        } catch (e) {
            console.error(e);
            setError(T.ERROR_API);
        } finally {
            setIsLoading(false);
        }
    };

    const InputField = ({ label, name, type = 'number', icon: Icon, min = 0, max = 200, step = 1, unit = '' }) => (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon className="h-5 w-5 text-green-500" />
                </div>
                <input
                    type={type}
                    name={name}
                    value={params[name]}
                    onChange={handleChange}
                    min={min}
                    max={max}
                    step={step}
                    required
                    className="block w-full rounded-lg border-gray-300 pl-10 pr-10 py-2 text-base focus:border-green-500 focus:ring-green-500 transition"
                />
                {unit && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm">{unit}</span>}
            </div>
        </div>
    );

    const ResultCard = ({ title, icon: Icon, content, subContent, color }) => (
      <div className={`p-4 md:p-6 rounded-xl shadow-lg border ${color || 'bg-white'} transition duration-300 transform hover:shadow-xl`}>
        <div className="flex items-center space-x-4 mb-3">
          <Icon className={`w-8 h-8 text-white`} />
          <h3 className={`text-xl font-semibold text-white`}>{title}</h3>
        </div>
        <div className="text-2xl font-bold tracking-tight text-white">
          {content}
        </div>
        {subContent && <p className={`text-sm mt-1 text-gray-200`}>{subContent}</p>}
      </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <h1 className="text-4xl font-extrabold text-green-700 mb-8 flex items-center">
                <Wheat className="w-8 h-8 mr-3" />
                {T.PREDICTION}
            </h1>

            <div className="p-4 md:p-8 bg-white rounded-xl shadow-2xl">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                    <Barcode className="w-7 h-7 mr-3 text-green-600" />
                    {T.INPUT_PARAMS}
                </h2>
                <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Environmental Inputs */}
                    <InputField label={T.TEMPERATURE} name="temperature" icon={Thermometer} min={-10} max={50} step={0.1} unit="°C" />
                    <InputField label={T.HUMIDITY} name="humidity" icon={Droplet} min={0} max={100} unit="%" />
                    <InputField label={T.RAINFALL} name="rainfall" icon={Cloud} min={0} max={5000} unit="mm" />
                    <InputField label={T.PH_LEVEL} name="phLevel" icon={FlaskConical} min={0} max={14} step={0.1} />

                    {/* Soil Nutrient Inputs (NPK) */}
                    <InputField label={T.N_LEVEL} name="nLevel" icon={Sprout} max={200} unit="kg/ha" />
                    <InputField label={T.P_LEVEL} name="pLevel" icon={Sprout} max={200} unit="kg/ha" />
                    <InputField label={T.K_LEVEL} name="kLevel" icon={Sprout} max={200} unit="kg/ha" />

                    {/* Location/Soil Type */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                        <div className="relative mt-1 rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Globe className="h-5 w-5 text-green-500" />
                            </div>
                            <select
                                name="soilType"
                                value={params.soilType}
                                onChange={handleChange}
                                required
                                className="block w-full rounded-lg border-gray-300 pl-10 pr-3 py-2 text-base focus:border-green-500 focus:ring-green-500 transition appearance-none"
                            >
                                {T.SOIL_TYPES.map((type, index) => (
                                    <option key={index} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                
                    <InputField label="Location/Area" name="location" type="text" icon={MapPin} max={100} unit="" />
                
                    <div className="col-span-full mt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full md:w-auto px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                            {T.PREDICT}
                        </button>
                    </div>
                </form>
            </div>

            {(prediction || isLoading || error) && (
                <div className="mt-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                        <TrendingUp className="w-7 h-7 mr-3 text-green-600" />
                        {T.PREDICTION_RESULT}
                    </h2>

                    {isLoading && (
                        <div className="text-center p-12 bg-white rounded-xl shadow-lg">
                            <Loader2 className="w-10 h-10 animate-spin mx-auto text-green-600" />
                            <p className="mt-3 text-green-600 font-semibold">{T.FETCHING_DATA}</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
                            <X className="w-5 h-5 mr-3" />
                            {error}
                        </div>
                    )}

                    {prediction && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Suggested Crop Card */}
                            <ResultCard
                                title={T.CROP_SUGGESTED}
                                icon={Sprout}
                                content={prediction.crop}
                                subContent={`(Optimal for your inputs)`}
                                color="bg-green-600"
                            />

                            {/* Profit Analysis Card */}
                            <ResultCard
                                title={T.ESTIMATED_PROFIT}
                                icon={DollarSign}
                                content={prediction.profit}
                                subContent={`${T.RISK_LEVEL}: ${prediction.risk}`}
                                color="bg-yellow-600"
                            />

                            {/* Weather Forecast Card */}
                            <ResultCard
                                title={T.WEATHER_FORECAST}
                                icon={Cloud}
                                content={prediction.weather}
                                subContent="Based on location input."
                                color="bg-blue-600"
                            />
                            
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


// --- 8. LANDING PAGE (Scrollable Sections) ---

const LandingPage = ({ T, openAuthModal, toggleLanguage }) => {
  const sections = [
    { id: 'home', label: T.HOME, icon: Home },
    { id: 'about', label: T.ABOUT, icon: Info },
    { id: 'contact', label: T.CONTACT, icon: Mail },
  ];

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const Header = ({ isScrolled }) => (
    <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-green-800'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
           <Sprout className={`w-8 h-8 ${isScrolled ? 'text-green-600' : 'text-white'}`} fill="currentColor" />
            <span className={`text-xl font-extrabold tracking-wider ${isScrolled ? 'text-gray-800' : 'text-white'}`}>AgriOptima</span>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`text-sm font-medium transition-colors ${isScrolled ? 'text-gray-700 hover:text-green-600' : 'text-white hover:text-green-200'}`}
            >
              {section.label}
            </button>
          ))}
          <button
            onClick={toggleLanguage}
            className={`flex items-center px-3 py-1 rounded-full transition-colors ${isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-green-700'} border ${isScrolled ? 'border-gray-300' : 'border-green-700'}`}
            title="Change Language"
          >
            <ArrowLeftRight className="w-4 h-4 mr-1" />
            <span className="text-xs font-semibold">{T === translations.en ? 'हि' : 'EN'}</span>
          </button>
          <button
            onClick={() => openAuthModal('login')}
            className="px-4 py-2 bg-yellow-400 text-green-900 font-semibold rounded-full shadow-md hover:bg-yellow-500 transition duration-300 flex items-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{T.LOGIN} / {T.SIGNUP}</span>
          </button>
        </nav>
        {/* Mobile Menu */}
         <MobileMenu sections={sections} scrollToSection={scrollToSection} openAuthModal={openAuthModal} T={T} toggleLanguage={toggleLanguage} isScrolled={isScrolled} />
      </div>
    </header>
  );
  
  const MobileMenu = ({ sections, scrollToSection, openAuthModal, T, toggleLanguage, isScrolled }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="md:hidden">
        <button onClick={() => setIsOpen(!isOpen)} className={`${isScrolled ? 'text-gray-700' : 'text-white'}`}>
          <Menu className="w-6 h-6" />
        </button>
        {isOpen && (
          <div className="absolute right-0 top-14 w-64 bg-white shadow-xl rounded-lg py-2 transition-all">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => { scrollToSection(section.id); setIsOpen(false); }}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-green-50"
              >
                <section.icon className="w-5 h-5 inline mr-2 text-green-600" /> {section.label}
              </button>
            ))}
             <button
                onClick={toggleLanguage}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-green-50"
                title="Change Language"
              >
                <ArrowLeftRight className="w-5 h-5 inline mr-2 text-green-600" />
                <span className="font-semibold">{T === translations.en ? 'हि' : 'EN'}</span>
            </button>
            <div className="border-t mt-2 pt-2">
              <button
                onClick={() => { openAuthModal('login'); setIsOpen(false); }}
                className="block w-full text-left px-4 py-3 text-green-600 font-semibold hover:bg-green-50"
              >
                <LogIn className="w-5 h-5 inline mr-2" /> {T.LOGIN} / {T.SIGNUP}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const HeroSection = () => (
    <section id="home" className="pt-28 md:pt-40 pb-20 bg-green-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
            {T.APP_NAME}: <span className="text-yellow-400">{T.SLOGAN}</span>
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {T.ABOUT_TEXT}
          </p>
          <button
            onClick={() => openAuthModal('signup')}
            className="px-8 py-3 bg-yellow-400 text-green-900 font-bold rounded-full text-lg shadow-xl hover:bg-yellow-500 transition duration-300 transform hover:scale-105"
          >
            {T.SIGNUP} Today
          </button>
        </div>
        <div className="md:w-1/2">
          {/* Image Placeholder - use a relevant farming illustration */}
          <img
            src="https://placehold.co/600x400/90EE90/000000?text=AI+Powered+Farming"
            alt="AI Farming Illustration"
            className="rounded-xl shadow-2xl"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/90EE90/000000?text=AI+Powered+Farming"; }}
          />
        </div>
      </div>
    </section>
  );

  const AboutSection = () => (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">{T.ABOUT}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-xl shadow-lg border-t-4 border-green-600">
            <Cloud className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <h3 className="text-xl font-semibold mb-2">Climate Analysis</h3>
            <p className="text-gray-600">Integrates future weather predictions for optimal sowing times.</p>
          </div>
          <div className="p-6 rounded-xl shadow-lg border-t-4 border-green-600">
            <Sprout className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <h3 className="text-xl font-semibold mb-2">Soil & Crop Matching</h3>
            <p className="text-gray-600">Uses ML to match your soil profile (N, P, K) to the best crop yield.</p>
          </div>
          <div className="p-6 rounded-xl shadow-lg border-t-4 border-green-600">
            <TrendingUp className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <h3 className="text-xl font-semibold mb-2">Profit Maximization</h3>
            <p className="text-gray-600">Provides profit estimates and risk assessment for financial planning.</p>
          </div>
        </div>
        <p className="mt-12 text-center text-lg text-gray-700 max-w-4xl mx-auto">{T.ABOUT_TEXT}</p>
      </div>
    </section>
  );

  const ContactSection = () => (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-4 text-center">{T.CONTACT_US}</h2>
        <p className="text-center text-lg text-gray-600 mb-10">{T.CONTACT_TEXT}</p>

        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
          <form className="grid grid-cols-1 gap-6">
            <input type="text" placeholder={T.FNAME} required className="p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
            <input type="email" placeholder={T.EMAIL} required className="p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
            <textarea rows="4" placeholder={T.MESSAGE} required className="p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 resize-none"></textarea>
            <button type="submit" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition">
              {T.SEND}
            </button>
          </form>
        </div>
      </div>
      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} AgriOptima. All rights reserved.</p>
      </footer>
    </section>
  );

  return (
    <div className="min-h-screen">
      <Header isScrolled={isScrolled} />
      <main className="mt-[64px] md:mt-[72px]">
        <HeroSection />
        <AboutSection />
        <ContactSection />
      </main>
    </div>
  );
};


// --- 9. MAIN APP COMPONENT ---

const App = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState('landing');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authType, setAuthType] = useState('login'); // 'login' or 'signup'
  const [selectedCrop, setSelectedCrop] = useState(null); // Lifted modal state for sharing
  const T = translations[currentLang];

  const toggleLanguage = useCallback(() => {
    setCurrentLang(prev => prev === 'en' ? 'hi' : 'en');
  }, []);
  
  const handleViewDetails = (cropName) => {
      setSelectedCrop(cropName);
  };
  
  const handleCloseDetails = () => {
      setSelectedCrop(null);
  };

  const openAuthModal = useCallback((type) => {
    setAuthType(type);
    setIsModalOpen(true);
  }, []);
  
  // --- Authentication Handlers ---
  const handleAuthAction = async (data, isSignup) => {
    if (!auth || !db) return false;
    try {
      if (isSignup) {
        // Sign Up attempt
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;
        const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
        
        await setDoc(userDocRef, {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          city: data.city,
          state: data.state,
          country: data.country,
          mobile: data.mobile,
          createdAt: serverTimestamp(),
        });
        return true;
      } else {
        // Log In attempt
        await signInWithEmailAndPassword(auth, data.email, data.password);
        return true;
      }
    } catch (e) {
      console.error("Auth error:", e.message);
      // Fallback for when Email/Password provider is disabled in Firebase console.
      if (e.code === 'auth/operation-not-allowed') {
          console.warn("Email/Password Sign-in is not allowed. Please enable it in Firebase console or proceed as Guest.");
      }
      return false;
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setUserProfile(null);
      setCurrentPage('landing');
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  // --- Initial Auth Check & Profile Listener ---
  useEffect(() => {
    if (!auth || !db) return;

    // 1. Initial anonymous/custom token sign-in
    const setupAuth = async () => {
      try {
        if (initialAuthToken) {
          // Use provided custom token
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          // Fallback to anonymous sign-in if no token is available
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase Auth Init Error:", error);
      }
    };

    setupAuth();

    // 2. Auth State Listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user && !user.isAnonymous) {
        // User successfully signed up/logged in (or authenticated via custom token)
        setIsAuthenticated(true);
        setCurrentPage('dashboard');
        
        // 3. Profile Listener
        const profileDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
        const unsubscribeProfile = onSnapshot(profileDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            // Create a default profile if one doesn't exist yet (e.g. immediately after signup)
            const defaultEmail = user.email || 'N/A';
            const defaultFirstName = user.email ? user.email.split('@')[0] : 'Farmer';
            setUserProfile({ email: defaultEmail, firstName: defaultFirstName, lastName: '' });
          }
        }, (error) => {
          console.error("Error fetching user profile:", error);
        });
        
        setIsAuthReady(true);
        return () => unsubscribeProfile(); // Clean up profile listener
      } else if (user && user.isAnonymous) {
          // User is signed in anonymously (initial state if no custom token was present)
          setIsAuthenticated(false); // Treat as unauthenticated for dashboard purposes
          setUserProfile({ email: 'guest@agrioptima.com', firstName: 'Guest', lastName: '' });
          setCurrentPage('landing');
          setIsAuthReady(true);
      } else {
        // Logged out state
        setIsAuthenticated(false);
        setUserProfile(null);
        setCurrentPage('landing');
        setIsAuthReady(true);
      }
    });

    return () => unsubscribeAuth();
  }, []);


  const renderContent = () => {
    if (!isAuthReady) {
      // Simple full-screen loading state
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Loader2 className="w-12 h-12 animate-spin text-green-600" />
          <p className="ml-3 text-lg text-gray-600">Loading AgriOptima...</p>
        </div>
      );
    }
    
    // Check if the user is explicitly authenticated (not anonymous/guest)
    if (isAuthenticated && userProfile) {
      switch (currentPage) {
        case 'dashboard':
          return <UserDashboard T={T} handleLogout={handleLogout} userProfile={userProfile} setCurrentPage={setCurrentPage} toggleLanguage={toggleLanguage} />;
        case 'prediction':
          return <PredictionView T={T} userId={auth.currentUser?.uid} isAuthReady={true} />;
        case 'analytics':
          return <AnalyticsView T={T} />;
        case 'crops':
          return <CropsView T={T} handleViewDetails={handleViewDetails} />; // Pass handler to CropsView
        case 'profile':
          return <ProfileView T={T} userProfile={userProfile} />;
        default:
          return <UserDashboard T={T} handleLogout={handleLogout} userProfile={userProfile} setCurrentPage={setCurrentPage} toggleLanguage={toggleLanguage} />;
      }
    }
    
    return <LandingPage T={T} openAuthModal={openAuthModal} toggleLanguage={toggleLanguage} />;
  };

  return (
    <>
      {renderContent()}
      <AuthModal
        T={T}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        authType={authType}
        setAuthType={setAuthType}
        handleAuthAction={handleAuthAction}
      />
      
      {/* Crop Details Modal - Rendered globally to be accessible from any authenticated view */}
      {selectedCrop && (
          <CropDetailsModal T={T} cropName={selectedCrop} onClose={handleCloseDetails} />
      )}
    </>
  );
};

export default App;