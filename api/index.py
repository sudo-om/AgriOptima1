from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import asyncio
import random

app = FastAPI()

# --- CORS Configuration ---
origins = ["*"]  # Allow all for Vercel/Production simplicity

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Models ---
class PredictionInput(BaseModel):
    temperature: float
    humidity: float
    nLevel: float
    pLevel: float
    kLevel: float
    soilType: str
    rainfall: float
    phLevel: float
    location: Optional[str] = None

class MarketInsightsInput(BaseModel):
    crop_name: str
    location: Optional[str] = None

# --- Mock Data ---
mock_crop_details = {
    "Rice": { "botany": "Oryza sativa. Semi-aquatic grass, staple food. Requires high heat and heavy rain.", "breed": "Basmati, Sona Masuri.", "profit": "₹75,000", "requirements": { "temp": "25-35", "rainfall": "1200-1500", "ph": "5.5-6.5", "n": "60-90", "p": "30-40", "k": "30-40" }, "image": 'https://placehold.co/600x400/228B22/FFFFFF?text=Rice+Paddy' },
    "Wheat": { "botany": "Triticum aestivum. Temperate cereal, needs cool, dry weather.", "breed": "Durum Wheat, Bread Wheat.", "profit": "₹60,000", "requirements": { "temp": "15-25", "rainfall": "500-1000", "ph": "6.0-7.5", "n": "80-120", "p": "40-60", "k": "20-40" }, "image": 'https://placehold.co/600x400/B8860B/FFFFFF?text=Wheat+Crop' },
    "Maize": { "botany": "Zea mays. Tropical cereal, highly adaptable. Requires warm temp and deep soil.", "breed": "Sweet Corn, Dent Corn.", "profit": "₹55,000", "requirements": { "temp": "20-30", "rainfall": "600-900", "ph": "6.0-7.0", "n": "100-150", "p": "50-70", "k": "50-70" }, "image": 'https://placehold.co/600x400/FFD700/000000?text=Maize+Corn' },
    "Jowar (Sorghum)": { "botany": "Sorghum bicolor. Drought-tolerant millet.", "breed": "CSH Series.", "profit": "₹30,000", "requirements": { "temp": "25-35", "rainfall": "300-600", "ph": "6.0-7.5", "n": "50-80", "p": "20-30", "k": "20-30" }, "image": 'https://placehold.co/600x400/8B4513/FFFFFF?text=Jowar+Sorghum' },
    "Bajra (Pearl Millet)": { "botany": "Pennisetum glaucum. Hardy, short-duration millet.", "breed": "Hybrid.", "profit": "₹28,000", "requirements": { "temp": "25-35", "rainfall": "250-500", "ph": "6.0-7.5", "n": "40-60", "p": "20-30", "k": "20-30" }, "image": 'https://placehold.co/600x400/D2B48C/000000?text=Pearl+Millet+Bajra' },
    "Ragi (Finger Millet)": { "botany": "Eleusine coracana. Highly nutritious, resilient millet.", "breed": "Indaf series.", "profit": "₹35,000", "requirements": { "temp": "20-30", "rainfall": "500-1000", "ph": "5.0-6.5", "n": "40-60", "p": "20-30", "k": "20-30" }, "image": 'https://placehold.co/600x400/A9A9A9/FFFFFF?text=Finger+Millet+Ragi' },
    "Gram": { "botany": "Cicer arietinum. Cool season pulse crop.", "breed": "Kabuli, Desi.", "profit": "₹50,000", "requirements": { "temp": "15-25", "rainfall": "400-600", "ph": "6.0-7.5", "n": "20-30", "p": "40-60", "k": "20-30" }, "image": 'https://placehold.co/600x400/BDB76B/000000?text=Chickpea+Gram' },
    "Tur/Arhar": { "botany": "Cajanus cajan. Pigeon pea, long-duration pulse.", "breed": "ICPL-87, Pusa 992.", "profit": "₹65,000", "requirements": { "temp": "25-35", "rainfall": "600-1000", "ph": "6.0-7.5", "n": "20-40", "p": "40-60", "k": "20-40" }, "image": 'https://placehold.co/600x400/F4A460/FFFFFF?text=Pigeon+Pea' },
    "Urad": { "botany": "Vigna mungo. Black gram, requires warm, humid climate.", "breed": "T-9, Pant U-19.", "profit": "₹48,000", "requirements": { "temp": "25-35", "rainfall": "600-900", "ph": "6.0-7.5", "n": "20-30", "p": "40-60", "k": "20-30" }, "image": 'https://placehold.co/600x400/556B2F/FFFFFF?text=Black+Gram+Urad' },
    "Moong": { "botany": "Vigna radiata. Green gram, short-duration summer crop.", "breed": "Pusa Vishal.", "profit": "₹45,000", "requirements": { "temp": "25-35", "rainfall": "600-900", "ph": "6.0-7.5", "n": "20-30", "p": "40-60", "k": "20-30" }, "image": 'https://placehold.co/600x400/3CB371/FFFFFF?text=Green+Gram+Moong' },
    "Masur": { "botany": "Lens culinaris. Lentil, Rabi season pulse.", "breed": "Masoor.", "profit": "₹52,000", "requirements": { "temp": "18-30", "rainfall": "400-600", "ph": "6.0-8.0", "n": "10-20", "p": "40-60", "k": "20-40" }, "image": 'https://placehold.co/600x400/6B8E23/FFFFFF?text=Lentil+Masur' },
    "Sugarcane": { "botany": "Saccharum officinarum. Tall grass for sugar. Needs long, hot season.", "breed": "Co-86032, CoC-671.", "profit": "₹1,20,000", "requirements": { "temp": "20-32", "rainfall": "1000-1500", "ph": "6.0-7.5", "n": "150-250", "p": "50-80", "k": "100-150" }, "image": 'https://placehold.co/600x400/808000/FFFFFF?text=Sugarcane+Stalks' },
    "Cotton": { "botany": "Gossypium spp. Grown for fiber. Needs high temp and moderate rain.", "breed": "Bt Cotton, Hybrid.", "profit": "₹85,000", "requirements": { "temp": "21-30", "rainfall": "500-1000", "ph": "5.5-8.5", "n": "60-120", "p": "30-60", "k": "30-60" }, "image": 'https://placehold.co/600x400/4682B4/FFFFFF?text=Cotton+Bolls' },
    "Jute": { "botany": "Corchorus olitorius. Fibre crop. Needs heavy rainfall and high humidity.", "breed": "JRO-524, JRC-212.", "profit": "₹70,000", "requirements": { "temp": "24-37", "rainfall": "1500-2000", "ph": "6.0-7.5", "n": "50-80", "p": "20-40", "k": "30-60" }, "image": 'https://placehold.co/600x400/D2B48C/000000?text=Jute+Fibre' },
    "Groundnut": { "botany": "Arachis hypogaea. Peanut, oilseed and pulse. Requires sandy soil.", "breed": "ICGS-11, TGV-1.", "profit": "₹90,000", "requirements": { "temp": "21-30", "rainfall": "500-700", "ph": "6.0-7.0", "n": "10-20", "p": "30-50", "k": "30-50" }, "image": 'https://placehold.co/600x400/FFA07A/000000?text=Groundnut+Peanut' },
    "Mustard": { "botany": "Brassica spp. Oilseed, Rabi crop. Requires cool, dry weather.", "breed": "Pusa Jaikisan.", "profit": "₹50,000", "requirements": { "temp": "15-25", "rainfall": "300-500", "ph": "6.0-7.5", "n": "80-120", "p": "40-60", "k": "20-40" }, "image": 'https://placehold.co/600x400/FFD700/000000?text=Mustard+Flower' },
    "Soybean": { "botany": "Glycine max. High-protein legume. Requires rich, well-drained soil.", "breed": "JS 335, Bragg.", "profit": "₹95,000", "requirements": { "temp": "20-30", "rainfall": "600-1000", "ph": "6.0-7.5", "n": "20-40", "p": "60-80", "k": "40-60" }, "image": 'https://placehold.co/600x400/3CB371/FFFFFF?text=Soybean+Pod' },
    "Sunflower": { "botany": "Helianthus annuus. Oilseed. Tolerant of drought and temperature.", "breed": "Hybrid.", "profit": "₹60,000", "requirements": { "temp": "25-30", "rainfall": "500-800", "ph": "6.0-7.5", "n": "60-90", "p": "40-60", "k": "40-60" }, "image": 'https://placehold.co/600x400/FFD700/000000?text=Sunflower+Head' },
    "Sesame": { "botany": "Sesamum indicum. Oilseed. Drought tolerant.", "breed": "T-13.", "profit": "₹45,000", "requirements": { "temp": "25-35", "rainfall": "500-800", "ph": "5.5-7.5", "n": "40-60", "p": "20-30", "k": "20-30" }, "image": 'https://placehold.co/600x400/F0E68C/000000?text=Sesame+Seed' },
    "Tobacco": { "botany": "Nicotiana spp. Commercial leaf crop. Highly specialized.", "breed": "FCV, Natu.", "profit": "₹1,10,000", "requirements": { "temp": "20-30", "rainfall": "500-1000", "ph": "5.0-6.0", "n": "80-120", "p": "40-60", "k": "100-150" }, "image": 'https://placehold.co/600x400/8B0000/FFFFFF?text=Tobacco+Leaf' },
    "Tea": { "botany": "Camellia sinensis. Evergreen shrub. Needs acidic soil and high rainfall.", "breed": "Assam type.", "profit": "₹1,50,000", "requirements": { "temp": "13-28", "rainfall": "1500-2500", "ph": "4.5-5.5", "n": "150-250", "p": "50-80", "k": "100-150" }, "image": 'https://placehold.co/600x400/006400/FFFFFF?text=Tea+Leaves' },
    "Coffee": { "botany": "Coffea spp. Requires specific tropical climate and high altitudes.", "breed": "Arabica, Robusta.", "profit": "₹1,80,000", "requirements": { "temp": "18-24", "rainfall": "1500-2000", "ph": "6.0-6.5", "n": "50-80", "p": "10-20", "k": "50-80" }, "image": 'https://placehold.co/600x400/8B4513/FFFFFF?text=Coffee+Beans' },
    "Rubber": { "botany": "Hevea brasiliensis. Tree crop. Needs high rainfall and humidity.", "breed": "RRII 105.", "profit": "₹2,00,000", "requirements": { "temp": "25-34", "rainfall": "2000-3000", "ph": "4.5-6.0", "n": "50-80", "p": "20-40", "k": "50-80" }, "image": 'https://placehold.co/600x400/3CB371/FFFFFF?text=Rubber+Tapping' },
    "Coconut": { "botany": "Cocos nucifera. Palm tree. Coastal regions, sandy soil.", "breed": "Dwarf, Tall.", "profit": "₹1,30,000", "requirements": { "temp": "25-35", "rainfall": "1000-2500", "ph": "5.5-7.0", "n": "50-100", "p": "30-50", "k": "100-200" }, "image": 'https://placehold.co/600x400/008000/FFFFFF?text=Coconut+Palm' },
    "Mangoes": { "botany": "Mangifera indica. Tropical fruit tree. Requires warm, frost-free climate.", "breed": "Alphonso, Dasheri.", "profit": "₹2,50,000", "requirements": { "temp": "24-30", "rainfall": "800-1200", "ph": "6.0-7.5", "n": "50-100", "p": "20-40", "k": "80-120" }, "image": 'https://placehold.co/600x400/FF8C00/000000?text=Mango+Fruit' },
    "Bananas": { "botany": "Musa spp. Herbaceous plant. Needs high heat and humidity.", "breed": "Cavendish, Robusta.", "profit": "₹1,80,000", "requirements": { "temp": "20-30", "rainfall": "1500-2500", "ph": "6.0-7.5", "n": "150-300", "p": "50-100", "k": "300-500" }, "image": 'https://placehold.co/600x400/FFD700/000000?text=Banana+Bunch' },
    "Citrus fruits": { "botany": "Citrus spp. Includes orange, lemon. Requires moderate climate.", "breed": "Nagpur orange, Lemon.", "profit": "₹1,60,000", "requirements": { "temp": "10-35", "rainfall": "700-1200", "ph": "6.0-7.5", "n": "80-120", "p": "40-60", "k": "80-120" }, "image": 'https://placehold.co/600x400/F4A460/000000?text=Orange+Lemon' },
    "Apples": { "botany": "Malus domestica. Temperate fruit. Requires chilling hours.", "breed": "Fuji, Gala.", "profit": "₹3,00,000", "requirements": { "temp": "15-25", "rainfall": "1000-1500", "ph": "5.5-6.5", "n": "50-80", "p": "20-40", "k": "50-80" }, "image": 'https://placehold.co/600x400/FF0000/FFFFFF?text=Red+Apple' },
    "Grapes": { "botany": "Vitis vinifera. Vine fruit. Requires dry, warm summers.", "breed": "Thompson Seedless.", "profit": "₹2,20,000", "requirements": { "temp": "15-40", "rainfall": "500-900", "ph": "6.0-7.0", "n": "60-100", "p": "30-50", "k": "100-150" }, "image": 'https://placehold.co/600x400/800080/FFFFFF?text=Grape+Vine' },
    "Potatoes": { "botany": "Solanum tuberosum. Tuber crop. Needs cool weather, well-drained soil.", "breed": "Kufri Jyoti.", "profit": "₹70,000", "requirements": { "temp": "15-20", "rainfall": "500-800", "ph": "5.0-6.5", "n": "100-150", "p": "80-100", "k": "120-150" }, "image": 'https://placehold.co/600x400/CD853F/FFFFFF?text=Potato+Tuber' },
    "Onions": { "botany": "Allium cepa. Bulb vegetable. Requires moderate temperature.", "breed": "Pusa Red.", "profit": "₹65,000", "requirements": { "temp": "15-25", "rainfall": "600-900", "ph": "6.0-7.5", "n": "80-120", "p": "40-60", "k": "80-120" }, "image": 'https://placehold.co/600x400/FFFFFF/000000?text=Onion+Bulb' },
    "Tomatoes": { "botany": "Solanum lycopersicum. Fruit vegetable. Wide adaptability.", "breed": "Pusa Ruby.", "profit": "₹75,000", "requirements": { "temp": "20-30", "rainfall": "600-1000", "ph": "6.0-7.0", "n": "100-150", "p": "50-80", "k": "80-120" }, "image": 'https://placehold.co/600x400/FF6347/FFFFFF?text=Tomato+Fruit' },
    "Brinjal (Eggplant)": { "botany": "Solanum melongena. Warm season vegetable.", "breed": "Pusa Purple.", "profit": "₹60,000", "requirements": { "temp": "25-35", "rainfall": "600-1000", "ph": "6.0-7.0", "n": "80-120", "p": "40-60", "k": "60-90" }, "image": 'https://placehold.co/600x400/800080/FFFFFF?text=Brinjal+Eggplant' },
    "Cauliflower": { "botany": "Brassica oleracea. Cool season vegetable.", "breed": "Pusa Snowball.", "profit": "₹55,000", "requirements": { "temp": "15-25", "rainfall": "600-900", "ph": "6.0-7.0", "n": "120-150", "p": "60-80", "k": "80-100" }, "image": 'https://placehold.co/600x400/F5F5DC/000000?text=Cauliflower+Head' },
    "Cabbage": { "botany": "Brassica oleracea. Cool season leafy vegetable.", "breed": "Golden Acre.", "profit": "₹50,000", "requirements": { "temp": "15-25", "rainfall": "600-900", "ph": "6.0-7.0", "n": "120-150", "p": "60-80", "k": "80-100" }, "image": 'https://placehold.co/600x400/D3D3D3/000000?text=Cabbage+Head' },
    "Peas": { "botany": "Pisum sativum. Cool season pulse/vegetable.", "breed": "Arkel.", "profit": "₹40,000", "requirements": { "temp": "10-20", "rainfall": "400-600", "ph": "6.0-7.5", "n": "20-30", "p": "40-60", "k": "20-40" }, "image": 'https://placehold.co/600x400/008000/FFFFFF?text=Peas+Pod' },
    "Black pepper": { "botany": "Piper nigrum. Spice vine. Needs hot, humid tropical climate.", "breed": "Panniyur 1.", "profit": "₹3,50,000", "requirements": { "temp": "20-30", "rainfall": "2000-3000", "ph": "5.5-6.5", "n": "100-150", "p": "50-80", "k": "150-200" }, "image": 'https://placehold.co/600x400/000000/FFFFFF?text=Black+Pepper+Crop' },
    "Cardamom": { "botany": "Elettaria cardamomum. Spice. Needs humid, shaded environment.", "breed": "Njallani.", "profit": "₹4,00,000", "requirements": { "temp": "15-30", "rainfall": "2500-4000", "ph": "5.0-6.5", "n": "100-150", "p": "50-80", "k": "100-150" }, "image": 'https://placehold.co/600x400/8B4513/FFFFFF?text=Cardamom+Pods' },
    "Dry chillies": { "botany": "Capsicum annuum. Spice/vegetable. Needs warm, dry climate.", "breed": "Teja.", "profit": "₹1,00,000", "requirements": { "temp": "20-30", "rainfall": "600-1200", "ph": "6.0-7.0", "n": "80-120", "p": "40-60", "k": "60-90" }, "image": 'https://placehold.co/600x400/FF0000/FFFFFF?text=Red+Chilli' },
    "Turmeric": { "botany": "Curcuma longa. Spice rhizome. Needs warm, humid conditions.", "breed": "Alleppey.", "profit": "₹80,000", "requirements": { "temp": "20-30", "rainfall": "1000-2000", "ph": "6.0-7.5", "n": "60-90", "p": "30-50", "k": "90-120" }, "image": 'https://placehold.co/600x400/FFD700/000000?text=Turmeric+Root' },
    "Ginger": { "botany": "Zingiber officinale. Spice rhizome. Needs warm, humid conditions.", "breed": "Nadia.", "profit": "₹75,000", "requirements": { "temp": "25-35", "rainfall": "1500-3000", "ph": "6.0-7.5", "n": "80-120", "p": "40-60", "k": "100-150" }, "image": 'https://placehold.co/600x400/DAA520/000000?text=Ginger+Root' },
    "Coriander": { "botany": "Coriandrum sativum. Spice/herb. Cool season crop.", "breed": "Rajendra Swati.", "profit": "₹30,000", "requirements": { "temp": "15-25", "rainfall": "300-500", "ph": "6.0-8.0", "n": "40-60", "p": "20-30", "k": "20-30" }, "image": 'https://placehold.co/600x400/3CB371/FFFFFF?text=Coriander+Leaf' },
    "Berseem": { "botany": "Trifolium alexandrinum. Fodder crop. Rabi season.", "breed": "Mescavi.", "profit": "₹25,000", "requirements": { "temp": "15-25", "rainfall": "300-500", "ph": "6.0-7.5", "n": "20-30", "p": "40-60", "k": "20-30" }, "image": 'https://placehold.co/600x400/7CFC00/000000?text=Berseem+Clover' },
    "Oats": { "botany": "Avena sativa. Cereal/Fodder. Cool season crop.", "breed": "Kent.", "profit": "₹35,000", "requirements": { "temp": "10-20", "rainfall": "500-800", "ph": "6.0-7.5", "n": "60-90", "p": "30-50", "k": "30-50" }, "image": 'https://placehold.co/600x400/D2B48C/000000?text=Oats+Stalk' },
    "Sudan grass": { "botany": "Sorghum sudanense. Fodder grass.", "breed": "SSG-59-3.", "profit": "₹20,000", "requirements": { "temp": "25-35", "rainfall": "400-800", "ph": "6.0-7.5", "n": "80-120", "p": "40-60", "k": "40-60" }, "image": 'https://placehold.co/600x400/3CB371/FFFFFF?text=Sudan+Grass' },
    "Napier grass": { "botany": "Pennisetum purpureum. Perennial fodder grass.", "breed": "Hybrid Napier.", "profit": "₹30,000", "requirements": { "temp": "25-35", "rainfall": "1000-2000", "ph": "5.5-7.0", "n": "100-150", "p": "50-80", "k": "80-120" }, "image": 'https://placehold.co/600x400/008000/FFFFFF?text=Napier+Grass' },
    "Lucerne": { "botany": "Medicago sativa. Alfalfa, perennial fodder.", "breed": "Anand-2.", "profit": "₹35,000", "requirements": { "temp": "15-30", "rainfall": "400-800", "ph": "6.5-7.5", "n": "0-20", "p": "50-80", "k": "50-80" }, "image": 'https://placehold.co/600x400/FFA07A/000000?text=Lucerne+Alfalfa' },
    "Castor": { "botany": "Ricinus communis. Non-edible oilseed.", "breed": "GCH-7.", "profit": "₹65,000", "requirements": { "temp": "20-30", "rainfall": "500-800", "ph": "6.0-7.5", "n": "60-90", "p": "30-50", "k": "30-50" }, "image": 'https://placehold.co/600x400/B8860B/FFFFFF?text=Castor+Oilseed' },
    "Linseed": { "botany": "Linum usitatissimum. Flaxseed, oilseed.", "breed": "Neelam.", "profit": "₹50,000", "requirements": { "temp": "15-25", "rainfall": "400-600", "ph": "6.0-7.5", "n": "40-60", "p": "20-30", "k": "20-30" }, "image": 'https://placehold.co/600x400/F0E68C/000000?text=Linseed+Flax' },
    "Safflower": { "botany": "Carthamus tinctorius. Oilseed. Drought tolerant.", "breed": "Bima.", "profit": "₹40,000", "requirements": { "temp": "15-25", "rainfall": "300-500", "ph": "6.0-8.0", "n": "40-60", "p": "20-30", "k": "20-30" }, "image": 'https://placehold.co/600x400/DAA520/000000?text=Safflower+Flower' },
    "Niger seed": { "botany": "Guizotia abyssinica. Oilseed. Hardy crop.", "breed": "RCR-18.", "profit": "₹35,000", "requirements": { "temp": "20-30", "rainfall": "500-1000", "ph": "5.0-7.0", "n": "30-50", "p": "20-30", "k": "20-30" }, "image": 'https://placehold.co/600x400/696969/FFFFFF?text=Niger+Seed' },
    "Rapeseed": { "botany": "Brassica napus. Oilseed.", "breed": "Hybrid.", "profit": "₹55,000", "requirements": { "temp": "15-25", "rainfall": "400-600", "ph": "6.0-7.5", "n": "80-120", "p": "40-60", "k": "20-40" }, "image": 'https://placehold.co/600x400/FFD700/000000?text=Rapeseed+Plant' },
    "Kusum seed": { "botany": "Schleichera oleosa. Minor oilseed.", "breed": "Local.", "profit": "₹25,000", "requirements": { "temp": "25-35", "rainfall": "800-1500", "ph": "6.0-7.5", "n": "30-50", "p": "20-30", "k": "30-50" }, "image": 'https://placehold.co/600x400/A0522D/FFFFFF?text=Kusum+Tree' },
    "Pongam seeds": { "botany": "Millettia pinnata. Minor oilseed.", "breed": "Local.", "profit": "₹30,000", "requirements": { "temp": "25-35", "rainfall": "800-1500", "ph": "6.0-7.5", "n": "30-50", "p": "20-30", "k": "30-50" }, "image": 'https://placehold.co/600x400/BDB76B/000000?text=Pongam+Seeds' },
    "Cowpeas (Lobia)": { "botany": "Vigna unguiculata. Pulse/vegetable. Warm season.", "breed": "Pusa Komal.", "profit": "₹40,000", "requirements": { "temp": "25-35", "rainfall": "500-800", "ph": "6.0-7.5", "n": "20-30", "p": "40-60", "k": "20-30" }, "image": 'https://placehold.co/600x400/3CB371/FFFFFF?text=Cowpeas+Lobia' },
    "Horse gram": { "botany": "Macrotyloma uniflorum. Drought-tolerant pulse.", "breed": "GPM-6.", "profit": "₹35,000", "requirements": { "temp": "25-35", "rainfall": "300-500", "ph": "6.0-7.5", "n": "20-30", "p": "30-50", "k": "20-30" }, "image": 'https://placehold.co/600x400/A0522D/FFFFFF?text=Horse+Gram' },
    "Rajma (Kidney beans)": { "botany": "Phaseolus vulgaris. Pulse. Needs cooler temperature.", "breed": "PDR-14.", "profit": "₹55,000", "requirements": { "temp": "15-25", "rainfall": "600-1000", "ph": "6.0-7.5", "n": "20-40", "p": "40-60", "k": "30-50" }, "image": 'https://placehold.co/600x400/B22222/FFFFFF?text=Rajma+Kidney+Beans' },
    "Moth": { "botany": "Vigna aconitifolia. Moth bean. Drought tolerant pulse.", "breed": "RMO-40.", "profit": "₹30,000", "requirements": { "temp": "30-40", "rainfall": "200-500", "ph": "6.0-8.0", "n": "20-30", "p": "30-50", "k": "20-30" }, "image": 'https://placehold.co/600x400/DAA520/000000?text=Moth+Bean' },
    "Khesari dal": { "botany": "Lathyrus sativus. Grass pea. Resilient pulse.", "breed": "Bio-L-212.", "profit": "₹40,000", "requirements": { "temp": "15-25", "rainfall": "400-600", "ph": "6.0-7.5", "n": "20-30", "p": "40-60", "k": "20-30" }, "image": 'https://placehold.co/600x400/87CEFA/000000?text=Khesari+Dal' },
    "Foxtail millet (Kangni)": { "botany": "Setaria italica. Minor millet.", "breed": "Sia 3085.", "profit": "₹30,000", "requirements": { "temp": "25-35", "rainfall": "400-600", "ph": "5.5-7.0", "n": "30-50", "p": "20-30", "k": "20-30" }, "image": 'https://placehold.co/600x400/F0E68C/000000?text=Foxtail+Millet' },
    "Kodo millet": { "botany": "Paspalum scrobiculatum. Minor millet.", "breed": "JK-48.", "profit": "₹32,000", "requirements": { "temp": "25-35", "rainfall": "500-900", "ph": "5.5-7.0", "n": "30-50", "p": "20-30", "k": "20-30" }, "image": 'https://placehold.co/600x400/DAA520/000000?text=Kodo+Millet' },
    "Little millet": { "botany": "Panicum sumatrense. Minor millet.", "breed": "Olm 203.", "profit": "₹30,000", "requirements": { "temp": "25-35", "rainfall": "500-900", "ph": "5.5-7.0", "n": "30-50", "p": "20-30", "k": "20-30" }, "image": 'https://placehold.co/600x400/8B4513/FFFFFF?text=Little+Millet' },
    "Barnyard millet": { "botany": "Echinochloa frumentacea. Minor millet.", "breed": "VL 172.", "profit": "₹28,000", "requirements": { "temp": "25-35", "rainfall": "400-800", "ph": "5.5-7.0", "n": "30-50", "p": "20-30", "k": "20-30" }, "image": 'https://placehold.co/600x400/A0522D/FFFFFF?text=Barnyard+Millet' },
    "Buckwheat": { "botany": "Fagopyrum esculentum. Pseudo-cereal.", "breed": "Sweet Buckwheat.", "profit": "₹45,000", "requirements": { "temp": "15-25", "rainfall": "500-800", "ph": "5.0-6.5", "n": "20-40", "p": "30-50", "k": "30-50" }, "image": 'https://placehold.co/600x400/BDB76B/000000?text=Buckwheat' },
    "Amaranth seed": { "botany": "Amaranthus spp. Pseudo-cereal.", "breed": "Annapurna.", "profit": "₹40,000", "requirements": { "temp": "20-30", "rainfall": "600-1000", "ph": "6.0-7.5", "n": "40-60", "p": "20-40", "k": "30-50" }, "image": 'https://placehold.co/600x400/FFD700/000000?text=Amaranth+Seed' },
    "Cucumber": { "botany": "Cucumis sativus. Vine vegetable.", "breed": "Pusa Sanyog.", "profit": "₹50,000", "requirements": { "temp": "20-30", "rainfall": "600-1000", "ph": "6.0-7.0", "n": "80-120", "p": "40-60", "k": "60-90" }, "image": 'https://placehold.co/600x400/90EE90/000000?text=Cucumber' },
    "Bitter gourd": { "botany": "Momordica charantia. Vine vegetable.", "breed": "Pusa Do Mausami.", "profit": "₹45,000", "requirements": { "temp": "25-35", "rainfall": "600-1000", "ph": "6.0-7.0", "n": "80-120", "p": "40-60", "k": "60-90" }, "image": 'https://placehold.co/600x400/3CB371/FFFFFF?text=Bitter+Gourd' },
    "Muskmelon": { "botany": "Cucumis melo. Fruit.", "breed": "Pusa Rasraj.", "profit": "₹70,000", "requirements": { "temp": "25-35", "rainfall": "500-800", "ph": "6.0-7.0", "n": "80-120", "p": "40-60", "k": "60-90" }, "image": 'https://placehold.co/600x400/FFA07A/000000?text=Muskmelon' },
    "Watermelon": { "botany": "Citrullus lanatus. Fruit. Needs warm weather.", "breed": "Sugar Baby.", "profit": "₹80,000", "requirements": { "temp": "25-35", "rainfall": "500-800", "ph": "6.0-7.0", "n": "80-120", "p": "40-60", "k": "60-90" }, "image": 'https://placehold.co/600x400/B22222/FFFFFF?text=Watermelon' },
    "Pumpkin": { "botany": "Cucurbita moschata. Vegetable/fruit.", "breed": "Arka Suryamukhi.", "profit": "₹60,000", "requirements": { "temp": "20-30", "rainfall": "600-1000", "ph": "6.0-7.0", "n": "80-120", "p": "40-60", "k": "60-90" }, "image": 'https://placehold.co/600x400/FF8C00/000000?text=Pumpkin' },
    "Garlic": { "botany": "Allium sativum. Spice/vegetable. Cool season.", "breed": "Yamuna Safed.", "profit": "₹90,000", "requirements": { "temp": "10-25", "rainfall": "500-800", "ph": "6.0-7.5", "n": "80-120", "p": "40-60", "k": "80-120" }, "image": 'https://placehold.co/600x400/FFFFFF/000000?text=Garlic' },
    "Carrots": { "botany": "Daucus carota. Root vegetable. Cool season.", "breed": "Pusa Kesar.", "profit": "₹55,000", "requirements": { "temp": "15-20", "rainfall": "500-800", "ph": "6.0-7.0", "n": "80-120", "p": "40-60", "k": "60-90" }, "image": 'https://placehold.co/600x400/FF8C00/000000?text=Carrots' },
    "Spinach": { "botany": "Spinacia oleracea. Leafy vegetable. Cool season.", "breed": "Pusa Jyoti.", "profit": "₹35,000", "requirements": { "temp": "15-25", "rainfall": "400-600", "ph": "6.0-7.5", "n": "80-120", "p": "40-60", "k": "40-60" }, "image": 'https://placehold.co/600x400/008000/FFFFFF?text=Spinach' },
    "Lady's finger (Okra/Bhindi)": { "botany": "Abelmoschus esculentus. Warm season vegetable.", "breed": "Pusa A-4.", "profit": "₹65,000", "requirements": { "temp": "25-35", "rainfall": "600-1000", "ph": "6.0-7.0", "n": "80-120", "p": "40-60", "k": "60-90" }, "image": 'https://placehold.co/600x400/3CB371/FFFFFF?text=Okra+Bhindi' },
    "Apricot": { "botany": "Prunus armeniaca. Temperate fruit.", "breed": "Kaisha.", "profit": "₹2,00,000", "requirements": { "temp": "15-30", "rainfall": "800-1200", "ph": "6.0-7.0", "n": "50-80", "p": "20-40", "k": "50-80" }, "image": 'https://placehold.co/600x400/FF8C00/000000?text=Apricot+Fruit' },
    "Peach": { "botany": "Prunus persica. Temperate fruit.", "breed": "Flordasun.", "profit": "₹2,10,000", "requirements": { "temp": "15-30", "rainfall": "800-1200", "ph": "6.0-7.0", "n": "50-80", "p": "20-40", "k": "50-80" }, "image": 'https://placehold.co/600x400/FFA07A/000000?text=Peach+Fruit' },
    "Pear": { "botany": "Pyrus spp. Temperate fruit.", "breed": "Patharnakh.", "profit": "₹1,90,000", "requirements": { "temp": "15-25", "rainfall": "800-1200", "ph": "6.0-7.0", "n": "50-80", "p": "20-40", "k": "50-80" }, "image": 'https://placehold.co/600x400/D3D3D3/000000?text=Pear+Fruit' },
    "Plum": { "botany": "Prunus domestica. Temperate fruit.", "breed": "Satsuma.", "profit": "₹1,70,000", "requirements": { "temp": "15-30", "rainfall": "800-1200", "ph": "6.0-7.0", "n": "50-80", "p": "20-40", "k": "50-80" }, "image": 'https://placehold.co/600x400/800080/FFFFFF?text=Plum+Fruit' },
    "Pineapple": { "botany": "Ananas comosus. Tropical fruit.", "breed": "Kew.", "profit": "₹1,50,000", "requirements": { "temp": "22-32", "rainfall": "1000-1500", "ph": "5.5-6.5", "n": "80-120", "p": "40-60", "k": "80-120" }, "image": 'https://placehold.co/600x400/FFD700/000000?text=Pineapple+Fruit' },
    "Guava": { "botany": "Psidium guajava. Tropical fruit.", "breed": "Allahabad Safeda.", "profit": "₹1,60,000", "requirements": { "temp": "20-30", "rainfall": "800-1500", "ph": "6.0-7.0", "n": "50-100", "p": "30-50", "k": "50-100" }, "image": 'https://placehold.co/600x400/BDB76B/000000?text=Guava+Fruit' },
    "Papaya": { "botany": "Carica papaya. Tropical fruit.", "breed": "Pusa Delicious.", "profit": "₹1,20,000", "requirements": { "temp": "25-35", "rainfall": "600-1000", "ph": "6.0-7.0", "n": "100-150", "p": "50-80", "k": "100-150" }, "image": 'https://placehold.co/600x400/FFA07A/000000?text=Papaya+Fruit' },
    "Litchi": { "botany": "Litchi chinensis. Tropical fruit.", "breed": "Shahi.", "profit": "₹2,30,000", "requirements": { "temp": "25-35", "rainfall": "1000-1500", "ph": "5.5-7.0", "n": "80-120", "p": "40-60", "k": "80-120" }, "image": 'https://placehold.co/600x400/FF6347/FFFFFF?text=Litchi+Fruit' },
    "Cumin": { "botany": "Cuminum cyminum. Spice. Cool, dry weather.", "breed": "RZ-19.", "profit": "₹80,000", "requirements": { "temp": "15-25", "rainfall": "300-500", "ph": "6.0-7.5", "n": "30-50", "p": "20-30", "k": "20-30" }, "image": 'https://placehold.co/600x400/D2B48C/000000?text=Cumin+Seed' },
    "Fennel seed": { "botany": "Foeniculum vulgare. Spice. Cool season.", "breed": "Gujarat Fennel-1.", "profit": "₹70,000", "requirements": { "temp": "15-25", "rainfall": "400-600", "ph": "6.0-7.5", "n": "40-60", "p": "20-30", "k": "20-30" }, "image": 'https://placehold.co/600x400/F0E68C/000000?text=Fennel+Seed' },
    "Fenugreek seed": { "botany": "Trigonella foenum-graecum. Spice/herb. Cool season.", "breed": "RMT-143.", "profit": "₹65,000", "requirements": { "temp": "15-25", "rainfall": "300-500", "ph": "6.0-7.5", "n": "30-50", "p": "20-30", "k": "20-30" }, "image": 'https://placehold.co/600x400/FFA07A/000000?text=Fenugreek+Seed' },
    "Cloves": { "botany": "Syzygium aromaticum. Spice tree. Needs tropical, high humidity.", "breed": "Local.", "profit": "₹4,50,000", "requirements": { "temp": "20-30", "rainfall": "1500-2500", "ph": "6.0-7.0", "n": "100-150", "p": "50-80", "k": "150-200" }, "image": 'https://placehold.co/600x400/8B4513/FFFFFF?text=Cloves' },
    "Tulsi (Holy Basil)": { "botany": "Ocimum tenuiflorum. Medicinal herb.", "breed": "Rama Tulsi.", "profit": "₹40,000", "requirements": { "temp": "20-30", "rainfall": "500-1000", "ph": "6.0-7.5", "n": "30-50", "p": "20-30", "k": "20-30" }, "image": 'https://placehold.co/600x400/3CB371/FFFFFF?text=Tulsi+Basil' },
    "Aloe Vera": { "botany": "Aloe barbadensis miller. Medicinal plant. Drought tolerant.", "breed": "Local.", "profit": "₹50,000", "requirements": { "temp": "20-30", "rainfall": "300-500", "ph": "6.0-8.0", "n": "20-40", "p": "20-30", "k": "20-30" }, "image": 'https://placehold.co/600x400/90EE90/000000?text=Aloe+Vera' },
    "Mentha": { "botany": "Mentha spp. Mint oil. Water intensive.", "breed": "Mentha arvensis.", "profit": "₹60,000", "requirements": { "temp": "20-30", "rainfall": "800-1200", "ph": "6.0-7.5", "n": "80-120", "p": "40-60", "k": "60-90" }, "image": 'https://placehold.co/600x400/008000/FFFFFF?text=Mentha+Mint' },
    "Chandan (Sandalwood)": { "botany": "Santalum album. Tree crop. Highly valuable.", "breed": "Local.", "profit": "₹5,00,000", "requirements": { "temp": "15-35", "rainfall": "600-1500", "ph": "6.5-7.5", "n": "10-20", "p": "10-20", "k": "10-20" }, "image": 'https://placehold.co/600x400/B8860B/FFFFFF?text=Sandalwood+Chandan' },
    "Saffron": { "botany": "Crocus sativus. Spice. Needs extreme cold and specific soil.", "breed": "Kashmir.", "profit": "₹10,00,000", "requirements": { "temp": "5-20", "rainfall": "300-500", "ph": "6.0-8.0", "n": "20-30", "p": "40-60", "k": "40-60" }, "image": 'https://placehold.co/600x400/800080/FFFFFF?text=Saffron+Flower', "soil_type": "Loam" },
}

