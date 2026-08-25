import React, { useState } from 'react';
import { X, Layers, ShieldCheck, Cpu, ArrowDown, Activity, CheckCircle2, AlertTriangle, Users, Building2, Truck } from 'lucide-react';

export const AgriOSArchitectureModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [selectedLayer, setSelectedLayer] = useState<number>(0);

  if (!isOpen) return null;

  const ARCH_LAYERS = [
    {
      id: 0,
      title: "1. Real-World Signals & Ingestion",
      subtitle: "AWS Weather Stations • APMC Mandis • Soil Sensors • Satellite Imagery • GPS Telemetry",
      badge: "DATA SOURCES",
      color: "bg-cyan-50 border-cyan-200 text-cyan-900",
      description: "Continuously captures telemetry from IoT field sensors, Sentinel-2 multispectral satellites, Doppler radar, government APMC e-NAM portals, and freight telematics.",
      specs: [
        "IoT Ingestion: 100 Hz MQTT / HTTP gateways",
        "Spatial Resolution: 10m multispectral NDVI",
        "Market Polling: 30-sec APMC ticker updates",
        "Edge Filtering: Anomalous spike rejection at source"
      ]
    },
    {
      id: 1,
      title: "2. Kafka / Redpanda Event Bus (128+ Topics)",
      subtitle: "10 Logical Domains • 1,400+ Active Partitions • ~2.6s Interval",
      badge: "EVENT STREAM",
      color: "bg-amber-50 border-amber-200 text-amber-900",
      description: "Distributed, immutable event log partitioned across Market, Weather, Soil, Water, Crop, Logistics, Livestock, Marketplace, Knowledge, and Safety domains.",
      specs: [
        "Throughput: ~23 events/min (Demo) / 50K msg/sec (Prod)",
        "Partition Strategy: Keyed by farmer_id, lot_id, mandi_id",
        "Retention: 24h to 30 days based on domain velocity",
        "Failover: Multi-AZ consumer group rebalancing"
      ]
    },
    {
      id: 2,
      title: "3. 24 Autonomous Domain Agents",
      subtitle: "Decoupled Event Consumers & Producers • Specific Agronomic Intelligence",
      badge: "AGENTIC LAYER",
      color: "bg-purple-50 border-purple-200 text-purple-900",
      description: "Independent autonomous workers that consume real-time domain events, run specialized algorithms (econometrics, evapotranspiration, pathogen risk, OCR assay), and publish enriched recommendations.",
      specs: [
        "Market Intelligence: Price arbitrage & demand forecast",
        "Agronomy & Disease: Microclimate pathogen curves",
        "Logistics & Cold Chain: Turnaround & re-routing",
        "Quality Grading: Computer vision produce assay"
      ]
    },
    {
      id: 3,
      title: "4. AgriOS Intelligence Core",
      subtitle: "Multi-Agent Synthesis • Cross-Domain Correlation Engine",
      badge: "SYNTHESIS CORE",
      color: "bg-green-50 border-green-200 text-forest",
      description: "The central intelligence hub that correlates signals from different domains (e.g. rain forecast + harvest maturity + mandi supply shortage) to compute holistic net realization recommendations.",
      specs: [
        "Cross-Domain Synthesis: Rain + Market + Logistics alignment",
        "Optimization Goal: Maximize farmer net realization (₹/kg)",
        "Transparency: Explainable AI attribution vectors",
        "Confidence Scoring: Multi-factor probabilistic modeling"
      ]
    },
    {
      id: 4,
      title: "5. AgriOS Safety & Policy Layer",
      subtitle: "Automated Guardrails • Toxic Chemical Filters • Human-in-the-Loop Queue",
      badge: "SAFETY GATEWAY",
      color: "bg-rose-50 border-rose-200 text-rose-900",
      description: "Strict safety boundary that classifies all agent actions into APPROVED, HUMAN REVIEW, or BLOCKED. Consequential actions (chemical spray, large contracts) are never executed without human approval.",
      specs: [
        "Three-Tier Gate: Approved / Human Review / Blocked",
        "Audit Ledger: Immutable log of all AI suggestions and human reviews",
        "MRL & Chemical Guard: Statutory toxic dosage screening",
        "Fraud Barrier: Counterparty default & phantom lot circuit breaker"
      ]
    },
    {
      id: 5,
      title: "6. Stakeholder Execution Layer",
      subtitle: "Farmer Mobile App • Buyer Procurement Portal • FPO Aggregator • Logistics Dashboard",
      badge: "ACTION & VALUE",
      color: "bg-blue-50 border-blue-200 text-blue-900",
      description: "Delivers actionable, explainable recommendations, binding buyer offers, escrow payments, and navigation routes to farmers, institutional buyers, and logistics drivers.",
      specs: [
        "Farmer App: Multilingual voice & chat advisories",
        "Buyer Matching: Direct farmgate procurement",
        "FPO Bulk Pooling: Aggregate volume bargaining",
        "Escrow Settlement: Instant 24-hr payment release"
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-modal border border-agriBorder relative space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-cream pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-forest text-white flex items-center justify-center font-black">
              <Cpu className="w-6 h-6 text-freshGreen" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-charcoal">AgriOS End-to-End Architecture</h2>
              <p className="text-xs text-charcoal-muted mt-0.5">Event-driven Autonomous Intelligence Operating System Specification</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-charcoal-muted hover:text-charcoal p-2 rounded-full hover:bg-cream transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIPELINE VISUAL FLOW */}
        <div className="space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-forest block">
            End-to-End Autonomous Pipeline Chain
          </span>

          <div className="space-y-2.5">
            {ARCH_LAYERS.map((layer, index) => {
              const isSelected = selectedLayer === layer.id;
              return (
                <div key={layer.id}>
                  <div
                    onClick={() => setSelectedLayer(layer.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? `${layer.color} shadow-md scale-[1.01]`
                        : 'bg-white hover:bg-cream border-agriBorder'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/80 border border-current shadow-sm">
                          {layer.badge}
                        </span>
                        <h4 className="text-sm font-black">{layer.title}</h4>
                      </div>
                      <p className="text-xs text-charcoal-muted font-medium">{layer.subtitle}</p>
                    </div>

                    <span className="text-xs font-bold shrink-0">
                      {isSelected ? "▼ Expanded Specs" : "▶ Click to Inspect"}
                    </span>
                  </div>

                  {/* Expanded Layer Specs */}
                  {isSelected && (
                    <div className="mt-2 p-5 bg-cream/70 rounded-2xl border border-agriBorder space-y-3 text-xs animate-fadeIn">
                      <p className="text-charcoal font-medium leading-relaxed">{layer.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-agriBorder/60">
                        {layer.specs.map((sp, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-agriBorder">
                            <CheckCircle2 className="w-4 h-4 text-agriGreen shrink-0" />
                            <span className="font-semibold text-charcoal text-[11px]">{sp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Flow Arrow */}
                  {index < ARCH_LAYERS.length - 1 && (
                    <div className="flex justify-center my-1 text-forest">
                      <ArrowDown className="w-4 h-4 opacity-40" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* PRODUCTION INTEGRATION GUARANTEES */}
        <div className="p-4 bg-forest text-white rounded-2xl space-y-2 text-xs">
          <span className="text-[10px] font-black uppercase text-amberGold tracking-wider block">
            Production Readiness & Extensibility Note
          </span>
          <p className="text-white/80 leading-relaxed">
            The AgriOS event bus is decoupled from the UI. Connecting an enterprise Apache Kafka cluster or Redpanda instance automatically flips the state from <span className="font-bold text-amberGold">LIVE SIMULATION</span> to <span className="font-bold text-freshGreen">LIVE STREAM</span> without modifying application logic.
          </p>
        </div>

      </div>
    </div>
  );
};
