from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import random
import time

from app.database import get_db

router = APIRouter(prefix="/agrios", tags=["AgriOS Intelligence Core"])

# Catalog of 135 structured Kafka topics across 10 agricultural domains
TOPICS_CATALOG = [
    # MARKET DOMAIN (16 topics)
    {"id": "market.price.updated", "domain": "MARKET", "description": "Real-time modal price updates from APMC mandis", "partitions": 12, "retention_hrs": 72},
    {"id": "market.mandi.updated", "domain": "MARKET", "description": "Arrival volumes and market operational status", "partitions": 8, "retention_hrs": 48},
    {"id": "market.buyer.offer.created", "domain": "MARKET", "description": "Institutional buyer RFQ and procurement orders", "partitions": 16, "retention_hrs": 168},
    {"id": "market.buyer.offer.updated", "domain": "MARKET", "description": "Modifications to buyer purchase orders", "partitions": 8, "retention_hrs": 72},
    {"id": "market.buyer.offer.countered", "domain": "MARKET", "description": "Farmer or FPO price counteroffers", "partitions": 8, "retention_hrs": 72},
    {"id": "market.demand.detected", "domain": "MARKET", "description": "Aggregated buyer demand surge alerts", "partitions": 12, "retention_hrs": 96},
    {"id": "market.price.anomaly", "domain": "MARKET", "description": "Spike or collapse beyond 3 sigma standard deviation", "partitions": 6, "retention_hrs": 120},
    {"id": "market.contract.created", "domain": "MARKET", "description": "Direct forward contract between farmer and processor", "partitions": 8, "retention_hrs": 720},
    {"id": "market.contract.settled", "domain": "MARKET", "description": "Contract execution and milestone clearance", "partitions": 8, "retention_hrs": 720},
    {"id": "market.auction.started", "domain": "MARKET", "description": "Dynamic digital bidding session initiation", "partitions": 16, "retention_hrs": 24},
    {"id": "market.auction.bid.placed", "domain": "MARKET", "description": "Real-time bid placement stream", "partitions": 32, "retention_hrs": 24},
    {"id": "market.volatility.alert", "domain": "MARKET", "description": "High price swing warnings across regional hubs", "partitions": 6, "retention_hrs": 48},
    {"id": "market.arbitrage.spread.detected", "domain": "MARKET", "description": "Price differential between neighboring mandis after logistics", "partitions": 8, "retention_hrs": 48},
    {"id": "market.terminal.market.index", "domain": "MARKET", "description": "Macro agricultural index for national consumption hubs", "partitions": 4, "retention_hrs": 168},
    {"id": "market.export.parity.updated", "domain": "MARKET", "description": "FOB port prices and export viability margins", "partitions": 4, "retention_hrs": 168},
    {"id": "market.futures.basis.calculated", "domain": "MARKET", "description": "Spot vs futures basis convergence tracking", "partitions": 4, "retention_hrs": 72},

    # WEATHER DOMAIN (14 topics)
    {"id": "weather.temperature.updated", "domain": "WEATHER", "description": "Automated Weather Station (AWS) ambient temperature", "partitions": 16, "retention_hrs": 48},
    {"id": "weather.rainfall.updated", "domain": "WEATHER", "description": "Precipitation accumulation telemetry in mm", "partitions": 16, "retention_hrs": 72},
    {"id": "weather.rainfall.radar.scanned", "domain": "WEATHER", "description": "Doppler radar storm cell velocity and reflectance", "partitions": 8, "retention_hrs": 24},
    {"id": "weather.forecast.updated", "domain": "WEATHER", "description": "24-hour hyperlocal high-resolution forecast", "partitions": 12, "retention_hrs": 48},
    {"id": "weather.forecast.7day.updated", "domain": "WEATHER", "description": "Medium range 7-day probabilistic weather outlook", "partitions": 8, "retention_hrs": 168},
    {"id": "weather.alert.created", "domain": "WEATHER", "description": "Severe agricultural weather advisory", "partitions": 8, "retention_hrs": 72},
    {"id": "weather.extreme-weather.detected", "domain": "WEATHER", "description": "Extreme climate event identification", "partitions": 6, "retention_hrs": 96},
    {"id": "weather.humidity.updated", "domain": "WEATHER", "description": "Relative humidity and vapor pressure deficit", "partitions": 12, "retention_hrs": 48},
    {"id": "weather.frost.warning", "domain": "WEATHER", "description": "Sub-zero surface temperature frost alerts", "partitions": 6, "retention_hrs": 48},
    {"id": "weather.wind.gust.alert", "domain": "WEATHER", "description": "High wind velocity warnings affecting tall crops and orchards", "partitions": 8, "retention_hrs": 24},
    {"id": "weather.hailstorm.risk", "domain": "WEATHER", "description": "Convective hail probability index", "partitions": 6, "retention_hrs": 48},
    {"id": "weather.heatwave.index", "domain": "WEATHER", "description": "Cumulative degree days and thermal stress index", "partitions": 6, "retention_hrs": 72},
    {"id": "weather.cyclone.tracking", "domain": "WEATHER", "description": "Coastal depression and cyclone path telemetry", "partitions": 4, "retention_hrs": 120},
    {"id": "weather.evapotranspiration.calculated", "domain": "WEATHER", "description": "Penman-Monteith reference evapotranspiration (ET0)", "partitions": 8, "retention_hrs": 72},

    # SOIL DOMAIN (13 topics)
    {"id": "soil.moisture.updated", "domain": "SOIL", "description": "Volumetric water content across topsoil 15cm", "partitions": 16, "retention_hrs": 72},
    {"id": "soil.moisture.rootzone.depleted", "domain": "SOIL", "description": "Permanent wilting point proximity warning", "partitions": 12, "retention_hrs": 48},
    {"id": "soil.ph.updated", "domain": "SOIL", "description": "Soil acidity/alkalinity electrode telemetry", "partitions": 8, "retention_hrs": 168},
    {"id": "soil.nutrients.updated", "domain": "SOIL", "description": "Composite NPK optical sensor absorption data", "partitions": 12, "retention_hrs": 168},
    {"id": "soil.nitrogen.level", "domain": "SOIL", "description": "Available nitrate and ammoniacal nitrogen in ppm", "partitions": 8, "retention_hrs": 168},
    {"id": "soil.phosphorus.level", "domain": "SOIL", "description": "Available phosphorus Olsen P index", "partitions": 8, "retention_hrs": 168},
    {"id": "soil.potassium.level", "domain": "SOIL", "description": "Exchangeable potassium K2O values", "partitions": 8, "retention_hrs": 168},
    {"id": "soil.organic-carbon.updated", "domain": "SOIL", "description": "Soil organic carbon (SOC) percentage index", "partitions": 6, "retention_hrs": 720},
    {"id": "soil.salinity.ec.updated", "domain": "SOIL", "description": "Electrical conductivity (dS/m) salinity level", "partitions": 8, "retention_hrs": 168},
    {"id": "soil.temperature.updated", "domain": "SOIL", "description": "Sub-surface rootzone temperature", "partitions": 12, "retention_hrs": 72},
    {"id": "soil.health.assessed", "domain": "SOIL", "description": "Composite soil fertility index scorecard", "partitions": 8, "retention_hrs": 720},
    {"id": "soil.microbiome.activity", "domain": "SOIL", "description": "Soil respiration rate and microbial biomass index", "partitions": 4, "retention_hrs": 360},
    {"id": "soil.compaction.alert", "domain": "SOIL", "description": "Penetrometer bulk density root impedance alert", "partitions": 4, "retention_hrs": 168},

    # WATER DOMAIN (13 topics)
    {"id": "water.level.updated", "domain": "WATER", "description": "Farm pond and borehole static water table depth", "partitions": 12, "retention_hrs": 72},
    {"id": "water.irrigation.required", "domain": "WATER", "description": "Automated crop water deficit trigger", "partitions": 16, "retention_hrs": 48},
    {"id": "water.irrigation.started", "domain": "WATER", "description": "Pump switch-on confirmation and valve actuation", "partitions": 8, "retention_hrs": 48},
    {"id": "water.irrigation.completed", "domain": "WATER", "description": "Flow meter volume delivered confirmation", "partitions": 8, "retention_hrs": 72},
    {"id": "water.stress.detected", "domain": "WATER", "description": "Thermal crop water stress index (CWSI) breach", "partitions": 12, "retention_hrs": 48},
    {"id": "water.usage.updated", "domain": "WATER", "description": "Daily cumulative cubic meters consumed per acre", "partitions": 8, "retention_hrs": 168},
    {"id": "water.aquifer.depth.measured", "domain": "WATER", "description": "Groundwater hydrostatic sensor telemetry", "partitions": 6, "retention_hrs": 720},
    {"id": "water.salinity.index", "domain": "WATER", "description": "Irrigation water Total Dissolved Solids (TDS)", "partitions": 6, "retention_hrs": 168},
    {"id": "water.canal.discharge.updated", "domain": "WATER", "description": "Irrigation canal water release schedule", "partitions": 4, "retention_hrs": 168},
    {"id": "water.reservoir.capacity.updated", "domain": "WATER", "description": "Regional basin water storage percentage", "partitions": 4, "retention_hrs": 360},
    {"id": "water.drip.pressure.alert", "domain": "WATER", "description": "Drip lateral pressure drop or emitter clogging", "partitions": 8, "retention_hrs": 48},
    {"id": "water.fertigation.metered", "domain": "WATER", "description": "Venturi injector fertilizer dose integration", "partitions": 6, "retention_hrs": 72},
    {"id": "water.runoff.risk", "domain": "WATER", "description": "Soil infiltration excess and nutrient leaching alert", "partitions": 6, "retention_hrs": 48},

    # CROP DOMAIN (15 topics)
    {"id": "crop.health.updated", "domain": "CROP", "description": "Multispectral vegetative vigor telemetry", "partitions": 16, "retention_hrs": 168},
    {"id": "crop.stage.updated", "domain": "CROP", "description": "Phenological growth stage transition (BBCH scale)", "partitions": 8, "retention_hrs": 720},
    {"id": "crop.disease.detected", "domain": "CROP", "description": "Computer vision and microclimate disease diagnosis", "partitions": 12, "retention_hrs": 168},
    {"id": "crop.pest.infestation.flagged", "domain": "CROP", "description": "Pheromone trap count and visual pest warning", "partitions": 8, "retention_hrs": 96},
    {"id": "crop.harvest.predicted", "domain": "CROP", "description": "Optimum maturity date and harvest window forecast", "partitions": 8, "retention_hrs": 168},
    {"id": "crop.yield.predicted", "domain": "CROP", "description": "Crop simulation model final yield projection", "partitions": 8, "retention_hrs": 360},
    {"id": "crop.canopy.temperature", "domain": "CROP", "description": "Infrared radiometer leaf temperature reading", "partitions": 12, "retention_hrs": 48},
    {"id": "crop.ndvi.assessed", "domain": "CROP", "description": "Sentinel-2 Normalized Difference Vegetation Index", "partitions": 8, "retention_hrs": 720},
    {"id": "crop.chlorophyll.index", "domain": "CROP", "description": "SPAD leaf nitrogen/chlorophyll optical index", "partitions": 8, "retention_hrs": 168},
    {"id": "crop.flowering.window.tracked", "domain": "CROP", "description": "Pollination temperature safety window", "partitions": 6, "retention_hrs": 168},
    {"id": "crop.pod.filling.status", "domain": "CROP", "description": "Grain filling moisture sensitive period", "partitions": 6, "retention_hrs": 168},
    {"id": "crop.moisture.grain.tested", "domain": "CROP", "description": "Pre-harvest field grain moisture percentage", "partitions": 8, "retention_hrs": 72},
    {"id": "crop.blight.early-warning", "domain": "CROP", "description": "Late blight pathogen temperature-humidity hours", "partitions": 6, "retention_hrs": 96},
    {"id": "crop.leaf-rust.risk", "domain": "CROP", "description": "Spore dispersal and infection risk index", "partitions": 6, "retention_hrs": 96},
    {"id": "crop.post-harvest.spoilage.risk", "domain": "CROP", "description": "Field-to-shade temperature delay decay curve", "partitions": 8, "retention_hrs": 72},

    # LOGISTICS DOMAIN (14 topics)
    {"id": "logistics.vehicle.updated", "domain": "LOGISTICS", "description": "GPS coordinates, speed and ignition telemetry", "partitions": 24, "retention_hrs": 48},
    {"id": "logistics.route.updated", "domain": "LOGISTICS", "description": "Dynamic turn-by-turn routing optimization", "partitions": 16, "retention_hrs": 48},
    {"id": "logistics.delay.detected", "domain": "LOGISTICS", "description": "Traffic bottleneck and transit delay alerts", "partitions": 12, "retention_hrs": 48},
    {"id": "logistics.cold-chain.alert", "domain": "LOGISTICS", "description": "Reefer container temperature excursion warning", "partitions": 12, "retention_hrs": 96},
    {"id": "logistics.cold-chain.temp.breached", "domain": "LOGISTICS", "description": "Critical perishable produce thermal spoilage event", "partitions": 8, "retention_hrs": 168},
    {"id": "logistics.delivery.completed", "domain": "LOGISTICS", "description": "Electronic proof of delivery (e-POD) signoff", "partitions": 12, "retention_hrs": 720},
    {"id": "logistics.fuel.efficiency.computed", "domain": "LOGISTICS", "description": "Engine telemetry km/L and idle fuel analysis", "partitions": 8, "retention_hrs": 72},
    {"id": "logistics.toll.congestion.rerouted", "domain": "LOGISTICS", "description": "FASTag plaza detour optimization", "partitions": 6, "retention_hrs": 24},
    {"id": "logistics.driver.sla.assessed", "domain": "LOGISTICS", "description": "On-time arrival and rest cycle adherence", "partitions": 6, "retention_hrs": 168},
    {"id": "logistics.dock.turnaround.measured", "domain": "LOGISTICS", "description": "Unloading duration at processor warehouse", "partitions": 8, "retention_hrs": 72},
    {"id": "logistics.reefer.humidity.monitored", "domain": "LOGISTICS", "description": "Controlled Atmosphere humidity control in transit", "partitions": 8, "retention_hrs": 72},
    {"id": "logistics.geo-fence.entered", "domain": "LOGISTICS", "description": "Vehicle entry into farm or mandi boundary", "partitions": 16, "retention_hrs": 48},
    {"id": "logistics.geo-fence.exited", "domain": "LOGISTICS", "description": "Vehicle departure confirmation", "partitions": 16, "retention_hrs": 48},
    {"id": "logistics.freight.rate.benchmarked", "domain": "LOGISTICS", "description": "Per tonne-kilometer spot transport benchmark", "partitions": 6, "retention_hrs": 72},

    # LIVESTOCK DOMAIN (13 topics)
    {"id": "livestock.health.updated", "domain": "LIVESTOCK", "description": "Smart collar heart rate and activity metrics", "partitions": 12, "retention_hrs": 72},
    {"id": "livestock.feed.updated", "domain": "LIVESTOCK", "description": "Total Mixed Ration (TMR) feed intake telemetry", "partitions": 8, "retention_hrs": 168},
    {"id": "livestock.feed.ration.optimized", "domain": "LIVESTOCK", "description": "Linear programming least-cost feed formulation", "partitions": 6, "retention_hrs": 168},
    {"id": "livestock.temperature.alert", "domain": "LIVESTOCK", "description": "Rumen bolus core body temperature spike alert", "partitions": 8, "retention_hrs": 48},
    {"id": "livestock.health-risk.detected", "domain": "LIVESTOCK", "description": "Mastitis or lameness behavioral anomaly detection", "partitions": 8, "retention_hrs": 96},
    {"id": "livestock.milk.yield.recorded", "domain": "LIVESTOCK", "description": "Automatic milking parlor individual yield", "partitions": 12, "retention_hrs": 360},
    {"id": "livestock.milk.scc.quality", "domain": "LIVESTOCK", "description": "Somatic cell count and fat-protein ratio", "partitions": 8, "retention_hrs": 360},
    {"id": "livestock.vaccination.due", "domain": "LIVESTOCK", "description": "FMD and Brucellosis immunization schedule reminder", "partitions": 6, "retention_hrs": 720},
    {"id": "livestock.rumination.index", "domain": "LIVESTOCK", "description": "Minutes of cud chewing per 24-hour cycle", "partitions": 8, "retention_hrs": 72},
    {"id": "livestock.estrus.detected", "domain": "LIVESTOCK", "description": "AI breeding window heat detection alert", "partitions": 6, "retention_hrs": 48},
    {"id": "livestock.weight.gain.tracked", "domain": "LIVESTOCK", "description": "3D optical body weight estimation in cattle", "partitions": 6, "retention_hrs": 360},
    {"id": "livestock.water.intake.alert", "domain": "LIVESTOCK", "description": "Trough flow meter consumption deficit warning", "partitions": 8, "retention_hrs": 48},
    {"id": "livestock.biosecurity.perimeter.alert", "domain": "LIVESTOCK", "description": "Barn quarantine fence motion alert", "partitions": 4, "retention_hrs": 72},

    # MARKETPLACE DOMAIN (14 topics)
    {"id": "lot.created", "domain": "MARKETPLACE", "description": "Farmer publishes verified digital harvest lot", "partitions": 16, "retention_hrs": 360},
    {"id": "lot.updated", "domain": "MARKETPLACE", "description": "Lot price, quantity or availability adjustment", "partitions": 12, "retention_hrs": 168},
    {"id": "lot.quality.certified", "domain": "MARKETPLACE", "description": "Assay lab or AI grade certification issued", "partitions": 8, "retention_hrs": 720},
    {"id": "lot.matched", "domain": "MARKETPLACE", "description": "Automated matching engine pairs lot with buyer RFQ", "partitions": 16, "retention_hrs": 168},
    {"id": "buyer.offer.created", "domain": "MARKETPLACE", "description": "Verified processor submits binding price bid", "partitions": 16, "retention_hrs": 168},
    {"id": "offer.accepted", "domain": "MARKETPLACE", "description": "Farmer accepts buyer offer and locks transaction", "partitions": 12, "retention_hrs": 720},
    {"id": "offer.countered", "domain": "MARKETPLACE", "description": "Negotiation price revision submitted", "partitions": 12, "retention_hrs": 168},
    {"id": "order.created", "domain": "MARKETPLACE", "description": "Purchase order generated with trade terms", "partitions": 12, "retention_hrs": 720},
    {"id": "payment.escrow.locked", "domain": "MARKETPLACE", "description": "Buyer funds deposited into AgriLink smart escrow", "partitions": 16, "retention_hrs": 720},
    {"id": "payment.released", "domain": "MARKETPLACE", "description": "Escrow disbursed to farmer upon quality signoff", "partitions": 16, "retention_hrs": 720},
    {"id": "payment.disputed", "domain": "MARKETPLACE", "description": "Quality deduction or weight shortage dispute raised", "partitions": 8, "retention_hrs": 720},
    {"id": "shipment.created", "domain": "MARKETPLACE", "description": "Consignment note and transport manifest generated", "partitions": 12, "retention_hrs": 720},
    {"id": "fpo.aggregate.lot.formed", "domain": "MARKETPLACE", "description": "FPO pools 20+ smallholder farmers into single bulk lot", "partitions": 8, "retention_hrs": 720},
    {"id": "mandi.gate.pass.issued", "domain": "MARKETPLACE", "description": "E-NAM electronic mandi gate clearance", "partitions": 8, "retention_hrs": 360},

    # KNOWLEDGE DOMAIN (11 topics)
    {"id": "knowledge.advisory.requested", "domain": "KNOWLEDGE", "description": "Farmer submits agronomy or price query", "partitions": 12, "retention_hrs": 168},
    {"id": "knowledge.recommendation.created", "domain": "KNOWLEDGE", "description": "Synthesized AI agronomic prescription generated", "partitions": 12, "retention_hrs": 360},
    {"id": "knowledge.source.updated", "domain": "KNOWLEDGE", "description": "ICAR package of practices or university trial update", "partitions": 4, "retention_hrs": 720},
    {"id": "knowledge.pest.protocol.retrieved", "domain": "KNOWLEDGE", "description": "Integrated Pest Management (IPM) guidance protocol", "partitions": 8, "retention_hrs": 360},
    {"id": "knowledge.agronomy.rule.matched", "domain": "KNOWLEDGE", "description": "Crop-stage specific fertilization rules matched", "partitions": 8, "retention_hrs": 360},
    {"id": "knowledge.crop.calendar.synced", "domain": "KNOWLEDGE", "description": "Agro-climatic seasonal sowing calendar alignment", "partitions": 6, "retention_hrs": 720},
    {"id": "knowledge.fertilizer.dosage.checked", "domain": "KNOWLEDGE", "description": "Soil test-based nutrient target verification", "partitions": 8, "retention_hrs": 360},
    {"id": "knowledge.organic.certification.verified", "domain": "KNOWLEDGE", "description": "NPOP organic compliance check", "partitions": 4, "retention_hrs": 720},
    {"id": "knowledge.govt.subsidy.matched", "domain": "KNOWLEDGE", "description": "PM-Kisan, PMKSY or state scheme entitlement matched", "partitions": 6, "retention_hrs": 720},
    {"id": "knowledge.export.mrl.screened", "domain": "KNOWLEDGE", "description": "Maximum Residue Limit (MRL) destination compliance", "partitions": 6, "retention_hrs": 720},
    {"id": "knowledge.peer.farmer.shared", "domain": "KNOWLEDGE", "description": "High-yield neighbor farmer benchmark insight shared", "partitions": 8, "retention_hrs": 360},

    # SAFETY DOMAIN (12 topics)
    {"id": "safety.action.requested", "domain": "SAFETY", "description": "Agent requests execution of recommendation or trade action", "partitions": 16, "retention_hrs": 720},
    {"id": "safety.action.approved", "domain": "SAFETY", "description": "Automated policy check passed; safe for execution", "partitions": 16, "retention_hrs": 720},
    {"id": "safety.action.blocked", "domain": "SAFETY", "description": "Action rejected due to high toxicity, price risk or rule breach", "partitions": 12, "retention_hrs": 720},
    {"id": "safety.confidence.low", "domain": "SAFETY", "description": "Model confidence below safety threshold (<75%)", "partitions": 8, "retention_hrs": 360},
    {"id": "safety.human-review.required", "domain": "SAFETY", "description": "High-impact recommendation queued for human agronomist/user approval", "partitions": 12, "retention_hrs": 720},
    {"id": "safety.chemical.threshold.exceeded", "domain": "SAFETY", "description": "Pesticide active ingredient safety dosage warning", "partitions": 8, "retention_hrs": 720},
    {"id": "safety.audit.logged", "domain": "SAFETY", "description": "Immutable compliance verification ledger entry", "partitions": 16, "retention_hrs": 720},
    {"id": "safety.override.recorded", "domain": "SAFETY", "description": "Human farmer or admin manual decision override", "partitions": 8, "retention_hrs": 720},
    {"id": "safety.advisory.disclaimer.attached", "domain": "SAFETY", "description": "Agronomic statutory disclaimer validation", "partitions": 8, "retention_hrs": 360},
    {"id": "safety.price.gouging.flagged", "domain": "SAFETY", "description": "Unreasonable buyer margin or predatory bid detection", "partitions": 6, "retention_hrs": 720},
    {"id": "safety.counterparty.risk.checked", "domain": "SAFETY", "description": "Buyer creditworthiness and default history screen", "partitions": 8, "retention_hrs": 720},
    {"id": "safety.emergency.halt.tripped", "domain": "SAFETY", "description": "Circuit breaker triggered for market or environmental anomaly", "partitions": 4, "retention_hrs": 720}
]