mock_analytics_data = {
    "profitTrend": {
        "labels": ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        "datasets": [{
            "label": 'Profit Trend (₹)',
            "data": [15000, 18000, 17500, 22000, 25000, 28000],
            "borderColor": '#10B981',
            "tension": 0.4,
            "pointBackgroundColor": '#059669',
        }],
    },
    "cropFrequency": {
        "labels": ['Rice', 'Wheat', 'Maize', 'Lentil'],
        "datasets": [{
            "label": 'Crop Frequency',
            "data": [10, 8, 4, 2],
            "backgroundColor": ['#059669', '#F59E0B', '#FCD34D', '#10B981'],
            "hoverOffset": 4,
        }]
    }
}

mock_user_profile = {
    "firstName": "Saloni",
    "lastName": "Patil",
    "email": "saloni@agrioptima.com",
    "mobile": "+91 98765 43210",
    "city": "Pune",
    "state": "Maharashtra",
    "country": "India"
}

class ProfileUpdate(BaseModel):
    firstName: str
    lastName: str
    email: str
    mobile: str
    city: str
    state: str
    country: str


# --- Router Definition ---
router = APIRouter()

@router.post("/predict")
async def predict_crop(data: PredictionInput):
    rainfall = data.rainfall
    temperature = data.temperature
    phLevel = data.phLevel
    nLevel = data.nLevel
    pLevel = data.pLevel
    kLevel = data.kLevel
    soilType = data.soilType

    if rainfall > 2000 and temperature > 25 and phLevel < 6.5: return {"suggested_crop": "Black pepper"}
    if rainfall > 2500 and temperature > 20 and phLevel < 5.5: return {"suggested_crop": "Tea"}
    if rainfall > 1000 and temperature > 20 and nLevel > 150: return {"suggested_crop": "Bananas"}
    if rainfall < 600 and temperature < 20 and phLevel > 7.5: return {"suggested_crop": "Saffron"}
    
    if soilType == 'Clay' and temperature > 25 and data.humidity > 60 and nLevel > 60: return {"suggested_crop": "Rice"}
    if soilType == 'Loam' and temperature < 20 and nLevel > 80: return {"suggested_crop": "Wheat"}
    if soilType == 'Silt' and temperature > 20 and pLevel > 50: return {"suggested_crop": "Maize"}
    if temperature < 25 and nLevel > 60 and phLevel > 6.0: return {"suggested_crop": "Barley"}
    
    if nLevel < 40 and pLevel > 40 and temperature < 30: return {"suggested_crop": "Gram"}
    if nLevel < 30 and temperature > 25 and rainfall < 800: return {"suggested_crop": "Moth"}
    if nLevel < 30 and temperature > 25 and soilType == 'Loam': return {"suggested_crop": "Soybean"}
    
    if temperature < 20 and kLevel > 100: return {"suggested_crop": "Potatoes"}
    if temperature < 25 and kLevel > 80 and phLevel > 6.0: return {"suggested_crop": "Onions"}
    if temperature > 20 and temperature < 30 and nLevel > 100: return {"suggested_crop": "Tomatoes"}

    if rainfall < 500 and temperature > 30: return {"suggested_crop": "Jowar (Sorghum)"}
    if rainfall < 400 and temperature > 30: return {"suggested_crop": "Bajra (Pearl Millet)"}

    return {"suggested_crop": "Maize"}

