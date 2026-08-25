export interface KafkaTopic {
  id: string;
  domain: 'MARKET' | 'WEATHER' | 'SOIL' | 'WATER' | 'CROP' | 'LOGISTICS' | 'LIVESTOCK' | 'MARKETPLACE' | 'KNOWLEDGE' | 'SAFETY';
  description: string;
  partitions: number;
  retention_hrs: number;
  messageCount?: number;
}

export interface DomainAgent {
  id: string;
  name: string;
  domain: 'MARKET' | 'WEATHER' | 'SOIL' | 'WATER' | 'CROP' | 'LOGISTICS' | 'LIVESTOCK' | 'MARKETPLACE' | 'KNOWLEDGE' | 'SAFETY';
  status: 'ACTIVE' | 'PROCESSING' | 'IDLE' | 'ALERT';
  task: string;
  consumes: string[];
  produces: string[];
  confidence: number;
  eventsConsumed: number;
  eventsProduced: number;
  lastActivity: string;
  recommendation: string;
}

export interface AgriEvent {
  id: string;
  timestamp: string;
  agentName: string;
  domain: 'MARKET' | 'WEATHER' | 'SOIL' | 'WATER' | 'CROP' | 'LOGISTICS' | 'LIVESTOCK' | 'MARKETPLACE' | 'KNOWLEDGE' | 'SAFETY';
  topic: string;
  summary: string;
  payload: Record<string, any>;
  status: 'APPROVED' | 'HUMAN_REVIEW' | 'BLOCKED';
  confidence: number;
  causalParentId?: string;
}

export interface ReviewItem {
  id: string;
  title: string;
  domain: string;
  agent: string;
  recommendation: string;
  confidence: number;
  riskLevel: 'HIGH' | 'CONSEQUENTIAL' | 'FINANCIAL';
  submittedAt: string;
  factors: { label: string; value: string }[];
}

export interface SystemStatus {
  status: 'OPERATIONAL' | 'DEGRADED';
  mode: 'LIVE SIMULATION' | 'LIVE STREAM';
  agentCount: number;
  topicCount: number;
  eventsProcessed: number;
  avgEventIntervalSeconds: number;
  systemAvailabilityPct: number;
  activeRecommendationsCount: number;
  humanReviewQueueCount: number;
  blockedActionsCount: number;
  eventRatePerMin: number;
  lastEventSecondsAgo: number;
}

