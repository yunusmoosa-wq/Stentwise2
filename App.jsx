import { useState, useCallback, useMemo, useEffect } from "react";

// ── CPT DATA ─────────────────────────────────────────────────────────────────
const CPT_DATA = {
  inpatient: {
    label: "Inpatient E&M", icon: "🏥", color: "#3B82F6",
    services: [
      { cpt: "99223", name: "Initial – High",           wrvu: 3.86, note: "High MDM or 70+ min" },
      { cpt: "99222", name: "Initial – Moderate",       wrvu: 2.61, note: "Moderate MDM or 50+ min" },
      { cpt: "99221", name: "Initial – Low",            wrvu: 1.92, note: "Low MDM or 40+ min" },
      { cpt: "99233", name: "Subsequent – High",        wrvu: 2.00, note: "High MDM or 40+ min" },
      { cpt: "99232", name: "Subsequent – Moderate",    wrvu: 1.39, note: "Moderate MDM or 25+ min" },
      { cpt: "99231", name: "Subsequent – Low",         wrvu: 0.76, note: "Low MDM or 15+ min" },
      { cpt: "99239", name: "Discharge >30 min",        wrvu: 1.90, note: "Complex discharge" },
      { cpt: "99238", name: "Discharge ≤30 min",        wrvu: 1.28, note: "Straightforward discharge" },
      { cpt: "99291", name: "Critical Care 30–74 min",  wrvu: 4.50, note: "Shock / unstable" },
      { cpt: "99292", name: "Critical Care add-on",     wrvu: 2.25, note: "Each add'l 30 min" },
    ],
  },
  outpatient: {
    label: "Outpatient E&M", icon: "🩺", color: "#10B981",
    services: [
      { cpt: "99205", name: "New Pt – High",       wrvu: 3.50, note: "High complexity" },
      { cpt: "99204", name: "New Pt – Moderate",   wrvu: 2.60, note: "Moderate complexity" },
      { cpt: "99203", name: "New Pt – Low",        wrvu: 1.60, note: "Low complexity" },
      { cpt: "99215", name: "Est Pt – High",       wrvu: 2.11, note: "High complexity" },
      { cpt: "99214", name: "Est Pt – Moderate",   wrvu: 1.50, note: "Moderate complexity" },
      { cpt: "99213", name: "Est Pt – Low",        wrvu: 0.97, note: "Low complexity" },
    ],
  },
  imaging: {
    label: "Cardiac Imaging", icon: "📡", color: "#8B5CF6",
    services: [
      { cpt: "93306", name: "Echo TTE Complete",        wrvu: 1.30, note: "Professional interp" },
      { cpt: "93307", name: "Echo TTE Limited",         wrvu: 0.68, note: "Limited/follow-up" },
      { cpt: "93312", name: "TEE Complete",             wrvu: 2.20, note: "Incl. probe placement" },
      { cpt: "93315", name: "TEE w/ Procedure",         wrvu: 2.80, note: "Intraoperative/periop" },
      { cpt: "93351", name: "Echo Stress Complete",     wrvu: 3.50, note: "With report" },
      { cpt: "93015", name: "Stress Test Global",       wrvu: 1.90, note: "Supv + interp" },
      { cpt: "93016", name: "Stress Supervision",       wrvu: 0.40, note: "Supervision only" },
      { cpt: "93018", name: "Stress Interpretation",    wrvu: 0.50, note: "Interpretation only" },
      { cpt: "93000", name: "EKG Global",               wrvu: 0.22, note: "12-lead + interp" },
      { cpt: "93228", name: "External Event Monitor",   wrvu: 1.20, note: "Review + report" },
      { cpt: "93288", name: "Pacemaker Interrogation",  wrvu: 0.80, note: "Single lead" },
      { cpt: "93289", name: "ICD Interrogation",        wrvu: 0.80, note: "Single/dual ICD" },
      { cpt: "93790", name: "Ambulatory BP Report",     wrvu: 0.22, note: "BP review" },
    ],
  },
  cath: {
    label: "Diagnostic Cath", icon: "🔬", color: "#F59E0B",
    services: [
      { cpt: "93458", name: "LHC + Coronary Angio",     wrvu: 6.60, note: "Standard diagnostic cath" },
      { cpt: "93459", name: "LHC + Cors + LV Gram",     wrvu: 7.80, note: "With left ventriculogram" },
      { cpt: "93460", name: "RHC + LHC + Coronary",     wrvu: 7.20, note: "Combined R+L heart" },
      { cpt: "93461", name: "RHC + LHC + Cors + LV",   wrvu: 8.50, note: "Full hemodynamic study" },
      { cpt: "93451", name: "RHC Only",                 wrvu: 2.70, note: "Right heart cath alone" },
      { cpt: "93456", name: "Arterial Cath Only",       wrvu: 4.20, note: "Arterial access only" },
      { cpt: "93462", name: "Transseptal Puncture",     wrvu: 2.25, note: "Add-on to cath" },
      { cpt: "93505", name: "Endomyocardial Biopsy",    wrvu: 3.10, note: "With cath" },
    ],
  },
  coronary: {
    label: "Coronary Intervention", icon: "❤️", color: "#EF4444",
    services: [
      { cpt: "92928", name: "PCI – Single Vessel Stent",  wrvu: 9.75,  note: "Balloon + stent" },
      { cpt: "92929", name: "PCI – Add-on Vessel",        wrvu: 5.00,  note: "Each additional vessel" },
      { cpt: "92930", name: "PCI – Complex/Bifurcation",  wrvu: 12.00, note: "Complex lesion" },
      { cpt: "92933", name: "PCI – Atherectomy + Stent",  wrvu: 11.64, note: "Rotational/orbital ath" },
      { cpt: "92934", name: "PCI – Atherectomy Add-on",   wrvu: 5.80,  note: "Each add-on vessel" },
      { cpt: "92937", name: "PCI – Restenosis/Bypass",    wrvu: 10.80, note: "ISR / CABG graft" },
      { cpt: "92941", name: "STEMI PCI",                  wrvu: 12.40, note: "Acute MI intervention" },
      { cpt: "92943", name: "CTO PCI",                    wrvu: 13.35, note: "Chronic total occlusion" },
      { cpt: "92944", name: "CTO Add-on Vessel",          wrvu: 6.70,  note: "Add-on CTO vessel" },
      { cpt: "92978", name: "IVUS – Initial Vessel",      wrvu: 1.76,  note: "IVUS/OCT add-on" },
      { cpt: "92979", name: "IVUS – Add-on Vessel",       wrvu: 0.88,  note: "Each additional" },
      { cpt: "93571", name: "FFR/DFR – Initial Vessel",   wrvu: 1.76,  note: "Pressure wire" },
      { cpt: "93572", name: "FFR/DFR – Add-on Vessel",    wrvu: 0.88,  note: "Each additional" },
      { cpt: "33990", name: "Impella Insertion",           wrvu: 20.00, note: "Percutaneous MCS" },
      { cpt: "33991", name: "Impella Removal",             wrvu: 3.50,  note: "Device removal" },
      { cpt: "33962", name: "IABP Insertion",              wrvu: 5.60,  note: "Intra-aortic balloon pump" },
    ],
  },
  peripheral: {
    label: "Peripheral Intervention", icon: "🦵", color: "#EC4899",
    services: [
      { cpt: "37220", name: "Iliac PTA",                  wrvu: 7.50,  note: "Iliac balloon angioplasty" },
      { cpt: "37221", name: "Iliac Stent",                wrvu: 9.00,  note: "Iliac stenting" },
      { cpt: "37222", name: "Iliac Add-on PTA",           wrvu: 3.50,  note: "Each add'l iliac" },
      { cpt: "37223", name: "Iliac Add-on Stent",         wrvu: 4.50,  note: "Each add'l stent" },
      { cpt: "37224", name: "Fem-Pop PTA",                wrvu: 8.00,  note: "Femoral-popliteal PTA" },
      { cpt: "37225", name: "Fem-Pop Atherectomy",        wrvu: 10.00, note: "Fem-pop ath ± stent" },
      { cpt: "37226", name: "Fem-Pop Stent",              wrvu: 9.00,  note: "Fem-pop stenting" },
      { cpt: "37227", name: "Fem-Pop Ath + Stent",        wrvu: 11.50, note: "Combined" },
      { cpt: "37228", name: "Tib/Peroneal PTA",           wrvu: 9.00,  note: "Below-knee PTA" },
      { cpt: "37229", name: "Tib/Peroneal Atherectomy",   wrvu: 11.00, note: "Below-knee ath" },
      { cpt: "37230", name: "Tib/Peroneal Stent",         wrvu: 10.00, note: "Below-knee stent" },
      { cpt: "37231", name: "Tib/Peroneal Ath + Stent",   wrvu: 12.00, note: "Below-knee combined" },
      { cpt: "37236", name: "Visceral/Renal Stent",       wrvu: 11.00, note: "Renal/mesenteric" },
      { cpt: "37238", name: "Venous Stent",               wrvu: 9.50,  note: "Venous intervention" },
      { cpt: "36245", name: "Selective Angiography",      wrvu: 3.30,  note: "Visceral/renal diag" },
      { cpt: "75716", name: "Peripheral Angio Bilateral", wrvu: 1.40,  note: "Bilateral runoff" },
    ],
  },
};

