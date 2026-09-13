import React, { useState, useMemo, useCallback } from "react";
import {
  LayoutDashboard, Radar, Users, ShoppingCart, Boxes, Truck, IndianRupee,
  Leaf, PlayCircle, Menu, X, ChevronRight, ArrowRight, ArrowDown,
  MapPin, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Clock,
  Package, Sparkles, Route as RouteIcon, Wallet, BadgeCheck, Info,
  Sprout, Factory, Scale, Languages, Mic, ChevronDown
} from "lucide-react";
import { CROPS, LOCATIONS, FARMERS, BUYERS, VEHICLES, DEMAND_HISTORY, DEMAND_MONTHS, DEMAND_RADAR, VIRTUAL_LOTS } from "./data/mockData.js";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, AreaChart, Area
} from "recharts";

/* ============================================================
   KISANFLOW — Demand-first agricultural supply chain
   ============================================================ */

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
`;

const COLORS = {
  bg: "#F6F4EC",
  panel: "#FFFFFF",
  ink: "#16241A",
  forest: "#20402A",
  forestDeep: "#152A1B",
  sage: "#7C9070",
  amber: "#C6801F",
  amberSoft: "#F1E0BE",
  brick: "#A5402F",
  brickSoft: "#F3DBD5",
  balanced: "#5C7A3F",
  balancedSoft: "#E4EAD7",
  line: "#DDD7C6",
};

/* ---------------- Mock data layer (deterministic, fixed) ---------------- */

function statusFor(demand, supply) {
  const ratio = supply / demand;
  if (ratio < 0.85) return { key: "SHORTAGE", color: COLORS.brick, bg: COLORS.brickSoft };
  if (ratio > 1.15) return { key: "SURPLUS", color: COLORS.balanced, bg: COLORS.balancedSoft };
  return { key: "BALANCED", color: COLORS.amber, bg: COLORS.amberSoft };
}

/* ---------------- Deterministic "AI" service layer ---------------- */
/* Structured so a real ML/optimization backend can replace these later. */

function forecastDemand(history) {
  const avg = history.reduce((a, b) => a + b, 0) / history.length;
  const trend = (history[history.length - 1] - history[0]) / history.length;
  const seasonal = 1.04; // fixed seasonal multiplier for prototype
  return Math.round((avg + trend * 2) * seasonal);
}

function matchFarmerScore(farmer, need) {
  const cropMatch = farmer.crop === need.crop ? 40 : 0;
  const qtyScore = Math.min(25, (farmer.qty / need.quantity) * 25);
  const distanceScore = 20 - (farmer.loc === need.loc ? 0 : 4); // simplified heuristic
  const readinessScore = farmer.ready.includes("Tomorrow") ? 15 : 8;
  return Math.round(cropMatch + qtyScore + distanceScore + readinessScore);
}

function recommendBuyer(buyersOffers, logisticsCost, farmerMin) {
  return buyersOffers
    .map((b) => ({ ...b, realization: b.offer - logisticsCost }))
    .filter((b) => b.realization >= farmerMin)
    .sort((a, b) => b.realization - a.realization)[0];
}

/* ---------------- Shared UI atoms ---------------- */

function AILabel({ children = "AI Forecast" }) {
  return (
    <span className="ai-tag">
      <Sparkles size={12} strokeWidth={2.5} />
      {children}
    </span>
  );
}

function StatusPill({ status }) {
  return (
    <span className="status-pill" style={{ color: status.color, background: status.bg, borderColor: status.color + "33" }}>
      {status.key}
    </span>
  );
}

function Card({ title, icon: Icon, action, children, tone }) {
  return (
    <div className={`card ${tone ? "card-" + tone : ""}`}>
      {(title || Icon) && (
        <div className="card-head">
          <div className="card-head-title">
            {Icon && <Icon size={17} strokeWidth={2} />}
            {title}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function Metric({ label, value, sub, trend }) {
  return (
    <div className="metric">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {sub && (
        <div className={`metric-sub ${trend === "up" ? "up" : trend === "down" ? "down" : ""}`}>
          {trend === "up" && <TrendingUp size={13} />}
          {trend === "down" && <TrendingDown size={13} />}
          {sub}
        </div>
      )}
    </div>
  );
}

function Disclaimer({ children }) {
  return (
    <div className="disclaimer">
      <Info size={14} />
      <span>{children || "Prototype simulation — illustrative estimate, not a verified real-world result."}</span>
    </div>
  );
}

/* ---------------- Navigation ---------------- */

const NAV = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "radar", label: "Demand Radar", icon: Radar },
  { key: "farmers", label: "Farmer Network", icon: Users },
  { key: "buyers", label: "Buyer Network", icon: ShoppingCart },
  { key: "lots", label: "Virtual Lots", icon: Boxes },
  { key: "logistics", label: "Logistics AI", icon: Truck },
  { key: "price", label: "Price Intelligence", icon: IndianRupee },
  { key: "impact", label: "Impact", icon: Leaf },
  { key: "demo", label: "Simulation", icon: PlayCircle },
];

/* ================================================================
   PAGE: Overview (Landing + Admin Control Center)
   ================================================================ */

function OverviewPage({ role, goTo }) {
  const totalDemand = DEMAND_RADAR.reduce((a, r) => a + r.demand, 0);
  const totalSupply = DEMAND_RADAR.reduce((a, r) => a + r.supply, 0);
  const activeFarmers = FARMERS.length;
  const activeBuyers = BUYERS.length;
  const vehiclesAvailable = VEHICLES.filter((v) => v.capacity - v.used >= 2).length;

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow-free-label">Ministry of Consumer Affairs, Food &amp; Public Distribution</div>
          <h1 className="hero-title">KISANFLOW</h1>
          <p className="hero-tagline">Predict the demand. Pool the harvest. Optimize the journey.</p>
          <p className="hero-sub">
            An AI-assisted demand-to-delivery network that connects farmers, bulk buyers and logistics —
            starting from where demand is heading, not just what is already harvested.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => goTo("radar")}>
              Open Control Center <ArrowRight size={16} />
            </button>
            <button className="btn btn-ghost" onClick={() => goTo("demo")}>
              <PlayCircle size={16} /> Run Simulation
            </button>
          </div>
        </div>
        <div className="hero-flow">
          {["Demand", "AI Forecast", "Farmer Aggregation", "Virtual Lot", "Load Pooling", "Route Optimization", "Buyer"].map((s, i, arr) => (
            <React.Fragment key={s}>
              <div className="flow-node">{s}</div>
              {i < arr.length - 1 && <ArrowDown size={14} className="flow-arrow" />}
            </React.Fragment>
          ))}
        </div>
      </section>

      <section className="metrics-row">
        <Metric label="Farmer value protected" value="₹24.8L" sub="est. this season" trend="up" />
        <Metric label="Logistics utilization" value="86%" sub="vs 58% traditional" trend="up" />
        <Metric label="Forecast accuracy" value="82%" sub="prototype backtest" />
        <Metric label="Waste reduction potential" value="34%" sub="freshness-aware routing" trend="up" />
      </section>

      <section className="why-grid">
        <h2 className="section-title">Why KISANFLOW</h2>
        <div className="grid-5">
          {[
            { icon: Radar, t: "Demand before harvest", d: "Forecasts what buyers will need next, so sowing and selling decisions follow the market instead of chasing it." },
            { icon: Boxes, t: "Virtual farmer aggregation", d: "Combines small, scattered quantities from many farmers into one bulk lot a buyer can actually transact with." },
            { icon: Truck, t: "AI load pooling", d: "Groups nearby shipments onto shared vehicles instead of sending half-empty trucks to the same corridor." },
            { icon: Clock, t: "Spoilage-aware routing", d: "Weighs how perishable each crop is against delivery time when deciding pickup order and route." },
            { icon: IndianRupee, t: "Farmer-centric pricing", d: "Shows the full price waterfall from consumer to farmer, so realization is visible, not assumed." },
          ].map((c) => (
            <div className="why-card" key={c.t}>
              <c.icon size={20} strokeWidth={1.8} />
              <div className="why-t">{c.t}</div>
              <div className="why-d">{c.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head-row">
          <h2 className="section-title">Supply Chain Intelligence Center</h2>
          <span className="muted-sub">Real-time view of predicted demand, available supply and logistics.</span>
        </div>
        <div className="grid-4">
          <Metric label="Predicted demand (7d)" value={totalDemand.toLocaleString("en-IN") + " kg"} />
          <Metric label="Available supply (7d)" value={totalSupply.toLocaleString("en-IN") + " kg"} />
          <Metric label="Active farmers" value={activeFarmers} />
          <Metric label="Active buyers" value={activeBuyers} />
          <Metric label="Open virtual lots" value={VIRTUAL_LOTS.length} />
          <Metric label="Vehicles with free capacity" value={vehiclesAvailable + " / " + VEHICLES.length} />
          <Metric label="Potential farmer savings" value="₹4.10/kg" sub="vs traditional chain" trend="up" />
          <Metric label="Estimated waste avoided" value="1.8 T" sub="this week" />
        </div>
      </section>

      <section>
        <h2 className="section-title">AI opportunity alerts</h2>
        <div className="alert-list">
          <div className="alert-item shortage">
            <AlertTriangle size={16} />
            <span>Tomato demand in Hyderabad is projected to exceed available committed supply by <b>8,000 kg</b> over the next 7 days.</span>
          </div>
          <div className="alert-item ok">
            <CheckCircle2 size={16} />
            <span>3 nearby farmer clusters (Warangal, Siddipet, Nalgonda) can together satisfy <b>72%</b> of the projected gap.</span>
          </div>
          <div className="alert-item info">
            <Truck size={16} />
            <span>Vehicle <b>TRK-104</b> is running Sangareddy → Hyderabad with 4 tonnes of unused capacity today.</span>
          </div>
        </div>
      </section>

      <Disclaimer>All figures on this page are prototype simulation values used to demonstrate the KISANFLOW concept.</Disclaimer>
    </div>
  );
}

/* ================================================================
   PAGE: Demand Radar
   ================================================================ */

function DemandRadarPage() {
  const [loc, setLoc] = useState("All");
  const [crop, setCrop] = useState("All");
  const [modalRow, setModalRow] = useState(null);

  const rows = DEMAND_RADAR.filter(
    (r) => (loc === "All" || r.loc === loc) && (crop === "All" || r.crop === crop)
  );

  const chartData = DEMAND_MONTHS.map((m, i) => ({
    month: m,
    Tomato: DEMAND_HISTORY.Tomato[i],
    Onion: DEMAND_HISTORY.Onion[i],
    Chilli: DEMAND_HISTORY.Chilli[i],
  }));

  return (
    <div className="page">
      <div className="page-head">
        <h1>AI Demand Radar</h1>
        <p className="muted-sub">Predicting what the market will need before the produce reaches it.</p>
      </div>

      <div className="filter-row">
        <select value={loc} onChange={(e) => setLoc(e.target.value)}>
          <option>All</option>
          {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
        </select>
        <select value={crop} onChange={(e) => setCrop(e.target.value)}>
          <option>All</option>
          {CROPS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select defaultValue="Next 7 days">
          <option>Next 7 days</option>
          <option>Next 14 days</option>
          <option>Next 30 days</option>
        </select>
        <select defaultValue="All">
          <option>All buyer types</option>
          <option>Retail Chain</option>
          <option>Wholesaler</option>
          <option>Exporter</option>
          <option>Processor</option>
        </select>
      </div>

      <Card title="Historical demand → forecast demand" icon={TrendingUp}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid stroke={COLORS.line} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: COLORS.ink }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: COLORS.ink }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.line}`, fontFamily: "IBM Plex Sans" }} />
            <Legend />
            <Line type="monotone" dataKey="Tomato" stroke={COLORS.brick} strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="Onion" stroke={COLORS.amber} strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="Chilli" stroke={COLORS.forest} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="chart-note">Oct* is the AI-forecasted month; Mar–Sep are historical demand.</div>
      </Card>

      <div className="radar-list">
        {rows.map((r) => {
          const st = statusFor(r.demand, r.supply);
          const gap = r.demand - r.supply;
          return (
            <Card key={r.crop + r.loc}>
              <div className="radar-row">
                <div className="radar-main">
                  <div className="radar-title-row">
                    <span className="radar-crop">{r.crop}</span>
                    <span className="radar-loc"><MapPin size={13} /> {r.loc}</span>
                    <StatusPill status={st} />
                  </div>
                  <div className="radar-figs">
                    <div><span className="fig-label">Forecast demand (7d)</span><span className="fig-val">{r.demand.toLocaleString("en-IN")} kg</span></div>
                    <div><span className="fig-label">Current supply</span><span className="fig-val">{r.supply.toLocaleString("en-IN")} kg</span></div>
                    <div><span className="fig-label">{gap >= 0 ? "Gap" : "Surplus"}</span><span className="fig-val" style={{ color: st.color }}>{Math.abs(gap).toLocaleString("en-IN")} kg</span></div>
                    <div><span className="fig-label">Projected buyer price</span><span className="fig-val">₹{r.price}/kg</span></div>
                    <div><span className="fig-label">Expected farmer realization</span><span className="fig-val">₹{r.farmerLow}–₹{r.farmerHigh}/kg</span></div>
                    <div><span className="fig-label">AI confidence</span><span className="fig-val">{r.confidence}%</span></div>
                  </div>
                </div>
                {gap > 0 && (
                  <button className="btn btn-primary btn-sm" onClick={() => setModalRow(r)}>
                    Create Supply Opportunity
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {modalRow && (
        <div className="modal-backdrop" onClick={() => setModalRow(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <span><Sparkles size={16} /> AI Supply Opportunity</span>
              <button className="icon-btn" onClick={() => setModalRow(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="modal-line"><span>Requirement</span><b>{(modalRow.demand - modalRow.supply).toLocaleString("en-IN")} kg {modalRow.crop.toLowerCase()}</b></div>
              <div className="modal-line"><span>Suggested farmer clusters</span><b>Warangal · Siddipet · Nalgonda</b></div>
              <div className="modal-line"><span>Suggested fulfillment date</span><b>Tomorrow</b></div>
              <div className="modal-line"><span>Expected farmer realization</span><b>₹{modalRow.farmerHigh}/kg</b></div>
              <Disclaimer>Suggested clusters are ranked by the prototype matching heuristic (crop fit, quantity, distance, readiness).</Disclaimer>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModalRow(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => setModalRow(null)}>Create Virtual Lot</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   PAGE: Farmer Network / Farmer Dashboard
   ================================================================ */

function FarmerPage() {
  const [showForm, setShowForm] = useState(false);
  const my = FARMERS[0]; // demo farmer: Ramesh Reddy

  return (
    <div className="page">
      <div className="page-head">
        <h1>Namaste, {my.name.split(" ")[0]}</h1>
        <p className="muted-sub">{my.loc} · Registered farmer</p>
      </div>

      <div className="grid-4">
        <Metric label="My produce" value="2 lots" sub="Tomato, Chilli" />
        <Metric label="Active orders" value="1" sub="Virtual Lot VL-2026-014" />
        <Metric label="Expected earnings" value="₹48,000" sub="pending pickup" trend="up" />
        <Metric label="Pickup scheduled" value="Tomorrow" sub="9:00–11:00 AM" />
      </div>

      <Card
        title="My current produce"
        icon={Sprout}
        action={<button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>Add Produce</button>}
      >
        <table className="table">
          <thead><tr><th>Crop</th><th>Quantity</th><th>Grade</th><th>Harvest readiness</th></tr></thead>
          <tbody>
            <tr><td>Tomato</td><td>700 kg</td><td><span className="grade-pill">Grade A</span></td><td>Tomorrow</td></tr>
            <tr><td>Chilli</td><td>350 kg</td><td><span className="grade-pill">Grade A</span></td><td>3 days</td></tr>
          </tbody>
        </table>
      </Card>

      <Card title="AI market opportunity" icon={Sparkles} tone="amber">
        <p className="opp-line">Hyderabad tomato demand is expected to rise next week.</p>
        <div className="opp-figs">
          <div><span className="fig-label">Expected demand</span><span className="fig-val">22 tonnes</span></div>
          <div><span className="fig-label">Your potential contribution</span><span className="fig-val">700 kg</span></div>
          <div><span className="fig-label">Estimated realization</span><span className="fig-val">₹24/kg</span></div>
          <div><span className="fig-label">Potential earning</span><span className="fig-val">₹16,800</span></div>
        </div>
        <button className="btn btn-primary">Join Virtual Lot</button>
        <AILabel>Projected, not guaranteed</AILabel>
      </Card>

      <Card title="Voice & regional language" icon={Languages}>
        <p className="muted-sub" style={{ marginBottom: 10 }}>Farmers can interact using voice or a regional-language interface. Simulated for this prototype.</p>
        <div className="lang-demo">
          <div className="lang-row">
            <span className="lang-tag">తెలుగు</span>
            <span className="lang-input"><Mic size={14} /> “నా దగ్గర 500 కిలోల టమాటాలు ఉన్నాయి”</span>
          </div>
          <ArrowDown size={14} className="flow-arrow" />
          <div className="lang-row response">
            <CheckCircle2 size={14} />
            <span>500 kg Tomato inventory detected and added to your produce list.</span>
          </div>
        </div>
        <div className="lang-pills">
          <span className="lang-pill">English</span>
          <span className="lang-pill">తెలుగు</span>
          <span className="lang-pill">हिन्दी</span>
        </div>
      </Card>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><span>Add Produce</span><button className="icon-btn" onClick={() => setShowForm(false)}><X size={16} /></button></div>
            <div className="modal-body form-grid">
              <label>Crop<select><option>Tomato</option><option>Chilli</option><option>Onion</option></select></label>
              <label>Quantity (kg)<input type="number" placeholder="500" /></label>
              <label>Grade<select><option>A</option><option>B</option></select></label>
              <label>Expected harvest date<input type="date" /></label>
              <label>Location<input type="text" placeholder="Warangal" /></label>
              <label>Minimum acceptable price (₹/kg)<input type="number" placeholder="20" /></label>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowForm(false)}>Save Produce</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   PAGE: Buyer Network / Buyer Dashboard
   ================================================================ */

function BuyerPage() {
  const [step, setStep] = useState("form"); // form -> searching -> found
  const [form, setForm] = useState({ crop: "Tomato", qty: 10000, grade: "A", loc: "Hyderabad", date: "Tomorrow", maxPrice: 28 });

  const submit = () => {
    setStep("searching");
    setTimeout(() => setStep("found"), 900);
  };

  return (
    <div className="page">
      <div className="page-head">
        <h1>Bulk Buyer Dashboard</h1>
        <p className="muted-sub">Deccan FreshMart · Retail Chain</p>
      </div>

      <div className="grid-4">
        <Metric label="Active requests" value="3" />
        <Metric label="Matched supply" value="94%" trend="up" />
        <Metric label="Deliveries this week" value="7" />
        <Metric label="Purchase history" value="₹18.6L" sub="last 30 days" />
      </div>

      <div className="two-col">
        <Card title="Create demand request" icon={Package}>
          <div className="form-grid">
            <label>Crop
              <select value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })}>
                {CROPS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label>Quantity (kg)<input type="number" value={form.qty} onChange={(e) => setForm({ ...form, qty: +e.target.value })} /></label>
            <label>Quality<select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}><option>A</option><option>B</option></select></label>
            <label>Delivery location
              <select value={form.loc} onChange={(e) => setForm({ ...form, loc: e.target.value })}>
                {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </label>
            <label>Delivery date<input type="text" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
            <label>Maximum price (₹/kg)<input type="number" value={form.maxPrice} onChange={(e) => setForm({ ...form, maxPrice: +e.target.value })} /></label>
          </div>
          <button className="btn btn-primary" onClick={submit} disabled={step === "searching"}>
            {step === "searching" ? "Searching…" : "Submit Demand Request"}
          </button>
        </Card>

        <Card title="AI supply matching" icon={Sparkles} tone="amber">
          {step === "form" && <p className="muted-sub">Submit a demand request to see AI-matched supply.</p>}
          {step === "searching" && (
            <div className="loading-line"><Sparkles size={14} className="spin" /> AI is searching for supply…</div>
          )}
          {step === "found" && (
            <>
              <div className="opp-figs">
                <div><span className="fig-label">Supply found</span><span className="fig-val">{form.qty.toLocaleString("en-IN")} kg</span></div>
                <div><span className="fig-label">Farmers</span><span className="fig-val">5</span></div>
                <div><span className="fig-label">Estimated fulfillment</span><span className="fig-val">98%</span></div>
                <div><span className="fig-label">Estimated logistics</span><span className="fig-val">₹10,700</span></div>
              </div>
              <button className="btn btn-primary">Create Virtual Lot</button>
            </>
          )}
        </Card>
      </div>

      <Card title="Active requests" icon={Boxes}>
        <table className="table">
          <thead><tr><th>Crop</th><th>Quantity</th><th>Status</th><th>Matched supply</th><th>Delivery</th></tr></thead>
          <tbody>
            <tr><td>Tomato</td><td>10,000 kg</td><td><StatusPill status={{ key: "MATCHED", color: COLORS.balanced, bg: COLORS.balancedSoft }} /></td><td>100%</td><td>Tomorrow</td></tr>
            <tr><td>Onion</td><td>8,000 kg</td><td><StatusPill status={{ key: "COLLECTING", color: COLORS.amber, bg: COLORS.amberSoft }} /></td><td>92%</td><td>3 days</td></tr>
            <tr><td>Chilli</td><td>2,200 kg</td><td><StatusPill status={{ key: "COLLECTING", color: COLORS.amber, bg: COLORS.amberSoft }} /></td><td>68%</td><td>4 days</td></tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ================================================================
   PAGE: Virtual Lots
   ================================================================ */

function VirtualLotsPage() {
  return (
    <div className="page">
      <div className="page-head">
        <h1>Virtual Lots</h1>
        <p className="muted-sub">Small quantities from multiple farmers are digitally combined to fulfill larger buyer requirements.</p>
      </div>

      {VIRTUAL_LOTS.map((lot) => {
        const total = lot.farmers.reduce((a, f) => a + f.qty, 0);
        const pct = Math.min(100, Math.round((total / lot.required) * 100));
        const benefit = Math.round((lot.farmerRealization - (lot.buyerPrice - lot.farmerRealization) * 0.4) * total);
        return (
          <Card key={lot.id}>
            <div className="lot-head">
              <div>
                <div className="lot-id">VIRTUAL LOT #{lot.id}</div>
                <div className="lot-sub">{lot.crop} · Grade {lot.grade} → {lot.buyer}</div>
              </div>
              <StatusPill status={
                lot.status === "READY FOR LOGISTICS"
                  ? { key: lot.status, color: COLORS.balanced, bg: COLORS.balancedSoft }
                  : { key: lot.status, color: COLORS.amber, bg: COLORS.amberSoft }
              } />
            </div>

            <table className="table">
              <thead><tr><th>Farmer</th><th>Quantity</th></tr></thead>
              <tbody>
                {lot.farmers.map((f) => <tr key={f.name}><td>{f.name}</td><td>{f.qty.toLocaleString("en-IN")} kg</td></tr>)}
              </tbody>
            </table>

            <div className="progress-row">
              <div className="progress-track"><div className="progress-fill" style={{ width: pct + "%" }} /></div>
              <span className="progress-label">{total.toLocaleString("en-IN")} / {lot.required.toLocaleString("en-IN")} kg</span>
            </div>

            <div className="opp-figs" style={{ marginTop: 14 }}>
              <div><span className="fig-label">Average farmer realization</span><span className="fig-val">₹{lot.farmerRealization}/kg</span></div>
              <div><span className="fig-label">Buyer purchase price</span><span className="fig-val">₹{lot.buyerPrice}/kg</span></div>
              <div><span className="fig-label">Estimated consumer price</span><span className="fig-val">₹{lot.consumerPrice}/kg</span></div>
              <div><span className="fig-label">Potential farmer benefit</span><span className="fig-val">₹{benefit.toLocaleString("en-IN")}</span></div>
            </div>

            {pct >= 100 && <button className="btn btn-primary" style={{ marginTop: 14 }}>Optimize Logistics</button>}
          </Card>
        );
      })}
      <Disclaimer />
    </div>
  );
}

/* ================================================================
   PAGE: Logistics AI
   ================================================================ */

function LogisticsPage() {
  return (
    <div className="page">
      <div className="page-head">
        <h1>AI Logistics Control</h1>
        <p className="muted-sub">Dynamic load pooling across nearby farmer pickups and buyer deliveries.</p>
      </div>

      <Card title="AI suggestion" icon={Sparkles} tone="amber">
        <p className="opp-line">Combine Farmer B and Farmer D shipments with TRK-101 — both fall on the same Siddipet–Hyderabad corridor with 4T of spare capacity.</p>
        <div className="before-after-mini">
          <div><span className="fig-label">Before</span><span className="fig-val">5 separate transport movements</span></div>
          <ArrowRight size={16} />
          <div><span className="fig-label">After</span><span className="fig-val">2 optimized routes</span></div>
        </div>
      </Card>

      <Card title="Available vehicles" icon={Truck}>
        <table className="table">
          <thead><tr><th>Vehicle</th><th>Capacity</th><th>Used</th><th>Available</th><th>Route</th></tr></thead>
          <tbody>
            {VEHICLES.map((v) => {
              const avail = v.capacity - v.used;
              return (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.capacity} T</td>
                  <td>{v.used} T</td>
                  <td style={{ color: avail >= 3 ? COLORS.balanced : COLORS.ink }}>{avail} T</td>
                  <td>{v.route}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card title="Route visualization — Tomato Virtual Lot VL-2026-014" icon={RouteIcon}>
        <div className="route-diagram">
          <div className="route-line">
            {["Farmer A · Warangal", "Farmer B · Siddipet", "Farmer D · Hyd. Rural", "Collection Point", "Hyderabad Buyer"].map((s, i, arr) => (
              <React.Fragment key={s}>
                <div className="route-node">{s}</div>
                {i < arr.length - 1 && <ChevronRight size={16} className="route-arrow" />}
              </React.Fragment>
            ))}
          </div>
          <div className="route-line">
            {["Farmer C · Nalgonda", "Farmer E · Sangareddy", "Hyderabad Buyer"].map((s, i, arr) => (
              <React.Fragment key={s}>
                <div className="route-node alt">{s}</div>
                {i < arr.length - 1 && <ChevronRight size={16} className="route-arrow" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ================================================================
   PAGE: Price Intelligence
   ================================================================ */

function PricePage() {
  const offers = [
    { name: "Buyer A", offer: 22 },
    { name: "Buyer B", offer: 24 },
    { name: "Buyer C", offer: 27 },
  ];
  const best = recommendBuyer(offers, 3, 21); // logistics ₹3/kg, farmer min ₹21/kg

  const waterfall = [
    { label: "Consumer price", value: 31 },
    { label: "Retail / buyer operations", value: -4 },
    { label: "Logistics", value: -2 },
    { label: "Platform / processing", value: -1 },
    { label: "Farmer realization", value: 24, final: true },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <h1>Farmer Price Intelligence</h1>
        <p className="muted-sub">Tomato · Hyderabad corridor</p>
      </div>

      <Card title="Buyer offers" icon={IndianRupee}>
        <div className="offer-row">
          <div className="offer-chip"><span>Market reference</span><b>₹26/kg</b></div>
          {offers.map((o) => (
            <div className={`offer-chip ${best && o.name === best.name ? "best" : ""}`} key={o.name}>
              <span>{o.name}</span><b>₹{o.offer}/kg</b>
            </div>
          ))}
        </div>
        {best && (
          <div className="ai-recommend">
            <BadgeCheck size={16} />
            <div>
              <div><b>AI recommended buyer: {best.name}</b></div>
              <div className="muted-sub">Highest farmer realization (₹{best.realization}/kg) while meeting the delivery requirement.</div>
            </div>
          </div>
        )}
      </Card>

      <Card title="Transparent price waterfall" icon={Scale}>
        <div className="waterfall">
          {waterfall.map((w) => (
            <div key={w.label} className={`waterfall-row ${w.final ? "final" : ""}`}>
              <span>{w.label}</span>
              <b>{w.final ? "" : (w.value < 0 ? "− " : "")}₹{Math.abs(w.value)}/kg</b>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ================================================================
   PAGE: Impact (Before/After + Sustainability + Freshness)
   ================================================================ */

function ImpactPage() {
  const impactBars = [
    { name: "Logistics cost (₹)", Traditional: 18400, KISANFLOW: 10700 },
    { name: "Farmer realization (₹/kg)", Traditional: 20, KISANFLOW: 24 },
    { name: "Truck utilization (%)", Traditional: 58, KISANFLOW: 86 },
  ];

  const freshness = [
    { crop: "Tomato", pct: 92, window: "18 hours", priority: "HIGH" },
    { crop: "Chilli", pct: 95, window: "32 hours", priority: "MEDIUM" },
    { crop: "Banana", pct: 88, window: "24 hours", priority: "HIGH" },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <h1>Impact & Sustainability</h1>
        <p className="muted-sub">Illustrative comparison between a traditional multi-intermediary chain and KISANFLOW.</p>
      </div>

      <div className="two-col">
        <Card title="Traditional supply chain" icon={Factory}>
          <ul className="check-list bad">
            <li>Multiple intermediaries</li>
            <li>5 separate farmer movements</li>
            <li>High logistics duplication</li>
            <li>Low transparency</li>
            <li>Uncertain farmer realization</li>
          </ul>
        </Card>
        <Card title="KISANFLOW" icon={Leaf} tone="green">
          <ul className="check-list good">
            <li>Direct buyer connection</li>
            <li>Virtual farmer aggregation</li>
            <li>AI load pooling</li>
            <li>Optimized routes</li>
            <li>Transparent price breakdown</li>
          </ul>
        </Card>
      </div>

      <Card title="Comparison metrics" icon={Scale}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={impactBars}>
            <CartesianGrid stroke={COLORS.line} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: COLORS.ink }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: COLORS.ink }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.line}` }} />
            <Legend />
            <Bar dataKey="Traditional" fill={COLORS.brick} radius={[4, 4, 0, 0]} />
            <Bar dataKey="KISANFLOW" fill={COLORS.balanced} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <Disclaimer>Reduction shown: 41.8% lower logistics cost, 20% higher farmer realization (prototype simulation).</Disclaimer>
      </Card>

      <Card title="Freshness intelligence" icon={Clock}>
        <p className="muted-sub" style={{ marginBottom: 10 }}>KISANFLOW factors product perishability and delivery deadlines into logistics priority. Prototype estimate — not a scientifically validated freshness measurement.</p>
        <div className="grid-3">
          {freshness.map((f) => (
            <div className="fresh-card" key={f.crop}>
              <div className="fresh-crop">{f.crop}</div>
              <div className="fresh-pct">{f.pct}%</div>
              <div className="muted-sub">Freshness · Prototype estimate</div>
              <div className="fresh-line"><span>Optimal selling window</span><b>{f.window}</b></div>
              <div className="fresh-line"><span>AI priority</span><b style={{ color: f.priority === "HIGH" ? COLORS.brick : COLORS.amber }}>{f.priority}</b></div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Impact metrics" icon={TrendingUp}>
        <div className="grid-3">
          <Metric label="Farmers connected" value="20" />
          <Metric label="Virtual lots created" value="16" sub="this season" />
          <Metric label="Bulk orders fulfilled" value="34" />
          <Metric label="Estimated logistics savings" value="₹4,20,000" sub="prototype simulation" />
          <Metric label="Estimated farmer value improvement" value="20%" trend="up" />
          <Metric label="Estimated wastage avoided" value="6.4 T" />
        </div>
        <div className="chain-flow">
          <span>Farmer</span><ArrowRight size={16} /><span>Buyer</span><ArrowRight size={16} /><span>Consumer</span>
        </div>
        <p className="muted-sub">Shorter, more transparent supply chains can reduce unnecessary cost layers between farm and table.</p>
      </Card>
    </div>
  );
}

/* ================================================================
   PAGE: Simulation
   ================================================================ */

const DEMO_STEPS = [
  { title: "Demand request received", body: "Buyer requires 10,000 kg Grade-A tomatoes in Hyderabad by tomorrow." },
  { title: "AI finds suitable farmers", body: "Matching by crop, quantity, distance and harvest readiness." },
  { title: "Virtual lot created", body: "5 farmers combined into one 10,000 kg transactable lot." },
  { title: "AI finds transport capacity", body: "Scanning nearby vehicles for spare capacity on matching corridors." },
  { title: "AI optimizes route", body: "Grouping pickups into two efficient collection routes." },
  { title: "Delivery plan ready", body: "Consolidated plan with cost, time and spoilage risk estimated." },
  { title: "Farmer payment calculated", body: "Realization computed per farmer based on quantity contributed." },
];

function DemoModePage() {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);

  const run = () => { setRunning(true); setStep(0); };
  const next = () => setStep((s) => Math.min(DEMO_STEPS.length - 1, s + 1));
  const reset = () => { setRunning(false); setStep(-1); };

  const farmers = [
    { name: "Farmer A", loc: "Warangal", qty: 2000, price: 24 },
    { name: "Farmer B", loc: "Siddipet", qty: 1500, price: 24 },
    { name: "Farmer C", loc: "Nalgonda", qty: 3000, price: 24 },
    { name: "Farmer D", loc: "Hyderabad Rural", qty: 1000, price: 24 },
    { name: "Farmer E", loc: "Sangareddy", qty: 2500, price: 24 },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <h1>Live AI Simulation</h1>
        <p className="muted-sub">One demand → multiple farmers → one virtual lot → optimized logistics → direct buyer.</p>
      </div>

      {!running && (
        <Card title="Buyer need" icon={Package}>
          <div className="opp-figs">
            <div><span className="fig-label">Product</span><span className="fig-val">Tomato</span></div>
            <div><span className="fig-label">Quantity</span><span className="fig-val">10,000 kg</span></div>
            <div><span className="fig-label">Location</span><span className="fig-val">Hyderabad</span></div>
            <div><span className="fig-label">Delivery</span><span className="fig-val">Tomorrow</span></div>
            <div><span className="fig-label">Quality</span><span className="fig-val">Grade A</span></div>
          </div>
          <button className="btn btn-primary" onClick={run}><Sparkles size={16} /> Ask KISANFLOW AI</button>
        </Card>
      )}

      {running && (
        <>
          <div className="demo-progress">
            {DEMO_STEPS.map((s, i) => (
              <div key={s.title} className={`demo-dot ${i <= step ? "done" : ""} ${i === step ? "active" : ""}`}>
                <span>{i + 1}</span>
              </div>
            ))}
          </div>

          <Card title={`Step ${step + 1} · ${DEMO_STEPS[step].title}`} icon={Sparkles} tone="amber">
            <p className="opp-line">{DEMO_STEPS[step].body}</p>

            {step === 1 && (
              <table className="table">
                <thead><tr><th>Farmer</th><th>Location</th><th>Quantity</th></tr></thead>
                <tbody>{farmers.map((f) => <tr key={f.name}><td>{f.name}</td><td>{f.loc}</td><td>{f.qty.toLocaleString("en-IN")} kg</td></tr>)}</tbody>
              </table>
            )}

            {step === 2 && (
              <div className="progress-row">
                <div className="progress-track"><div className="progress-fill" style={{ width: "100%" }} /></div>
                <span className="progress-label">10,000 / 10,000 kg</span>
              </div>
            )}

            {step === 3 && (
              <table className="table">
                <thead><tr><th>Vehicle</th><th>Capacity</th><th>Available</th></tr></thead>
                <tbody>
                  <tr><td>TRK-101</td><td>10 T</td><td>6 T</td></tr>
                  <tr><td>TRK-102</td><td>8 T</td><td>5 T</td></tr>
                </tbody>
              </table>
            )}
            {step === 3 && <div className="ai-recommend"><BadgeCheck size={16} /> Pooling shipments across TRK-101 and TRK-102 reduces estimated logistics cost.</div>}

            {step === 4 && (
              <div className="route-diagram">
                <div className="route-line">
                  {["Farmer A", "Farmer B", "Farmer D", "Collection Point", "Hyderabad Buyer"].map((s, i, arr) => (
                    <React.Fragment key={s}><div className="route-node">{s}</div>{i < arr.length - 1 && <ChevronRight size={16} className="route-arrow" />}</React.Fragment>
                  ))}
                </div>
                <div className="route-line">
                  {["Farmer C", "Farmer E", "Hyderabad Buyer"].map((s, i, arr) => (
                    <React.Fragment key={s}><div className="route-node alt">{s}</div>{i < arr.length - 1 && <ChevronRight size={16} className="route-arrow" />}</React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="opp-figs">
                <div><span className="fig-label">Total produce</span><span className="fig-val">10,000 kg</span></div>
                <div><span className="fig-label">Vehicles</span><span className="fig-val">2</span></div>
                <div><span className="fig-label">Estimated logistics</span><span className="fig-val">₹10,700</span></div>
                <div><span className="fig-label">Estimated delivery</span><span className="fig-val">4h 20m</span></div>
                <div><span className="fig-label">Estimated spoilage</span><span className="fig-val">6%</span></div>
              </div>
            )}

            {step === 6 && (
              <>
                <table className="table">
                  <thead><tr><th>Farmer</th><th>Payment</th></tr></thead>
                  <tbody>{farmers.map((f) => <tr key={f.name}><td>{f.name}</td><td>₹{(f.qty * f.price).toLocaleString("en-IN")}</td></tr>)}</tbody>
                </table>
                <div className="lot-total">Total farmer value: ₹{farmers.reduce((a, f) => a + f.qty * f.price, 0).toLocaleString("en-IN")}</div>
              </>
            )}

            <div className="demo-nav">
              {step < DEMO_STEPS.length - 1
                ? <button className="btn btn-primary" onClick={next}>Next Step <ArrowRight size={15} /></button>
                : <button className="btn btn-primary" onClick={next}>View Impact Summary <ArrowRight size={15} /></button>}
              <button className="btn btn-ghost" onClick={reset}>Reset</button>
            </div>
          </Card>

          {step === DEMO_STEPS.length - 1 && (
            <Card title="Before vs after KISANFLOW" icon={Scale} tone="green">
              <div className="two-col">
                <div className="ba-block bad">
                  <div className="ba-title">Before KISANFLOW</div>
                  <div className="ba-line">₹18,400 estimated logistics</div>
                  <div className="ba-line">₹20/kg farmer realization</div>
                  <div className="ba-line">5 separate movements</div>
                </div>
                <div className="ba-block good">
                  <div className="ba-title">After KISANFLOW</div>
                  <div className="ba-line">₹10,700 estimated logistics</div>
                  <div className="ba-line">₹24/kg farmer realization</div>
                  <div className="ba-line">2 optimized movements</div>
                </div>
              </div>
              <Disclaimer>Illustrative prototype simulation — actual savings and price improvements depend on real market, logistics and operational data.</Disclaimer>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

/* ================================================================
   Farmer / Buyer directory pages (simple tables)
   ================================================================ */

function FarmersDirectoryPage() {
  return (
    <div className="page">
      <div className="page-head"><h1>Farmer Network</h1><p className="muted-sub">{FARMERS.length} registered farmers across Telangana.</p></div>
      <Card>
        <table className="table">
          <thead><tr><th>ID</th><th>Name</th><th>Location</th><th>Crop</th><th>Quantity</th><th>Grade</th><th>Readiness</th></tr></thead>
          <tbody>
            {FARMERS.map((f) => (
              <tr key={f.id}>
                <td>{f.id}</td><td>{f.name}</td><td>{f.loc}</td><td>{f.crop}</td>
                <td>{f.qty.toLocaleString("en-IN")} kg</td><td><span className="grade-pill">{f.grade}</span></td><td>{f.ready}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function BuyersDirectoryPage() {
  return (
    <div className="page">
      <div className="page-head"><h1>Buyer Network</h1><p className="muted-sub">{BUYERS.length} registered bulk buyers.</p></div>
      <Card>
        <table className="table">
          <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Location</th></tr></thead>
          <tbody>
            {BUYERS.map((b) => <tr key={b.id}><td>{b.id}</td><td>{b.name}</td><td>{b.type}</td><td>{b.loc}</td></tr>)}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ================================================================
   App shell
   ================================================================ */

export default function KisanflowApp() {
  const [page, setPage] = useState("overview");
  const [role, setRole] = useState("Admin");
  const [navOpen, setNavOpen] = useState(false);

  const goTo = useCallback((p) => { setPage(p); setNavOpen(false); }, []);

  const PageComponent = useMemo(() => {
    switch (page) {
      case "overview": return <OverviewPage role={role} goTo={goTo} />;
      case "radar": return <DemandRadarPage />;
      case "farmers": return role === "Farmer" ? <FarmerPage /> : <FarmersDirectoryPage />;
      case "buyers": return role === "Buyer" ? <BuyerPage /> : <BuyersDirectoryPage />;
      case "lots": return <VirtualLotsPage />;
      case "logistics": return <LogisticsPage />;
      case "price": return <PricePage />;
      case "impact": return <ImpactPage />;
      case "demo": return <DemoModePage />;
      default: return null;
    }
  }, [page, role, goTo]);

  return (
    <div className="kf-root">
      <style>{`
        ${FONT_IMPORT}
        .kf-root, .kf-root * { box-sizing: border-box; }
        .kf-root {
          font-family: 'IBM Plex Sans', system-ui, sans-serif;
          background: ${COLORS.bg};
          color: ${COLORS.ink};
          display: flex;
          min-height: 100vh;
          width: 100%;
        }
        .kf-root h1, .kf-root h2 { font-family: 'Fraunces', serif; margin: 0; }

        /* Sidebar */
        .sidebar {
          width: 232px; flex-shrink: 0; background: ${COLORS.forestDeep}; color: #EDEBDF;
          display: flex; flex-direction: column; padding: 18px 14px;
        }
        .sidebar-brand { display:flex; align-items:center; gap:9px; padding: 4px 8px 18px; }
        .sidebar-brand .mark { width:26px; height:26px; border-radius:6px; background:${COLORS.amber}; display:flex; align-items:center; justify-content:center; color:${COLORS.forestDeep}; font-weight:700; font-family:'Fraunces',serif; font-size:14px; }
        .sidebar-brand span { font-family:'Fraunces', serif; font-size:17px; letter-spacing:0.2px; }
        .nav-item {
          display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:8px;
          font-size:13.5px; color:#C9CFC0; cursor:pointer; margin-bottom:2px; border:none; background:none; text-align:left; width:100%;
          font-family:'IBM Plex Sans', sans-serif;
        }
        .nav-item:hover { background: rgba(255,255,255,0.06); color:#fff; }
        .nav-item.active { background: ${COLORS.amber}; color:${COLORS.forestDeep}; font-weight:600; }
        .sidebar-status { margin-top:auto; padding:12px 10px 4px; font-size:11.5px; color:#8FA087; border-top:1px solid rgba(255,255,255,0.08); }
        .sidebar-status div { display:flex; align-items:center; gap:6px; margin-top:5px; }
        .dot { width:6px; height:6px; border-radius:50%; background:#7BBE7B; display:inline-block; }

        /* Topbar */
        .main { flex:1; display:flex; flex-direction:column; min-width:0; }
        .topbar {
          display:flex; align-items:center; justify-content:space-between; padding: 12px 26px;
          border-bottom: 1px solid ${COLORS.line}; background: ${COLORS.panel};
        }
        .role-switch { display:flex; gap:4px; background:${COLORS.bg}; padding:3px; border-radius:9px; border:1px solid ${COLORS.line}; }
        .role-btn { border:none; background:none; padding:6px 14px; font-size:12.5px; border-radius:7px; cursor:pointer; color:${COLORS.ink}; font-family:'IBM Plex Sans'; font-weight:500; }
        .role-btn.active { background:${COLORS.forest}; color:#fff; }
        .menu-btn { display:none; }

        .content { flex:1; overflow-y:auto; padding: 26px 30px 60px; }
        .page { max-width: 1080px; display:flex; flex-direction:column; gap:22px; }
        .page-head h1 { font-size: 26px; color:${COLORS.forestDeep}; }
        .muted-sub { color:#6B7264; font-size:13.5px; }
        .section-title { font-size:19px; color:${COLORS.forestDeep}; margin-bottom:12px; }
        .section-head-row { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:12px; flex-wrap:wrap; gap:6px; }

        /* Hero */
        .hero { display:grid; grid-template-columns: 1.1fr 0.9fr; gap:30px; align-items:center; padding: 22px 0 6px; }
        .eyebrow-free-label { font-size:12px; color:${COLORS.sage}; margin-bottom:10px; }
        .hero-title { font-size:46px; color:${COLORS.forestDeep}; letter-spacing:-0.5px; }
        .hero-tagline { font-size:17px; color:${COLORS.amber}; font-weight:600; margin: 8px 0 10px; font-family:'Fraunces',serif; }
        .hero-sub { font-size:14.5px; color:#4B5245; max-width:480px; line-height:1.55; }
        .hero-actions { display:flex; gap:10px; margin-top:18px; flex-wrap:wrap; }
        .hero-flow { display:flex; flex-direction:column; align-items:center; gap:4px; background:${COLORS.panel}; border:1px solid ${COLORS.line}; border-radius:14px; padding:18px; }
        .flow-node { font-size:12.5px; font-weight:600; background:${COLORS.balancedSoft}; color:${COLORS.forestDeep}; padding:6px 14px; border-radius:7px; width:100%; text-align:center; }
        .flow-arrow { color:${COLORS.sage}; }

        .metrics-row { display:grid; grid-template-columns: repeat(4, 1fr); gap:14px; }
        .grid-4 { display:grid; grid-template-columns: repeat(4, 1fr); gap:14px; }
        .grid-5 { display:grid; grid-template-columns: repeat(5, 1fr); gap:14px; }
        .grid-3 { display:grid; grid-template-columns: repeat(3, 1fr); gap:14px; }

        .metric { background:${COLORS.panel}; border:1px solid ${COLORS.line}; border-radius:12px; padding:16px; }
        .metric-label { font-size:12px; color:#6B7264; margin-bottom:6px; }
        .metric-value { font-size:22px; font-weight:600; color:${COLORS.forestDeep}; font-family:'Fraunces', serif; }
        .metric-sub { font-size:11.5px; color:#8B917E; margin-top:4px; display:flex; align-items:center; gap:4px; }
        .metric-sub.up { color:${COLORS.balanced}; }
        .metric-sub.down { color:${COLORS.brick}; }

        .why-card { background:${COLORS.panel}; border:1px solid ${COLORS.line}; border-radius:12px; padding:16px; color:${COLORS.forest}; }
        .why-t { font-weight:600; margin: 10px 0 6px; font-size:14px; color:${COLORS.forestDeep}; }
        .why-d { font-size:12.5px; color:#666f5b; line-height:1.5; }

        .alert-list { display:flex; flex-direction:column; gap:8px; }
        .alert-item { display:flex; gap:10px; align-items:flex-start; padding:12px 14px; border-radius:10px; font-size:13px; border:1px solid transparent; }
        .alert-item.shortage { background:${COLORS.brickSoft}; color:#6E241A; border-color:#e4c1b8; }
        .alert-item.ok { background:${COLORS.balancedSoft}; color:#3C4F27; border-color:#cdd9b8; }
        .alert-item.info { background:${COLORS.amberSoft}; color:#6B4A0E; border-color:#e3cd9c; }

        /* Card */
        .card { background:${COLORS.panel}; border:1px solid ${COLORS.line}; border-radius:14px; padding:18px 20px; }
        .card-amber { border-left:4px solid ${COLORS.amber}; }
        .card-green { border-left:4px solid ${COLORS.balanced}; }
        .card-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
        .card-head-title { display:flex; align-items:center; gap:8px; font-weight:600; font-size:15px; color:${COLORS.forestDeep}; }

        .ai-tag { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:${COLORS.amber}; background:${COLORS.amberSoft}; padding:4px 9px; border-radius:20px; margin-top:10px; }
        .status-pill { font-size:11px; font-weight:700; padding:4px 10px; border-radius:20px; border:1px solid; letter-spacing:0.3px; }

        .disclaimer { display:flex; align-items:center; gap:8px; font-size:12px; color:#7A8069; background:#F0EEE2; border:1px dashed ${COLORS.line}; border-radius:9px; padding:9px 13px; }

        /* Buttons */
        .btn { display:inline-flex; align-items:center; gap:7px; font-family:'IBM Plex Sans'; font-weight:600; font-size:13.5px; padding:10px 18px; border-radius:9px; border:1px solid transparent; cursor:pointer; }
        .btn-primary { background:${COLORS.forest}; color:#fff; }
        .btn-primary:hover { background:${COLORS.forestDeep}; }
        .btn-primary:disabled { opacity:0.6; cursor:default; }
        .btn-ghost { background:transparent; color:${COLORS.forest}; border-color:${COLORS.line}; }
        .btn-ghost:hover { background:${COLORS.bg}; }
        .btn-sm { padding:7px 13px; font-size:12.5px; }
        .icon-btn { background:none; border:none; cursor:pointer; color:${COLORS.ink}; }

        /* Filters */
        .filter-row { display:flex; gap:10px; flex-wrap:wrap; }
        select, input { font-family:'IBM Plex Sans'; font-size:13px; padding:8px 11px; border-radius:8px; border:1px solid ${COLORS.line}; background:${COLORS.panel}; color:${COLORS.ink}; }

        .chart-note { font-size:11.5px; color:#8B917E; margin-top:6px; }

        .radar-list { display:flex; flex-direction:column; gap:12px; }
        .radar-row { display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
        .radar-title-row { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
        .radar-crop { font-weight:700; font-size:15px; color:${COLORS.forestDeep}; }
        .radar-loc { display:flex; align-items:center; gap:4px; font-size:12.5px; color:#6B7264; }
        .radar-figs { display:grid; grid-template-columns: repeat(6, 1fr); gap:14px; }
        .fig-label { display:block; font-size:11px; color:#8B917E; margin-bottom:3px; }
        .fig-val { display:block; font-size:14px; font-weight:600; color:${COLORS.forestDeep}; }

        .table { width:100%; border-collapse: collapse; font-size:13px; }
        .table th { text-align:left; font-size:11px; text-transform: uppercase; letter-spacing:0.4px; color:#8B917E; font-weight:600; padding:8px 10px; border-bottom:1px solid ${COLORS.line}; }
        .table td { padding:9px 10px; border-bottom:1px solid #EFEBDD; color:${COLORS.ink}; }
        .grade-pill { background:${COLORS.balancedSoft}; color:#3C4F27; font-size:11px; font-weight:700; padding:2px 8px; border-radius:20px; }

        .opp-line { font-size:14px; color:${COLORS.forestDeep}; margin-bottom:12px; }
        .opp-figs { display:grid; grid-template-columns: repeat(4, 1fr); gap:14px; margin-bottom:14px; }

        .lang-demo { display:flex; flex-direction:column; align-items:flex-start; gap:6px; margin-bottom:12px; }
        .lang-row { display:flex; align-items:center; gap:8px; font-size:13.5px; background:${COLORS.bg}; padding:8px 13px; border-radius:9px; border:1px solid ${COLORS.line}; }
        .lang-row.response { background:${COLORS.balancedSoft}; color:#3C4F27; border-color:#cdd9b8; }
        .lang-tag { font-weight:700; color:${COLORS.amber}; }
        .lang-pills { display:flex; gap:8px; }
        .lang-pill { font-size:12px; background:${COLORS.bg}; border:1px solid ${COLORS.line}; padding:5px 12px; border-radius:20px; }

        .two-col { display:grid; grid-template-columns: 1fr 1fr; gap:16px; }
        .form-grid { display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:16px; }
        .form-grid label { display:flex; flex-direction:column; gap:5px; font-size:12.5px; color:#5C6350; }

        .loading-line { display:flex; align-items:center; gap:8px; font-size:13.5px; color:${COLORS.amber}; }
        .spin { animation: spin 1.4s linear infinite; }
        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }

        .lot-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
        .lot-id { font-family:'IBM Plex Mono', monospace; font-size:13px; color:${COLORS.forestDeep}; font-weight:600; }
        .lot-sub { font-size:12.5px; color:#6B7264; margin-top:2px; }
        .progress-row { display:flex; align-items:center; gap:12px; margin-top:12px; }
        .progress-track { flex:1; height:9px; background:${COLORS.bg}; border-radius:6px; overflow:hidden; border:1px solid ${COLORS.line}; }
        .progress-fill { height:100%; background:${COLORS.balanced}; }
        .progress-label { font-size:12px; font-weight:600; color:${COLORS.forestDeep}; white-space:nowrap; }

        .before-after-mini { display:flex; align-items:center; gap:18px; margin-top:6px; color:${COLORS.forest}; }

        .route-diagram { display:flex; flex-direction:column; gap:14px; }
        .route-line { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
        .route-node { background:${COLORS.balancedSoft}; color:#3C4F27; font-size:12px; font-weight:600; padding:7px 12px; border-radius:8px; }
        .route-node.alt { background:${COLORS.amberSoft}; color:#6B4A0E; }
        .route-arrow { color:#8B917E; }

        .offer-row { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:14px; }
        .offer-chip { display:flex; flex-direction:column; gap:3px; background:${COLORS.bg}; border:1px solid ${COLORS.line}; padding:10px 16px; border-radius:10px; font-size:12px; color:#6B7264; }
        .offer-chip b { font-size:15px; color:${COLORS.forestDeep}; }
        .offer-chip.best { border-color:${COLORS.balanced}; background:${COLORS.balancedSoft}; }
        .ai-recommend { display:flex; gap:10px; align-items:flex-start; background:${COLORS.amberSoft}; color:#6B4A0E; padding:12px 14px; border-radius:10px; font-size:13px; margin-top: 4px; }

        .waterfall { display:flex; flex-direction:column; }
        .waterfall-row { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #EFEBDD; font-size:13.5px; }
        .waterfall-row.final { font-weight:700; color:${COLORS.forestDeep}; border-bottom:none; padding-top:12px; }

        .check-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:9px; font-size:13.5px; }
        .check-list li { padding-left:20px; position:relative; }
        .check-list.bad li::before { content:"–"; position:absolute; left:0; color:${COLORS.brick}; font-weight:700; }
        .check-list.good li::before { content:"✓"; position:absolute; left:0; color:${COLORS.balanced}; font-weight:700; }

        .fresh-card { background:${COLORS.bg}; border:1px solid ${COLORS.line}; border-radius:12px; padding:16px; }
        .fresh-crop { font-weight:600; color:${COLORS.forestDeep}; font-size:14px; }
        .fresh-pct { font-family:'Fraunces',serif; font-size:26px; color:${COLORS.forest}; margin:4px 0; }
        .fresh-line { display:flex; justify-content:space-between; font-size:12.5px; margin-top:8px; color:#5C6350; }

        .chain-flow { display:flex; align-items:center; gap:10px; font-weight:600; color:${COLORS.forestDeep}; margin:14px 0 6px; }

        .demo-progress { display:flex; gap:6px; }
        .demo-dot { width:30px; height:30px; border-radius:50%; background:${COLORS.bg}; border:1px solid ${COLORS.line}; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:#8B917E; }
        .demo-dot.done { background:${COLORS.balancedSoft}; color:#3C4F27; border-color:#cdd9b8; }
        .demo-dot.active { background:${COLORS.amber}; color:#fff; border-color:${COLORS.amber}; }
        .demo-nav { display:flex; gap:10px; margin-top:16px; }
        .lot-total { text-align:right; font-weight:700; color:${COLORS.forestDeep}; margin-top:10px; font-size:15px; }

        .ba-block { border-radius:12px; padding:16px; }
        .ba-block.bad { background:${COLORS.brickSoft}; }
        .ba-block.good { background:${COLORS.balancedSoft}; }
        .ba-title { font-weight:700; margin-bottom:10px; color:${COLORS.forestDeep}; }
        .ba-line { font-size:13.5px; padding:4px 0; color:#4B5245; }

        .modal-backdrop { position:fixed; inset:0; background:rgba(21,42,27,0.45); display:flex; align-items:center; justify-content:center; z-index:50; }
        .modal { background:${COLORS.panel}; border-radius:14px; width:420px; max-width:92vw; padding:20px 22px; }
        .modal-head { display:flex; justify-content:space-between; align-items:center; font-weight:700; margin-bottom:14px; color:${COLORS.forestDeep}; }
        .modal-body { display:flex; flex-direction:column; gap:10px; margin-bottom:16px; }
        .modal-line { display:flex; justify-content:space-between; font-size:13.5px; }
        .modal-actions { display:flex; justify-content:flex-end; gap:10px; }

        @media (max-width: 900px) {
          .sidebar { position:fixed; z-index:40; height:100%; transform: translateX(-100%); transition: transform .2s; }
          .sidebar.open { transform: translateX(0); }
          .menu-btn { display:flex; }
          .hero { grid-template-columns: 1fr; }
          .metrics-row, .grid-4, .grid-5, .grid-3, .two-col, .radar-figs, .opp-figs, .form-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {navOpen && <div className="modal-backdrop" style={{ background: "rgba(0,0,0,0.3)" }} onClick={() => setNavOpen(false)} />}

      <aside className={`sidebar ${navOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="mark">K</div>
          <span>KISANFLOW</span>
        </div>
        {NAV.map((n) => (
          <button key={n.key} className={`nav-item ${page === n.key ? "active" : ""}`} onClick={() => goTo(n.key)}>
            <n.icon size={16} />
            {n.label}
          </button>
        ))}
        <div className="sidebar-status">
          System status
          <div><span className="dot" /> AI Engine Online</div>
          <div><span className="dot" /> Logistics Engine Online</div>
          <div><span className="dot" /> Marketplace Online</div>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setNavOpen(true)}><Menu size={20} /></button>
          <div className="muted-sub" style={{ fontWeight: 600, color: COLORS.forestDeep }}>
            {NAV.find((n) => n.key === page)?.label}
          </div>
          <div className="role-switch">
            {["Farmer", "Buyer", "Admin"].map((r) => (
              <button key={r} className={`role-btn ${role === r ? "active" : ""}`} onClick={() => setRole(r)}>{r}</button>
            ))}
          </div>
        </div>
        <div className="content">{PageComponent}</div>
      </div>
    </div>
  );
}
