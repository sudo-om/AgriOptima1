import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Sprout, Cloud, Thermometer, Droplet, Wind, Sun, 
  TrendingUp, AlertTriangle, Search, Menu, X, 
  ChevronRight, ChevronDown, MapPin, Phone, Mail, 
  User, Lock, LogIn, UserPlus, BarChart, 
  Calendar, FileText, CheckCircle, HelpCircle,
  Wheat, DollarSign, Activity, Globe, FlaskConical,
  MessageSquare, ArrowLeftRight, Gauge, Barcode, Loader2, Briefcase
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement
);

const API_BASE_URL = "http://127.0.0.1:8000";

// --- 2. TRANSLATION DATA ---
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
    MOST_SUGGESTED: "सबसे अधिक सुझाई गई फसल",
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

// --- 3. MOCK DATA ---
const mockDashboardData = {
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

const ConditionCard = ({ Icon, label, value, unit }) => (
    <div className="p-3 bg-gray-50 rounded-lg border">
        <Icon className="w-5 h-5 text-green-600 mx-auto mb-1" />
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-lg font-semibold text-gray-800">{value} <span className="text-sm font-normal">{unit}</span></p>
    </div>
);

const CropDetailsModal = ({ T, cropName, onClose }) => {
    const [cropData, setCropData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCropDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/crops/${cropName}`);
                if (!response.ok) throw new Error('Failed to fetch crop details');
                const data = await response.json();
                setCropData(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (cropName) {
            fetchCropDetails();
        }
    }, [cropName]);

    const displayRequirements = useMemo(() => {
        if (!cropData) return [];
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

    if (!cropName) return null;

    if (loading) return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
             <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center">
                <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-3" />
                <p className="text-gray-600 font-medium">Loading {cropName} details...</p>
            </div>
        </div>
    );

    if (error || !cropData) return (
         <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
                <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <p className="text-gray-800 font-medium mb-4">Failed to load details for {cropName}.</p>
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Close</button>
            </div>
        </div>
    );

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
                    {/* Image and Profit */}
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

const RecommendedCropCard = ({ name, profit, image, soil, T, handleViewDetails }) => (
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

const UserDashboard = ({ T, handleLogout, userId, userProfile, setCurrentPage, toggleLanguage, handleViewDetails }) => {
  const data = mockDashboardData;
  const username = userProfile?.firstName || data.user.name;
  const [selectedSoilFilter, setSelectedSoilFilter] = useState(T.ALL_SOILS);
  
  // Filter recommended crops based on soil selection
  const filteredCrops = useMemo(() => {
    if (selectedSoilFilter === T.ALL_SOILS) {
        return data.recommendedCrops;
    }
    // Match against the English soil name stored in mock data
    const soilFilterEnglish = translations.en.SOIL_TYPES[T.SOIL_TYPES.indexOf(selectedSoilFilter)];
    
    return data.recommendedCrops.filter(crop => crop.soil === soilFilterEnglish);
  }, [selectedSoilFilter, data.recommendedCrops, T.ALL_SOILS, T.SOIL_TYPES]);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header/Navigation */}
      <div className="bg-green-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-3">
          <div className="flex items-center space-x-6 text-white text-sm font-medium">
            <button onClick={() => setCurrentPage('dashboard')} className="hover:text-green-200 transition">
              <Briefcase className="w-5 h-5 inline mr-1" /> {T.DASHBOARD}
            </button>
            <button onClick={() => setCurrentPage('prediction')} className="hover:text-green-200 transition">
              <TrendingUp className="w-5 h-5 inline mr-1" /> {T.PREDICTION}
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
                  <RecommendedCropCard key={index} {...crop} T={T} handleViewDetails={handleViewDetails} />
                ))
            ) : (
                <p className="text-gray-500 col-span-full p-4 text-center border rounded-lg bg-white">No recommended crops found for the selected soil type ({selectedSoilFilter}).</p>
            )}
          </div>
        </div>

        {/* History and Knowledge Base Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
             <div className="grid grid-cols-1 gap-4">
                 {data.knowledgeBase.map((item, idx) => (
                    <button key={idx} className="flex items-center space-x-3 p-3 hover:bg-green-50 rounded-lg transition w-full text-left border border-transparent hover:border-green-100" onClick={() => handleViewDetails(item.name)}>
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-full object-cover border-2 border-green-200" onError={(e) => { e.target.onerror=null; e.target.src="https://placehold.co/100x70/B8860B/FFFFFF?text=Crop"; }} />
                        <span className="font-medium text-gray-800">{item.name}</span>
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                    </button>
                 ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PredictionView = ({ T, userId, isAuthReady, setCurrentPage }) => {
    const [formData, setFormData] = useState({
        temperature: '', humidity: '', nLevel: '', pLevel: '', kLevel: '', 
        phLevel: '', rainfall: '', soilType: 'Loam'
    });
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [marketInsights, setMarketInsights] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePredict = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setPrediction(null);
        setMarketInsights(null);

        try {
            const predictRes = await fetch(`${API_BASE_URL}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (!predictRes.ok) throw new Error("Prediction failed");
            const predictData = await predictRes.json();
            const crop = predictData.suggested_crop;
            setPrediction(crop);

            const insightRes = await fetch(`${API_BASE_URL}/market-insights?crop_name=${crop}`);
            if (insightRes.ok) {
                const insightData = await insightRes.json();
                setMarketInsights(insightData);
            }
        } catch (err) {
            console.error(err);
            setError(T.ERROR_API);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
                <button onClick={() => setCurrentPage('dashboard')} className="flex items-center text-gray-600 hover:text-green-700 font-medium">
                    <ChevronDown className="w-5 h-5 rotate-90 mr-1" /> Back
                </button>
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                    <FlaskConical className="w-8 h-8 mr-3 text-green-600" /> {T.PREDICTION}
                </h2>
                <div className="w-10"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg h-fit">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{T.INPUT_PARAMS}</h3>
                    <form onSubmit={handlePredict} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <AuthFormInput label="Temp (°C)" name="temperature" type="number" value={formData.temperature} onChange={handleChange} icon={Thermometer} />
                            <AuthFormInput label={T.HUMIDITY} name="humidity" type="number" value={formData.humidity} onChange={handleChange} icon={Droplet} />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <AuthFormInput label={T.N_LEVEL} name="nLevel" type="number" value={formData.nLevel} onChange={handleChange} icon={Sprout} />
                            <AuthFormInput label={T.P_LEVEL} name="pLevel" type="number" value={formData.pLevel} onChange={handleChange} icon={Sprout} />
                            <AuthFormInput label={T.K_LEVEL} name="kLevel" type="number" value={formData.kLevel} onChange={handleChange} icon={Sprout} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <AuthFormInput label={T.RAINFALL} name="rainfall" type="number" value={formData.rainfall} onChange={handleChange} icon={Cloud} />
                            <AuthFormInput label={T.PH_LEVEL} name="phLevel" type="number" value={formData.phLevel} onChange={handleChange} icon={FlaskConical} />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                            <select name="soilType" value={formData.soilType} onChange={handleChange} className="block w-full rounded-lg border-gray-300 p-2 border focus:border-green-500 focus:ring-green-500">
                                {T.SOIL_TYPES.map(soil => <option key={soil} value={soil}>{soil}</option>)}
                            </select>
                        </div>

                        <button type="submit" disabled={loading} className="w-full py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition flex justify-center items-center">
                            {loading ? <Loader2 className="animate-spin mr-2" /> : <Search className="mr-2" />}
                            {loading ? T.FETCHING_DATA : T.PREDICT}
                        </button>
                    </form>
                    {error && <p className="text-red-500 mt-4 text-center font-medium bg-red-50 p-2 rounded-lg border border-red-200">{error}</p>}
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {prediction ? (
                        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-green-100 animate-fade-in">
                            <div className="flex items-center mb-6">
                                <CheckCircle className="w-12 h-12 text-green-600 mr-4" />
                                <div>
                                    <h3 className="text-lg text-gray-500 font-medium">{T.PREDICTION_RESULT}</h3>
                                    <p className="text-5xl font-extrabold text-green-800">{prediction}</p>
                                </div>
                            </div>
                            
                            {marketInsights && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-100">
                                    <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                                        <div className="flex items-center mb-2">
                                            <Cloud className="w-5 h-5 text-blue-600 mr-2" />
                                            <p className="text-sm text-blue-800 font-bold">{T.WEATHER_FORECAST}</p>
                                        </div>
                                        <p className="text-gray-800 text-sm leading-relaxed">{marketInsights.weather}</p>
                                    </div>
                                    <div className="p-5 bg-green-50 rounded-xl border border-green-100">
                                         <div className="flex items-center mb-2">
                                            <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                                            <p className="text-sm text-green-800 font-bold">{T.ESTIMATED_PROFIT}</p>
                                        </div>
                                        <p className="text-gray-900 font-bold text-2xl">{marketInsights.profit}</p>
                                    </div>
                                    <div className={`p-5 rounded-xl border ${marketInsights.risk === 'High' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'}`}>
                                         <div className="flex items-center mb-2">
                                            <AlertTriangle className={`w-5 h-5 mr-2 ${marketInsights.risk === 'High' ? 'text-red-600' : 'text-yellow-600'}`} />
                                            <p className={`text-sm font-bold ${marketInsights.risk === 'High' ? 'text-red-800' : 'text-yellow-800'}`}>{T.RISK_LEVEL}</p>
                                        </div>
                                        <p className="text-gray-900 font-bold text-2xl">{marketInsights.risk}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 p-10">
                            <Sprout className="w-20 h-20 mb-6 text-gray-300" />
                            <p className="text-xl font-medium text-gray-500">Enter parameters to get AI suggestions</p>
                            <p className="text-sm text-gray-400 mt-2">We analyze soil, weather, and market data.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CropsView = ({ T, handleViewDetails }) => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/crops`)
            .then(res => res.json())
            .then(data => setCrops(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 max-w-7xl mx-auto flex items-center"><Wheat className="mr-3 text-green-600" /> {T.CROP_CATALOG}</h2>
            {loading ? (
                <div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin w-10 h-10 text-green-600" /></div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {crops.map((crop, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition group">
                             <div className="h-40 overflow-hidden relative">
                                <img src={crop.image} alt={crop.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/CCCCCC/333333?text=Crop"; }} />
                                <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-2 py-1 m-2 rounded">{crop.soil_type || 'General'}</div>
                             </div>
                             <div className="p-5">
                                 <h3 className="text-lg font-bold text-gray-800 mb-1">{crop.name}</h3>
                                 <p className="text-green-600 font-semibold mb-3">{crop.profit}</p>
                                 <button onClick={() => handleViewDetails(crop.name)} className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-green-600 hover:text-white transition font-medium">
                                     {T.VIEW_DETAILS}
                                 </button>
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const AnalyticsView = ({ T }) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/analytics`)
            .then(res => res.json())
            .then(data => setData(data))
            .catch(err => console.error(err));
    }, []);

    if (!data) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-green-600" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 max-w-7xl mx-auto flex items-center"><BarChart className="mr-3 text-blue-600" /> {T.ANALYTICS_OVERVIEW}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold text-gray-700 mb-6">{T.PROFIT_TREND}</h3>
                    <Line data={data.profitTrend} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold text-gray-700 mb-6">{T.CROP_FREQUENCY}</h3>
                    <div className="h-64 flex justify-center">
                        <Doughnut data={data.cropFrequency} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileView = ({ T, userProfile }) => {
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
             <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full">
                <div className="flex items-center space-x-4 mb-8 border-b pb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-3xl font-bold text-green-700">
                        {userProfile?.firstName?.[0] || 'U'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{userProfile?.firstName} {userProfile?.lastName}</h2>
                        <p className="text-gray-500">{userProfile?.email}</p>
                    </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-4">{T.PROFILE_DETAILS}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{T.MOBILE}</p>
                        <p className="font-medium text-gray-800">{userProfile?.mobile || 'Not provided'}</p>
                    </div>
                     <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{T.CITY}</p>
                        <p className="font-medium text-gray-800">{userProfile?.city || 'Not provided'}</p>
                    </div>
                     <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{T.STATE}</p>
                        <p className="font-medium text-gray-800">{userProfile?.state || 'Not provided'}</p>
                    </div>
                     <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{T.COUNTRY}</p>
                        <p className="font-medium text-gray-800">{userProfile?.country || 'Not provided'}</p>
                    </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                    <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Edit Profile</button>
                </div>
             </div>
        </div>
    );
};
const NavLink = ({ children }) => (
  <a href="#" className="text-gray-700 hover:text-green-600 font-medium transition">{children}</a>
);

const LandingPage = ({ T, openAuthModal, toggleLanguage }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="font-sans text-gray-800 bg-white">
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-green-600 p-2 rounded-lg">
                <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className={`text-2xl font-extrabold tracking-tight ${isScrolled ? 'text-green-800' : 'text-green-900'}`}>{T.APP_NAME}</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <NavLink>{T.HOME}</NavLink>
            <NavLink>{T.ABOUT}</NavLink>
            <NavLink>{T.CONTACT}</NavLink>
            <button onClick={toggleLanguage} className="flex items-center text-gray-700 hover:text-green-600 font-medium transition">
                <Globe className="w-4 h-4 mr-1" /> {T.LANG_NAME}
            </button>
            <button onClick={openAuthModal} className="px-5 py-2 bg-green-600 text-white rounded-full font-semibold shadow-lg hover:bg-green-700 hover:shadow-xl transition transform hover:-translate-y-0.5">
              {T.LOGIN} / {T.SIGNUP}
            </button>
          </div>

          <div className="md:hidden flex items-center">
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white absolute top-full left-0 w-full shadow-lg py-4 px-6 flex flex-col space-y-4">
            <a href="#" className="text-gray-800 font-medium">{T.HOME}</a>
            <a href="#" className="text-gray-800 font-medium">{T.ABOUT}</a>
            <a href="#" className="text-gray-800 font-medium">{T.CONTACT}</a>
            <button onClick={toggleLanguage} className="text-left text-gray-800 font-medium flex items-center">
                 <Globe className="w-4 h-4 mr-2" /> {T.LANG_NAME}
            </button>
            <button onClick={openAuthModal} className="w-full py-2 bg-green-600 text-white rounded-lg font-semibold">
              {T.LOGIN}
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
            <img src="https://placehold.co/1920x1080/228B22/FFFFFF?text=Farm+Landscape" alt="Farm" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-6 animate-fade-in-up">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                <span className="text-sm font-medium tracking-wide uppercase">AI-Powered Agriculture</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-lg animate-fade-in-up delay-100">
                {T.SLOGAN}
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-2xl mx-auto font-light animate-fade-in-up delay-200">
                Maximize your yield with data-driven insights. Get real-time crop suggestions, weather forecasts, and market analysis.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-up delay-300">
                <button onClick={openAuthModal} className="px-8 py-4 bg-green-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-green-500 hover:shadow-green-500/30 transition transform hover:-translate-y-1 flex items-center">
                    Get Started Free <ChevronRight className="ml-2 w-5 h-5" />
                </button>
                <button className="px-8 py-4 bg-white text-green-800 rounded-full font-bold text-lg shadow-lg hover:bg-gray-100 transition transform hover:-translate-y-1 flex items-center">
                    Learn More
                </button>
            </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-white/70">
            <ChevronDown className="w-8 h-8" />
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose AgriOptima?</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">We combine advanced technology with agricultural expertise to help you make the best decisions for your farm.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                    { icon: Sprout, title: "Smart Crop Suggestions", desc: "AI analysis of soil and climate to recommend the most profitable crops." },
                    { icon: Cloud, title: "Weather & Market Insights", desc: "Real-time forecasts and market trends to minimize risk." },
                    { icon: BarChart, title: "Yield Analytics", desc: "Track performance and optimize your farming strategy over time." }
                ].map((feature, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-100 group">
                        <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition duration-300">
                            <feature.icon className="w-8 h-8 text-green-600 group-hover:text-white transition duration-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-12">
                <img src="https://placehold.co/600x400/228B22/FFFFFF?text=Farmers+Using+Tablet" alt="About Us" className="rounded-2xl shadow-2xl" />
            </div>
            <div className="md:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{T.ABOUT}</h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">{T.ABOUT_TEXT}</p>
                <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-start">
                        <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1" />
                        <div>
                            <h4 className="font-bold text-gray-900">Data Driven</h4>
                            <p className="text-sm text-gray-500">Backed by extensive agricultural datasets.</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1" />
                        <div>
                            <h4 className="font-bold text-gray-900">Farmer First</h4>
                            <p className="text-sm text-gray-500">Designed with the needs of farmers in mind.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-green-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{T.CONTACT_US}</h2>
            <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">{T.CONTACT_TEXT}</p>
            <button className="px-8 py-3 bg-white text-green-900 rounded-full font-bold hover:bg-green-50 transition">
                {T.SEND}
            </button>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
                <div className="flex items-center space-x-2 mb-4">
                    <Sprout className="w-6 h-6 text-green-500" />
                    <span className="text-xl font-bold text-white">AgriOptima</span>
                </div>
                <p className="text-sm">Empowering farmers with intelligent technology for a sustainable future.</p>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Product</h4>
                <ul className="space-y-2 text-sm">
                    <li><a href="#" className="hover:text-green-500">Features</a></li>
                    <li><a href="#" className="hover:text-green-500">Pricing</a></li>
                    <li><a href="#" className="hover:text-green-500">API</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                    <li><a href="#" className="hover:text-green-500">About</a></li>
                    <li><a href="#" className="hover:text-green-500">Blog</a></li>
                    <li><a href="#" className="hover:text-green-500">Careers</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Connect</h4>
                <div className="flex space-x-4">
                    {/* Social Icons Placeholders */}
                    <div className="w-8 h-8 bg-gray-800 rounded-full hover:bg-green-600 transition"></div>
                    <div className="w-8 h-8 bg-gray-800 rounded-full hover:bg-green-600 transition"></div>
                    <div className="w-8 h-8 bg-gray-800 rounded-full hover:bg-green-600 transition"></div>
                </div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-sm">
            &copy; 2025 AgriOptima. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState('landing');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authType, setAuthType] = useState('login');
  const [selectedCrop, setSelectedCrop] = useState(null);

  const T = translations[currentLang];

  useEffect(() => {
    // Simulate Auth Check
    setTimeout(() => {
        setIsAuthReady(true);
        // Check local storage or session
        const storedUser = localStorage.getItem('agri_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setCurrentPage('dashboard');
        }
    }, 1000);
  }, []);

  const toggleLanguage = () => setCurrentLang(prev => prev === 'en' ? 'hi' : 'en');

  const handleAuthAction = async (data, isSignup) => {
      // Mock Auth
      const userObj = { uid: 'mock-uid', email: data.email };
      setUser(userObj);
      if (isSignup) {
          setUserProfile(data);
          localStorage.setItem('agri_user_profile', JSON.stringify(data));
      }
      localStorage.setItem('agri_user', JSON.stringify(userObj));
      setCurrentPage('dashboard');
      return true;
  };

  const handleLogout = () => {
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem('agri_user');
      localStorage.removeItem('agri_user_profile');
      setCurrentPage('landing');
  };

  const handleViewDetails = (cropName) => {
      setSelectedCrop(cropName);
  };

  const renderContent = () => {
      if (!isAuthReady) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin w-10 h-10 text-green-600" /></div>;

      if (currentPage === 'landing') return <LandingPage T={T} openAuthModal={() => { setIsModalOpen(true); setAuthType('login'); }} toggleLanguage={toggleLanguage} />;
      
      switch (currentPage) {
          case 'dashboard': return <UserDashboard T={T} handleLogout={handleLogout} userId={user?.uid} userProfile={userProfile} setCurrentPage={setCurrentPage} toggleLanguage={toggleLanguage} handleViewDetails={handleViewDetails} />;
          case 'prediction': return <PredictionView T={T} userId={user?.uid} isAuthReady={isAuthReady} setCurrentPage={setCurrentPage} />;
          case 'crops': return <CropsView T={T} handleViewDetails={handleViewDetails} />;
          case 'analytics': return <AnalyticsView T={T} />;
          case 'profile': return <ProfileView T={T} userProfile={userProfile} />;
          default: return <UserDashboard T={T} />;
      }
  };

  return (
      <>
        {renderContent()}
        <AuthModal T={T} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} setAuthType={setAuthType} authType={authType} handleAuthAction={handleAuthAction} />
        {selectedCrop && <CropDetailsModal T={T} cropName={selectedCrop} onClose={() => setSelectedCrop(null)} />}
      </>
  );
};

export default App;