# 24 Autonomous Domain Agents
AGENTS_CATALOG = [
    {
        "id": "agent-market-intel",
        "name": "Market Intelligence Agent",
        "domain": "MARKET",
        "status": "ACTIVE",
        "task": "Synthesizing APMC arrival volumes and regional price arbitrage",
        "consumes": ["market.price.updated", "market.mandi.updated", "buyer.offer.created"],
        "produces": ["market.price.anomaly", "market.demand.detected", "market.price.recommendation"],
        "confidence": 94.2,
        "eventsConsumed": 4821,
        "eventsProduced": 642,
        "recommendation": "Tomato demand in Lucknow up 11%. Recommended farmer listing: ₹30–₹34/kg."
    },
    {
        "id": "agent-mandi-price",
        "name": "Mandi Price Agent",
        "domain": "MARKET",
        "status": "ACTIVE",
        "task": "Tracking real-time modal prices and modal rate deviations across 100+ APMCs",
        "consumes": ["market.mandi.updated", "market.terminal.market.index"],
        "produces": ["market.price.updated", "market.volatility.alert"],
        "confidence": 97.8,
        "eventsConsumed": 8930,
        "eventsProduced": 1420,
        "recommendation": "Kanpur Mandi benchmark at ₹28/kg. Premium wholesale buyer offers available at ₹33/kg."
    },
    {
        "id": "agent-buyer-demand",
        "name": "Buyer Demand Agent",
        "domain": "MARKET",
        "status": "ACTIVE",
        "task": "Aggregating institutional processor RFQs and daily factory intake capacities",
        "consumes": ["market.buyer.offer.created", "market.buyer.offer.updated"],
        "produces": ["market.demand.detected", "market.contract.created"],
        "confidence": 92.5,
        "eventsConsumed": 3140,
        "eventsProduced": 480,
        "recommendation": "FreshHarvest Foods expanding procurement quota by 40 tonnes for Grade A Tomato."
    },
    {
        "id": "agent-price-forecast",
        "name": "Price Forecast Agent",
        "domain": "MARKET",
        "status": "ACTIVE",
        "task": "Running econometrics on seasonality, festival demand, and harvest arrivals",
        "consumes": ["market.price.updated", "weather.rainfall.updated", "crop.yield.predicted"],
        "produces": ["market.futures.basis.calculated", "knowledge.recommendation.created"],
        "confidence": 88.6,
        "eventsConsumed": 2750,
        "eventsProduced": 310,
        "recommendation": "Price expected to rise +4.8% over next 6 days due to heavy rainfall in southern belt."
    },
    {
        "id": "agent-weather-intel",
        "name": "Weather Intelligence Agent",
        "domain": "WEATHER",
        "status": "ACTIVE",
        "task": "Monitoring Doppler radar storm cells, temperature anomalies and precipitation",
        "consumes": ["weather.temperature.updated", "weather.rainfall.radar.scanned"],
        "produces": ["weather.forecast.updated", "weather.alert.created"],
        "confidence": 96.1,
        "eventsConsumed": 9420,
        "eventsProduced": 1820,
        "recommendation": "Rain probability updated to 82% in Kanpur-Unnao corridor within next 18 hours."
    },
    {
        "id": "agent-extreme-weather",
        "name": "Extreme Weather Agent",
        "domain": "WEATHER",
        "status": "ACTIVE",
        "task": "Scanning for hailstorm, frost, squall, and convective cyclone vectors",
        "consumes": ["weather.wind.gust.alert", "weather.hailstorm.risk", "weather.temperature.updated"],
        "produces": ["weather.extreme-weather.detected", "safety.action.requested"],
        "confidence": 98.4,
        "eventsConsumed": 4210,
        "eventsProduced": 210,
        "recommendation": "No extreme cyclone or hailstorm risk detected across Central UP plains."
    },
    {
        "id": "agent-soil-intel",
        "name": "Soil Intelligence Agent",
        "domain": "SOIL",
        "status": "ACTIVE",
        "task": "Assessing rootzone moisture, NPK optical readings, and electrical conductivity",
        "consumes": ["soil.moisture.updated", "soil.nutrients.updated", "soil.ph.updated"],
        "produces": ["soil.health.assessed", "water.irrigation.required"],
        "confidence": 93.7,
        "eventsConsumed": 6840,
        "eventsProduced": 890,
        "recommendation": "Soil moisture at 38% (optimal). Nitrogen availability 240 kg/ha."
    },
    {
        "id": "agent-irrigation",
        "name": "Irrigation Agent",
        "domain": "WATER",
        "status": "ACTIVE",
        "task": "Optimizing water scheduling against crop growth stage and rainfall forecast",
        "consumes": ["soil.moisture.updated", "weather.forecast.updated", "crop.stage.updated"],
        "produces": ["water.irrigation.required", "water.usage.updated"],
        "confidence": 95.0,
        "eventsConsumed": 5420,
        "eventsProduced": 760,
        "recommendation": "Rain forecasted in 18 hrs (82% prob). Delay irrigation to prevent root hypoxia."
    },
    {
        "id": "agent-crop-health",
        "name": "Crop Health Agent",
        "domain": "CROP",
        "status": "ACTIVE",
        "task": "Computing Sentinel-2 NDVI vegetative vigor index and canopy temperature",
        "consumes": ["crop.ndvi.assessed", "crop.canopy.temperature", "crop.stage.updated"],
        "produces": ["crop.health.updated", "crop.harvest.predicted"],
        "confidence": 91.8,
        "eventsConsumed": 4120,
        "eventsProduced": 540,
        "recommendation": "NDVI at 0.74 (Vigorous growth). Tomato crop in active fruit development stage."
    },
    {
        "id": "agent-disease-detection",
        "name": "Disease Detection Agent",
        "domain": "CROP",
        "status": "ACTIVE",
        "task": "Evaluating microclimate humidity-hours for early blight and fungal pathogen risk",
        "consumes": ["weather.humidity.updated", "crop.blight.early-warning", "crop.health.updated"],
        "produces": ["crop.disease.detected", "safety.action.requested"],
        "confidence": 89.2,
        "eventsConsumed": 3890,
        "eventsProduced": 320,
        "recommendation": "Moderate humidity spike. Apply preventative bio-fungicide if wetness persists >12 hrs."
    },
    {
        "id": "agent-yield-prediction",
        "name": "Yield Prediction Agent",
        "domain": "CROP",
        "status": "ACTIVE",
        "task": "Projecting farmgate harvest tonnage using dynamic biomass growth models",
        "consumes": ["crop.stage.updated", "soil.health.assessed", "weather.temperature.updated"],
        "produces": ["crop.yield.predicted", "market.terminal.market.index"],
        "confidence": 90.4,
        "eventsConsumed": 2980,
        "eventsProduced": 190,
        "recommendation": "Projected yield: 18.5 tonnes/ha (+6% above regional seasonal average)."
    },
    {
        "id": "agent-harvest-planning",
        "name": "Harvest Planning Agent",
        "domain": "CROP",
        "status": "ACTIVE",
        "task": "Calculating optimal harvest timing to balance fruit firmness with mandi prices",
        "consumes": ["crop.stage.updated", "market.price.updated", "weather.forecast.updated"],
        "produces": ["crop.harvest.predicted", "lot.created"],
        "confidence": 93.0,
        "eventsConsumed": 3450,
        "eventsProduced": 410,
        "recommendation": "Harvest 60% of mature lot today before rain; hold remaining for post-rain price surge."
    },
    {
        "id": "agent-livestock-health",
        "name": "Livestock Health Agent",
        "domain": "LIVESTOCK",
        "status": "ACTIVE",
        "task": "Analyzing dairy herd rumination index, body temperature, and SCC milk quality",
        "consumes": ["livestock.health.updated", "livestock.rumination.index", "livestock.milk.scc.quality"],
        "produces": ["livestock.health-risk.detected", "safety.action.requested"],
        "confidence": 95.6,
        "eventsConsumed": 3610,
        "eventsProduced": 280,
        "recommendation": "Herd rumination normal (485 min/day). Somatic cell count 140K/mL (Grade A Premium)."
    },
    {
        "id": "agent-feed-optimization",
        "name": "Feed Optimization Agent",
        "domain": "LIVESTOCK",
        "status": "ACTIVE",
        "task": "Formulating lowest-cost balanced Total Mixed Rations based on local grain prices",
        "consumes": ["market.price.updated", "livestock.feed.updated", "crop.moisture.grain.tested"],
        "produces": ["livestock.feed.ration.optimized"],
        "confidence": 94.1,
        "eventsConsumed": 2180,
        "eventsProduced": 190,
        "recommendation": "Incorporate 15% maize bran and mustard cake to reduce feed cost by ₹1.80/kg."
    },
    {
        "id": "agent-logistics",
        "name": "Logistics Agent",
        "domain": "LOGISTICS",
        "status": "ACTIVE",
        "task": "Coordinating farmgate pickup, loading schedules, and digital gate pass dispatch",
        "consumes": ["order.created", "shipment.created", "logistics.vehicle.updated"],
        "produces": ["logistics.geo-fence.entered", "logistics.delay.detected"],
        "confidence": 96.5,
        "eventsConsumed": 6120,
        "eventsProduced": 940,
        "recommendation": "Scheduled pickup for 800 kg Tomato via Lucknow Corridor (42 km). ETA: 45 min."
    },
    {
        "id": "agent-route-optimization",
        "name": "Route Optimization Agent",
        "domain": "LOGISTICS",
        "status": "ACTIVE",
        "task": "Calculating real-time detour routes around highway congestion and mandi bottlenecks",
        "consumes": ["logistics.vehicle.updated", "logistics.delay.detected", "logistics.toll.congestion.rerouted"],
        "produces": ["logistics.route.updated"],
        "confidence": 97.2,
        "eventsConsumed": 5410,
        "eventsProduced": 780,
        "recommendation": "NH-27 bypass saves 31 minutes vs inner city route. Re-routed transit vehicle."
    },
    {
        "id": "agent-supply-demand",
        "name": "Supply-Demand Agent",
        "domain": "MARKET",
        "status": "ACTIVE",
        "task": "Modeling macro crop balance sheets, processing absorption and export demand",
        "consumes": ["market.mandi.updated", "crop.yield.predicted", "market.buyer.offer.created"],
        "produces": ["market.demand.detected", "market.volatility.alert"],
        "confidence": 91.0,
        "eventsConsumed": 3890,
        "eventsProduced": 430,
        "recommendation": "Northern tomato processing demand deficit: +180 tonnes required this week."
    },
    {
        "id": "agent-marketplace-matching",
        "name": "Marketplace Matching Agent",
        "domain": "MARKETPLACE",
        "status": "ACTIVE",
        "task": "Pairing farmer harvest lots with verified institutional buyers by proximity and price",
        "consumes": ["lot.created", "buyer.offer.created", "market.price.updated"],
        "produces": ["lot.matched", "safety.action.requested"],
        "confidence": 95.8,
        "eventsConsumed": 7240,
        "eventsProduced": 1150,
        "recommendation": "Matched Lot KL-LOT-10493 (Tomato) with FreshHarvest Foods. Score: 94%."
    },
    {
        "id": "agent-agri-knowledge",
        "name": "Agricultural Knowledge Agent",
        "domain": "KNOWLEDGE",
        "status": "ACTIVE",
        "task": "Querying ICAR agronomic rules, MRL limits, and organic package of practices",
        "consumes": ["knowledge.advisory.requested", "crop.disease.detected", "knowledge.source.updated"],
        "produces": ["knowledge.recommendation.created", "safety.action.requested"],
        "confidence": 98.0,
        "eventsConsumed": 4820,
        "eventsProduced": 920,
        "recommendation": "Verified IPM compliance protocol: Pre-harvest interval (PHI) is 3 days."
    },
    {
        "id": "agent-risk-intel",
        "name": "Risk Intelligence Agent",
        "domain": "MARKET",
        "status": "ACTIVE",
        "task": "Computing composite farm revenue risk index across weather, credit, and price volatility",
        "consumes": ["weather.alert.created", "market.volatility.alert", "payment.disputed"],
        "produces": ["safety.confidence.low", "knowledge.recommendation.created"],
        "confidence": 93.4,
        "eventsConsumed": 3410,
        "eventsProduced": 390,
        "recommendation": "Overall farm risk score: LOW (24/100). Net realization is protected by buyer escrow."
    },
    {
        "id": "agent-fraud-detection",
        "name": "Fraud Detection Agent",
        "domain": "MARKETPLACE",
        "status": "ACTIVE",
        "task": "Screening for phantom lots, fraudulent assay certificates, and payment default patterns",
        "consumes": ["buyer.offer.created", "payment.escrow.locked", "lot.quality.certified"],
        "produces": ["safety.action.blocked", "safety.audit.logged"],
        "confidence": 99.1,
        "eventsConsumed": 6890,
        "eventsProduced": 140,
        "recommendation": "All active buyers verified with 100% Escrow deposit and zero default history."
    },
    {
        "id": "agent-quality-grading",
        "name": "Quality Grading Agent",
        "domain": "MARKETPLACE",
        "status": "ACTIVE",
        "task": "Computer vision assessment of produce size uniformity, color saturation, and surface defects",
        "consumes": ["lot.created", "crop.moisture.grain.tested"],
        "produces": ["lot.quality.certified"],
        "confidence": 94.7,
        "eventsConsumed": 4120,
        "eventsProduced": 620,
        "recommendation": "Visual assay confirmed: 92% uniform deep red color, Grade A premium tier."
    },
    {
        "id": "agent-sustainability",
        "name": "Sustainability Agent",
        "domain": "SOIL",
        "status": "ACTIVE",
        "task": "Quantifying carbon sequestration, water use efficiency, and soil organic matter accrual",
        "consumes": ["soil.organic-carbon.updated", "water.usage.updated", "crop.stage.updated"],
        "produces": ["knowledge.recommendation.created"],
        "confidence": 92.3,
        "eventsConsumed": 2190,
        "eventsProduced": 180,
        "recommendation": "Drip irrigation saved 28,000 liters water/acre; +0.12% soil organic carbon improvement."
    },
    {
        "id": "agent-safety-policy",
        "name": "Safety & Policy Agent",
        "domain": "SAFETY",
        "status": "ACTIVE",
        "task": "Executing automated guardrails, compliance checks, and human-in-the-loop escalation",
        "consumes": ["safety.action.requested", "safety.chemical.threshold.exceeded"],
        "produces": ["safety.action.approved", "safety.action.blocked", "safety.human-review.required"],
        "confidence": 99.9,
        "eventsConsumed": 11450,
        "eventsProduced": 2180,
        "recommendation": "All 18 active trade and irrigation recommendations safety-screened and policy approved."
    }
]