// 135 structured topics across 10 domains
export const KAFKA_TOPICS: KafkaTopic[] = [
  // MARKET (16)
  { id: "market.price.updated", domain: "MARKET", description: "Real-time modal price updates from APMC mandis", partitions: 12, retention_hrs: 72 },
  { id: "market.mandi.updated", domain: "MARKET", description: "Arrival volumes and market operational status", partitions: 8, retention_hrs: 48 },
  { id: "market.buyer.offer.created", domain: "MARKET", description: "Institutional buyer RFQ and procurement orders", partitions: 16, retention_hrs: 168 },
  { id: "market.buyer.offer.updated", domain: "MARKET", description: "Modifications to buyer purchase orders", partitions: 8, retention_hrs: 72 },
  { id: "market.buyer.offer.countered", domain: "MARKET", description: "Farmer or FPO price counteroffers", partitions: 8, retention_hrs: 72 },
  { id: "market.demand.detected", domain: "MARKET", description: "Aggregated buyer demand surge alerts", partitions: 12, retention_hrs: 96 },
  { id: "market.price.anomaly", domain: "MARKET", description: "Spike or collapse beyond 3 sigma standard deviation", partitions: 6, retention_hrs: 120 },
  { id: "market.contract.created", domain: "MARKET", description: "Direct forward contract between farmer and processor", partitions: 8, retention_hrs: 720 },
  { id: "market.contract.settled", domain: "MARKET", description: "Contract execution and milestone clearance", partitions: 8, retention_hrs: 720 },
  { id: "market.auction.started", domain: "MARKET", description: "Dynamic digital bidding session initiation", partitions: 16, retention_hrs: 24 },
  { id: "market.auction.bid.placed", domain: "MARKET", description: "Real-time bid placement stream", partitions: 32, retention_hrs: 24 },
  { id: "market.volatility.alert", domain: "MARKET", description: "High price swing warnings across regional hubs", partitions: 6, retention_hrs: 48 },
  { id: "market.arbitrage.spread.detected", domain: "MARKET", description: "Price differential between neighboring mandis after logistics", partitions: 8, retention_hrs: 48 },
  { id: "market.terminal.market.index", domain: "MARKET", description: "Macro agricultural index for national consumption hubs", partitions: 4, retention_hrs: 168 },
  { id: "market.export.parity.updated", domain: "MARKET", description: "FOB port prices and export viability margins", partitions: 4, retention_hrs: 168 },
  { id: "market.futures.basis.calculated", domain: "MARKET", description: "Spot vs futures basis convergence tracking", partitions: 4, retention_hrs: 72 },

  // WEATHER (14)
  { id: "weather.temperature.updated", domain: "WEATHER", description: "Automated Weather Station (AWS) ambient temperature", partitions: 16, retention_hrs: 48 },
  { id: "weather.rainfall.updated", domain: "WEATHER", description: "Precipitation accumulation telemetry in mm", partitions: 16, retention_hrs: 72 },
  { id: "weather.rainfall.radar.scanned", domain: "WEATHER", description: "Doppler radar storm cell velocity and reflectance", partitions: 8, retention_hrs: 24 },
  { id: "weather.forecast.updated", domain: "WEATHER", description: "24-hour hyperlocal high-resolution forecast", partitions: 12, retention_hrs: 48 },
  { id: "weather.forecast.7day.updated", domain: "WEATHER", description: "Medium range 7-day probabilistic weather outlook", partitions: 8, retention_hrs: 168 },
  { id: "weather.alert.created", domain: "WEATHER", description: "Severe agricultural weather advisory", partitions: 8, retention_hrs: 72 },
  { id: "weather.extreme-weather.detected", domain: "WEATHER", description: "Extreme climate event identification", partitions: 6, retention_hrs: 96 },
  { id: "weather.humidity.updated", domain: "WEATHER", description: "Relative humidity and vapor pressure deficit", partitions: 12, retention_hrs: 48 },
  { id: "weather.frost.warning", domain: "WEATHER", description: "Sub-zero surface temperature frost alerts", partitions: 6, retention_hrs: 48 },
  { id: "weather.wind.gust.alert", domain: "WEATHER", description: "High wind velocity warnings affecting crops", partitions: 8, retention_hrs: 24 },
  { id: "weather.hailstorm.risk", domain: "WEATHER", description: "Convective hail probability index", partitions: 6, retention_hrs: 48 },
  { id: "weather.heatwave.index", "domain": "WEATHER", description: "Cumulative degree days and thermal stress index", partitions: 6, retention_hrs: 72 },
  { id: "weather.cyclone.tracking", "domain": "WEATHER", description: "Coastal depression and cyclone path telemetry", partitions: 4, retention_hrs: 120 },
  { id: "weather.evapotranspiration.calculated", "domain": "WEATHER", description: "Penman-Monteith reference evapotranspiration (ET0)", partitions: 8, retention_hrs: 72 },

  // SOIL (13)
  { id: "soil.moisture.updated", domain: "SOIL", description: "Volumetric water content across topsoil 15cm", partitions: 16, retention_hrs: 72 },
  { id: "soil.moisture.rootzone.depleted", domain: "SOIL", description: "Permanent wilting point proximity warning", partitions: 12, retention_hrs: 48 },
  { id: "soil.ph.updated", domain: "SOIL", description: "Soil acidity/alkalinity electrode telemetry", partitions: 8, retention_hrs: 168 },
  { id: "soil.nutrients.updated", domain: "SOIL", description: "Composite NPK optical sensor absorption data", partitions: 12, retention_hrs: 168 },
  { id: "soil.nitrogen.level", domain: "SOIL", description: "Available nitrate and ammoniacal nitrogen in ppm", partitions: 8, retention_hrs: 168 },
  { id: "soil.phosphorus.level", domain: "SOIL", description: "Available phosphorus Olsen P index", partitions: 8, retention_hrs: 168 },
  { id: "soil.potassium.level", domain: "SOIL", description: "Exchangeable potassium K2O values", partitions: 8, retention_hrs: 168 },
  { id: "soil.organic-carbon.updated", domain: "SOIL", description: "Soil organic carbon (SOC) percentage index", partitions: 6, retention_hrs: 720 },
  { id: "soil.salinity.ec.updated", domain: "SOIL", description: "Electrical conductivity (dS/m) salinity level", partitions: 8, retention_hrs: 168 },
  { id: "soil.temperature.updated", domain: "SOIL", description: "Sub-surface rootzone temperature", partitions: 12, retention_hrs: 72 },
  { id: "soil.health.assessed", domain: "SOIL", description: "Composite soil fertility index scorecard", partitions: 8, retention_hrs: 720 },
  { id: "soil.microbiome.activity", domain: "SOIL", description: "Soil respiration rate and microbial biomass index", partitions: 4, retention_hrs: 360 },
  { id: "soil.compaction.alert", domain: "SOIL", description: "Penetrometer bulk density root impedance alert", partitions: 4, retention_hrs: 168 },

  // WATER (13)
  { id: "water.level.updated", domain: "WATER", description: "Farm pond and borehole static water table depth", partitions: 12, retention_hrs: 72 },
  { id: "water.irrigation.required", domain: "WATER", description: "Automated crop water deficit trigger", partitions: 16, retention_hrs: 48 },
  { id: "water.irrigation.started", domain: "WATER", description: "Pump switch-on confirmation and valve actuation", partitions: 8, retention_hrs: 48 },
  { id: "water.irrigation.completed", domain: "WATER", description: "Flow meter volume delivered confirmation", partitions: 8, retention_hrs: 72 },
  { id: "water.stress.detected", domain: "WATER", description: "Thermal crop water stress index (CWSI) breach", partitions: 12, retention_hrs: 48 },
  { id: "water.usage.updated", domain: "WATER", description: "Daily cumulative cubic meters consumed per acre", partitions: 8, retention_hrs: 168 },
  { id: "water.aquifer.depth.measured", domain: "WATER", description: "Groundwater hydrostatic sensor telemetry", partitions: 6, retention_hrs: 720 },
  { id: "water.salinity.index", domain: "WATER", description: "Irrigation water Total Dissolved Solids (TDS)", partitions: 6, retention_hrs: 168 },
  { id: "water.canal.discharge.updated", domain: "WATER", description: "Irrigation canal water release schedule", partitions: 4, retention_hrs: 168 },
  { id: "water.reservoir.capacity.updated", domain: "WATER", description: "Regional basin water storage percentage", partitions: 4, retention_hrs: 360 },
  { id: "water.drip.pressure.alert", domain: "WATER", description: "Drip lateral pressure drop or emitter clogging", partitions: 8, retention_hrs: 48 },
  { id: "water.fertigation.metered", domain: "WATER", description: "Venturi injector fertilizer dose integration", partitions: 6, retention_hrs: 72 },
  { id: "water.runoff.risk", domain: "WATER", description: "Soil infiltration excess and nutrient leaching alert", partitions: 6, retention_hrs: 48 },

  // CROP (15)
  { id: "crop.health.updated", domain: "CROP", description: "Multispectral vegetative vigor telemetry", partitions: 16, retention_hrs: 168 },
  { id: "crop.stage.updated", domain: "CROP", description: "Phenological growth stage transition (BBCH scale)", partitions: 8, retention_hrs: 720 },
  { id: "crop.disease.detected", domain: "CROP", description: "Computer vision and microclimate disease diagnosis", partitions: 12, retention_hrs: 168 },
  { id: "crop.pest.infestation.flagged", domain: "CROP", description: "Pheromone trap count and visual pest warning", partitions: 8, retention_hrs: 96 },
  { id: "crop.harvest.predicted", domain: "CROP", description: "Optimum maturity date and harvest window forecast", partitions: 8, retention_hrs: 168 },
  { id: "crop.yield.predicted", domain: "CROP", description: "Crop simulation model final yield projection", partitions: 8, retention_hrs: 360 },
  { id: "crop.canopy.temperature", domain: "CROP", description: "Infrared radiometer leaf temperature reading", partitions: 12, retention_hrs: 48 },
  { id: "crop.ndvi.assessed", domain: "CROP", description: "Sentinel-2 Normalized Difference Vegetation Index", partitions: 8, retention_hrs: 720 },
  { id: "crop.chlorophyll.index", domain: "CROP", description: "SPAD leaf nitrogen/chlorophyll optical index", partitions: 8, retention_hrs: 168 },
  { id: "crop.flowering.window.tracked", domain: "CROP", description: "Pollination temperature safety window", partitions: 6, retention_hrs: 168 },
  { id: "crop.pod.filling.status", domain: "CROP", description: "Grain filling moisture sensitive period", partitions: 6, retention_hrs: 168 },
  { id: "crop.moisture.grain.tested", domain: "CROP", description: "Pre-harvest field grain moisture percentage", partitions: 8, retention_hrs: 72 },
  { id: "crop.blight.early-warning", domain: "CROP", description: "Late blight pathogen temperature-humidity hours", partitions: 6, retention_hrs: 96 },
  { id: "crop.leaf-rust.risk", domain: "CROP", description: "Spore dispersal and infection risk index", partitions: 6, retention_hrs: 96 },
  { id: "crop.post-harvest.spoilage.risk", domain: "CROP", description: "Field-to-shade temperature delay decay curve", partitions: 8, retention_hrs: 72 },

  // LOGISTICS (14)
  { id: "logistics.vehicle.updated", domain: "LOGISTICS", description: "GPS coordinates, speed and ignition telemetry", partitions: 24, retention_hrs: 48 },
  { id: "logistics.route.updated", domain: "LOGISTICS", description: "Dynamic turn-by-turn routing optimization", partitions: 16, retention_hrs: 48 },
  { id: "logistics.delay.detected", domain: "LOGISTICS", description: "Traffic bottleneck and transit delay alerts", partitions: 12, retention_hrs: 48 },
  { id: "logistics.cold-chain.alert", domain: "LOGISTICS", description: "Reefer container temperature excursion warning", partitions: 12, retention_hrs: 96 },
  { id: "logistics.cold-chain.temp.breached", domain: "LOGISTICS", description: "Critical perishable produce thermal spoilage event", partitions: 8, retention_hrs: 168 },
  { id: "logistics.delivery.completed", domain: "LOGISTICS", description: "Electronic proof of delivery (e-POD) signoff", partitions: 12, retention_hrs: 720 },
  { id: "logistics.fuel.efficiency.computed", domain: "LOGISTICS", description: "Engine telemetry km/L and idle fuel analysis", partitions: 8, retention_hrs: 72 },
  { id: "logistics.toll.congestion.rerouted", domain: "LOGISTICS", description: "FASTag plaza detour optimization", partitions: 6, retention_hrs: 24 },
  { id: "logistics.driver.sla.assessed", domain: "LOGISTICS", description: "On-time arrival and rest cycle adherence", partitions: 6, retention_hrs: 168 },
  { id: "logistics.dock.turnaround.measured", domain: "LOGISTICS", description: "Unloading duration at processor warehouse", partitions: 8, retention_hrs: 72 },
  { id: "logistics.reefer.humidity.monitored", domain: "LOGISTICS", description: "Controlled Atmosphere humidity control in transit", partitions: 8, retention_hrs: 72 },
  { id: "logistics.geo-fence.entered", domain: "LOGISTICS", description: "Vehicle entry into farm or mandi boundary", partitions: 16, retention_hrs: 48 },
  { id: "logistics.geo-fence.exited", domain: "LOGISTICS", description: "Vehicle departure confirmation", partitions: 16, retention_hrs: 48 },
  { id: "logistics.freight.rate.benchmarked", domain: "LOGISTICS", description: "Per tonne-kilometer spot transport benchmark", partitions: 6, retention_hrs: 72 },

  // LIVESTOCK (13)
  { id: "livestock.health.updated", domain: "LIVESTOCK", description: "Smart collar heart rate and activity metrics", partitions: 12, retention_hrs: 72 },
  { id: "livestock.feed.updated", domain: "LIVESTOCK", description: "Total Mixed Ration (TMR) feed intake telemetry", partitions: 8, retention_hrs: 168 },
  { id: "livestock.feed.ration.optimized", domain: "LIVESTOCK", description: "Linear programming least-cost feed formulation", partitions: 6, retention_hrs: 168 },
  { id: "livestock.temperature.alert", domain: "LIVESTOCK", description: "Rumen bolus core body temperature spike alert", partitions: 8, retention_hrs: 48 },
  { id: "livestock.health-risk.detected", domain: "LIVESTOCK", description: "Mastitis or lameness behavioral anomaly detection", partitions: 8, retention_hrs: 96 },
  { id: "livestock.milk.yield.recorded", domain: "LIVESTOCK", description: "Automatic milking parlor individual yield", partitions: 12, retention_hrs: 360 },
  { id: "livestock.milk.scc.quality", domain: "LIVESTOCK", description: "Somatic cell count and fat-protein ratio", partitions: 8, retention_hrs: 360 },
  { id: "livestock.vaccination.due", domain: "LIVESTOCK", description: "FMD and Brucellosis immunization schedule reminder", partitions: 6, retention_hrs: 720 },
  { id: "livestock.rumination.index", domain: "LIVESTOCK", description: "Minutes of cud chewing per 24-hour cycle", partitions: 8, retention_hrs: 72 },
  { id: "livestock.estrus.detected", domain: "LIVESTOCK", description: "AI breeding window heat detection alert", partitions: 6, retention_hrs: 48 },
  { id: "livestock.weight.gain.tracked", domain: "LIVESTOCK", description: "3D optical body weight estimation in cattle", partitions: 6, retention_hrs: 360 },
  { id: "livestock.water.intake.alert", domain: "LIVESTOCK", description: "Trough flow meter consumption deficit warning", partitions: 8, retention_hrs: 48 },
  { id: "livestock.biosecurity.perimeter.alert", domain: "LIVESTOCK", description: "Barn quarantine fence motion alert", partitions: 4, retention_hrs: 72 },

  // MARKETPLACE (14)
  { id: "lot.created", domain: "MARKETPLACE", description: "Farmer publishes verified digital harvest lot", partitions: 16, retention_hrs: 360 },
  { id: "lot.updated", domain: "MARKETPLACE", description: "Lot price, quantity or availability adjustment", partitions: 12, retention_hrs: 168 },
  { id: "lot.quality.certified", domain: "MARKETPLACE", description: "Assay lab or AI grade certification issued", partitions: 8, retention_hrs: 720 },
  { id: "lot.matched", domain: "MARKETPLACE", description: "Automated matching engine pairs lot with buyer RFQ", partitions: 16, retention_hrs: 168 },
  { id: "buyer.offer.created", domain: "MARKETPLACE", description: "Verified processor submits binding price bid", partitions: 16, retention_hrs: 168 },
  { id: "offer.accepted", domain: "MARKETPLACE", description: "Farmer accepts buyer offer and locks transaction", partitions: 12, retention_hrs: 720 },
  { id: "offer.countered", domain: "MARKETPLACE", description: "Negotiation price revision submitted", partitions: 12, retention_hrs: 168 },
  { id: "order.created", domain: "MARKETPLACE", description: "Purchase order generated with trade terms", partitions: 12, retention_hrs: 720 },
  { id: "payment.escrow.locked", domain: "MARKETPLACE", description: "Buyer funds deposited into AgriLink smart escrow", partitions: 16, retention_hrs: 720 },
  { id: "payment.released", domain: "MARKETPLACE", description: "Escrow disbursed to farmer upon quality signoff", partitions: 16, retention_hrs: 720 },
  { id: "payment.disputed", domain: "MARKETPLACE", description: "Quality deduction or weight shortage dispute raised", partitions: 8, retention_hrs: 720 },
  { id: "shipment.created", domain: "MARKETPLACE", description: "Consignment note and transport manifest generated", partitions: 12, retention_hrs: 720 },
  { id: "fpo.aggregate.lot.formed", domain: "MARKETPLACE", description: "FPO pools 20+ smallholders into bulk lot", partitions: 8, retention_hrs: 720 },
  { id: "mandi.gate.pass.issued", domain: "MARKETPLACE", description: "E-NAM electronic mandi gate clearance", partitions: 8, retention_hrs: 360 },

  // KNOWLEDGE (11)
  { id: "knowledge.advisory.requested", domain: "KNOWLEDGE", description: "Farmer submits agronomy or price query", partitions: 12, retention_hrs: 168 },
  { id: "knowledge.recommendation.created", domain: "KNOWLEDGE", description: "Synthesized AI agronomic prescription generated", partitions: 12, retention_hrs: 360 },
  { id: "knowledge.source.updated", domain: "KNOWLEDGE", description: "ICAR package of practices or university trial update", partitions: 4, retention_hrs: 720 },
  { id: "knowledge.pest.protocol.retrieved", domain: "KNOWLEDGE", description: "Integrated Pest Management (IPM) guidance protocol", partitions: 8, retention_hrs: 360 },
  { id: "knowledge.agronomy.rule.matched", domain: "KNOWLEDGE", description: "Crop-stage specific fertilization rules matched", partitions: 8, retention_hrs: 360 },
  { id: "knowledge.crop.calendar.synced", domain: "KNOWLEDGE", description: "Agro-climatic seasonal sowing calendar alignment", partitions: 6, retention_hrs: 720 },
  { id: "knowledge.fertilizer.dosage.checked", domain: "KNOWLEDGE", description: "Soil test-based nutrient target verification", partitions: 8, retention_hrs: 360 },
  { id: "knowledge.organic.certification.verified", domain: "KNOWLEDGE", description: "NPOP organic compliance check", partitions: 4, retention_hrs: 720 },
  { id: "knowledge.govt.subsidy.matched", domain: "KNOWLEDGE", description: "PM-Kisan, PMKSY or state scheme entitlement matched", partitions: 6, retention_hrs: 720 },
  { id: "knowledge.export.mrl.screened", domain: "KNOWLEDGE", description: "Maximum Residue Limit (MRL) destination compliance", partitions: 6, retention_hrs: 720 },
  { id: "knowledge.peer.farmer.shared", domain: "KNOWLEDGE", description: "High-yield neighbor farmer benchmark insight shared", partitions: 8, retention_hrs: 360 },

  // SAFETY (12)
  { id: "safety.action.requested", domain: "SAFETY", description: "Agent requests execution of recommendation or trade action", partitions: 16, retention_hrs: 720 },
  { id: "safety.action.approved", domain: "SAFETY", description: "Automated policy check passed; safe for execution", partitions: 16, retention_hrs: 720 },
  { id: "safety.action.blocked", domain: "SAFETY", description: "Action rejected due to high toxicity or risk", partitions: 12, retention_hrs: 720 },
  { id: "safety.confidence.low", domain: "SAFETY", description: "Model confidence below safety threshold (<75%)", partitions: 8, retention_hrs: 360 },
  { id: "safety.human-review.required", domain: "SAFETY", description: "High-impact recommendation queued for human review", partitions: 12, retention_hrs: 720 },
  { id: "safety.chemical.threshold.exceeded", domain: "SAFETY", description: "Pesticide active ingredient safety dosage warning", partitions: 8, retention_hrs: 720 },
  { id: "safety.audit.logged", domain: "SAFETY", description: "Immutable compliance verification ledger entry", partitions: 16, retention_hrs: 720 },
  { id: "safety.override.recorded", domain: "SAFETY", description: "Human farmer or admin manual decision override", partitions: 8, retention_hrs: 720 },
  { id: "safety.advisory.disclaimer.attached", domain: "SAFETY", description: "Agronomic statutory disclaimer validation", partitions: 8, retention_hrs: 360 },
  { id: "safety.price.gouging.flagged", domain: "SAFETY", description: "Unreasonable buyer margin or predatory bid detection", partitions: 6, retention_hrs: 720 },
  { id: "safety.counterparty.risk.checked", domain: "SAFETY", description: "Buyer creditworthiness and default history screen", partitions: 8, retention_hrs: 720 },
  { id: "safety.emergency.halt.tripped", domain: "SAFETY", description: "Circuit breaker triggered for market or environmental anomaly", partitions: 4, retention_hrs: 720 }
];

