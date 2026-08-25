import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, Activity, Layers, Play, Pause, RotateCcw, FastForward, 
  ShieldCheck, AlertTriangle, CheckCircle2, TrendingUp, CloudRain,
  Sprout, Droplets, Leaf, Truck, Building2, Users, BookOpen,
  Filter, Search, ArrowUpRight, ChevronRight, Zap, RefreshCw, Eye,
  Sliders, ArrowRight, ShieldAlert, Ban, Info, Sparkles, X
} from 'lucide-react';
import { 
  KAFKA_TOPICS, DOMAIN_AGENTS_INITIAL, INITIAL_REVIEWS, 
  EVENT_CAUSAL_PATTERNS, KafkaTopic, DomainAgent, AgriEvent, ReviewItem 
} from '../services/agriOsEventService';
import { AgriOSIntelligenceGraph } from '../components/AgriOSIntelligenceGraph';
import { AgriOSArchitectureModal } from '../components/AgriOSArchitectureModal';
import { AgriOSExplainModal } from '../components/AgriOSExplainModal';
import { AgriOSReviewQueueModal } from '../components/AgriOSReviewQueueModal';

export const AgriOSCommandCenterView: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [eventsProcessed, setEventsProcessed] = useState<number>(34821);
  const [lastEventAgo, setLastEventAgo] = useState<number>(1.2);
  const [events, setEvents] = useState<AgriEvent[]>([]);
  const [agents, setAgents] = useState<DomainAgent[]>(DOMAIN_AGENTS_INITIAL);
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals & Bottom Sheets
  const [isArchOpen, setIsArchOpen] = useState<boolean>(false);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [explainCrop, setExplainCrop] = useState<{ open: boolean; crop: string; rec?: string }>({ open: false, crop: 'Tomato' });
  const [selectedAgentDetail, setSelectedAgentDetail] = useState<DomainAgent | null>(null);
  const [isGraphModalOpen, setIsGraphModalOpen] = useState<boolean>(false);
  const [showAllEventsMobile, setShowAllEventsMobile] = useState<boolean>(false);
  
  const [reviewCount, setReviewCount] = useState<number>(INITIAL_REVIEWS.length);

  const patternIndexRef = useRef<number>(0);
  const stepIndexRef = useRef<number>(0);

  useEffect(() => {
    const initialEvts: AgriEvent[] = [
      {
        id: `evt-${Date.now() - 1200}`,
        timestamp: new Date(Date.now() - 1200).toTimeString().split(' ')[0],
        agentName: "Marketplace Matching Agent",
        domain: "MARKETPLACE",
        topic: "lot.matched",
        summary: "Matched Lot #KL-LOT-10493 (Tomato 800 kg) with FreshHarvest Foods processor",
        payload: { lot_id: "KL-LOT-10493", crop: "Tomato", score: 94 },
        status: "APPROVED",
        confidence: 95.8
      },
      {
        id: `evt-${Date.now() - 3800}`,
        timestamp: new Date(Date.now() - 3800).toTimeString().split(' ')[0],
        agentName: "Safety & Policy Agent",
        domain: "SAFETY",
        topic: "safety.action.approved",
        summary: "Safety guardrail verified: Suggested listing price within fair mandi bounds (₹31–₹34/kg)",
        payload: { action: "PRICE_RECOMMENDATION", verified: true },
        status: "APPROVED",
        confidence: 99.9
      },
      {
        id: `evt-${Date.now() - 6400}`,
        timestamp: new Date(Date.now() - 6400).toTimeString().split(' ')[0],
        agentName: "Price Forecast Agent",
        domain: "MARKET",
        topic: "market.price.recommendation",
        summary: "Optimal realization range calculated: ₹31.00–₹34.00/kg (Benchmark ₹28.00/kg)",
        payload: { crop: "Tomato", mandi_ref: 28.0, min_target: 31.0, max_target: 34.0 },
        status: "APPROVED",
        confidence: 91.2
      },
      {
        id: `evt-${Date.now() - 9000}`,
        timestamp: new Date(Date.now() - 9000).toTimeString().split(' ')[0],
        agentName: "Market Intelligence Agent",
        domain: "MARKET",
        topic: "market.demand.detected",
        summary: "Tomato demand surge detected in regional processing hub (+11% buyer orders)",
        payload: { crop: "Tomato", demand_increase_pct: 11.0, hub: "Lucknow" },
        status: "APPROVED",
        confidence: 94.2
      },
      {
        id: `evt-${Date.now() - 11600}`,
        timestamp: new Date(Date.now() - 11600).toTimeString().split(' ')[0],
        agentName: "Crop Health Agent",
        domain: "CROP",
        topic: "crop.harvest.predicted",
        summary: "Precipitation risk flag: Tomato harvest recommended before rain window narrows",
        payload: { crop: "Tomato", mature_pct: 85 },
        status: "APPROVED",
        confidence: 91.8
      }
    ];
    setEvents(initialEvts);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(500, 2600 / speedMultiplier);

    const interval = setInterval(() => {
      const currentPattern = EVENT_CAUSAL_PATTERNS[patternIndexRef.current % EVENT_CAUSAL_PATTERNS.length];
      const template = currentPattern[stepIndexRef.current % currentPattern.length];

      const newEvent: AgriEvent = {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        agentName: template.agentName,
        domain: template.domain as any,
        topic: template.topic,
        summary: template.summary,
        payload: template.payload,
        status: template.status as any,
        confidence: template.confidence
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 49)]);
      setEventsProcessed(prev => prev + 1);
      setLastEventAgo(0.1);

      setAgents(prevAgents => prevAgents.map(ag => {
        if (ag.name === template.agentName) {
          return {
            ...ag,
            status: 'PROCESSING',
            eventsConsumed: ag.eventsConsumed + 1,
            eventsProduced: ag.eventsProduced + 1,
            lastActivity: 'Just now'
          };
        }
        return ag;
      }));

      stepIndexRef.current += 1;
      if (stepIndexRef.current >= currentPattern.length) {
        stepIndexRef.current = 0;
        patternIndexRef.current += 1;
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLastEventAgo(prev => +(prev + 0.1).toFixed(1));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const handleReplay = () => {
    setEventsProcessed(34821);
    stepIndexRef.current = 0;
    patternIndexRef.current = 0;
  };

  const domainsList = ['ALL', 'MARKET', 'WEATHER', 'SOIL', 'WATER', 'CROP', 'LOGISTICS', 'LIVESTOCK', 'MARKETPLACE', 'KNOWLEDGE', 'SAFETY'];

  const filteredAgents = agents.filter(a => {
    const matchesDomain = selectedDomain === 'ALL' || a.domain === selectedDomain;
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.consumes.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDomain && matchesSearch;
  });

  const filteredTopics = KAFKA_TOPICS.filter(t => {
    const matchesDomain = selectedDomain === 'ALL' || t.domain === selectedDomain;
    const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const visibleMobileEvents = showAllEventsMobile ? events : events.slice(0, 4);

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 text-charcoal">
      
      {/* 1. MASTER COMMAND CENTER HERO HEADER */}
      <div className="bg-forest text-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xl border border-forest-light relative overflow-hidden space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-agriGreen/30 text-freshGreen text-[10px] sm:text-xs font-black border border-agriGreen-accent/40">
                <span className="w-2 h-2 rounded-full bg-freshGreen animate-ping" />
                LIVE SIMULATION
              </span>
              <span className="text-[11px] font-bold text-white/70">
                AgriOS Intelligence Core
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              AgriOS Command Center
            </h1>
            
            <p className="text-xs text-white/80 font-medium leading-relaxed hidden sm:block">
              One intelligence core. Every agricultural domain. Continuously turns real-world signals into explainable recommendations.
            </p>
          </div>

          {/* Quick Action Buttons & Replay Controls */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-1 flex items-center gap-1 border border-white/15">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="min-touch px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 bg-agriGreen text-white active:scale-95"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={handleReplay}
                className="min-touch p-1.5 rounded-lg text-white/80 hover:text-white text-xs transition-all flex items-center"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-0.5 pl-1 border-l border-white/20">
                {[1, 2, 5].map(spd => (
                  <button
                    key={spd}
                    onClick={() => setSpeedMultiplier(spd)}
                    className={`px-1.5 py-1 rounded text-[10px] font-black ${
                      speedMultiplier === spd ? 'bg-amberGold text-charcoal' : 'text-white/70'
                    }`}
                  >
                    {spd}×
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsArchOpen(true)}
              className="min-touch px-3 py-2 bg-white/15 text-white text-xs font-black rounded-xl border border-white/20 flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-freshGreen" />
              <span>Pipeline</span>
            </button>

            <button
              onClick={() => setIsReviewOpen(true)}
              className="min-touch px-3 py-2 bg-amberGold text-charcoal text-xs font-black rounded-xl flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Reviews ({reviewCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME SYSTEM METRICS (2x2 Grid on Mobile - Requirement 13) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-charcoal">
        <div className="bg-white p-3.5 rounded-2xl border border-agriBorder shadow-sm">
          <span className="text-[10px] font-bold uppercase text-charcoal-muted block">Autonomous Agents</span>
          <span className="text-xl sm:text-2xl font-black text-forest block mt-0.5">24 Active</span>
          <span className="text-[10px] text-agriGreen font-bold block">100% Operational</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-agriBorder shadow-sm">
          <span className="text-[10px] font-bold uppercase text-charcoal-muted block">Kafka Topics</span>
          <span className="text-xl sm:text-2xl font-black text-charcoal block mt-0.5">{KAFKA_TOPICS.length} Topics</span>
          <span className="text-[10px] text-charcoal-muted block">10 Domain Groups</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-agriBorder shadow-sm">
          <span className="text-[10px] font-bold uppercase text-charcoal-muted block">Events Processed</span>
          <span className="text-xl sm:text-2xl font-black font-mono text-agriGreen block mt-0.5">
            {eventsProcessed.toLocaleString()}
          </span>
          <span className="text-[10px] text-charcoal-muted block">~23/min Live Event Rate</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-agriBorder shadow-sm">
          <span className="text-[10px] font-bold uppercase text-charcoal-muted block">Avg Interval</span>
          <span className="text-xl sm:text-2xl font-black text-forest block mt-0.5">2.6s</span>
          <span className="text-[10px] text-agriGreen font-bold block">{lastEventAgo}s ago last</span>
        </div>
      </div>

      {/* 3. MOBILE SYSTEM GRAPH BANNER & DESKTOP GRAPH (Requirement 16) */}
      <div className="block lg:hidden bg-white p-4 rounded-2xl border border-agriBorder shadow-card space-y-3">
        <div className="flex items-center justify-between border-b border-cream pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-agriGreen animate-ping" />
            <h3 className="text-sm font-black text-charcoal">AgriOS Intelligence Graph</h3>
          </div>
          <span className="text-[10px] font-bold text-forest bg-agriGreen-light px-2 py-0.5 rounded-full">
            10 DOMAINS
          </span>
        </div>

        {/* Simplified Mobile Flow Diagram (Requirement 16) */}
        <div className="p-3 bg-cream rounded-xl text-center space-y-1 text-xs">
          <div className="flex items-center justify-center gap-2 font-bold text-forest">
            <span>Sensors & Weather</span>
            <span>→</span>
            <span className="px-2 py-0.5 bg-forest text-white rounded-lg">AgriOS Core</span>
            <span>→</span>
            <span>Farmer / Buyer</span>
          </div>
        </div>

        <button
          onClick={() => setIsGraphModalOpen(true)}
          className="w-full min-touch py-2.5 bg-forest text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
        >
          <Eye className="w-4 h-4 text-freshGreen" />
          <span>Open Full Interactive System Map</span>
        </button>
      </div>

      <div className="hidden lg:block">
        <AgriOSIntelligenceGraph
          onSelectDomain={(dom) => setSelectedDomain(dom)}
          onOpenArchitecture={() => setIsArchOpen(true)}
        />
      </div>

      {/* 4. REAL-TIME LIVE EVENT TIMELINE (Requirement 15) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-agriBorder shadow-card space-y-3">
        <div className="flex items-center justify-between border-b border-cream pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-forest animate-pulse" />
            <h3 className="text-sm sm:text-base font-black text-charcoal">Live Kafka Event Stream</h3>
          </div>
          <button
            onClick={() => setShowAllEventsMobile(!showAllEventsMobile)}
            className="text-xs font-bold text-forest hover:text-agriGreen"
          >
            {showAllEventsMobile ? 'Show Less' : 'View Full Stream →'}
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {visibleMobileEvents.map((evt) => (
            <div 
              key={evt.id} 
              className="p-3 bg-cream/70 rounded-xl border border-agriBorder space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-charcoal-muted font-bold">{evt.timestamp}</span>
                  <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded bg-white text-forest border border-agriBorder">
                    {evt.agentName}
                  </span>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.2 rounded-full ${
                  evt.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {evt.status}
                </span>
              </div>

              <p className="font-bold text-charcoal text-[11px] leading-snug">
                {evt.summary}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-agriBorder/40 text-[10px]">
                <span className="font-mono text-charcoal-muted truncate max-w-[180px]">
                  {evt.topic}
                </span>
                <button
                  onClick={() => setExplainCrop({ open: true, crop: 'Tomato', rec: evt.summary })}
                  className="text-forest font-bold flex items-center gap-0.5"
                >
                  Why? <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. 24 AUTONOMOUS DOMAIN AGENTS (Requirement 14, 15) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-agriBorder shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cream pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-charcoal">24 Autonomous Domain Agents</h2>
            <p className="text-xs text-charcoal-muted">Tap any agent card to inspect telemetry & tasks</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-cream border border-agriBorder rounded-xl pl-8 pr-3 py-1.5 text-xs font-semibold text-charcoal focus:outline-none w-full sm:w-56"
            />
          </div>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
          {domainsList.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedDomain === dom
                  ? 'bg-forest text-white shadow-sm'
                  : 'bg-cream text-charcoal border border-agriBorder'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>

        {/* AGENTS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAgents.map((ag) => (
            <div
              key={ag.id}
              onClick={() => setSelectedAgentDetail(ag)}
              className="bg-cream/60 hover:bg-cream rounded-2xl p-3.5 sm:p-4 border border-agriBorder transition-all cursor-pointer space-y-2 active:scale-98"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white text-forest border border-agriBorder">
                  {ag.domain}
                </span>
                <span className="text-[10px] font-extrabold text-agriGreen">
                  ● {ag.confidence}% CONF
                </span>
              </div>

              <h3 className="text-sm font-black text-charcoal truncate">{ag.name}</h3>
              <p className="text-xs text-charcoal-muted line-clamp-2 leading-tight">{ag.task}</p>

              <div className="p-2 bg-white rounded-xl border border-agriBorder text-[11px] font-bold text-forest truncate">
                {ag.recommendation}
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px] text-charcoal-muted">
                <span>Consumed: {ag.eventsConsumed}</span>
                <span className="font-bold text-forest flex items-center gap-0.5">
                  Inspect <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. 135 TOPICS DIRECTORY LIST */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-agriBorder shadow-card space-y-3">
        <div className="flex items-center justify-between border-b border-cream pb-2.5">
          <div>
            <h2 className="text-base font-black text-charcoal">Event Topic Architecture</h2>
            <p className="text-xs text-charcoal-muted">{filteredTopics.length} Topics across 10 Domains</p>
          </div>
          <span className="text-[11px] font-mono font-bold text-forest bg-agriGreen-light px-2.5 py-0.5 rounded-full">
            1,420 Partitions
          </span>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
          {filteredTopics.map((top) => (
            <div key={top.id} className="p-2.5 bg-cream/70 rounded-xl border border-agriBorder flex items-center justify-between text-xs gap-2">
              <div className="min-w-0">
                <span className="font-mono font-bold text-forest text-[11px] block truncate">{top.id}</span>
                <span className="text-[10px] text-charcoal-muted block truncate">{top.description}</span>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-white border shrink-0">
                {top.domain}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AGENT DETAIL BOTTOM SHEET MODAL (Requirement 14) */}
      {selectedAgentDetail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-t-[2rem] sm:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 shadow-modal border border-agriBorder relative space-y-4 pb-safe">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />
            <button
              onClick={() => setSelectedAgentDetail(null)}
              className="min-touch absolute top-4 right-4 text-charcoal-muted hover:text-charcoal p-2 rounded-full hover:bg-cream"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded bg-agriGreen-light text-forest border border-agriGreen-accent/30">
                {selectedAgentDetail.domain} DOMAIN
              </span>
              <h3 className="text-lg font-black text-charcoal">{selectedAgentDetail.name}</h3>
              <span className="text-xs text-agriGreen font-black block">● ACTIVE AGENT ({selectedAgentDetail.confidence}% CONFIDENCE)</span>
            </div>

            <div className="p-3 bg-cream rounded-xl border border-agriBorder text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Current Task:</span>
              <p className="font-bold text-charcoal">{selectedAgentDetail.task}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-center">
              <div className="p-2.5 bg-cream rounded-xl border">
                <span className="text-[10px] text-charcoal-muted block">Events Consumed</span>
                <span className="font-black text-charcoal text-sm">{selectedAgentDetail.eventsConsumed}</span>
              </div>
              <div className="p-2.5 bg-cream rounded-xl border">
                <span className="text-[10px] text-charcoal-muted block">Events Produced</span>
                <span className="font-black text-charcoal text-sm">{selectedAgentDetail.eventsProduced}</span>
              </div>
            </div>

            <div className="p-3 bg-forest text-white rounded-xl space-y-1 text-xs">
              <span className="text-[9px] font-black uppercase tracking-wider text-amberGold block">Latest Output Recommendation:</span>
              <p className="font-bold text-white text-xs">{selectedAgentDetail.recommendation}</p>
            </div>

            <button
              onClick={() => setSelectedAgentDetail(null)}
              className="w-full min-touch py-2.5 bg-forest text-white text-xs font-bold rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* FULL SYSTEM MAP MODAL */}
      {isGraphModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-charcoal/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 relative space-y-4">
            <button
              onClick={() => setIsGraphModalOpen(false)}
              className="min-touch absolute top-4 right-4 text-charcoal-muted hover:text-charcoal p-2 rounded-full hover:bg-cream"
            >
              <X className="w-5 h-5" />
            </button>

            <AgriOSIntelligenceGraph
              onSelectDomain={(dom) => {
                setSelectedDomain(dom);
                setIsGraphModalOpen(false);
              }}
              onOpenArchitecture={() => {
                setIsGraphModalOpen(false);
                setIsArchOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* GLOBAL MODALS */}
      <AgriOSArchitectureModal isOpen={isArchOpen} onClose={() => setIsArchOpen(false)} />
      <AgriOSReviewQueueModal 
        isOpen={isReviewOpen} 
        onClose={() => setIsReviewOpen(false)} 
        onActionProcessed={() => setReviewCount(prev => Math.max(0, prev - 1))}
      />
      <AgriOSExplainModal 
        isOpen={explainCrop.open} 
        onClose={() => setExplainCrop({ open: false, crop: 'Tomato' })}
        crop={explainCrop.crop}
        recommendation={explainCrop.rec}
      />

    </div>
  );
};