# In-memory realistic events buffer
START_TIME = time.time()
BASE_EVENT_COUNTER = 34820

@router.get("/status")
def get_agrios_status():
    elapsed_seconds = time.time() - START_TIME
    # Simulate ~23 events per minute (~2.6s interval)
    current_count = int(BASE_EVENT_COUNTER + (elapsed_seconds / 2.6))
    
    return {
        "status": "OPERATIONAL",
        "mode": "LIVE SIMULATION", # Automatically switchable to LIVE STREAM
        "agentCount": 24,
        "topicCount": len(TOPICS_CATALOG),
        "eventsProcessed": current_count,
        "avgEventIntervalSeconds": 2.6,
        "systemAvailabilityPct": 99.97,
        "activeRecommendationsCount": 17,
        "humanReviewQueueCount": 3,
        "blockedActionsCount": 1,
        "eventRatePerMin": 23,
        "lastEventSecondsAgo": round(random.uniform(0.8, 2.4), 1),
        "systemLoadPct": 28.4,
        "activePartitions": 1420
    }

@router.get("/topics")
def get_topics(domain: Optional[str] = None):
    if domain:
        return [t for t in TOPICS_CATALOG if t["domain"].upper() == domain.upper()]
    return TOPICS_CATALOG

@router.get("/agents")
def get_agents():
    return AGENTS_CATALOG