export const DOMAIN_AGENTS_INITIAL: DomainAgent[] = [
  {
    id: "agent-market-intel",
    name: "Market Intelligence Agent",
    domain: "MARKET",
    status: "ACTIVE",
    task: "Synthesizing APMC arrival volumes and regional price arbitrage",
    consumes: ["market.price.updated", "market.mandi.updated", "buyer.offer.created"],
    produces: ["market.price.anomaly", "market.demand.detected", "market.price.recommendation"],
    confidence: 94.2,
    eventsConsumed: 4821,
    eventsProduced: 642,
    lastActivity: "1.2s ago",
    recommendation: "Tomato demand in Lucknow up 11%. Recommended listing: ₹30–₹34/kg."
  },
  {
    id: "agent-mandi-price",
    name: "Mandi Price Agent",
    domain: "MARKET",
    status: "ACTIVE",
    task: "Tracking real-time modal prices across 100+ APMCs",
    consumes: ["market.mandi.updated", "market.terminal.market.index"],
    produces: ["market.price.updated", "market.volatility.alert"],
    confidence: 97.8,
    eventsConsumed: 8930,
    eventsProduced: 1420,
    lastActivity: "0.8s ago",
    recommendation: "Kanpur benchmark: ₹28/kg. Verified buyer offers available at ₹33/kg."
  },
  {
    id: "agent-buyer-demand",
    name: "Buyer Demand Agent",
    domain: "MARKET",
    status: "ACTIVE",
    task: "Aggregating processor RFQs and daily factory intake quotas",
    consumes: ["market.buyer.offer.created", "market.buyer.offer.updated"],
    produces: ["market.demand.detected", "market.contract.created"],
    confidence: 92.5,
    eventsConsumed: 3140,
    eventsProduced: 480,
    lastActivity: "2.1s ago",
    recommendation: "FreshHarvest Foods expanding quota by +40 tonnes for Grade A Tomato."
  },
  {
    id: "agent-price-forecast",
    name: "Price Forecast Agent",
    domain: "MARKET",
    status: "ACTIVE",
    task: "Forecasting 7-day realization curves using econometric models",
    consumes: ["market.price.updated", "weather.rainfall.updated", "crop.yield.predicted"],
    produces: ["market.futures.basis.calculated", "knowledge.recommendation.created"],
    confidence: 88.6,
    eventsConsumed: 2750,
    eventsProduced: 310,
    lastActivity: "3.4s ago",
    recommendation: "Prices expected to rise +4.8% over next 6 days due to southern rains."
  },
  {
    id: "agent-weather-intel",
    name: "Weather Intelligence Agent",
    domain: "WEATHER",
    status: "ACTIVE",
    task: "Monitoring Doppler radar storm cells and precipitation telemetry",
    consumes: ["weather.temperature.updated", "weather.rainfall.radar.scanned"],
    produces: ["weather.forecast.updated", "weather.alert.created"],
    confidence: 96.1,
    eventsConsumed: 9420,
    eventsProduced: 1820,
    lastActivity: "1.9s ago",
    recommendation: "Rain probability updated to 82% in Kanpur corridor within next 18 hours."
  },
  {
    id: "agent-extreme-weather",
    name: "Extreme Weather Agent",
    domain: "WEATHER",
    status: "ACTIVE",
    task: "Scanning for hailstorm, frost, squall and heatwave vectors",
    consumes: ["weather.wind.gust.alert", "weather.hailstorm.risk", "weather.temperature.updated"],
    produces: ["weather.extreme-weather.detected", "safety.action.requested"],
    confidence: 98.4,
    eventsConsumed: 4210,
    eventsProduced: 210,
    lastActivity: "4.2s ago",
    recommendation: "No extreme cyclone or hailstorm risk detected across Central UP."
  },
  {
    id: "agent-soil-intel",
    name: "Soil Intelligence Agent",
    domain: "SOIL",
    status: "ACTIVE",
    task: "Assessing rootzone moisture, NPK optical readings and electrical conductivity",
    consumes: ["soil.moisture.updated", "soil.nutrients.updated", "soil.ph.updated"],
    produces: ["soil.health.assessed", "water.irrigation.required"],
    confidence: 93.7,
    eventsConsumed: 6840,
    eventsProduced: 890,
    lastActivity: "2.5s ago",
    recommendation: "Soil moisture at 38% (optimal). Nitrogen availability 240 kg/ha."
  },
  {
    id: "agent-irrigation",
    name: "Irrigation Agent",
    domain: "WATER",
    status: "ACTIVE",
    task: "Optimizing water scheduling against growth stage and rain forecast",
    consumes: ["soil.moisture.updated", "weather.forecast.updated", "crop.stage.updated"],
    produces: ["water.irrigation.required", "water.usage.updated"],
    confidence: 95.0,
    eventsConsumed: 5420,
    eventsProduced: 760,
    lastActivity: "1.7s ago",
    recommendation: "Rain forecasted in 18 hrs (82% prob). Delay irrigation to prevent hypoxia."
  },
  {
    id: "agent-crop-health",
    name: "Crop Health Agent",
    domain: "CROP",
    status: "ACTIVE",
    task: "Computing Sentinel-2 NDVI vegetative vigor index and canopy temperature",
    consumes: ["crop.ndvi.assessed", "crop.canopy.temperature", "crop.stage.updated"],
    produces: ["crop.health.updated", "crop.harvest.predicted"],
    confidence: 91.8,
    eventsConsumed: 4120,
    eventsProduced: 540,
    lastActivity: "2.8s ago",
    recommendation: "NDVI at 0.74 (Vigorous growth). Crop in active fruit development stage."
  },
  {
    id: "agent-disease-detection",
    name: "Disease Detection Agent",
    domain: "CROP",
    status: "ACTIVE",
    task: "Evaluating microclimate humidity-hours for early blight risk",
    consumes: ["weather.humidity.updated", "crop.blight.early-warning", "crop.health.updated"],
    produces: ["crop.disease.detected", "safety.action.requested"],
    confidence: 89.2,
    eventsConsumed: 3890,
    eventsProduced: 320,
    lastActivity: "3.1s ago",
    recommendation: "Moderate humidity spike. Preventative bio-spray recommended if rain persists."
  },
  {
    id: "agent-yield-prediction",
    name: "Yield Prediction Agent",
    domain: "CROP",
    status: "ACTIVE",
    task: "Projecting farmgate harvest tonnage using dynamic biomass models",
    consumes: ["crop.stage.updated", "soil.health.assessed", "weather.temperature.updated"],
    produces: ["crop.yield.predicted", "market.terminal.market.index"],
    confidence: 90.4,
    eventsConsumed: 2980,
    eventsProduced: 190,
    lastActivity: "5.0s ago",
    recommendation: "Projected yield: 18.5 tonnes/ha (+6% above regional seasonal average)."
  },
  {
    id: "agent-harvest-planning",
    name: "Harvest Planning Agent",
    domain: "CROP",
    status: "ACTIVE",
    task: "Calculating harvest timing to balance firmness with mandi price windows",
    consumes: ["crop.stage.updated", "market.price.updated", "weather.forecast.updated"],
    produces: ["crop.harvest.predicted", "lot.created"],
    confidence: 93.0,
    eventsConsumed: 3450,
    eventsProduced: 410,
    lastActivity: "1.4s ago",
    recommendation: "Harvest 60% of mature lot today before rain; hold remainder for price surge."
  },
  {
    id: "agent-livestock-health",
    name: "Livestock Health Agent",
    domain: "LIVESTOCK",
    status: "ACTIVE",
    task: "Analyzing dairy herd rumination, body temperature, and SCC milk quality",
    consumes: ["livestock.health.updated", "livestock.rumination.index", "livestock.milk.scc.quality"],
    produces: ["livestock.health-risk.detected", "safety.action.requested"],
    confidence: 95.6,
    eventsConsumed: 3610,
    eventsProduced: 280,
    lastActivity: "2.3s ago",
    recommendation: "Herd rumination normal (485 min/day). SCC count 140K/mL (Grade A Premium)."
  },
  {
    id: "agent-feed-optimization",
    name: "Feed Optimization Agent",
    domain: "LIVESTOCK",
    status: "ACTIVE",
    task: "Formulating lowest-cost balanced TMR rations based on local grain prices",
    consumes: ["market.price.updated", "livestock.feed.updated", "crop.moisture.grain.tested"],
    produces: ["livestock.feed.ration.optimized"],
    confidence: 94.1,
    eventsConsumed: 2180,
    eventsProduced: 190,
    lastActivity: "4.5s ago",
    recommendation: "Incorporate 15% maize bran and mustard cake to reduce feed cost by ₹1.80/kg."
  },
  {
    id: "agent-logistics",
    name: "Logistics Agent",
    domain: "LOGISTICS",
    status: "ACTIVE",
    task: "Coordinating farmgate pickup, loading schedules, and e-gate passes",
    consumes: ["order.created", "shipment.created", "logistics.vehicle.updated"],
    produces: ["logistics.geo-fence.entered", "logistics.delay.detected"],
    confidence: 96.5,
    eventsConsumed: 6120,
    eventsProduced: 940,
    lastActivity: "0.9s ago",
    recommendation: "Scheduled pickup for 800 kg Tomato via Lucknow Corridor (42 km). ETA: 45 min."
  },
  {
    id: "agent-route-optimization",
    name: "Route Optimization Agent",
    domain: "LOGISTICS",
    status: "ACTIVE",
    task: "Calculating detour routes around highway congestion and mandi queues",
    consumes: ["logistics.vehicle.updated", "logistics.delay.detected", "logistics.toll.congestion.rerouted"],
    produces: ["logistics.route.updated"],
    confidence: 97.2,
    eventsConsumed: 5410,
    eventsProduced: 780,
    lastActivity: "1.1s ago",
    recommendation: "NH-27 bypass saves 31 minutes vs inner city route. Re-routed transit vehicle."
  },
  {
    id: "agent-supply-demand",
    name: "Supply-Demand Agent",
    domain: "MARKET",
    status: "ACTIVE",
    task: "Modeling macro crop balance sheets and processing plant deficits",
    consumes: ["market.mandi.updated", "crop.yield.predicted", "market.buyer.offer.created"],
    produces: ["market.demand.detected", "market.volatility.alert"],
    confidence: 91.0,
    eventsConsumed: 3890,
    eventsProduced: 430,
    lastActivity: "3.8s ago",
    recommendation: "Northern tomato processing demand deficit: +180 tonnes required this week."
  },
  {
    id: "agent-marketplace-matching",
    name: "Marketplace Matching Agent",
    domain: "MARKETPLACE",
    status: "ACTIVE",
    task: "Pairing harvest lots with verified buyers by quality and proximity",
    consumes: ["lot.created", "buyer.offer.created", "market.price.updated"],
    produces: ["lot.matched", "safety.action.requested"],
    confidence: 95.8,
    eventsConsumed: 7240,
    eventsProduced: 1150,
    lastActivity: "0.6s ago",
    recommendation: "Matched Lot KL-LOT-10493 (Tomato) with FreshHarvest Foods. Score: 94%."
  },
  {
    id: "agent-agri-knowledge",
    name: "Agricultural Knowledge Agent",
    domain: "KNOWLEDGE",
    status: "ACTIVE",
    task: "Querying ICAR agronomic rules, MRL limits, and organic package of practices",
    consumes: ["knowledge.advisory.requested", "crop.disease.detected", "knowledge.source.updated"],
    produces: ["knowledge.recommendation.created", "safety.action.requested"],
    confidence: 98.0,
    eventsConsumed: 4820,
    eventsProduced: 920,
    lastActivity: "1.5s ago",
    recommendation: "Verified IPM compliance protocol: Pre-harvest interval (PHI) is 3 days."
  },
  {
    id: "agent-risk-intel",
    name: "Risk Intelligence Agent",
    domain: "MARKET",
    status: "ACTIVE",
    task: "Computing composite farm revenue risk index across weather and market",
    consumes: ["weather.alert.created", "market.volatility.alert", "payment.disputed"],
    produces: ["safety.confidence.low", "knowledge.recommendation.created"],
    confidence: 93.4,
    eventsConsumed: 3410,
    eventsProduced: 390,
    lastActivity: "2.7s ago",
    recommendation: "Overall farm risk score: LOW (24/100). Net realization protected by buyer escrow."
  },
  {
    id: "agent-fraud-detection",
    name: "Fraud Detection Agent",
    domain: "MARKETPLACE",
    status: "ACTIVE",
    task: "Screening for phantom lots, fraudulent assays, and payment default patterns",
    consumes: ["buyer.offer.created", "payment.escrow.locked", "lot.quality.certified"],
    produces: ["safety.action.blocked", "safety.audit.logged"],
    confidence: 99.1,
    eventsConsumed: 6890,
    eventsProduced: 140,
    lastActivity: "1.0s ago",
    recommendation: "All active buyers verified with 100% Escrow deposit and zero default history."
  },
  {
    id: "agent-quality-grading",
    name: "Quality Grading Agent",
    domain: "MARKETPLACE",
    status: "ACTIVE",
    task: "Assessing produce size uniformity, color saturation, and surface defects",
    consumes: ["lot.created", "crop.moisture.grain.tested"],
    produces: ["lot.quality.certified"],
    confidence: 94.7,
    eventsConsumed: 4120,
    eventsProduced: 620,
    lastActivity: "1.8s ago",
    recommendation: "Visual assay confirmed: 92% uniform deep red color, Grade A premium tier."
  },
  {
    id: "agent-sustainability",
    name: "Sustainability Agent",
    domain: "SOIL",
    status: "ACTIVE",
    task: "Quantifying carbon sequestration, water use efficiency, and soil health",
    consumes: ["soil.organic-carbon.updated", "water.usage.updated", "crop.stage.updated"],
    produces: ["knowledge.recommendation.created"],
    confidence: 92.3,
    eventsConsumed: 2190,
    eventsProduced: 180,
    lastActivity: "4.9s ago",
    recommendation: "Drip irrigation saved 28,000L water/acre; +0.12% soil organic carbon improvement."
  },
  {
    id: "agent-safety-policy",
    name: "Safety & Policy Agent",
    domain: "SAFETY",
    status: "ACTIVE",
    task: "Executing automated guardrails, compliance checks, and human review escalation",
    consumes: ["safety.action.requested", "safety.chemical.threshold.exceeded"],
    produces: ["safety.action.approved", "safety.action.blocked", "safety.human-review.required"],
    confidence: 99.9,
    eventsConsumed: 11450,
    eventsProduced: 2180,
    lastActivity: "0.5s ago",
    recommendation: "All 18 active trade and irrigation recommendations safety-screened and approved."
  }
];

