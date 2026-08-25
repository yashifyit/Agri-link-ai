import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, TrendingUp, AlertTriangle, Building2, Truck, 
  CheckCircle, Radio, Activity, Eye, ShieldAlert, Sparkles, Navigation, Layers, ZoomIn
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MarketNode {
  id: string;
  name: string;
  region: string;
  type: 'MARKET' | 'BUYER' | 'FPO' | 'ANOMALY';
  crop: string;
  price: number;
  benchmarkPrice?: number;
  anomaly?: string;
  lat: number;
  lng: number;
  distanceFromOrigin?: number;
  details: string;
  arrivalTons?: number;
}

export const MAP_NODES: MarketNode[] = [
  // Uttar Pradesh Corridor
  {
    id: 'up-1',
    name: 'Kanpur Mandi (APMC)',
    region: 'Uttar Pradesh',
    type: 'MARKET',
    crop: 'Tomato & Potato',
    price: 28,
    lat: 26.4499,
    lng: 80.3319,
    distanceFromOrigin: 0,
    arrivalTons: 45,
    details: 'Primary regional aggregation mandi with electronic auction yard.'
  },
  {
    id: 'up-2',
    name: 'Unnao Mandi',
    region: 'Uttar Pradesh',
    type: 'MARKET',
    crop: 'Tomato & Vegetables',
    price: 30,
    lat: 26.5393,
    lng: 80.4878,
    distanceFromOrigin: 18,
    arrivalTons: 30,
    details: 'Transit mandi connecting Kanpur to Lucknow capital highway corridor.'
  },
  {
    id: 'up-3',
    name: 'Lucknow Hub (FreshHarvest Foods)',
    region: 'Uttar Pradesh',
    type: 'BUYER',
    crop: 'Tomato & Green Chilli',
    price: 33,
    lat: 26.8467,
    lng: 80.9462,
    distanceFromOrigin: 42,
    arrivalTons: 120,
    details: 'Verified mega food processing facility. 24-hr payment escrow guarantee.'
  },
  {
    id: 'up-4',
    name: 'Varanasi Cold Corridor',
    region: 'Uttar Pradesh',
    type: 'ANOMALY',
    crop: 'Tomato & Perishables',
    price: 39,
    benchmarkPrice: 29,
    anomaly: '+34.5% Supply Squeeze Anomaly Detected',
    lat: 25.3176,
    lng: 82.9739,
    distanceFromOrigin: 310,
    arrivalTons: 12,
    details: 'Sudden wholesale arrival drop causing severe price deviation spike.'
  },

  // Maharashtra Corridor
  {
    id: 'mh-1',
    name: 'Nashik Hub (Sahyadri FPO)',
    region: 'Maharashtra',
    type: 'FPO',
    crop: 'Onion & Pomegranate',
    price: 33,
    lat: 19.9975,
    lng: 73.7898,
    distanceFromOrigin: 1200,
    arrivalTons: 210,
    details: '2,500+ farmer cooperative aggregation hub with cold chain sorting lines.'
  },
  {
    id: 'mh-2',
    name: 'Pune APMC Hub',
    region: 'Maharashtra',
    type: 'MARKET',
    crop: 'Onion, Tomato, Soybean',
    price: 35,
    lat: 18.5204,
    lng: 73.8567,
    distanceFromOrigin: 1350,
    arrivalTons: 340,
    details: 'Central wholesale trading exchange connecting Western Ghats growers.'
  },
  {
    id: 'mh-3',
    name: 'Kolhapur APMC',
    region: 'Maharashtra',
    type: 'ANOMALY',
    crop: 'Tomato & Chili',
    price: 41,
    benchmarkPrice: 31,
    anomaly: '+32.3% Price Spike Deviation Detected',
    lat: 16.7050,
    lng: 74.2433,
    distanceFromOrigin: 1520,
    arrivalTons: 15,
    details: 'Unusual demand spike from coastal Karnataka processing buyers.'
  },
  {
    id: 'mh-4',
    name: 'Baramati Agri FPO Hub',
    region: 'Maharashtra',
    type: 'FPO',
    crop: 'Grapes & Sugarcane',
    price: 34,
    lat: 18.1517,
    lng: 74.5772,
    distanceFromOrigin: 1410,
    arrivalTons: 180,
    details: 'Integrated farmer producer collective with high-tech storage.'
  },
  {
    id: 'mh-5',
    name: 'Nagpur Market Corridor',
    region: 'Maharashtra',
    type: 'MARKET',
    crop: 'Orange & Soybean',
    price: 34,
    lat: 21.1458,
    lng: 79.0882,
    distanceFromOrigin: 850,
    arrivalTons: 160,
    details: 'Central India citrus and oilseeds distribution hub.'
  }
];