@router.get("/events")
def get_recent_events(limit: int = 25):
    # Generates a realistic causal event stream
    now = datetime.now()
    sample_events = [
        {
            "id": f"evt-{int(time.time()*1000)-1000}",
            "timestamp": (now - timedelta(seconds=2)).strftime("%H:%M:%S"),
            "agentName": "Marketplace Matching Agent",
            "domain": "MARKETPLACE",
            "topic": "lot.matched",
            "summary": "Matched Lot #KL-LOT-10493 (Tomato 800 kg) with FreshHarvest Foods",
            "payload": {"lot_id": "KL-LOT-10493", "crop": "Tomato", "buyer": "FreshHarvest", "score": 94},
            "status": "APPROVED",
            "confidence": 95.8
        },
        {
            "id": f"evt-{int(time.time()*1000)-3600}",
            "timestamp": (now - timedelta(seconds=5)).strftime("%H:%M:%S"),
            "agentName": "Safety & Policy Agent",
            "domain": "SAFETY",
            "topic": "safety.action.approved",
            "summary": "Verified trade pricing within safe mandi bounds (₹31–₹34/kg)",
            "payload": {"action": "PRICE_RECOMMENDATION", "crop": "Tomato", "verified": True},
            "status": "APPROVED",
            "confidence": 99.9
        },
        {
            "id": f"evt-{int(time.time()*1000)-6200}",
            "timestamp": (now - timedelta(seconds=8)).strftime("%H:%M:%S"),
            "agentName": "Price Forecast Agent",
            "domain": "MARKET",
            "topic": "market.price.recommendation",
            "summary": "Computed net realization optimum: Suggested range ₹31.00–₹34.00/kg",
            "payload": {"crop": "Tomato", "mandi_ref": 28.0, "suggested_min": 31.0, "suggested_max": 34.0},
            "status": "APPROVED",
            "confidence": 91.2
        },
        {
            "id": f"evt-{int(time.time()*1000)-8800}",
            "timestamp": (now - timedelta(seconds=11)).strftime("%H:%M:%S"),
            "agentName": "Market Intelligence Agent",
            "domain": "MARKET",
            "topic": "market.demand.detected",
            "summary": "Tomato demand surge detected in Lucknow (+11% processor inquiry)",
            "payload": {"crop": "Tomato", "demand_change_pct": 11.0, "hub": "Lucknow"},
            "status": "APPROVED",
            "confidence": 94.2
        },
        {
            "id": f"evt-{int(time.time()*1000)-11400}",
            "timestamp": (now - timedelta(seconds=14)).strftime("%H:%M:%S"),
            "agentName": "Crop Health Agent",
            "domain": "CROP",
            "topic": "crop.harvest.predicted",
            "summary": "Harvest risk increased due to impending precipitation event",
            "payload": {"crop": "Tomato", "risk_level": "MODERATE", "mature_pct": 85},
            "status": "APPROVED",
            "confidence": 91.8
        },
        {
            "id": f"evt-{int(time.time()*1000)-14000}",
            "timestamp": (now - timedelta(seconds=16)).strftime("%H:%M:%S"),
            "agentName": "Irrigation Agent",
            "domain": "WATER",
            "topic": "water.irrigation.required",
            "summary": "Delay irrigation: Rain probability 82% exceeds crop water deficit threshold",
            "payload": {"action": "DELAY_IRRIGATION", "hours_hold": 24, "saving_liters": 14000},
            "status": "APPROVED",
            "confidence": 95.0
        },
        {
            "id": f"evt-{int(time.time()*1000)-16600}",
            "timestamp": (now - timedelta(seconds=19)).strftime("%H:%M:%S"),
            "agentName": "Weather Intelligence Agent",
            "domain": "WEATHER",
            "topic": "weather.forecast.updated",
            "summary": "Radar scans show convective cloud cluster moving over Central UP (82% rain prob)",
            "payload": {"precip_mm": 24.5, "prob_pct": 82, "window_hours": 18},
            "status": "APPROVED",
            "confidence": 96.1
        },
        {
            "id": f"evt-{int(time.time()*1000)-19200}",
            "timestamp": (now - timedelta(seconds=22)).strftime("%H:%M:%S"),
            "agentName": "Logistics Agent",
            "domain": "LOGISTICS",
            "topic": "logistics.route.updated",
            "summary": "Traffic congestion detected on NH-27; re-routed truck via Outer Bypass (saved 31m)",
            "payload": {"truck_id": "UP-78-BT-4092", "eta_min_saved": 31, "cold_chain_temp": 11.2},
            "status": "APPROVED",
            "confidence": 97.2
        },
        {
            "id": f"evt-{int(time.time()*1000)-21800}",
            "timestamp": (now - timedelta(seconds=25)).strftime("%H:%M:%S"),
            "agentName": "Livestock Health Agent",
            "domain": "LIVESTOCK",
            "topic": "livestock.rumination.index",
            "summary": "Dairy herd rumination stable at 485 min/day; milk SCC quality Grade A",
            "payload": {"herd_id": "HD-04", "rumination_min": 485, "scc_k_ml": 140},
            "status": "APPROVED",
            "confidence": 95.6
        },
        {
            "id": f"evt-{int(time.time()*1000)-24400}",
            "timestamp": (now - timedelta(seconds=27)).strftime("%H:%M:%S"),
            "agentName": "Disease Detection Agent",
            "domain": "CROP",
            "topic": "safety.human-review.required",
            "summary": "Chemical spray request: High humidity hours triggered preventative bio-spray review",
            "payload": {"crop": "Tomato", "chemical": "Copper Oxychloride", "requires_review": True},
            "status": "HUMAN_REVIEW",
            "confidence": 72.4
        }
    ]
    return sample_events[:limit]