@router.get("/market-insights")
async def get_market_insights(crop_name: str, location: Optional[str] = "Current Area"):
    await asyncio.sleep(1.5) 
    weather_summary = f"Forecast for {location}: Next 7 days expect avg high of 28°C and 60% humidity. Light rainfall expected on Day 3."
    details = mock_crop_details.get(crop_name, mock_crop_details['Rice'])
    profit = details['profit']
    risk = "Low"
    if '3,50,000' in profit or '10,00,000' in profit:
        risk = "High"
    elif '2,00,000' in profit:
        risk = "Medium"
    return {
        "weather": weather_summary,
        "profit": profit,
        "risk": risk
    }

@router.get("/crops")
async def get_all_crops():
    crops_list = []
    for name, details in mock_crop_details.items():
        crop_item = details.copy()
        crop_item['name'] = name
        if 'soil_type' not in crop_item:
             crop_item['soil_type'] = random.choice(["Clay", "Loam", "Silt", "Sandy", "Red", "Peat"])
        crops_list.append(crop_item)
    return crops_list

@router.get("/crops/{crop_name}")
async def get_crop_details(crop_name: str):
    crop = mock_crop_details.get(crop_name)
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return crop

@router.get("/analytics")
async def get_analytics():
    return mock_analytics_data

@router.get("/profile")
async def get_profile():
    return mock_user_profile

@router.put("/profile")
async def update_profile(profile: ProfileUpdate):
    global mock_user_profile
    mock_user_profile.update(profile.dict())
    return mock_user_profile

# --- Register Router ---
# Include without prefix for local development (http://localhost:8000/predict)
app.include_router(router)

# Include WITH prefix for Vercel/Production if rewrite keeps path (http://.../api/predict)
app.include_router(router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

@router.get("/debug")
def debug_endpoint():
    return {"status": "ok", "message": "Backend is reachable"}

@app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def catch_all(path_name: str):
    return {"status": "debug_catch_all", "path_seen": path_name, "message": "Route not found in router but caught here."}