export const MaharashtraMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const [selectedNode, setSelectedNode] = useState<MarketNode>(MAP_NODES[2]); // FreshHarvest Lucknow default
  const [filterType, setFilterType] = useState<string>('ALL');
  const [activeRegion, setActiveRegion] = useState<'ALL' | 'UP' | 'MH'>('ALL');
  const [livePulseTick, setLivePulseTick] = useState<number>(0);

  // Live telemetry pulse ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePulseTick(prev => prev + 1);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Center on India agricultural corridor (UP & MH)
    const map = L.map(mapContainerRef.current, {
      center: [22.8, 77.5],
      zoom: 5.5,
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: false
    });

    // High quality Voyager TileLayer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Draw Corridors Polyline
    // UP Corridor: Kanpur -> Unnao -> Lucknow
    const upCoords: [number, number][] = [
      [26.4499, 80.3319],
      [26.5393, 80.4878],
      [26.8467, 80.9462]
    ];
    L.polyline(upCoords, {
      color: '#16a34a',
      weight: 3,
      dashArray: '6, 6',
      opacity: 0.8
    }).addTo(map);

    // MH Corridor: Nashik -> Pune -> Baramati -> Kolhapur
    const mhCoords: [number, number][] = [
      [19.9975, 73.7898],
      [18.5204, 73.8567],
      [18.1517, 74.5772],
      [16.7050, 74.2433]
    ];
    L.polyline(mhCoords, {
      color: '#8b5cf6',
      weight: 3,
      dashArray: '6, 6',
      opacity: 0.8
    }).addTo(map);

    // Render Markers
    MAP_NODES.forEach((node) => {
      let pinColor = '#16a34a'; // Mandi green
      let label = 'MANDI';
      let iconHtml = '🌾';

      if (node.type === 'BUYER') {
        pinColor = '#2563eb'; // Blue
        label = 'BUYER';
        iconHtml = '🏢';
      } else if (node.type === 'FPO') {
        pinColor = '#7c3aed'; // Purple
        label = 'FPO';
        iconHtml = '🚜';
      } else if (node.type === 'ANOMALY') {
        pinColor = '#d97706'; // Amber / Red
        label = 'ANOMALY';
        iconHtml = '⚠️';
      }

      const isAnomaly = node.type === 'ANOMALY';

      const customIcon = L.divIcon({
        className: 'custom-agri-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            ${isAnomaly ? '<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(245, 158, 11, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${pinColor}; color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid white; z-index: 10;">
              ${iconHtml}
            </div>
            <div style="margin-top: 2px; background: rgba(26, 46, 34, 0.9); color: #fff; font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: 9999px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              ₹${node.price}/kg
            </div>
          </div>
        `,
        iconSize: [40, 48],
        iconAnchor: [20, 24]
      });

      const marker = L.marker([node.lat, node.lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setSelectedNode(node);
      });

      markersRef.current[node.id] = marker;
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update zoom and view when activeRegion changes
  const handleRegionChange = (region: 'ALL' | 'UP' | 'MH') => {
    setActiveRegion(region);
    if (!mapInstanceRef.current) return;

    if (region === 'ALL') {
      mapInstanceRef.current.flyTo([22.8, 77.5], 5.5, { duration: 1.2 });
    } else if (region === 'UP') {
      mapInstanceRef.current.flyTo([26.6, 81.0], 7.5, { duration: 1.2 });
    } else if (region === 'MH') {
      mapInstanceRef.current.flyTo([18.6, 74.5], 7, { duration: 1.2 });
    }
  };

  const handleSelectNode = (node: MarketNode) => {
    setSelectedNode(node);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([node.lat, node.lng], 8.5, { duration: 1 });
    }
  };

  const filteredNodes = MAP_NODES.filter(n => {
    const matchesType = filterType === 'ALL' || n.type === filterType;
    const matchesRegion = activeRegion === 'ALL' || 
                          (activeRegion === 'UP' && n.region.includes('Uttar Pradesh')) ||
                          (activeRegion === 'MH' && n.region.includes('Maharashtra'));
    return matchesType && matchesRegion;
  });

  const anomalyNodes = MAP_NODES.filter(n => n.type === 'ANOMALY');

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-agriBorder shadow-card p-4 sm:p-6 space-y-4 text-charcoal">
      
      {/* 1. HEADER & LIVE MONITORING STATUS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-cream pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-agriGreen-light text-forest text-[10px] font-black border border-agriGreen-accent/30">
              <Radio className="w-3 h-3 text-agriGreen animate-pulse" />
              LIVE TELEMETRY ACTIVE
            </span>
            <span className="text-xs font-bold text-charcoal-muted">
              Leaflet Geospatial Stream
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-charcoal mt-1">
            Regional Agriculture & Market Activity Map
          </h2>
          <p className="text-xs text-charcoal-muted">
            Interactive trading hubs, verified processors & price anomalies across Maharashtra & Uttar Pradesh corridors
          </p>
        </div>

        {/* Region View Switches */}
        <div className="flex items-center bg-cream p-1 rounded-xl border border-agriBorder gap-1 self-start lg:self-auto">
          <button
            onClick={() => handleRegionChange('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeRegion === 'ALL' ? 'bg-forest text-white shadow-sm' : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            All Corridors
          </button>
          <button
            onClick={() => handleRegionChange('UP')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeRegion === 'UP' ? 'bg-forest text-white shadow-sm' : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Uttar Pradesh Belt
          </button>
          <button
            onClick={() => handleRegionChange('MH')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeRegion === 'MH' ? 'bg-forest text-white shadow-sm' : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Maharashtra Belt
          </button>
        </div>
      </div>

      {/* 2. LEGEND / FILTER BUTTONS */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: `All Hubs (${MAP_NODES.length})` },
            { id: 'MARKET', label: 'Mandis (4)' },
            { id: 'BUYER', label: 'Verified Buyers (1)' },
            { id: 'FPO', label: 'FPO Hubs (2)' },
            { id: 'ANOMALY', label: 'Price Anomalies (2)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1 rounded-xl font-bold transition-all text-xs ${
                filterType === tab.id
                  ? 'bg-charcoal text-white shadow-sm'
                  : 'bg-cream text-charcoal-muted hover:text-charcoal border border-agriBorder'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Live Anomaly Detection Badge */}
        <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 text-[11px] font-bold text-amber-900">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>2 Regional Anomalies Monitored</span>
        </div>
      </div>

      {/* 3. MAP & DETAIL PANEL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* LEAFLET MAP CONTAINER (2 Cols) */}
        <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border border-agriBorder shadow-sm h-[380px] sm:h-[440px] bg-cream">
          <div ref={mapContainerRef} className="w-full h-full z-0" />
          
          {/* Map Overlay Quick Indicator */}
          <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-agriBorder text-xs shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-agriGreen animate-ping" />
            <span className="font-extrabold text-charcoal">Live Geospatial Monitoring</span>
          </div>

          <div className="absolute bottom-3 right-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-agriBorder text-[11px] font-bold text-charcoal-muted shadow-sm">
            Corridors: Green (UP) • Purple (MH)
          </div>
        </div>

        {/* RIGHT COLUMN: SELECTED HUB DETAIL & LIVE ANOMALY DETECTOR */}
        <div className="space-y-3 flex flex-col justify-between">
          
          {/* SELECTED HUB CARD */}
          <div className="bg-cream/70 rounded-2xl p-4 sm:p-5 border border-agriBorder space-y-3">
            <div className="flex items-center justify-between border-b border-agriBorder/60 pb-2.5">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                selectedNode.type === 'BUYER' ? 'bg-blue-100 text-blue-800' :
                selectedNode.type === 'FPO' ? 'bg-purple-100 text-purple-800' :
                selectedNode.type === 'ANOMALY' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                'bg-green-100 text-green-800'
              }`}>
                {selectedNode.type} HUB
              </span>
              <span className="text-[11px] font-bold text-charcoal-muted">{selectedNode.region}</span>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-black text-charcoal">{selectedNode.name}</h4>
              <p className="text-[11px] text-charcoal-muted mt-0.5">{selectedNode.crop} Primary Focus</p>
            </div>

            {/* Price & Benchmark */}
            <div className="p-3 bg-white rounded-xl border border-agriBorder flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Current Benchmark</span>
                <span className="text-xl font-black text-forest">₹{selectedNode.price}.00 <span className="text-xs font-medium text-charcoal-muted">/ kg</span></span>
              </div>
              {selectedNode.arrivalTons && (
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Arrival Vol</span>
                  <span className="text-sm font-bold text-charcoal">{selectedNode.arrivalTons} Tons/day</span>
                </div>
              )}
            </div>

            {/* Anomaly Callout if flagged */}
            {selectedNode.anomaly && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{selectedNode.anomaly}</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-tight">
                  State modal benchmark is ₹{selectedNode.benchmarkPrice || 31}/kg. Arbitrage opportunity flagged for regional dispatch.
                </p>
              </div>
            )}

            <p className="text-[11px] text-charcoal-muted leading-relaxed">
              {selectedNode.details}
            </p>

            <div className="pt-2 border-t border-agriBorder/60 flex items-center justify-between text-xs font-bold text-forest">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-agriGreen" /> Verified Hub Telemetry
              </span>
              <span>{selectedNode.distanceFromOrigin} km distance</span>
            </div>
          </div>

          {/* QUICK HUB SELECTOR LIST */}
          <div className="bg-white rounded-2xl p-3 border border-agriBorder shadow-sm space-y-2">
            <span className="text-[10px] font-black uppercase text-charcoal tracking-wider block">
              Quick Hub Jump:
            </span>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {filteredNodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => handleSelectNode(node)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                    selectedNode.id === node.id
                      ? 'bg-forest text-white shadow-sm'
                      : 'bg-cream text-charcoal hover:bg-cream-dark border border-agriBorder'
                  }`}
                >
                  {node.type === 'ANOMALY' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  <span>{node.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
