import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, MessageSquare, Trash2, Globe, AlertTriangle, ArrowRight, CornerDownRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

import { AVAILABLE_LANGUAGES, getCropName, t } from '../utils/i18n';

interface Message {
  role: 'user' | 'model';
  content: string;
  tool_calls?: string[];
  sources?: { name: string; type: string; url: string }[];
  created_at?: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

export const KisanLinkAIAssistant: React.FC = () => {
  const { user } = useAuth();
  const { selectedCrop, language } = useApp();
  
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_BASE = 'http://localhost:8000/api/v1';

  // Quick Action triggers helper for all 9 languages
  const getGreeting = () => {
    const name = user?.name || "Ramesh";
    const greetings: Record<string, string> = {
      HI: `नमस्ते, ${name}। आप आज क्या जानना चाहते हैं?`,
      MR: `नमस्कार, ${name}। तुम्हाला आज काय जाणून घ्यायचे आहे?`,
      PA: `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ${name}। ਤੁਸੀਂ ਅੱਜ ਕੀ ਜਾਣਨਾ ਚਾਹੁੰਦੇ ਹੋ?`,
      TE: `నమస్కారం, ${name}। మీరు ఈరోజు ఏమి తెలుసుకోవాలనుకుంటున్నారు?`,
      TA: `வணக்கம், ${name}। இன்று நீங்கள் என்ன தெரிந்துகொள்ள விரும்புகிறீர்கள்?`,
      GU: `નમસ્તે, ${name}। તમે આજે શું જાણવા માંગો છો?`,
      KN: `ನಮಸ್ಕಾರ, ${name}। ನೀವು ಇಂದು ಏನು ತಿಳಿಯಲು ಬಯಸುತ್ತೀರಿ?`,
      BN: `নমস্কার, ${name}। আপনি আজ কী জানতে চান?`,
      EN: `Good day, ${name}. What would you like to know today?`
    };
    return greetings[language] || greetings.EN;
  };

  const getQuickActions = () => {
    const cropName = getCropName(selectedCrop, language);
    
    switch (language) {
      case 'HI':
        return [
          { label: "📈 आज के मंडी भाव", query: `आज मेरे पास ${cropName} का ताजा भाव क्या है?` },
          { label: "🏪 सत्यापित खरीदार खोजें", query: `मेरे 2 टन ${cropName} के लिए सर्वोत्तम सत्यापित खरीदार खोजें।` },
          { label: "💰 क्या मैं अभी बेचूं?", query: `क्या मुझे आज अपना ${cropName} लॉट बेचना चाहिए या रुकना चाहिए?` },
          { label: "🌾 फसल सलाह व ग्रेड", query: `${cropName} की गुणवत्ता ग्रेड और अधिकतम लाभ के सुझाव दें।` }
        ];
      case 'MR':
        return [
          { label: "📈 आजचे बाजारभाव", query: `माझ्या जवळ ${cropName} चा आजचा बाजारभाव काय आहे?` },
          { label: "🏪 खरेदीदार शोधा", query: `माझ्या 2 टन ${cropName} पिकासाठी सर्वोत्तम पडताळलेले खरेदीदार शोधा.` },
          { label: "💰 मी आता विकू का?", query: `मी आज ${cropName} विकावे की थांबावे?` },
          { label: "🌾 पीक सल्ला व ग्रेड", query: `${cropName} ची प्रत आणि बाजारपेठ नफा वाढवण्यासाठी टिप्स सांगा.` }
        ];
      case 'PA':
        return [
          { label: "📈 ਅੱਜ ਦੇ ਮੰਡੀ ਭਾਅ", query: `ਅੱਜ ਨੇੜੇ ਦੀ ਮੰਡੀ ਵਿੱਚ ${cropName} ਦਾ ਭਾਅ ਕੀ ਹੈ?` },
          { label: "🏪 ਖਰੀਦਦਾਰ ਲੱਭੋ", query: `ਮੇਰੇ 2 ਟਨ ${cropName} ਲਈ ਪ੍ਰਮਾਣਿਤ ਖਰੀਦਦਾਰ ਲੱਭੋ।` },
          { label: "💰 ਕੀ ਮੈਂ ਹੁਣ ਵੇਚਾਂ?", query: `ਕੀ ਮੈਨੂੰ ਅੱਜ ${cropName} ਵੇਚਣਾ ਚਾਹੀਦਾ ਹੈ ਜਾਂ ਰੁਕਣਾ ਚਾਹੀਦਾ ਹੈ?` },
          { label: "🌾 ਫ਼ਸਲ ਸਲਾਹ ਤੇ ਗ੍ਰੇਡ", query: `${cropName} ਲਈ ਗੁਣਵੱਤਾ ਸੁਧਾਰ ਅਤੇ ਲਾਭ ਵਧਾਉਣ ਦੇ ਸੁਝਾਅ ਦਿਓ।` }
        ];
      case 'TE':
        return [
          { label: "📈 నేటి మార్కెట్ ధరలు", query: `నా సమీపంలో ${cropName} నేటి ధర ఎంత?` },
          { label: "🏪 కొనుగోలుదారులను వెతకండి", query: `నా 2 టన్నుల ${cropName} కోసం ధృవీకరించబడిన కొనుగోలుదారులను చూపించండి.` },
          { label: "💰 నేను ఇప్పుడే అమ్మవచ్చా?", query: `నేను ఈరోజు ${cropName} అమ్మాలా లేక వేచి ఉండాలా?` },
          { label: "🌾 పంట సలహాలు & గ్రేడ్లు", query: `${cropName} నాణ్యతా ప్రమాణాలు మరియు లాభాల చిట్కాలు చెప్పండి.` }
        ];
      case 'TA':
        return [
          { label: "📈 இன்றைய சந்தை விலைகள்", query: `அருகிலுள்ள சந்தையில் ${cropName} இன்றைய விலை என்ன?` },
          { label: "🏪 வாங்குபவர்களைக் கண்டறியவும்", query: `எனது 2 டன் ${cropName} பயிருக்கு சரிபார்க்கப்பட்ட வாங்குபவர்களைக் கண்டறியவும்.` },
          { label: "💰 இப்போது விற்கலாமா?", query: `நான் இன்று ${cropName} விற்க வேண்டுமா அல்லது காத்திருக்க வேண்டுமா?` },
          { label: "🌾 பயிர் வழிகாட்டி & தரம்", query: `${cropName} தரத்தை மேம்படுத்தி அதிக லாபம் பெறுவதற்கான குறிப்புகள்.` }
        ];
      case 'GU':
        return [
          { label: "📈 આજના બજાર ભાવો", query: `મારી નજીકના બજારમાં ${cropName} નો આજનો ભાવ શું છે?` },
          { label: "🏪 ખરીદદાર શોધો", query: `મારા 2 ટન ${cropName} માટે ચકાસાયેલ ખરીદદારો શોધો.` },
          { label: "💰 શું હું અત્યારે વેચું?", query: `શું મારે આજે ${cropName} વેચવું જોઈએ કે રાહ જોવી?` },
          { label: "🌾 પાક સલાહ અને ગ્રેડ", query: `${cropName} ની ગુણવત્તા સુધારવા અને વધુ નફો મેળવવાની ટીપ્સ.` }
        ];
      case 'KN':
        return [
          { label: "📈 ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ದರಗಳು", query: `ನನ್ನ ಹತ್ತಿರದ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ${cropName} ಇಂದಿನ ಬೆಲೆ ಎಷ್ಟು?` },
          { label: "🏪 ಖರೀದಿದಾರರನ್ನು ಹುಡುಕಿ", query: `ನನ್ನ 2 ಟನ್ ${cropName} ಬೆಳೆಗೆ ಪರಿಶೀಲಿಸಿದ ಖರೀದಿದಾರರನ್ನು ಹುಡುಕಿ.` },
          { label: "💰 ನಾನು ಈಗಲೇ ಮಾರಬೇಕೇ?", query: `ನಾನು ಇಂದು ${cropName} ಮಾರಾಟ ಮಾಡಬೇಕೇ ಅಥವಾ ಕಾಯಬೇಕೇ?` },
          { label: "🌾 ಬೆಳೆ ಮಾಹಿತಿ & ಗ್ರೇಡ್‌ಗಳು", query: `${cropName} ಗುಣಮಟ್ಟ ಮತ್ತು ಲಾಭ ಹೆಚ್ಚಿಸುವ ಸಲಹೆಗಳು.` }
        ];
      case 'BN':
        return [
          { label: "📈 আজকের বাজার দর", query: `আমার নিকটবর্তী বাজারে ${cropName} এর আজকের দর কত?` },
          { label: "🏪 ক্রেতা খুঁজুন", query: `আমার ২ টন ${cropName} এর জন্য যাচাইকৃত ক্রেতা খুঁজুন।` },
          { label: "💰 আমি কি এখনই বিক্রি করব?", query: `আজ কি আমার ${cropName} বিক্রি করা উচিত নাকি অপেক্ষা করা উচিত?` },
          { label: "🌾 ফসল পরামর্শ ও গ্রেড", query: `${cropName} এর গুণমান ও সর্বোচ্চ মুনাফার পরামর্শ দিন।` }
        ];
      default:
        return [
          { label: "📈 Today's Mandi Prices", query: `What is today's benchmark price of ${selectedCrop} near me?` },
          { label: "🏪 Find Verified Buyers", query: `Find verified corporate & retail buyers for 2 tons of ${selectedCrop}.` },
          { label: "💰 Should I Sell Now?", query: `Should I sell my ${selectedCrop} lot today or hold for 3 days?` },
          { label: "🌾 Crop Quality & Grades", query: `What quality grade standards maximize net realization for ${selectedCrop}?` }
        ];
    }
  };

  // Fetch previous conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE}/ai/conversations?user_id=${user?.id || '1'}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load message history for conversation
  const loadConversation = async (convId: string) => {
    setActiveConvId(convId);
    setIsThinking(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`${API_BASE}/ai/conversations/${convId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      setErrorMessage("Failed to load message history.");
    } finally {
      setIsThinking(false);
    }
  };

  // Delete conversation
  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE}/ai/conversations/${convId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (activeConvId === convId) {
          setActiveConvId(null);
          setMessages([]);
        }
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Start new conversation session
  const startNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
    setErrorMessage(null);
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchConversations();
    }
  }, [isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Send query
  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    setErrorMessage(null);
    const userQuery = textToSend;
    setQuery('');

    // Append user message instantly
    const newMsg: Message = { role: 'user', content: userQuery };
    setMessages(prev => [...prev, newMsg]);
    setIsThinking(true);

    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userQuery,
          user_role: user?.role || 'FARMER',
          user_id: user?.id || '1',
          conversation_id: activeConvId
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      
      if (data.conversation_id) {
        setActiveConvId(data.conversation_id);
      }

      // Append assistant response
      setMessages(prev => [...prev, {
        role: 'model',
        content: data.text,
        tool_calls: data.tool_calls || [],
        sources: data.sources || [],
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      
      fetchConversations();
    } catch (e) {
      console.error(e);
      setErrorMessage("KisanLink AI is temporarily unavailable. Local fallback active.");
      
      // Local fallback rule execution
      setMessages(prev => [...prev, {
        role: 'model',
        content: `I'm temporarily unable to reach the Gemini API service. Rest assured, your market prices and transactions remain fully accessible in standard dashboards.`,
        sources: [],
        badges: ["◷ Offline"]
      } as any]);
    } finally {
      setIsThinking(false);
    }
  };

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ query?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.query) {
        handleSend(customEvent.detail.query);
      }
    };
    window.addEventListener('kisanlink-open-ai-assistant' as any, handleOpen);
    return () => window.removeEventListener('kisanlink-open-ai-assistant' as any, handleOpen);
  }, [user, activeConvId]);

  return (
    <>
      {/* FLOATING BUTTON (Positioned cleanly above mobile bottom nav to prevent collision) */}
      <div className="fixed z-40 bottom-20 right-4 sm:bottom-22 sm:right-6 md:bottom-8 md:right-8 flex flex-col items-end pointer-events-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-13 h-13 md:w-16 md:h-16 bg-forest hover:bg-forest-light text-white rounded-full flex items-center justify-center shadow-xl border-2 border-white/30 hover:scale-105 active:scale-95 transition-all duration-300 relative group p-3.5"
          aria-label="KisanLink AI Assistant"
        >
          {isOpen ? <X className="w-6 h-6 md:w-7 md:h-7" /> : <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-amberGold" />}
          
          <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-all bg-charcoal text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-md whitespace-nowrap">
            KisanLink AI
          </span>
        </button>
      </div>

      {/* DRAWER PANEL */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile closing */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-xs md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, x: 320 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed z-50 top-0 right-0 h-screen w-full max-w-md bg-cream border-l border-agriBorder shadow-2xl flex flex-col"
            >
            {/* PANEL HEADER */}
            <div className="bg-forest text-white p-5 flex items-center justify-between shadow-md relative shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                  <Sparkles className="w-5 h-5 text-amberGold" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm tracking-wide">KisanLink AI</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-freshGreen animate-pulse"></span>
                    <span className="text-[10px] text-white/70 font-semibold uppercase">Online • Market Intelligence</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-all text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CHAT CONTAINER BODY */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
              
              {/* SESSIONS & HISTORY PANEL IF NO MESSAGES */}
              {messages.length === 0 && conversations.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-agriBorder space-y-3 shadow-sm shrink-0">
                  <span className="text-xs font-bold text-charcoal-muted uppercase tracking-wider block">Recent Conversations</span>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {conversations.map(c => (
                      <div
                        key={c.id}
                        onClick={() => loadConversation(c.id)}
                        className="p-3 bg-cream hover:bg-cream-dark border border-agriBorder rounded-xl cursor-pointer flex items-center justify-between text-xs transition-all"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <MessageSquare className="w-3.5 h-3.5 text-forest shrink-0" />
                          <span className="font-bold text-charcoal truncate">{c.title}</span>
                        </div>
                        <button
                          onClick={(e) => deleteConversation(c.id, e)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-all shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MESSAGES LIST */}
              {messages.length === 0 ? (
                // INTRO COMPONENT
                <div className="text-center py-8 space-y-6 flex-1 flex flex-col justify-center">
                  <div className="max-w-xs mx-auto space-y-2">
                    <h3 className="text-lg font-black text-charcoal">{getGreeting()}</h3>
                    <p className="text-xs text-charcoal-muted leading-relaxed">
                      Ask me about price forecasts, matching buyers, transport calculations, cold storage, or dynamic agronomy tips.
                    </p>
                  </div>

                  {/* QUICK ACTIONS BUTTONS */}
                  <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto w-full px-4">
                    {getQuickActions().map((qa, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(qa.query)}
                        className="p-3.5 bg-white hover:bg-forest hover:text-white text-charcoal text-xs font-bold text-left rounded-2xl border border-agriBorder shadow-sm transition-all flex items-center justify-between group"
                      >
                        <span>{qa.label}</span>
                        <ArrowRight className="w-4 h-4 text-forest group-hover:text-white transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // CONVERSATION STREAM
                <div className="space-y-4 flex-1">
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      {/* ROLE BADGES */}
                      <span className="text-[9px] font-bold text-charcoal-muted uppercase mb-1 px-1">
                        {m.role === 'user' ? (user?.name || 'Farmer') : 'KisanLink AI'}
                      </span>

                      {/* MSG CONTENT CONTAINER */}
                      <div
                        className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                          m.role === 'user'
                            ? 'bg-forest text-white rounded-tr-none'
                            : 'bg-white text-charcoal border border-agriBorder rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-line text-xs font-medium leading-relaxed">{m.content}</p>

                        {/* SOURCE CITATIONS LINK RENDER */}
                        {m.role === 'model' && m.sources && m.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-cream text-[10px] space-y-1.5 text-charcoal-muted">
                            <span className="font-bold text-charcoal uppercase block tracking-wider">Sources & Citations:</span>
                            {m.sources.map((src, sidx) => (
                              <a
                                key={sidx}
                                href={src.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 hover:underline text-blue-600 font-semibold"
                              >
                                <CornerDownRight className="w-3 h-3 text-agriGreen" />
                                <span>{src.name}</span>
                                <span className="text-[8px] bg-blue-50 text-blue-700 px-1.5 rounded uppercase font-extrabold border border-blue-100">
                                  {src.type === 'KISANLINK_DATA' ? '◆ KisanLink' : '✓ Verified'}
                                </span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* LOADING DOTS */}
                  {isThinking && (
                    <div className="flex flex-col items-start">
                      <span className="text-[9px] font-bold text-charcoal-muted uppercase mb-1 px-1">KisanLink AI</span>
                      <div className="bg-white p-3 rounded-2xl border border-agriBorder rounded-tl-none flex items-center gap-1.5 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-forest animate-bounce delay-100"></span>
                        <span className="w-2 h-2 rounded-full bg-forest animate-bounce delay-200"></span>
                        <span className="w-2 h-2 rounded-full bg-forest animate-bounce delay-300"></span>
                      </div>
                    </div>
                  )}

                  {/* ERROR DISPLAY NOTICE */}
                  {errorMessage && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* CHAT INPUT AREA */}
            <div className="p-4 bg-white border-t border-agriBorder shrink-0 space-y-2">
              
              {/* UTILITIES PANEL */}
              <div className="flex items-center justify-between text-xs text-charcoal-muted">
                {activeConvId ? (
                  <button
                    onClick={startNewChat}
                    className="flex items-center gap-1 hover:text-forest font-bold transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-forest" /> New Chat Session
                  </button>
                ) : (
                  <span></span>
                )}
                
                <span className="text-[10px] font-bold text-agriGreen/80 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> {AVAILABLE_LANGUAGES.find(l => l.code === language)?.nativeName || language} ({language})
                </span>
              </div>

              {/* INPUT BAR */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(query);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('askAssistant', language)}
                  disabled={isThinking}
                  className="flex-1 bg-cream px-4 py-3 rounded-2xl text-xs font-medium text-charcoal placeholder-charcoal-muted border border-agriBorder focus:outline-none focus:border-forest shadow-inner"
                />
                
                <button
                  type="submit"
                  disabled={isThinking || !query.trim()}
                  className="w-11 h-11 bg-forest disabled:bg-agriBorder disabled:text-charcoal-muted hover:bg-forest-light text-white rounded-2xl flex items-center justify-center transition-all shadow-md shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// Internal icon proxy
const PlusCircle: React.FC<any> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);