const ALL_SVCS = Object.values(CPT_DATA).flatMap(s => s.services);
const DAILY_TARGET = 70;
const ANNUAL_TARGET = 7000;
const WORKING_DAYS = 250;
const TODAY = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

// ── STORAGE ──────────────────────────────────────────────────────────────────
const ls = {
  get: (k, fb) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
// Normalize any history entry to a "YYYY-MM-DD" key
function normKey(h) {
  if (h.dateKey && /^\d{4}-\d{2}-\d{2}$/.test(h.dateKey)) return h.dateKey;
  if (h.date) {
    try {
      const d = new Date(h.date + (h.date.includes(",") ? "" : ""));
      const iso = d.toISOString().slice(0, 10);
      if (iso !== "Invalid") return iso;
    } catch {}
  }
  return h.dateKey || h.date || "";
}

function calcTotal(c) {
  return ALL_SVCS.reduce((s, svc) => s + (c[svc.cpt] || 0) * svc.wrvu, 0);
}

function calcCatTotals(c) {
  const out = {};
  for (const [k, sec] of Object.entries(CPT_DATA))
    out[k] = sec.services.reduce((s, svc) => s + (c[svc.cpt] || 0) * svc.wrvu, 0);
  return out;
}

function exportCSV(history) {
  const hdr = ["Date", "Total wRVU", "Procedures", ...ALL_SVCS.map(s => `${s.cpt} ${s.name}`)].join(",");
  const rows = history.map(h => {
    const c = h.counts || {};
    return [h.date, h.total.toFixed(2), h.procedures, ...ALL_SVCS.map(s => c[s.cpt] || 0)].join(",");
  });
  const blob = new Blob([[hdr, ...rows].join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "StentWise_wRVU.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ── MONTHLY SUMMARY MODAL ─────────────────────────────────────────────────────
function MonthlySummary({ history, onClose }) {
  const now = new Date();
  const months = {};
  history.forEach(h => {
    const key = normKey(h).slice(0, 7); // "YYYY-MM"
    if (!key) return;
    if (!months[key]) {
      const d = new Date(normKey(h) + "T12:00:00");
      months[key] = { total: 0, days: 0, label: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }) };
    }
    months[key].total += h.total;
    months[key].days += 1;
  });
  const sorted = Object.entries(months).sort((a, b) => b[0].localeCompare(a[0]));
  const ytd = history.filter(h => normKey(h).startsWith(String(now.getFullYear()))).reduce((s, h) => s + h.total, 0);
  const monthTarget = ANNUAL_TARGET / 12;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#0C1828", border: "1px solid #2D4A6A", borderRadius: 18, width: "100%", maxWidth: 520, maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #1E3050" }}>
          <div>
            <div style={{ fontFamily: "system-ui, sans-serif", fontWeight: 700, fontSize: 16, color: "#fff" }}>Monthly Summary</div>
            <div style={{ fontSize: 11, color: "#7ABADD", marginTop: 2 }}>YTD {now.getFullYear()}: {ytd.toFixed(1)} of {ANNUAL_TARGET.toLocaleString()} wRVU</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => exportCSV(history)} style={{ background: "#1E3050", border: "1px solid #3A6888", borderRadius: 9, color: "#10B981", fontSize: 12, padding: "8px 13px", cursor: "pointer", fontWeight: 600 }}>↓ CSV</button>
            <button onClick={onClose} style={{ background: "#1E3050", border: "1px solid #3A6888", borderRadius: 9, color: "#A0C4E0", fontSize: 20, width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
        </div>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #1E3050" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#A0C4E0" }}>YTD Progress</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#3B82F6" }}>{((ytd / ANNUAL_TARGET) * 100).toFixed(1)}%</span>
          </div>
          <div style={{ height: 9, background: "#1A3050", borderRadius: 5, overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, (ytd / ANNUAL_TARGET) * 100)}%`, height: "100%", background: "linear-gradient(90deg,#3B82F6,#10B981)", borderRadius: 5 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
            <span style={{ fontSize: 10, color: "#5A8AAA" }}>{ytd.toFixed(0)} earned</span>
            <span style={{ fontSize: 10, color: "#5A8AAA" }}>{(ANNUAL_TARGET - ytd).toFixed(0)} remaining</span>
          </div>
        </div>
        <div style={{ overflowY: "auto", padding: "14px 20px", flex: 1 }}>
          {sorted.length === 0
            ? <div style={{ textAlign: "center", color: "#5A8AAA", fontSize: 13, padding: "40px 0" }}>No saved days yet.</div>
            : sorted.map(([key, m]) => {
              const pct = Math.min(100, (m.total / monthTarget) * 100);
              const ok = m.total >= monthTarget;
              return (
                <div key={key} style={{ marginBottom: 12, padding: 14, background: "#0A1525", borderRadius: 12, border: "1px solid #1E3050" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: "#5A8AAA", marginTop: 2 }}>{m.days} day{m.days !== 1 ? "s" : ""} · avg {(m.total / m.days).toFixed(1)} wRVU/day</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: ok ? "#10B981" : "#F59E0B" }}>{m.total.toFixed(1)}</div>
                      <div style={{ fontSize: 10, color: "#5A8AAA" }}>of {monthTarget.toFixed(0)}</div>
                    </div>
                  </div>
                  <div style={{ height: 5, background: "#1A3050", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: ok ? "#10B981" : "#F59E0B", borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

// ── CALENDAR ──────────────────────────────────────────────────────────────────
function CalendarView({ history, onEdit }) {
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  const dayMap = {};
  history.forEach(h => {
    const key = normKey(h);
    if (key) dayMap[key] = { ...h, _normKey: key };
  });

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const firstDay   = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const todayStr   = TODAY;
  const monthPrefix = `${calYear}-${String(calMonth + 1).padStart(2, "0")}`;
  const monthEntries = Object.entries(dayMap).filter(([k]) => k.startsWith(monthPrefix));
  const monthTotal   = monthEntries.reduce((s, [, h]) => s + h.total, 0);

  const prev = () => calMonth === 0 ? (setCalMonth(11), setCalYear(y => y - 1)) : setCalMonth(m => m - 1);
  const next = () => calMonth === 11 ? (setCalMonth(0), setCalYear(y => y + 1)) : setCalMonth(m => m + 1);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 10px 36px" }}>
      <div style={{ background: "#1A2840", border: "1px solid #3A5878", borderRadius: 16, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#1E3558,#243F6A)", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={prev} style={{ background: "#2A4060", border: "1px solid #4A6888", borderRadius: 8, color: "#A0C4E0", fontSize: 20, width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>{MONTHS[calMonth]} {calYear}</div>
            {monthEntries.length > 0 && (
              <div style={{ fontSize: 11, color: "#7ABADD", marginTop: 2 }}>
                {monthEntries.length} days · {monthTotal.toFixed(1)} wRVU · avg {(monthTotal / monthEntries.length).toFixed(1)}/day
              </div>
            )}
          </div>
          <button onClick={next} style={{ background: "#2A4060", border: "1px solid #4A6888", borderRadius: 8, color: "#A0C4E0", fontSize: 20, width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        </div>
        {/* Day labels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", background: "#0F1E30", padding: "8px 10px 4px" }}>
          {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#5A8AAA" }}>{d}</div>)}
        </div>
        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, padding: "6px 10px 12px", background: "#0F1E30" }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} />;
            const key = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const entry = dayMap[key];
            const isToday = key === todayStr;
            const hit = entry && entry.total >= DAILY_TARGET;
            const bg     = entry ? (hit ? "#0D3D2A" : "#3D2A0A") : isToday ? "#1E3A5F" : "#1A2A3C";
            const border = entry ? (hit ? "2px solid #10B981" : "2px solid #F59E0B") : isToday ? "2px solid #3B82F6" : "1px solid #2A3F58";
            const numCol = isToday ? "#60A5FA" : entry ? "#E2F0FF" : "#5A8AAA";
            const valCol = hit ? "#10B981" : "#F59E0B";
            return (
              <div key={key} onClick={() => entry && onEdit(entry._normKey)}
                style={{ background: bg, border, borderRadius: 8, minHeight: 54, padding: "5px 3px", cursor: entry ? "pointer" : "default", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: isToday ? 700 : 500, color: numCol }}>{day}</div>
                {entry && <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: valCol, marginTop: 2 }}>{entry.total.toFixed(0)}</div>
                  <div style={{ fontSize: 8, color: valCol, opacity: 0.8 }}>wRVU</div>
                </>}
                {isToday && !entry && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#3B82F6", marginTop: 4 }} />}
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", padding: "10px 16px 14px", background: "#0F1E30", borderTop: "1px solid #2A3F58", flexWrap: "wrap" }}>
          {[
            { bg: "#0D3D2A", border: "2px solid #10B981", label: "Hit target" },
            { bg: "#3D2A0A", border: "2px solid #F59E0B", label: "Below target" },
            { bg: "#1E3A5F", border: "2px solid #3B82F6", label: "Today" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 13, height: 13, borderRadius: 3, background: l.bg, border: l.border }} />
              <span style={{ fontSize: 10, color: "#7ABADD" }}>{l.label}</span>
            </div>
          ))}
          <span style={{ fontSize: 10, color: "#3A5878" }}>Tap day to edit</span>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [counts,      setCounts]      = useState(() => ls.get(`sw_counts_${TODAY}`, {}));
  const [history,     setHistory]     = useState(() => ls.get("sw_history_v2", []));
  const [activeTab,   setActiveTab]   = useState("inpatient");
  const [showMonthly, setShowMonthly] = useState(false);
  const [editingDay,  setEditingDay]  = useState(null); // { normKey, entry }
  const [dateOverride,setDateOverride]= useState("");   // "YYYY-MM-DD"
  const [toast,       setToast]       = useState(null);

  useEffect(() => { ls.set(`sw_counts_${TODAY}`, counts); }, [counts]);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  const updateCount = useCallback((cpt, delta) => {
    setCounts(prev => ({ ...prev, [cpt]: Math.max(0, (prev[cpt] || 0) + delta) }));
  }, []);
  const setCount = useCallback((cpt, val) => {
    setCounts(prev => ({ ...prev, [cpt]: Math.max(0, parseInt(val) || 0) }));
  }, []);

  // Live totals from current input
  const liveProcedures = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);
  const liveTotal      = useMemo(() => calcTotal(counts), [counts]);
  const liveCatTotals  = useMemo(() => calcCatTotals(counts), [counts]);

  // Today's saved entry (for display when counts are empty)
  const todaySaved = useMemo(() => history.find(h => normKey(h) === TODAY), [history]);

  // What to show in the breakdown / active charges panels
  const showingLive    = liveProcedures > 0 || !!editingDay;
  const displayCounts  = showingLive ? counts : (todaySaved?.counts || {});
  const displayTotal   = showingLive ? liveTotal : (todaySaved?.total || 0);
  const displayCatTots = showingLive ? liveCatTotals : calcCatTotals(displayCounts);
  const isSavedFallback = !showingLive && !!todaySaved;

  // Save today (or overridden date)
  const saveAndReset = () => {
    if (liveProcedures === 0) return;
    const useKey  = dateOverride || TODAY;
    const useDate = new Date(useKey + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const entry   = { date: useDate, dateKey: useKey, total: liveTotal, procedures: liveProcedures, counts: { ...counts } };
    const newHist = [entry, ...history.filter(h => normKey(h) !== useKey)]
      .sort((a, b) => normKey(b).localeCompare(normKey(a)))
      .slice(0, 90);
    setHistory(newHist);
    ls.set("sw_history_v2", newHist);
    setCounts({});
    setDateOverride("");
    showToast(`✓ Saved ${liveTotal.toFixed(1)} wRVU for ${useDate}`);
  };

  // Load a prior day for editing
  const loadDayForEdit = (nk) => {
    const idx = history.findIndex(h => normKey(h) === nk);
    if (idx === -1) { showToast("Day not found in history"); return; }
    const entry = history[idx];
    setEditingDay({ idx, normKey: nk, entry });
    setCounts({ ...(entry.counts || {}) });
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast(`✏️ Editing ${entry.date}`);
  };

  // Save edited prior day
  const savePriorDay = () => {
    if (!editingDay) return;
    const total = liveTotal;
    const procedures = liveProcedures;
    const updated = { ...editingDay.entry, total, procedures, counts: { ...counts } };
    const newHist = history.map((h, i) => i === editingDay.idx ? updated : h);
    setHistory(newHist);
    ls.set("sw_history_v2", newHist);
    setEditingDay(null);
    setCounts({});
    showToast(`✓ Updated ${updated.date} — ${total.toFixed(1)} wRVU`);
  };

  const cancelEdit = () => { setEditingDay(null); setCounts({}); };

  const deleteDay = (nk) => {
    const newHist = history.filter(h => normKey(h) !== nk);
    setHistory(newHist);
    ls.set("sw_history_v2", newHist);
    if (editingDay && editingDay.normKey === nk) { setEditingDay(null); setCounts({}); }
    showToast("Day deleted");
  };

  const pct = Math.min(100, (displayTotal / DAILY_TARGET) * 100);
  const statusColor = displayTotal >= DAILY_TARGET ? "#10B981" : displayTotal >= DAILY_TARGET * 0.75 ? "#F59E0B" : "#EF4444";
  const gap = Math.max(0, DAILY_TARGET - liveTotal);
  const section = CPT_DATA[activeTab];

  return (
    <div style={{ fontFamily: "'DM Mono','Courier New',monospace", background: "#080D18", minHeight: "100vh", color: "#E2E8F0" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #2D4060; border-radius: 2px; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        .cnt-btn { transition: transform 0.1s; cursor: pointer; touch-action: manipulation; user-select: none; }
        .cnt-btn:active { transform: scale(0.86); }
        .tab-btn { transition: all 0.15s; cursor: pointer; border: none; touch-action: manipulation; }
        .tab-btn:active { opacity: 0.75; }
        .svc-row { transition: background 0.1s; }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", background: "#10B981", color: "#fff", padding: "11px 22px", borderRadius: 12, fontSize: 13, fontWeight: 700, zIndex: 300, whiteSpace: "nowrap", boxShadow: "0 4px 24px rgba(16,185,129,0.4)", pointerEvents: "none" }}>
          {toast}
        </div>
      )}

      {showMonthly && <MonthlySummary history={history} onClose={() => setShowMonthly(false)} />}

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg,#0B1424,#101D33)", borderBottom: "1px solid #1E3050", padding: "12px 14px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#fff", letterSpacing: "-0.02em" }}>
              Stent<span style={{ color: "#3B82F6" }}>Wise</span>
            </div>
            <div style={{ fontSize: 10, color: "#5A8AAA", marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981", display: "inline-block" }} /> Auto-saving
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 34, fontWeight: 700, color: statusColor, lineHeight: 1 }}>{displayTotal.toFixed(1)}</div>
            <div style={{ fontSize: 10, color: "#5A8AAA" }}>{isSavedFallback ? "saved today" : "wRVU today"}</div>
          </div>
          <div style={{ width: 100 }}>
            <div style={{ height: 7, background: "#1E3050", borderRadius: 4, overflow: "hidden", marginBottom: 4 }}>
              <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,#3B82F6,${statusColor})`, borderRadius: 4, transition: "width 0.4s" }} />
            </div>
            <div style={{ fontSize: 11, color: statusColor, fontWeight: 700, textAlign: "right" }}>
              {gap > 0 ? `${gap.toFixed(1)} to go` : "✓ Target hit!"}
            </div>
          </div>
          {/* Buttons */}
          <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
            <button className="tab-btn" onClick={() => setShowMonthly(true)}
              style={{ background: "#1E3050", border: "1px solid #3A5878", borderRadius: 10, color: "#A0C4E0", fontSize: 12, padding: "9px 11px" }}>📊</button>
            {editingDay ? (
              <button className="tab-btn" onClick={savePriorDay}
                style={{ background: "#F59E0B", border: "none", borderRadius: 10, color: "#000", fontSize: 12, padding: "9px 13px", fontWeight: 700 }}>✓ Save Edit</button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <input type="date" value={dateOverride} max={TODAY}
                  onChange={e => setDateOverride(e.target.value)}
                  style={{ background: "#1E3050", border: `1.5px solid ${dateOverride ? "#F59E0B" : "#3A5878"}`, borderRadius: 9, color: dateOverride ? "#FCD34D" : "#7ABADD", fontSize: 11, padding: "7px 5px", fontFamily: "inherit", width: dateOverride ? 118 : 34 }} />
                <button className="tab-btn" onClick={saveAndReset} disabled={liveProcedures === 0}
                  style={{ background: liveProcedures > 0 ? "#EF4444" : "#2A3A50", border: `2px solid ${liveProcedures > 0 ? "#EF4444" : "#4A6080"}`, borderRadius: 10, color: liveProcedures > 0 ? "#fff" : "#7A9ABB", fontSize: 12, padding: "9px 13px", cursor: liveProcedures > 0 ? "pointer" : "not-allowed", fontWeight: 700 }}>
                  {dateOverride ? `↺ Save ${dateOverride.slice(5)}` : "↺ Save Day"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT BANNER */}
      {editingDay && (
        <div style={{ background: "linear-gradient(90deg,#92400E,#78350F)", borderBottom: "2px solid #F59E0B", padding: "10px 16px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#FCD34D" }}>✏️ Editing: {editingDay.entry.date}</div>
              <div style={{ fontSize: 10, color: "#D97706", marginTop: 2 }}>Modify counts then tap Save Edit. Changes replace the original.</div>
            </div>
            <button onClick={cancelEdit} style={{ background: "#78350F", border: "1px solid #D97706", borderRadius: 8, color: "#FCD34D", fontSize: 12, padding: "7px 12px", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* TABS */}
      <div style={{ background: "#0D1525", borderBottom: "1px solid #1E3050", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ display: "flex", padding: "10px 10px", gap: 7, minWidth: "max-content", maxWidth: 860, margin: "0 auto" }}>
          {Object.entries(CPT_DATA).map(([key, s]) => {
            const tot = liveCatTotals[key] || 0;
            const isActive = activeTab === key;
            return (
              <button key={key} className="tab-btn" onClick={() => setActiveTab(key)}
                style={{ background: isActive ? s.color : `${s.color}33`, border: `2px solid ${s.color}`, borderRadius: 11, padding: "9px 13px", color: isActive ? "#000" : s.color, fontSize: 12, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", fontWeight: 700, boxShadow: isActive ? `0 0 14px ${s.color}55` : "none" }}>
                <span style={{ fontSize: 15 }}>{s.icon}</span>
                <span>{s.label.split(" ").slice(0, 2).join(" ")}</span>
                {tot > 0 && <span style={{ background: "rgba(0,0,0,0.28)", color: isActive ? "#000" : "#fff", borderRadius: 5, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{tot.toFixed(1)}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* SERVICE LIST */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "12px 10px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ width: 3, height: 18, background: section.color, borderRadius: 2 }} />
          <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{section.icon} {section.label}</div>
          <div style={{ fontSize: 11, color: "#3A5878", marginLeft: "auto" }}>{section.services.length} services</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {section.services.map((svc, i) => {
            const cnt = counts[svc.cpt] || 0;
            const active = cnt > 0;
            return (
              <div key={svc.cpt} className="svc-row" style={{ background: active ? `${section.color}18` : i % 2 === 0 ? "#0F1828" : "#131E2E", border: `1.5px solid ${active ? section.color : "#2A4060"}`, borderRadius: 12, padding: "11px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ minWidth: 56, textAlign: "center", background: active ? section.color : "#1E3050", borderRadius: 8, padding: "5px 4px", fontSize: 11, fontWeight: 700, color: active ? "#000" : "#7ABADD", flexShrink: 0 }}>{svc.cpt}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: active ? "#fff" : "#A0C4E0", fontWeight: active ? 700 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{svc.name}</div>
                  <div style={{ fontSize: 10, color: "#5A8AAA", marginTop: 2 }}>{svc.note}</div>
                </div>
                <div style={{ textAlign: "center", flexShrink: 0, minWidth: 40 }}>
                  <div style={{ fontSize: 13, color: section.color, fontWeight: 700 }}>{svc.wrvu}</div>
                  <div style={{ fontSize: 9, color: "#5A8AAA" }}>ea</div>
                </div>
                {/* COUNTER */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                  <button className="cnt-btn" onClick={() => updateCount(svc.cpt, -1)}
                    style={{ width: 48, height: 48, borderRadius: 12, background: cnt > 0 ? "#EF444422" : "#1E3050", border: `2px solid ${cnt > 0 ? "#EF4444" : "#3A5878"}`, color: cnt > 0 ? "#EF4444" : "#5A8AAA", fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <input type="number" min="0" value={cnt} onChange={e => setCount(svc.cpt, e.target.value)}
                    style={{ width: 54, height: 48, textAlign: "center", background: "#1E3050", border: `2px solid ${active ? section.color : "#3A5878"}`, borderRadius: 12, color: active ? "#fff" : "#A0C4E0", fontSize: 18, fontFamily: "inherit", fontWeight: 700 }} />
                  <button className="cnt-btn" onClick={() => updateCount(svc.cpt, 1)}
                    style={{ width: 48, height: 48, borderRadius: 12, background: `${section.color}22`, border: `2px solid ${section.color}`, color: section.color, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
                <div style={{ minWidth: 48, textAlign: "right", flexShrink: 0 }}>
                  {active ? <div style={{ fontSize: 14, fontWeight: 700, color: section.color }}>{(cnt * svc.wrvu).toFixed(2)}</div>
                          : <div style={{ fontSize: 12, color: "#2A4060" }}>—</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM STRIP */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "14px 10px 16px" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>

          {/* TODAY'S BREAKDOWN */}
          <div style={{ flex: "1 1 190px", background: "#1A2840", border: "1px solid #3A5878", borderRadius: 13, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: "#7ABADD", letterSpacing: "0.07em", textTransform: "uppercase" }}>Today's Breakdown</div>
              {isSavedFallback && <div style={{ fontSize: 9, color: "#F59E0B", background: "#F59E0B22", border: "1px solid #F59E0B55", borderRadius: 4, padding: "2px 6px" }}>Saved ✓</div>}
            </div>
            {Object.entries(CPT_DATA).map(([key, s]) => {
              const tot = displayCatTots[key] || 0;
              return (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: tot > 0 ? s.color : "#2A4060" }} />
                    <span style={{ fontSize: 11, color: tot > 0 ? "#E2EEF8" : "#5A8AAA" }}>{s.icon} {s.label.split(" ")[0]}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: tot > 0 ? s.color : "#2A4060" }}>{tot > 0 ? tot.toFixed(2) : "—"}</span>
                </div>
              );
            })}
            <div style={{ borderTop: "1px solid #2A4060", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#7ABADD", fontWeight: 600 }}>TOTAL</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: statusColor }}>{displayTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* PACE */}
          <div style={{ flex: "1 1 160px", background: "#1A2840", border: "1px solid #3A5878", borderRadius: 13, padding: 14 }}>
            <div style={{ fontSize: 10, color: "#7ABADD", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>Pace</div>
            {[
              ["Target/day",  `${DAILY_TARGET} wRVU`],
              ["Today",       `${displayTotal.toFixed(1)} wRVU`],
              ["Procedures",  `${isSavedFallback ? (todaySaved?.procedures || 0) : liveProcedures}`],
              ["Annual pace", displayTotal > 0 ? `${(displayTotal * WORKING_DAYS).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` : "—"],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 11, color: "#7ABADD" }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#CBD5E1" }}>{val}</span>
              </div>
            ))}
            <div style={{ height: 6, background: "#1E3050", borderRadius: 3, overflow: "hidden", marginTop: 8 }}>
              <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,#3B82F6,${statusColor})`, borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 11, color: statusColor, fontWeight: 700, textAlign: "center", marginTop: 5 }}>{pct.toFixed(0)}% of goal</div>
          </div>

          {/* ACTIVE CHARGES */}
          <div style={{ flex: "1 1 160px", background: "#1A2840", border: "1px solid #3A5878", borderRadius: 13, padding: 14 }}>
            <div style={{ fontSize: 10, color: "#7ABADD", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>Active Charges</div>
            {Object.values(displayCounts).every(v => !v)
              ? <div style={{ fontSize: 11, color: "#5A8AAA", textAlign: "center", padding: "16px 0" }}>No charges yet</div>
              : <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 180, overflowY: "auto" }}>
                  {Object.entries(CPT_DATA).flatMap(([, s]) =>
                    s.services.filter(svc => (displayCounts[svc.cpt] || 0) > 0).map(svc => {
                      const cnt = displayCounts[svc.cpt];
                      return (
                        <div key={svc.cpt} style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 11, color: s.color }}>{svc.cpt} <span style={{ color: "#7ABADD" }}>×{cnt}</span></span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#E2EEF8" }}>{(cnt * svc.wrvu).toFixed(2)}</span>
                        </div>
                      );
                    })
                  )}
                </div>
            }
          </div>

          {/* ALERTS + PRIOR DAYS */}
          <div style={{ flex: "1 1 160px", background: "#1A2840", border: "1px solid #3A5878", borderRadius: 13, padding: 14 }}>
            <div style={{ fontSize: 10, color: "#7ABADD", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>Alerts</div>
            {[
              { cond: liveTotal < 20 && liveProcedures > 0, msg: "< 20 wRVU — add consults or cath", color: "#EF4444" },
              { cond: (liveCatTotals.coronary || 0) === 0 && liveTotal >= 15, msg: "No PCI — IVUS/FFR opportunity?", color: "#F59E0B" },
              { cond: (counts["99232"] || 0) > 0, msg: "99232 — can upgrade to 99233?", color: "#F59E0B" },
              { cond: liveTotal >= DAILY_TARGET, msg: "🎯 Daily target reached!", color: "#10B981" },
            ].filter(a => a.cond).map((a, i) => (
              <div key={i} style={{ padding: "6px 8px", background: `${a.color}22`, border: `1px solid ${a.color}66`, borderRadius: 7, marginBottom: 5 }}>
                <span style={{ fontSize: 10, color: a.color, lineHeight: 1.5 }}>{a.msg}</span>
              </div>
            ))}
            {liveProcedures === 0 && liveTotal === 0 && !editingDay &&
              <div style={{ fontSize: 11, color: "#5A8AAA", textAlign: "center" }}>Enter charges above</div>}

            {/* PRIOR DAYS */}
            {history.length > 0 && (
              <div style={{ marginTop: 10, borderTop: "1px solid #2A4060", paddingTop: 10 }}>
                <div style={{ fontSize: 10, color: "#A0C4E0", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 7 }}>PRIOR DAYS</div>
                {history.slice(0, 5).map((h, i) => {
                  const hk = normKey(h);
                  const isEditing = editingDay?.normKey === hk;
                  return (
                    <div key={hk + i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, padding: "6px 8px", background: isEditing ? "#78350F44" : "#1E3050", border: `1px solid ${isEditing ? "#F59E0B" : "#3A5878"}`, borderRadius: 8, gap: 6 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 10, color: "#E2F0FF", fontWeight: 600 }}>{h.date}</div>
                        <div style={{ fontSize: 10, color: h.total >= DAILY_TARGET ? "#10B981" : "#F59E0B", fontWeight: 700 }}>{h.total.toFixed(1)} wRVU</div>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button onClick={() => loadDayForEdit(hk)}
                          style={{ background: "#F59E0B22", border: "1px solid #F59E0B", borderRadius: 6, color: "#F59E0B", fontSize: 10, padding: "4px 8px", cursor: "pointer", fontWeight: 700 }}>✏️</button>
                        <button onClick={() => deleteDay(hk)}
                          style={{ background: "#EF444422", border: "1px solid #EF4444", borderRadius: 6, color: "#EF4444", fontSize: 11, padding: "4px 7px", cursor: "pointer" }}>✕</button>
                      </div>
                    </div>
                  );
                })}
                <button onClick={() => setShowMonthly(true)}
                  style={{ width: "100%", marginTop: 4, background: "#1E3050", border: "1px solid #3A5878", borderRadius: 8, color: "#3B82F6", fontSize: 11, padding: "7px 0", cursor: "pointer", fontWeight: 600 }}>
                  Full monthly view →
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* CALENDAR */}
      <CalendarView history={history} onEdit={loadDayForEdit} />

    </div>
  );
}
