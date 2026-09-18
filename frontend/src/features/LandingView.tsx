import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ShieldCheck, TrendingUp, Users, CheckCircle2, 
  Award, Zap, Sparkles, Search, CloudSun, 
  HeartHandshake, Sprout, Check, MapPin, Calendar, 
  Smartphone, Globe, Sun, CloudRain, Wind, Droplets, 
  HelpCircle, ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';
import { t, AVAILABLE_LANGUAGES } from '../utils/i18n';
import { fadeUp, fadeIn, scaleIn, staggerContainer, cardHover, buttonPress } from '../utils/animations';
import { CROPS_CATALOG, CropItem } from '../data/crops';
import { CropDetailModal } from '../components/CropDetailModal';
import { CropImage } from '../components/CropImage';
import { getCropImage } from '../services/imageService';

export const LandingView: React.FC<{ onStartSelling: () => void }> = ({ onStartSelling }) => {
  const { language, setCurrentTab, setSelectedCrop } = useApp();
  const { user } = useAuth();

  // Marketplace states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Cereals' | 'Pulses' | 'Oilseeds' | 'Vegetables' | 'Fruits' | 'Cash Crops' | 'Spices'>('All');
  const [selectedCropItem, setSelectedCropItem] = useState<CropItem | null>(null);

  // Weather widget state
  const [weatherRegion, setWeatherRegion] = useState<'kanpur' | 'nashik' | 'pune'>('kanpur');

  // Multi-lingual UI swapper demo state
  const [demoLang, setDemoLang] = useState<Language>('EN');

  const demoCardData: Record<Language, {
    status: string;
    farmerLot: string;
    totalQty: string;
    expectedPrice: string;
    harvestDate: string;
    qualityGrade: string;
    matched: string;
  }> = {
    EN: {
      status: 'LOT STATUS: ACTIVE',
      farmerLot: 'Ramesh Verma • Tomato Lot',
      totalQty: 'Total Quantity',
      expectedPrice: 'Expected Price',
      harvestDate: 'Harvest Date',
      qualityGrade: 'Quality Grade',
      matched: 'Matched with FreshHarvest Foods at ₹33/kg (+₹2,240 net margin)'
    },
    HI: {
      status: 'लॉट स्थिति: सक्रिय',
      farmerLot: 'रमेश वर्मा • टमाटर लॉट',
      totalQty: 'कुल मात्रा',
      expectedPrice: 'अपेक्षित मूल्य',
      harvestDate: 'फसल की तारीख',
      qualityGrade: 'गुणवत्ता ग्रेड',
      matched: '₹33/किलो पर फ्रेशहार्वेस्ट फूड्स के साथ मिलान किया गया (+₹2,240 शुद्ध लाभ)'
    },
    MR: {
      status: 'लॉट स्थिती: सक्रिय',
      farmerLot: 'रमेश वर्मा • टोमॅटो लॉट',
      totalQty: 'एकूण प्रमाण',
      expectedPrice: 'अपेक्षित किंमत',
      harvestDate: 'कापणी तारीख',
      qualityGrade: 'गुणवत्ता श्रेणी',
      matched: '₹33/किलो दराने फ्रेशहार्वेस्ट फूड्ससोबत व्यवहार जुळला (+₹2,240 निव्वळ नफा)'
    },
    PA: {
      status: 'ਲਾਟ ਸਥਿਤੀ: ਸਰਗਰਮ',
      farmerLot: 'ਰਮੇਸ਼ ਵਰਮਾ • ਟਮਾਟਰ ਲਾਟ',
      totalQty: 'ਕੁੱਲ ਮਾਤਰਾ',
      expectedPrice: 'ਉਮੀਦ ਕੀਤੀ ਕੀਮਤ',
      harvestDate: 'ਵਾਢੀ ਦੀ ਮਿਤੀ',
      qualityGrade: 'ਗੁਣਵੱਤਾ ਗ੍ਰੇਡ',
      matched: '₹33/ਕਿਲੋ ਦਰ ਤੇ ਫਰੈੱਸ਼ ਹਾਰਵੈਸਟ ਫੂਡਜ਼ ਨਾਲ ਸੌਦਾ ਤੈਅ (+₹2,240 ਸ਼ੁੱਧ ਮੁਨਾਫ਼ਾ)'
    },
    TE: {
      status: 'లాట్ స్థితి: సక్రియం',
      farmerLot: 'రమేష్ వర్మ • టమోటా లాట్',
      totalQty: 'మొత్తం పరిమాణం',
      expectedPrice: 'ఆశించిన ధర',
      harvestDate: 'కోత తేదీ',
      qualityGrade: 'నాణ్యత గ్రేడ్',
      matched: '₹33/కిలో వద్ద ఫ్రెష్‌హార్వెస్ట్ ఫుడ్స్‌తో ఖరారు అయింది (+₹2,240 నికర లాభం)'
    },
    TA: {
      status: 'லாட் நிலை: செயலில்',
      farmerLot: 'ரமேஷ் வர்மா • தக்காளி லாட்',
      totalQty: 'மொத்த அளவு',
      expectedPrice: 'எதிர்பார்க்கப்படும் விலை',
      harvestDate: 'அறுவடை தேதி',
      qualityGrade: 'தர வகை',
      matched: '₹33/கிலோ விலையில் ஃப்ரெஷ்ஹார்வெஸ்ட் ஃபுட்ஸ் நிறுவனத்துடன் இணைக்கப்பட்டது (+₹2,240 நிகர லாபம்)'
    },
    GU: {
      status: 'લોટ સ્થિતિ: સક્રિય',
      farmerLot: 'રમેશ વર્મા • ટામેટા લોટ',
      totalQty: 'કુલ જથ્થો',
      expectedPrice: 'અપેક્ષિત ભાવ',
      harvestDate: 'લણણી તારીખ',
      qualityGrade: 'ગુણવત્તા ગ્રેડ',
      matched: '₹33/કિલોના ભાવે ફ્રેશહાર્વેસ્ટ ફૂડ્સ સાથે મેળ મળ્યો (+₹2,240 ચોખ્ખો નફો)'
    },
    KN: {
      status: 'ಲಾಟ್ ಸ್ಥಿತಿ: ಸಕ್ರಿಯ',
      farmerLot: 'ರಮೇಶ್ ವರ್ಮಾ • ಟೊಮೆಟೊ ಲಾಟ್',
      totalQty: 'ಒಟ್ಟು ಪ್ರಮಾಣ',
      expectedPrice: 'ನಿರೀಕ್ಷಿತ ಬೆಲೆ',
      harvestDate: 'ಕೊಯ್ಲು ದಿನಾಂಕ',
      qualityGrade: 'ಗುಣಮಟ್ಟ ಗ್ರೇಡ್',
      matched: '₹33/ಕೆಜಿ ದರದಲ್ಲಿ ಫ್ರೆಶ್‌ಹಾರ್ವೆಸ್ಟ್ ಫುಡ್ಸ್ ಜೊತೆ ಹೊಂದಾಣಿಕೆಯಾಗಿದೆ (+₹2,240 ನಿವ್ವಳ ಲಾಭ)'
    },
    BN: {
      status: 'লট স্থিতি: সক্রিয়',
      farmerLot: 'রমেশ বর্মা • টমেটো লট',
      totalQty: 'মোট পরিমাণ',
      expectedPrice: 'প্রত্যাশিত মূল্য',
      harvestDate: 'ফসল কাটার তারিখ',
      qualityGrade: 'গুণমান গ্রেড',
      matched: '₹৩৩/কেজি দরে ফ্রেশহার্ভেস্ট ফুডস-এর সাথে সফল চুক্তি (+₹২,২৪০ নিট লাভ)'
    }
  };



  const categories: ('All' | 'Cereals' | 'Pulses' | 'Oilseeds' | 'Vegetables' | 'Fruits' | 'Cash Crops' | 'Spices')[] = [
    'All', 'Cereals', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits', 'Cash Crops', 'Spices'
  ];

  const filteredCrops = CROPS_CATALOG.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          crop.hindiName.includes(searchQuery) ||
                          crop.marathiName.includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || crop.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const weatherData = {
    kanpur: {
      temp: '28°C',
      condition: 'Partly Cloudy',
      humidity: '72%',
      rainProb: '30%',
      wind: '12 km/h',
      advisory: "Ideal humidity for tomato harvesting. Complete picking before evening to avoid overnight moisture accumulation."
    },
    nashik: {
      temp: '23°C',
      condition: 'Moderate Showers',
      humidity: '88%',
      rainProb: '80%',
      wind: '18 km/h',
      advisory: "Heavy rain forecast. Postpone chemical spray application on onion fields. Clear field drainage channels immediately."
    },
    pune: {
      temp: '26°C',
      condition: 'Clear Sunny Sky',
      humidity: '58%',
      rainProb: '10%',
      wind: '9 km/h',
      advisory: "Dry weather spells ahead. Apply light crop irrigation to sugarcane lots. Keep crop covers ready for soil moisture retention."
    }
  };

  const handleAskAI = (question: string) => {
    window.dispatchEvent(new CustomEvent('kisanlink-open-ai-assistant', {
      detail: { query: question }
    }));
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0.08, 0.05)}
      className="space-y-24 pb-20 text-charcoal bg-cream-light"
    >
      
      {/* 1. HERO SECTION */}
      <section id="hero" className="relative rounded-[2.5rem] overflow-hidden bg-forest text-white border border-forest-light shadow-2xl mt-4">
        {/* Subtle pattern background */}
        <div className="absolute inset-0 z-0 opacity-15 bg-[radial-gradient(#238B57_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* HERO LEFT - Headline & Call to Actions */}
          <motion.div variants={fadeUp} className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-agriGreen-accent text-xs font-bold backdrop-blur-md">
              <Zap className="w-4 h-4 text-amberGold" />
              <span>Intelligent Market Integration for Indian Farmers</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Connecting India’s<br />
              Farmers to <span className="text-agriGreen-accent">Better Markets.</span>
            </h1>

            <p className="text-base sm:text-lg text-cream/90 leading-relaxed max-w-xl font-medium">
              AgriLink brings farmers, buyers, Mandi benchmarks, and smart weather advisory together into one simple premium experience. Discover higher net realization for your hard work.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <motion.button
                variants={buttonPress}
                whileTap="tap"
                onClick={onStartSelling}
                className="w-full sm:w-auto px-8 py-4.5 bg-agriGreen hover:bg-agriGreen-hover text-white font-extrabold text-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 border border-agriGreen-accent/20"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                variants={buttonPress}
                whileTap="tap"
                onClick={() => setCurrentTab('agrios')}
                className="w-full sm:w-auto px-6 py-4.5 bg-gradient-to-r from-forest-light to-forest text-freshGreen font-black text-sm rounded-2xl backdrop-blur border border-freshGreen/40 hover:border-freshGreen transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-freshGreen animate-ping" />
                Launch AgriOS Core
              </motion.button>
            </div>

            <div className="pt-6 border-t border-white/10 text-xs text-cream/70 font-semibold flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-agriGreen-accent" /> Built for India's Farmers</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-agriGreen-accent" /> Simple & Localized</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-agriGreen-accent" /> 100% Transparent</span>
            </div>
          </motion.div>

          {/* HERO RIGHT - Image & Floating Cards */}
          <motion.div variants={scaleIn} className="lg:col-span-5 relative w-full flex items-center justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md h-96 sm:h-[450px] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/15">
              <img
                src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=800"
                alt="Indian Farmer in Field"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/50 via-transparent to-transparent" />
            </div>

            {/* FLOATING CARD 1: Tomato Price */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 bg-white text-charcoal px-4 py-3 rounded-2xl border border-agriBorder shadow-card text-left space-y-1 w-44"
            >
              <div className="flex items-center gap-1.5 text-agriGreen">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">Mandi Spike</span>
              </div>
              <p className="text-lg font-black text-charcoal">₹2,450 <span className="text-xs font-normal text-charcoal-muted">/ q</span></p>
              <p className="text-[10px] text-charcoal-muted font-bold">Wheat • Kanpur APMC</p>
            </motion.div>

            {/* FLOATING CARD 2: Net Realization */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-6 -right-4 bg-charcoal text-white p-4.5 rounded-2xl border border-white/10 shadow-card text-left w-56 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-amberGold tracking-wider bg-white/15 px-2 py-0.5 rounded">
                  Best Buyer Offer
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amberGold" />
              </div>
              <div className="flex justify-between items-baseline">
                <h4 className="text-xl font-black">₹33.00/kg</h4>
                <span className="text-[9px] text-white/60">Tomato (Grade A)</span>
              </div>
              <div className="border-t border-white/10 pt-1.5 text-[10px] text-freshGreen font-bold flex justify-between">
                <span>Direct optimization</span>
                <span className="text-amberGold">+₹2.80/kg net</span>
              </div>
            </motion.div>

            {/* FLOATING CARD 3: Trust Indicator */}
            <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 bg-agriGreen text-white px-3 py-2 rounded-xl shadow-md border border-agriGreen-accent/30 text-xs font-extrabold hidden md:block">
              12,480+ Farmers
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. WHY AGRILINK SECTION */}
      <section id="why-agrilink" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-forest bg-agriGreen-light px-3.5 py-1.5 rounded-full">
            The Digital Farming Advantage
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-charcoal">
            Everything a farmer needs. In one place.
          </h2>
          <p className="text-sm sm:text-base text-charcoal-muted leading-relaxed">
            We bypass middlemen, compile price trends from thousands of sources, and bring verified institutional buyers directly to your farm gate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Direct Marketplace",
              desc: "Farmers list crop lots directly. Verified institutional buyers discover, negotiate, and purchase without middle brokers.",
              icon: <HeartHandshake className="w-6 h-6 text-agriGreen" />
            },
            {
              title: "Live Market Prices",
              desc: "Aggregated, real-time modal benchmarks across prominent APMC mandis to guide pricing expectations.",
              icon: <TrendingUp className="w-6 h-6 text-agriGreen" />
            },
            {
              title: "Weather Intelligence",
              desc: "Precise local micro-weather indexes combined with targeted farming advisory prompts on sowing and protection.",
              icon: <CloudSun className="w-6 h-6 text-agriGreen" />
            },
            {
              title: "Crop Catalog",
              desc: "A rich catalog detailing optimal agronomic properties, disease prevention guide, and moisture storage rules.",
              icon: <Sprout className="w-6 h-6 text-agriGreen" />
            },
            {
              title: "Smart Farming AI",
              desc: "Advanced AI calculation scores evaluating transportation routes, regional pricing spikes, and net profits.",
              icon: <Award className="w-6 h-6 text-agriGreen" />
            },
            {
              title: "FPO Community Aggregation",
              desc: "Empower local Farmer Producer Organizations to pool harvest quantities and lock wholesale buyer contracts.",
              icon: <Users className="w-6 h-6 text-agriGreen" />
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              whileHover={{ y: -6, boxShadow: "0 12px 30px -4px rgba(18, 60, 42, 0.1)" }}
              className="bg-white rounded-3xl p-6 border border-agriBorder shadow-card text-left space-y-4 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center border border-agriBorder">
                {item.icon}
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-charcoal">{item.title}</h3>
                <p className="text-xs text-charcoal-muted leading-relaxed font-medium">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. FARMER-FIRST SECTION (Regional Swapper Mock) */}
      <section id="farmer-first" className="bg-white border-y border-agriBorder py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT: Translation Interface Mockup */}
          <div className="lg:col-span-6 space-y-6">
            <div className="text-left space-y-3">
              <span className="text-xs font-bold text-forest uppercase bg-agriGreen-light px-3 py-1 rounded">
                Multi-lingual Simulation UI
              </span>
              <h2 className="text-3xl font-black text-charcoal">
                Technology that speaks the farmer’s language.
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed font-medium">
                Try switching languages on the mock interface below to see how KisanLink automatically translates intricate billing and crop publishing operations into Hindi, Marathi, and English.
              </p>
            </div>

            {/* SWITCHER CONTROLS (All 9 Regional Languages) */}
            <div className="flex flex-wrap gap-1.5 p-1.5 bg-cream rounded-2xl border border-agriBorder self-start">
              {AVAILABLE_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setDemoLang(lang.code)}
                  className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all ${
                    demoLang === lang.code 
                      ? 'bg-forest text-white shadow-md' 
                      : 'text-charcoal-muted hover:text-charcoal bg-white/60'
                  }`}
                >
                  {lang.nativeName} ({lang.code})
                </button>
              ))}
            </div>

            {/* SIMULATED CARD */}
            <motion.div
              key={demoLang}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-cream rounded-3xl p-6 border border-agriBorder text-left space-y-4 shadow-sm"
            >
              <div className="flex justify-between items-center pb-3 border-b border-agriBorder">
                <div>
                  <span className="text-[10px] font-extrabold text-agriGreen uppercase">
                    {(demoCardData[demoLang] || demoCardData.EN).status}
                  </span>
                  <h4 className="text-base font-black text-charcoal">
                    {(demoCardData[demoLang] || demoCardData.EN).farmerLot}
                  </h4>
                </div>
                <div className="bg-forest text-white px-3 py-1 rounded text-[10px] font-bold">
                  KL-10492
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-bold text-charcoal">
                <div>
                  <span className="text-charcoal-muted block text-[9px] uppercase font-extrabold">
                    {(demoCardData[demoLang] || demoCardData.EN).totalQty}
                  </span>
                  <span className="text-sm font-black">800 KG</span>
                </div>
                <div>
                  <span className="text-charcoal-muted block text-[9px] uppercase font-extrabold">
                    {(demoCardData[demoLang] || demoCardData.EN).expectedPrice}
                  </span>
                  <span className="text-sm font-black">₹32.00 / kg</span>
                </div>
                <div>
                  <span className="text-charcoal-muted block text-[9px] uppercase font-extrabold">
                    {(demoCardData[demoLang] || demoCardData.EN).harvestDate}
                  </span>
                  <span className="text-sm font-black">23-Aug-2026</span>
                </div>
                <div>
                  <span className="text-charcoal-muted block text-[9px] uppercase font-extrabold">
                    {(demoCardData[demoLang] || demoCardData.EN).qualityGrade}
                  </span>
                  <span className="text-sm font-black text-agriGreen">Grade A</span>
                </div>
              </div>

              <div className="p-3 bg-agriGreen-light rounded-xl border border-agriGreen-accent/25 text-[11px] text-forest font-semibold">
                ✓ {(demoCardData[demoLang] || demoCardData.EN).matched}
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Authentic Farmer Image */}
          <div className="lg:col-span-6 relative">
            <div className="w-full h-80 sm:h-[400px] rounded-[2.5rem] overflow-hidden shadow-xl border border-agriBorder">
              <img
                src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800"
                alt="Farmer smiling with phone"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl border border-agriBorder shadow-lg text-left space-y-1 max-w-xs">
              <Smartphone className="w-5 h-5 text-forest" />
              <p className="text-xs font-bold text-charcoal">"Less complexity. Better decisions. Better opportunities."</p>
              <span className="text-[10px] text-charcoal-muted block">Empowering regional language users</span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. INTERACTIVE MARKETPLACE PREVIEW */}
      <section id="marketplace" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Marketplace Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-agriBorder pb-6">
          <div className="text-left space-y-2">
            <span className="text-xs font-black uppercase text-agriGreen tracking-wider bg-agriGreen-light px-3 py-1 rounded-full">
              Live Digital Lot Catalog
            </span>
            <h2 className="text-3xl font-black text-charcoal">
              Browse Active Marketplace Crops
            </h2>
            <p className="text-xs text-charcoal-muted max-w-lg font-medium">
              Explore current wholesale demands, verified pricing estimates, and target requirements listed by registered buyers.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
            <input
              type="text"
              placeholder="Search crop name (e.g. Tomato, Wheat)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white text-xs font-semibold rounded-xl border border-agriBorder text-charcoal placeholder-charcoal-muted focus:outline-none focus:border-forest shadow-inner"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                selectedCategory === cat
                  ? 'bg-agriGreen border-agriGreen text-white shadow-md'
                  : 'bg-white hover:bg-cream border-agriBorder text-charcoal-muted hover:text-charcoal'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Marketplace Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCrops.length > 0 ? (
            filteredCrops.map(crop => (
              <div
                key={crop.id}
                className="bg-white rounded-3xl border border-agriBorder shadow-card overflow-hidden hover:scale-[1.01] hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative h-44 w-full bg-cream border-b border-agriBorder overflow-hidden">
                  <CropImage
                    crop={crop}
                    className="w-full h-full transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded z-20">
                    {crop.category}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between text-left space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-charcoal">{crop.name}</h3>
                    <p className="text-[11px] text-charcoal-muted font-semibold">
                      {crop.hindiName} • {crop.marathiName}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-charcoal bg-cream/70 p-2.5 rounded-xl border border-agriBorder/60">
                    <div>
                      <span className="text-[8px] uppercase text-charcoal-muted block">Mandi Price</span>
                      <span>₹{crop.mandiPrice} / {crop.unit}</span>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase text-agriGreen block">Buyer Offer</span>
                      <span className="text-forest font-black">₹{crop.bestOfferPrice} / {crop.unit}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-1 text-[10px] font-black text-agriGreen">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+{crop.trendPct}% up</span>
                    </div>
                    <button
                      onClick={() => setSelectedCropItem(crop)}
                      className="px-3.5 py-2 bg-cream hover:bg-forest hover:text-white border border-agriBorder text-[10px] font-black rounded-lg transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-charcoal-muted text-xs font-bold bg-white rounded-3xl border border-agriBorder">
              No crops match your search query. Try typing another crop name.
            </div>
          )}
        </div>
      </section>

      {/* 5. MARKET PRICE INDEX COMPARISON SECTION */}
      <section id="market-prices" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-left max-w-xl space-y-2">
          <span className="text-xs font-black uppercase text-amberGold tracking-wider bg-amberGold-light px-3 py-1 rounded">
            Live Benchmarks Index
          </span>
          <h2 className="text-3xl font-black text-charcoal">
            Mandi Benchmarks & Buyer Matching Price
          </h2>
          <p className="text-xs text-charcoal-muted font-medium">
            Verify real crop modal prices at local mandis side-by-side with verified KisanLink buyer contract rates.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-agriBorder shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-cream border-b border-agriBorder text-charcoal-muted uppercase text-[10px] font-extrabold">
                  <th className="p-4.5">Crop Name</th>
                  <th className="p-4.5">Reference Mandi</th>
                  <th className="p-4.5">Mandi Rate</th>
                  <th className="p-4.5">Verified Buyer Rate</th>
                  <th className="p-4.5">Net Optimization</th>
                  <th className="p-4.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream font-medium text-charcoal">
                {[
                  { name: "Wheat", ref: "Kanpur Mandi (UP)", mandi: "₹2,450 / quintal", buyer: "₹2,700 / quintal", gain: "+₹250 / quintal", trend: "up" },
                  { name: "Tomato", ref: "Kanpur Mandi (UP)", mandi: "₹28.00 / kg", buyer: "₹33.00 / kg", gain: "+₹5.00 / kg", trend: "up" },
                  { name: "Potato", ref: "Agra APMC (UP)", mandi: "₹18.00 / kg", buyer: "₹22.00 / kg", gain: "+₹4.00 / kg", trend: "up" },
                  { name: "Onion", ref: "Nashik APMC (MH)", mandi: "₹24.00 / kg", buyer: "₹28.00 / kg", gain: "+₹4.00 / kg", trend: "up" },
                  { name: "Soybean", ref: "Latur APMC (MH)", mandi: "₹4,500 / quintal", buyer: "₹4,950 / quintal", gain: "+₹450 / quintal", trend: "up" },
                  { name: "Turmeric", ref: "Sangli Mandi (MH)", mandi: "₹12,500 / quintal", buyer: "₹14,200 / quintal", gain: "+₹1,700 / quintal", trend: "up" },
                ].map((item, idx) => (
                  <tr key={idx} className="hover:bg-cream/40 transition-colors">
                    <td className="p-4.5 font-bold flex items-center gap-3">
                      <CropImage cropName={item.name} className="w-8 h-8 rounded-full border border-agriBorder shrink-0" />
                      <span>{item.name}</span>
                    </td>
                    <td className="p-4.5 text-charcoal-muted">{item.ref}</td>
                    <td className="p-4.5">{item.mandi}</td>
                    <td className="p-4.5 text-forest font-bold">{item.buyer}</td>
                    <td className="p-4.5 text-agriSuccess font-bold">{item.gain}</td>
                    <td className="p-4.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedCrop(item.name);
                          setCurrentTab('markets');
                        }}
                        className="px-3.5 py-1.5 bg-cream hover:bg-forest hover:text-white rounded-lg border border-agriBorder text-[10px] font-black transition-all flex items-center gap-1.5 ml-auto"
                      >
                        Details <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-cream/50 border-t border-agriBorder flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-charcoal-muted">
            <span>* Mandi prices are updated daily from AGMARKNET feeds.</span>
            <button
              onClick={() => setCurrentTab('markets')}
              className="px-5 py-2.5 bg-forest hover:bg-forest-hover text-white rounded-xl shadow-md transition-all text-xs font-extrabold"
            >
              View All Market Prices
            </button>
          </div>
        </div>
      </section>

      {/* 6. DYNAMIC WEATHER ADVISORY WIDGET */}
      <section id="weather" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase text-forest bg-agriGreen-light px-3 py-1.5 rounded-full">
            Precision Agrometeorology
          </span>
          <h2 className="text-3xl font-black text-charcoal">Farming Weather Advisory</h2>
          <p className="text-xs text-charcoal-muted font-medium">
            Toggle regional agricultural centers to view real-time humidity indexes, precipitation ratios, and dynamic harvesting advisory guidelines.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-agriBorder shadow-card p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Weather Station Selector (Left) */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-[10px] uppercase font-black text-charcoal-muted tracking-wider">Select Agricultural Center:</span>
            <div className="flex flex-col gap-2">
              {[
                { key: 'kanpur', label: 'Kanpur Center (Uttar Pradesh)', desc: 'Tomato & Wheat Belt' },
                { key: 'nashik', label: 'Nashik Center (Maharashtra)', desc: 'Onion & Grape Belt' },
                { key: 'pune', label: 'Pune Center (Maharashtra)', desc: 'Sugarcane & Veg Belt' }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setWeatherRegion(item.key as any)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    weatherRegion === item.key
                      ? 'bg-forest border-forest text-white shadow-md'
                      : 'bg-cream border-agriBorder text-charcoal hover:bg-cream-dark'
                  }`}
                >
                  <h4 className="text-xs font-black">{item.label}</h4>
                  <span className={`text-[10px] block mt-0.5 ${weatherRegion === item.key ? 'text-freshGreen' : 'text-charcoal-muted'}`}>
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Weather Card Stats Display (Right) */}
          <div className="lg:col-span-8 bg-cream rounded-3xl p-6 border border-agriBorder space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-agriBorder pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-agriBorder">
                  {weatherRegion === 'nashik' ? (
                    <CloudRain className="w-6 h-6 text-blue-500" />
                  ) : (
                    <Sun className="w-6 h-6 text-amberGold" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-charcoal capitalize">{weatherRegion} Hub</h3>
                  <span className="text-[10px] text-charcoal-muted block font-semibold">Live Station Telemetry Feed</span>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-3xl font-black text-charcoal">{weatherData[weatherRegion].temp}</span>
                <span className="text-xs text-charcoal-muted block font-semibold">{weatherData[weatherRegion].condition}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-white rounded-2xl border border-agriBorder">
                <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <span className="text-[9px] uppercase text-charcoal-muted block">Humidity</span>
                <span className="text-sm font-black text-charcoal">{weatherData[weatherRegion].humidity}</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-agriBorder">
                <CloudRain className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <span className="text-[9px] uppercase text-charcoal-muted block">Rain Probability</span>
                <span className="text-sm font-black text-charcoal">{weatherData[weatherRegion].rainProb}</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-agriBorder">
                <Wind className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <span className="text-[9px] uppercase text-charcoal-muted block">Wind Speed</span>
                <span className="text-sm font-black text-charcoal">{weatherData[weatherRegion].wind}</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-agriBorder space-y-1.5 text-left">
              <span className="text-[9px] font-black text-forest uppercase tracking-wider bg-agriGreen-light px-2.5 py-0.5 rounded-full inline-block">
                Agronomy advisory notes
              </span>
              <p className="text-xs text-charcoal leading-relaxed font-semibold">
                {weatherData[weatherRegion].advisory}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HOW AGRILINK WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-black text-charcoal">How KisanLink Works</h2>
          <p className="text-xs text-charcoal-muted font-medium">
            3 simple, transparent steps to bridge the gap between crop harvest and payment settlement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {[
            { step: '01', title: 'Create Your Profile', desc: 'Join as a grower, FPO administrator, or verified buyer. Complete quick credential checks.', img: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=400" },
            { step: '02', title: 'Discover & Compare', desc: 'Scan real mandi prices, lookup compatibility indices, or browse crop demands.', img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400" },
            { step: '03', title: 'Execute Secure Trade', desc: 'Secure direct purchase contracts, track door-to-door transport, and receive payout in 24 hrs.', img: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=400" }
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-5 border border-agriBorder shadow-card flex flex-col justify-between text-left space-y-4 relative">
              <div className="h-40 w-full rounded-2xl overflow-hidden bg-cream border border-agriBorder">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
              </div>
              <div className="space-y-1">
                <span className="text-3xl font-black text-agriGreen/20 block">{item.step}</span>
                <h4 className="text-sm font-black text-charcoal">{item.title}</h4>
                <p className="text-xs text-charcoal-muted font-semibold leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. CROP DISCOVERY CATALOG */}
      <section id="crops" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-left space-y-2">
          <span className="text-xs font-black uppercase text-forest bg-agriGreen-light px-3 py-1 rounded">
            Agronomy Catalog
          </span>
          <h2 className="text-3xl font-black text-charcoal">Search Specific Crop Profiles</h2>
          <p className="text-xs text-charcoal-muted max-w-md font-medium">
            Browse through common crops in Indian geography to verify standard packing, grade metrics, and weather conditions.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 justify-start">
          {CROPS_CATALOG.slice(0, 16).map((crop) => (
            <button
              key={crop.id}
              onClick={() => setSelectedCropItem(crop)}
              className="bg-white hover:bg-cream border border-agriBorder hover:border-forest px-4.5 py-3 rounded-2xl flex items-center gap-3 transition-all text-left shadow-sm group"
            >
              <CropImage
                crop={crop}
                className="w-8 h-8 rounded-full border border-agriBorder shrink-0"
              />
              <div>
                <h4 className="text-xs font-bold text-charcoal group-hover:text-forest transition-colors">{crop.name}</h4>
                <span className="text-[9px] text-charcoal-muted block">{crop.hindiName}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 9. TRUST / STATISTICS SECTION */}
      <section className="bg-cream border border-agriBorder rounded-[2.5rem] p-8 sm:p-12 max-w-6xl mx-auto shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <span className="text-3xl font-black text-forest">12K+</span>
            <span className="text-[10px] text-charcoal-muted uppercase block font-extrabold mt-1">Verified Farmers</span>
          </div>
          <div>
            <span className="text-3xl font-black text-forest">500+</span>
            <span className="text-[10px] text-charcoal-muted uppercase block font-extrabold mt-1">Active Buyers</span>
          </div>
          <div>
            <span className="text-3xl font-black text-forest">100+</span>
            <span className="text-[10px] text-charcoal-muted uppercase block font-extrabold mt-1">APMC Mandis Covered</span>
          </div>
          <div>
            <span className="text-3xl font-black text-forest">50+</span>
            <span className="text-[10px] text-charcoal-muted uppercase block font-extrabold mt-1">Crop Categories</span>
          </div>
        </div>
      </section>

      {/* 10. AI AGRICULTURAL ASSISTANT SECTION */}
      <section id="ai-assistant" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest text-white rounded-[2.5rem] p-6 sm:p-10 border border-forest-light shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 text-left space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amberGold text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Dynamic Diagnostic Assistant
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">Ask anything about your farm.</h2>
              <p className="text-xs text-cream/80 leading-relaxed font-semibold">
                KisanLink AI analyses crop patterns, calculates road transport tariffs, and recommends planting schedules. Click any sample prompt on the right to test it directly.
              </p>
              <div className="pt-2">
                <span className="text-[10px] text-freshGreen font-bold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Supports English, Hindi, and Marathi query inputs
                </span>
              </div>
            </div>

            {/* Simulated chat widget query links */}
            <div className="lg:col-span-6 bg-white/5 rounded-3xl p-5 border border-white/10 space-y-3 text-left">
              <span className="text-[9px] uppercase tracking-wider text-white/50 block font-bold">Frequently Asked Advisor Prompts:</span>
              <div className="flex flex-col gap-2">
                {[
                  { text: "Why are my tomato leaves turning yellow?", label: "🍂 Diagnosis Guide" },
                  { text: "What is today's soybean price benchmark in Latur?", label: "📈 Live Mandi Query" },
                  { text: "How much transport cost should I expect for 42 km?", label: "🚚 Route optimization" },
                  { text: "Suggest crops suitable for black cotton clay soil.", label: "🌱 Soil Compatibility" }
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAskAI(q.text)}
                    className="p-3 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-2xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-between text-left group"
                  >
                    <span className="truncate pr-2">{q.text}</span>
                    <span className="text-[8px] uppercase tracking-wider text-amberGold bg-white/10 px-2 py-0.5 rounded whitespace-nowrap shrink-0 group-hover:bg-white/15 transition-all">
                      {q.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FOOTER COLUMN MATRIX */}
      <footer className="bg-forest text-white/70 border-t border-forest-light pt-16 pb-8 rounded-t-[2.5rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-xs">
          
          {/* Main columns */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-left">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-agriGreen flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.1 2 7 0 6-4.5 11-10 11Z" />
                  </svg>
                </div>
                <span className="text-xl font-black text-white font-sans tracking-tight">KisanLink</span>
              </div>
              <p className="text-[11px] text-cream/70 leading-relaxed max-w-sm">
                Empowering India's growers and FPOs with precise market intelligence, direct procurement options, and AI agricultural diagnostics.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Platform Hub</h4>
              <div className="flex flex-col gap-2 font-bold">
                <button onClick={() => setCurrentTab('overview')} className="hover:text-white transition-all text-left">Dashboard Overview</button>
                <button onClick={() => setCurrentTab('markets')} className="hover:text-white transition-all text-left">Mandi Price Index</button>
                <button onClick={() => setCurrentTab('buyers')} className="hover:text-white transition-all text-left">Direct Buyers Directory</button>
                <button onClick={() => setCurrentTab('ai-engine')} className="hover:text-white transition-all text-left">AI Sale Engine</button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Resources</h4>
              <div className="flex flex-col gap-2 font-bold">
                <button onClick={() => scrollToSection('crops')} className="hover:text-white transition-all text-left">Crop Catalog</button>
                <button onClick={() => scrollToSection('weather')} className="hover:text-white transition-all text-left">Weather Station</button>
                <button onClick={() => handleAskAI("Show farming guides")} className="hover:text-white transition-all text-left">Agronomy Guides</button>
                <button onClick={() => handleAskAI("Help FAQs")} className="hover:text-white transition-all text-left">Help & FAQs</button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Company</h4>
              <div className="flex flex-col gap-2 font-bold">
                <a href="#about" className="hover:text-white transition-all">About KisanLink</a>
                <a href="#contact" className="hover:text-white transition-all">Contact Support</a>
                <a href="#privacy" className="hover:text-white transition-all">Privacy Policy</a>
                <a href="#terms" className="hover:text-white transition-all">Terms of Use</a>
              </div>
            </div>
          </div>

          {/* Bottom attribution */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-cream/50 font-bold">
            <span>© 2026 KisanLink Platform. All rights reserved. Maharashtra State Innovation Society Project.</span>
            <div className="flex items-center gap-4">
              <span>Privacy</span>
              <span>Terms of Trade</span>
              <span>SLA Agreements</span>
            </div>
          </div>

        </div>
      </footer>

      {/* CROP DETAILS MODAL OVERLAY */}
      <CropDetailModal
        isOpen={selectedCropItem !== null}
        crop={selectedCropItem}
        onClose={() => setSelectedCropItem(null)}
        onSellCrop={(crop) => {
          setSelectedCrop(crop.name);
          setCurrentTab('overview');
        }}
      />

    </motion.div>
  );
};