@router.get("/pricing-breakdown")
def get_pricing_breakdown(crop: str = "Tomato", quantity_kg: float = 800.0):
    # Dynamic transparent pricing model
    mandi_benchmark = 28.0
    buyer_demand = 3.0
    quality_premium = 1.5
    location_factor = 0.8
    weather_risk = -0.5
    logistics_cost = -0.8
    suggested_min = 31.0
    suggested_max = 34.0
    confidence = 91.4

    return {
        "crop": crop,
        "quantity_kg": quantity_kg,
        "mandi_benchmark": mandi_benchmark,
        "buyer_demand_premium": buyer_demand,
        "quality_premium": quality_premium,
        "location_factor": location_factor,
        "weather_risk_factor": weather_risk,
        "logistics_deduction": logistics_cost,
        "suggested_min_price": suggested_min,
        "suggested_max_price": suggested_max,
        "model_confidence_pct": confidence,
        "formula": "Suggested = Mandi Benchmark + Buyer Demand + Quality + Location - Weather Risk - Logistics",
        "factors": [
            {"label": "Mandi Benchmark Rate", "value": f"₹{mandi_benchmark:.2f}/kg", "type": "base", "color": "text-charcoal"},
            {"label": "Verified Buyer Demand Surge", "value": f"+₹{buyer_demand:.2f}", "type": "positive", "color": "text-agriGreen"},
            {"label": "Grade A Quality Assay Premium", "value": f"+₹{quality_premium:.2f}", "type": "positive", "color": "text-agriGreen"},
            {"label": "Proximity Location Factor (Kanpur-Lucknow)", "value": f"+₹{location_factor:.2f}", "type": "positive", "color": "text-agriGreen"},
            {"label": "Precipitation Harvest Risk", "value": f"₹{weather_risk:.2f}", "type": "negative", "color": "text-agriDanger"},
            {"label": "Direct Farmgate Logistics", "value": f"₹{logistics_cost:.2f}", "type": "negative", "color": "text-agriDanger"}
        ],
        "explanation": "Your asking price is +4.8% above the Kanpur APMC baseline but well within the active institutional buyer range (₹31–₹34/kg)."
    }