export const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "rev-101",
    title: "High Weather Risk Tomato Harvest Scheduling",
    domain: "WEATHER / CROP",
    agent: "Harvest Planning Agent",
    recommendation: "Execute emergency early harvest of 500 kg mature tomato crop before 82% rain window",
    confidence: 72.4,
    riskLevel: "HIGH",
    submittedAt: "12 mins ago",
    factors: [
      { label: "Rain Probability", value: "82% within 18 hrs" },
      { label: "Field Rot Risk", value: "+35% if unpicked" },
      { label: "Labor Availability", value: "2 farmhands assigned" }
    ]
  },
  {
    id: "rev-102",
    title: "Pesticide Chemical Dosage Verification",
    domain: "CROP / SAFETY",
    agent: "Disease Detection Agent",
    recommendation: "Apply Copper Oxychloride (2.5g/L) for preventative late blight protection",
    confidence: 68.0,
    riskLevel: "CONSEQUENTIAL",
    submittedAt: "24 mins ago",
    factors: [
      { label: "Humidity Window", value: ">85% for 14 hours" },
      { label: "PHI Pre-harvest interval", value: "3 days required" },
      { label: "Organic Certification Impact", value: "Permitted under NPOP" }
    ]
  },
  {
    id: "rev-103",
    title: "Large Institutional Bulk Contract Execution",
    domain: "MARKETPLACE / FPO",
    agent: "Marketplace Matching Agent",
    recommendation: "Commit FPO bulk lot of 12.5 tonnes at locked price ₹34/kg with 24hr escrow release",
    confidence: 74.5,
    riskLevel: "FINANCIAL",
    submittedAt: "45 mins ago",
    factors: [
      { label: "Contract Value", value: "₹4,25,000" },
      { label: "Buyer Reliability", value: "94.2% verified score" },
      { label: "Member Farmers", value: "24 farmers pooled" }
    ]
  }
];

