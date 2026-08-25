import React, { useState, useEffect } from 'react';
import { 
  CloudRain, Sprout, Droplets, Leaf, TrendingUp, 
  Building2, Users, Activity, Truck, BookOpen, ShieldCheck,
  Cpu, Zap, ArrowRight, Layers, CheckCircle2, ChevronRight
} from 'lucide-react';
import { KAFKA_TOPICS, DOMAIN_AGENTS_INITIAL, DomainAgent, KafkaTopic } from '../services/agriOsEventService';

export interface IntelligenceGraphProps {
  activeDomain?: string | null;
  onSelectDomain?: (domain: string) => void;
  onOpenArchitecture?: () => void;
}

interface DomainNode {
  id: string;
  label: string;
  domain: string;
  icon: any;
  angle: number; // degrees
  color: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
}

const DOMAIN_NODES: DomainNode[] = [
  { id: 'WEATHER', label: 'Weather', domain: 'WEATHER', icon: CloudRain, angle: 0, color: 'text-cyan-500', bgLight: 'bg-cyan-50', borderColor: 'border-cyan-200', textColor: 'text-cyan-800' },
  { id: 'SOIL', label: 'Soil', domain: 'SOIL', icon: Sprout, angle: 36, color: 'text-amber-600', bgLight: 'bg-amber-50', borderColor: 'border-amber-200', textColor: 'text-amber-800' },
  { id: 'WATER', label: 'Water', domain: 'WATER', icon: Droplets, angle: 72, color: 'text-sky-500', bgLight: 'bg-sky-50', borderColor: 'border-sky-200', textColor: 'text-sky-800' },
  { id: 'CROP', label: 'Crops', domain: 'CROP', icon: Leaf, angle: 108, color: 'text-emerald-500', bgLight: 'bg-emerald-50', borderColor: 'border-emerald-200', textColor: 'text-emerald-800' },
  { id: 'MARKET', label: 'Markets', domain: 'MARKET', icon: TrendingUp, angle: 144, color: 'text-agriGreen', bgLight: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-forest' },
  { id: 'BUYERS', label: 'Buyers', domain: 'MARKETPLACE', icon: Building2, angle: 180, color: 'text-indigo-500', bgLight: 'bg-indigo-50', borderColor: 'border-indigo-200', textColor: 'text-indigo-800' },
  { id: 'FARMERS', label: 'Farmers', domain: 'MARKETPLACE', icon: Users, angle: 216, color: 'text-orange-500', bgLight: 'bg-orange-50', borderColor: 'border-orange-200', textColor: 'text-orange-800' },
  { id: 'LIVESTOCK', label: 'Livestock', domain: 'LIVESTOCK', icon: Activity, angle: 252, color: 'text-purple-500', bgLight: 'bg-purple-50', borderColor: 'border-purple-200', textColor: 'text-purple-800' },
  { id: 'LOGISTICS', label: 'Logistics', domain: 'LOGISTICS', icon: Truck, angle: 288, color: 'text-rose-500', bgLight: 'bg-rose-50', borderColor: 'border-rose-200', textColor: 'text-rose-800' },
  { id: 'KNOWLEDGE', label: 'Knowledge', domain: 'KNOWLEDGE', icon: BookOpen, angle: 324, color: 'text-teal-500', bgLight: 'bg-teal-50', borderColor: 'border-teal-200', textColor: 'text-teal-800' }
];

export const AgriOSIntelligenceGraph: React.FC<IntelligenceGraphProps> = ({
  activeDomain,
  onSelectDomain,
  onOpenArchitecture
}) => {
  const [selectedNode, setSelectedNode] = useState<DomainNode>(DOMAIN_NODES[0]);
  const [pulsingDomain, setPulsingDomain] = useState<string | null>(null);

  // Sync if activeDomain prop updates
  useEffect(() => {
    if (activeDomain) {
      const found = DOMAIN_NODES.find(n => n.id === activeDomain || n.domain === activeDomain);
      if (found) {
        setSelectedNode(found);
        setPulsingDomain(found.id);
        const timer = setTimeout(() => setPulsingDomain(null), 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [activeDomain]);

  // Radius for circular layout
  const radius = 175;
  const centerX = 240;
  const centerY = 240;

  // Filter topics and agents for selected domain
  const domainTopics = KAFKA_TOPICS.filter(t => t.domain === selectedNode.domain);
  const domainAgents = DOMAIN_AGENTS_INITIAL.filter(a => a.domain === selectedNode.domain);

  const handleNodeClick = (node: DomainNode) => {
    setSelectedNode(node);
    setPulsingDomain(node.id);
    if (onSelectDomain) {
      onSelectDomain(node.domain);
    }
    setTimeout(() => setPulsingDomain(null), 1200);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-agriBorder shadow-card space-y-5 flex flex-col justify-between">
      
      {/* HEADER & CONTROLS */}
      <div className="flex items-center justify-between border-b border-cream pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-agriGreen animate-ping" />
            <h3 className="text-base font-black text-charcoal">AgriOS Live Intelligence Graph</h3>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">Continuous event bus orchestration across 10 agricultural domains</p>
        </div>

        {onOpenArchitecture && (
          <button
            onClick={onOpenArchitecture}
            className="px-3 py-1.5 bg-cream hover:bg-forest hover:text-white border border-agriBorder rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" /> Full Pipeline Specs
          </button>
        )}
      </div>

      {/* GRAPH CANVAS & DRILL-DOWN PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* SVG GRAPH AREA */}
        <div className="lg:col-span-7 flex justify-center items-center py-2 relative">
          <svg viewBox="0 0 480 480" className="w-full max-w-[420px] aspect-square overflow-visible">
            
            {/* Background Orbit Guide Rings */}
            <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx={centerX} cy={centerY} r={radius * 0.55} fill="none" stroke="#F3F4F6" strokeWidth="1" />

            {/* Dynamic Connecting Lines from Center Core to Domain Nodes */}
            {DOMAIN_NODES.map((node) => {
              const rad = (node.angle * Math.PI) / 180;
              const x = centerX + radius * Math.cos(rad);
              const y = centerY + radius * Math.sin(rad);
              const isSelected = selectedNode.id === node.id;
              const isPulsing = pulsingDomain === node.id;

              return (
                <g key={`line-${node.id}`}>
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke={isSelected ? '#1B4332' : isPulsing ? '#2D6A4F' : '#E2E8F0'}
                    strokeWidth={isSelected || isPulsing ? '2.5' : '1.2'}
                    strokeDasharray={isSelected ? 'none' : '3 3'}
                    className="transition-all duration-300"
                  />
                  {/* Moving Particle Pulse on Event */}
                  {(isSelected || isPulsing) && (
                    <circle r="3.5" fill="#52B788" className="animate-pulse">
                      <animateMotion
                        path={`M ${centerX} ${centerY} L ${x} ${y}`}
                        dur="1.4s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* CENTER NODE: AgriOS Intelligence Core */}
            <g
              transform={`translate(${centerX}, ${centerY})`}
              className="cursor-pointer group"
              onClick={onOpenArchitecture}
            >
              {/* Outer Glow Halo */}
              <circle r="44" fill="#2D6A4F" fillOpacity="0.1" className="animate-pulse" />
              <circle r="36" fill="#1B4332" stroke="#52B788" strokeWidth="2.5" className="shadow-lg group-hover:scale-105 transition-transform" />
              
              {/* Core Icon & Text */}
              <foreignObject x="-24" y="-24" width="48" height="48" className="pointer-events-none">
                <div className="w-full h-full flex flex-col items-center justify-center text-white">
                  <Cpu className="w-6 h-6 text-freshGreen animate-spin-slow" />
                </div>
              </foreignObject>

              <text y="4" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900" fontFamily="sans-serif">
                AgriOS
              </text>
              <text y="14" textAnchor="middle" fill="#95D5B2" fontSize="7" fontWeight="700" fontFamily="sans-serif">
                CORE
              </text>
            </g>

            {/* DOMAIN NODES IN ORBIT */}
            {DOMAIN_NODES.map((node) => {
              const rad = (node.angle * Math.PI) / 180;
              const x = centerX + radius * Math.cos(rad);
              const y = centerY + radius * Math.sin(rad);
              const isSelected = selectedNode.id === node.id;
              const isPulsing = pulsingDomain === node.id;
              const Icon = node.icon;

              return (
                <g
                  key={node.id}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer group"
                  onClick={() => handleNodeClick(node)}
                >
                  {/* Pulse Effect */}
                  {isPulsing && (
                    <circle r="26" fill="currentColor" className={`${node.color} opacity-20 animate-ping`} />
                  )}

                  {/* Node Circle */}
                  <circle
                    r={isSelected ? "22" : "18"}
                    fill="#FFFFFF"
                    stroke={isSelected ? "#1B4332" : isPulsing ? "#52B788" : "#E2E8F0"}
                    strokeWidth={isSelected ? "2.5" : "1.5"}
                    className="shadow-md transition-all duration-300 group-hover:scale-110"
                  />

                  {/* Node Icon */}
                  <foreignObject x="-10" y="-10" width="20" height="20" className="pointer-events-none">
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-forest' : node.color}`} />
                    </div>
                  </foreignObject>

                  {/* Label Text below node */}
                  <text
                    y={isSelected ? "32" : "28"}
                    textAnchor="middle"
                    fill={isSelected ? "#1B4332" : "#4B5563"}
                    fontSize={isSelected ? "9" : "8"}
                    fontWeight={isSelected ? "900" : "700"}
                    fontFamily="sans-serif"
                    className="select-none"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* RIGHT COLUMN: DOMAIN INSPECTOR CARD */}
        <div className="lg:col-span-5 space-y-4 text-xs">
          <div className="p-4 bg-cream rounded-2xl border border-agriBorder space-y-3">
            <div className="flex items-center justify-between border-b border-agriBorder/60 pb-2.5">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl bg-white border border-agriBorder ${selectedNode.color}`}>
                  <selectedNode.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-charcoal">{selectedNode.label} Domain</h4>
                  <span className="text-[10px] text-charcoal-muted font-bold">Domain ID: {selectedNode.domain}</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-agriGreen-light text-forest border border-agriGreen-accent/30">
                ACTIVE BUS
              </span>
            </div>

            {/* Active Domain Agents */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Associated Autonomous Agents:</span>
              <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                {domainAgents.map(ag => (
                  <div key={ag.id} className="p-2 bg-white rounded-xl border border-agriBorder/80 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-charcoal block">{ag.name}</span>
                      <span className="text-[9px] text-charcoal-muted line-clamp-1">{ag.task}</span>
                    </div>
                    <span className="text-[9px] font-extrabold text-agriGreen shrink-0">{ag.confidence}% conf</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Kafka Topics Count & List */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase font-bold text-charcoal-muted">Subscribed Kafka Topics:</span>
                <span className="text-[10px] font-extrabold text-forest">{domainTopics.length} Topics</span>
              </div>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                {domainTopics.map(t => (
                  <span key={t.id} className="px-2 py-0.5 bg-white border border-agriBorder font-mono text-[9px] text-charcoal-muted rounded-md">
                    {t.id}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Action */}
            <button
              onClick={() => onSelectDomain && onSelectDomain(selectedNode.domain)}
              className="w-full py-2 bg-forest hover:bg-forest-light text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 mt-2"
            >
              Filter Stream for {selectedNode.label} Events <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