@router.get("/review-queue")
def get_human_review_queue():
    return [
        {
            "id": "rev-101",
            "title": "High Weather Risk Tomato Harvest Scheduling",
            "domain": "WEATHER / CROP",
            "agent": "Harvest Planning Agent",
            "recommendation": "Execute emergency early harvest of 500 kg mature tomato crop before 82% rain window",
            "confidence": 72.4,
            "riskLevel": "HIGH",
            "submittedAt": "12 mins ago",
            "factors": [
                {"label": "Rain Probability", "value": "82% within 18 hrs"},
                {"label": "Field Rot Risk", "value": "+35% if unpicked"},
                {"label": "Labor Availability", "value": "2 farmhands assigned"}
            ]
        },
        {
            "id": "rev-102",
            "title": "Pesticide Chemical Dosage Verification",
            "domain": "CROP / SAFETY",
            "agent": "Disease Detection Agent",
            "recommendation": "Apply Copper Oxychloride (2.5g/L) for preventative late blight protection",
            "confidence": 68.0,
            "riskLevel": "CONSEQUENTIAL",
            "submittedAt": "24 mins ago",
            "factors": [
                {"label": "Humidity Window", "value": ">85% for 14 hours"},
                {"label": "PHI Pre-harvest interval", "value": "3 days required"},
                {"label": "Organic Certification Impact", "value": "Permitted under NPOP"}
            ]
        },
        {
            "id": "rev-103",
            "title": "Large Institutional Bulk Contract Execution",
            "domain": "MARKETPLACE / FPO",
            "agent": "Marketplace Matching Agent",
            "recommendation": "Commit FPO bulk lot of 12.5 tonnes at locked price ₹34/kg with 24hr escrow release",
            "confidence": 74.5,
            "riskLevel": "FINANCIAL",
            "submittedAt": "45 mins ago",
            "factors": [
                {"label": "Contract Value", "value": "₹4,25,000"},
                {"label": "Buyer Reliability", "value": "94.2% verified score"},
                {"label": "Member Farmers", "value": "24 farmers pooled"}
            ]
        }
    ]

@router.post("/review/{review_id}/action")
def process_review_action(review_id: str, action: str = Query(..., pattern="^(APPROVE|BLOCK|DISMISS)$")):
    return {
        "review_id": review_id,
        "action": action,
        "processed_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "status": "RECORDED_IN_AUDIT_LEDGER"
    }