// Reusable causal templates for generating live events continuously
export const EVENT_CAUSAL_PATTERNS = [
  [
    {
      agentName: "Weather Intelligence Agent",
      domain: "WEATHER",
      topic: "weather.forecast.updated",
      summary: "Radar indicates convective precipitation band moving over Kanpur (82% rain prob in 18h)",
      payload: { prob_pct: 82, precip_mm: 24.0, window_hrs: 18 },
      status: "APPROVED",
      confidence: 96.1
    },
    {
      agentName: "Irrigation Agent",
      domain: "WATER",
      topic: "water.irrigation.required",
      summary: "Delay irrigation hold: Rain probability 82% exceeds crop water deficit threshold",
      payload: { action: "DELAY_IRRIGATION", hold_hours: 24, saving_liters: 14000 },
      status: "APPROVED",
      confidence: 95.0
    },
    {
      agentName: "Crop Health Agent",
      domain: "CROP",
      topic: "crop.harvest.predicted",
      summary: "Tomato harvest risk elevated due to impending rain; mature crop window narrowing",
      payload: { crop: "Tomato", risk: "ELEVATED", mature_pct: 85 },
      status: "APPROVED",
      confidence: 91.8
    },
    {
      agentName: "Market Intelligence Agent",
      domain: "MARKET",
      topic: "market.demand.detected",
      summary: "Tomato demand surge detected in regional processing hub (+11% buyer orders)",
      payload: { crop: "Tomato", demand_increase_pct: 11.0, hub: "Lucknow" },
      status: "APPROVED",
      confidence: 94.2
    },
    {
      agentName: "Price Forecast Agent",
      domain: "MARKET",
      topic: "market.price.recommendation",
      summary: "Computed optimal farmer listing range: ₹31.00–₹34.00/kg (Mandi benchmark ₹28/kg)",
      payload: { crop: "Tomato", mandi_ref: 28.0, min_target: 31.0, max_target: 34.0 },
      status: "APPROVED",
      confidence: 91.2
    },
    {
      agentName: "Marketplace Matching Agent",
      domain: "MARKETPLACE",
      topic: "lot.matched",
      summary: "Matched Lot #KL-LOT-10493 (Tomato 800 kg) with FreshHarvest Foods processor",
      payload: { lot_id: "KL-LOT-10493", buyer: "FreshHarvest", score: 94 },
      status: "APPROVED",
      confidence: 95.8
    },
    {
      agentName: "Safety & Policy Agent",
      domain: "SAFETY",
      topic: "safety.action.approved",
      summary: "Safety policy verified: Pricing and logistics within certified fair-trade guidelines",
      payload: { action: "TRADE_AND_PRICE", approved: true },
      status: "APPROVED",
      confidence: 99.9
    }
  ],
  [
    {
      agentName: "Soil Intelligence Agent",
      domain: "SOIL",
      topic: "soil.moisture.updated",
      summary: "Topsoil moisture at 42% following night dew; rootzone salinity EC 0.42 dS/m (Optimal)",
      payload: { moisture_pct: 42, ec: 0.42, nitrogen_ppm: 245 },
      status: "APPROVED",
      confidence: 94.8
    },
    {
      agentName: "Mandi Price Agent",
      domain: "MARKET",
      topic: "market.price.updated",
      summary: "Kanpur APMC modal rate logged at ₹28.00/kg (+₹1.50 over weekly baseline)",
      payload: { crop: "Tomato", modal_price: 28.0, weekly_trend: "+5.6%" },
      status: "APPROVED",
      confidence: 97.8
    },
    {
      agentName: "Logistics Agent",
      domain: "LOGISTICS",
      topic: "logistics.route.updated",
      summary: "NH-27 bypass selected for Lot #KL-LOT-10493 dispatch; saves 31 mins ETA",
      payload: { route: "Outer Bypass", eta_min_saved: 31, temp_c: 10.5 },
      status: "APPROVED",
      confidence: 97.2
    },
    {
      agentName: "Livestock Health Agent",
      domain: "LIVESTOCK",
      topic: "livestock.milk.scc.quality",
      summary: "Morning bulk tank milk SCC 135K/mL (Grade A Premium tier awarded)",
      payload: { milk_liters: 420, scc: 135000, fat_pct: 4.2 },
      status: "APPROVED",
      confidence: 96.0
    }
  ]
];
