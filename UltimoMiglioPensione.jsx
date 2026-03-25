import { useState, useEffect, useCallback } from "react";

const VOCI = [
  { id:"v01", label:"Stipendio tabellare", desc:"per 13 mensilità", valido13:true,  mult:12, tipo:"input" },
  { id:"v02", label:"Differenziale storico (ex PEO)", desc:"per 13 mensilità", valido13:true, mult:12, tipo:"input" },
  { id:"v03", label:"Differenziale stipendiale CCNL 2019–2021", desc:"per 13 mensilità", valido13:true, mult:12, tipo:"input" },
  { id:"v04", label:"Assegno ad personam non riassorbibile IIS Cat. B-D", desc:"per 13 mensilità", valido13:true, mult:12, tipo:"input" },
  { id:"v05", label:"Assegno ad personam riassorbibile (prog. verticale)", desc:"per 13 mensilità", valido13:true, mult:12, tipo:"input" },
  { id:"v06", label:"Salario Individuale di Anzianità (ex R.I.A.)", desc:"per 13 mensilità", valido13:true, mult:12, tipo:"input" },
  { id:"v07", label:"Retribuzione di Posizione", desc:"per 13 mensilità", valido13:true, mult:12, tipo:"input" },
  { id:"v08", label:"Indennità specifica art.4 c.3 CCNL 16/07/1996", desc:"per 12 mensilità · valore fisso normativo", valido13:false, mult:12, tipo:"fixed", fixedValue:5.38 },
  { id:"v09", label:"Indennità di Vacanza Contrattuale (IVC)", desc:"per 13 mensilità · compreso Anticipo IVC", valido13:true, mult:12, tipo:"input" },
  { id:"v10", label:"Indennità di Comparto", desc:"per 12 mensilità · seleziona il livello contrattuale", valido13:false, mult:12, tipo:"dropdown", options:[22.68,39.30,45.80,51.90] },
  { id:"v11", label:"Indennità di vigilanza", desc:"per 12 mensilità", valido13:false, mult:12, tipo:"input" },
  { id:"v12", label:"Ind. Professionale asili nido e scolastico (€ 55,40)", desc:"per 12 mensilità · ex art. 37 c.1 lett.c CCNL 1995 (voce 72)", valido13:false, mult:12, tipo:"input" },
  { id:"v13", label:"Ind. Aggiuntiva asili nido e scolastico (€ 28,41)", desc:"per 12 mensilità · ex art. 6 CCNL 2001 (voce 78)", valido13:false, mult:12, tipo:"input" },
  { id:"v14", label:"Ind. Tempo potenziato personale scolastico (€ 103,28)", desc:"per 10 mensilità · ex art. 37 c.7 CCNL 2000 (voce 74)", valido13:false, mult:10, tipo:"input" },
  { id:"v15", label:"Trattamento accessorio asili nido (€ 61,97)", desc:"per 10 mensilità · ex art. 37 c.7 CCNL 2000 (voce 84)", valido13:false, mult:10, tipo:"input" },
];

const SI13_IDS = ["v01","v02","v03","v04","v05","v06","v07","v09"];

function parseIt(s) {
  if (!s && s !== 0) return 0;
  const n = parseFloat(String(s).replace(",", "."));
  return isNaN(n) ? 0 : n;
}

function fmtEur(n, compact = false) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return (compact ? "" : "€ ") + n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcola(valori) {
  const annui = {};
  VOCI.forEach(v => { annui[v.id] = parseIt(valori[v.id]) * v.mult; });
  const totaleVoci = Object.values(annui).reduce((a, b) => a + b, 0);
  const tredicesima = SI13_IDS.reduce((sum, id) => sum + parseIt(valori[id]), 0);
  return { annui, totaleVoci, tredicesima, totale: totaleVoci + tredicesima };
}

function initValori() {
  const v = {};
  VOCI.forEach(vc => {
    if (vc.tipo === "fixed") v[vc.id] = vc.fixedValue.toFixed(2);
    else if (vc.tipo === "dropdown") v[vc.id] = String(vc.options[0]);
    else v[vc.id] = "";
  });
  return v;
}

const today = new Date().toISOString().split("T")[0];

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 – ANAGRAFICA
// ─────────────────────────────────────────────────────────────────────────────
function StepAnagrafica({ data, onChange, onNext }) {
  const f = (key, label, ph, type = "text") => (
    <div style={{ marginBottom: 14 }}>
      <label style={styles.label}>{label} <span style={{ opacity: .5, fontWeight: 400 }}>(facoltativo)</span></label>
      <input
        type={type}
        value={data[key]}
        onChange={e => onChange({ ...data, [key]: e.target.value })}
        placeholder={ph}
        style={styles.input}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <div style={styles.sectionTitle}>
        <span style={styles.stepNum}>1</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#0d1b2a" }}>Dati anagrafici</div>
          <div style={{ fontSize: 13, color: "#637180", marginTop: 2 }}>Campi facoltativi — compariranno nell'intestazione del report stampato</div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 18px" }}>
          <div style={{ gridColumn: "1/-1" }}>{f("nome", "Nome e Cognome", "Es. Mario Rossi")}</div>
          {f("ente", "Ente di Appartenenza", "Es. Comune di Roma")}
          {f("matricola", "N° Matricola", "—")}
          <div style={{ gridColumn: "1/-1" }}>{f("data", "Data Calcolo", "", "date")}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
        <button onClick={onNext} style={styles.btnPrimary}>
          Avanti — Inserisci le voci retributive →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 – VOCI
// ─────────────────────────────────────────────────────────────────────────────
function VoceRow({ voce, valore, onChangeVal, idx }) {
  const mensile = parseIt(valore);
  const annuo = mensile * voce.mult;
  const hasVal = mensile > 0;

  const handleBlur = useCallback((e) => {
    const raw = e.target.value.replace(",", ".");
    const n = parseFloat(raw);
    if (!isNaN(n) && n > 0) onChangeVal(n.toFixed(2));
    else if (e.target.value === "" || e.target.value === "0") onChangeVal("");
  }, [onChangeVal]);

  return (
    <tr style={{ background: idx % 2 === 0 ? "#fff" : "#f9fbfc", borderBottom: "1px solid #e8ecf1" }}>
      <td style={{ padding: "9px 14px 9px 16px", verticalAlign: "middle" }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#0d1b2a", lineHeight: 1.35 }}>{voce.label}</div>
        <div style={{ fontSize: 11, color: "#8a96a5", marginTop: 2 }}>{voce.desc}</div>
      </td>
      <td style={{ padding: "9px 10px", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap" }}>
        <span style={{
          display: "inline-block", padding: "2px 7px", borderRadius: 4, fontSize: 11, fontWeight: 700,
          background: voce.valido13 ? "#e8f5ee" : "#f1f3f5",
          color: voce.valido13 ? "#1d7a4e" : "#8a96a5"
        }}>
          {voce.valido13 ? "✓ SI" : "NO"}
        </span>
      </td>
      <td style={{ padding: "9px 10px", verticalAlign: "middle", width: 180 }}>
        {voce.tipo === "fixed" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#8a96a5", fontFamily: "monospace" }}>
              {String(voce.fixedValue.toFixed(2)).replace(".", ",")}
            </span>
            <span style={{ fontSize: 13, color: "#b0b8c4" }} title="Valore fisso normativo">🔒</span>
          </div>
        )}
        {voce.tipo === "dropdown" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "flex-end" }}>
            {voce.options.map(opt => {
              const sel = Math.abs(parseIt(valore) - opt) < 0.001;
              return (
                <button key={opt} onClick={() => onChangeVal(opt.toFixed(2))} style={{
                  padding: "4px 8px", fontSize: 11, fontWeight: 600, borderRadius: 5, cursor: "pointer",
                  border: sel ? "2px solid #c9a228" : "1px solid #d5dce5",
                  background: sel ? "#fdf6e3" : "white",
                  color: sel ? "#8a6900" : "#637180",
                  fontFamily: "monospace"
                }}>
                  {opt.toFixed(2).replace(".", ",")}
                </button>
              );
            })}
          </div>
        )}
        {voce.tipo === "input" && (
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#b0b8c4", pointerEvents: "none" }}>€</span>
            <input
              type="text"
              inputMode="decimal"
              value={valore}
              onChange={e => onChangeVal(e.target.value.replace(/[^0-9,.]/g, ""))}
              onBlur={handleBlur}
              placeholder="0,00"
              style={{
                width: "100%", padding: "7px 10px 7px 22px", fontSize: 13,
                border: `1.5px solid ${hasVal ? "#a8c8e8" : "#d5dce5"}`,
                borderRadius: 7, outline: "none", textAlign: "right", boxSizing: "border-box",
                background: hasVal ? "#f0f6ff" : "white", color: "#0d1b2a",
                fontFamily: "monospace", transition: "border-color .15s, background .15s"
              }}
            />
          </div>
        )}
      </td>
      <td style={{ padding: "9px 16px 9px 10px", textAlign: "right", verticalAlign: "middle", fontFamily: "monospace", fontSize: 13, color: hasVal ? "#1a3a5c" : "#c8d0da", fontWeight: hasVal ? 600 : 400, whiteSpace: "nowrap" }}>
        {hasVal ? fmtEur(annuo) : "—"}
        {hasVal && voce.mult === 10 && <span style={{ fontSize: 10, color: "#8a96a5", marginLeft: 4 }}>×10</span>}
      </td>
    </tr>
  );
}

function StepVoci({ valori, onChangeAll, onBack, onCalcola }) {
  const preview = calcola(valori);
  const hasAny = VOCI.some(v => parseIt(valori[v.id]) > 0);

  return (
    <div>
      <div style={{ ...styles.sectionTitle, marginBottom: 20 }}>
        <span style={styles.stepNum}>2</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#0d1b2a" }}>Voci retributive</div>
          <div style={{ fontSize: 13, color: "#637180", marginTop: 2 }}>
            Importi mensili annualizzati — a tempo pieno in caso di part-time. I campi vuoti valgono zero.
          </div>
        </div>
      </div>

      <div style={{ ...styles.card, padding: 0, overflow: "hidden" }}>
        {/* Table header */}
        <div style={{ background: "#1a3a5c", display: "grid", gridTemplateColumns: "1fr 72px 180px 130px", padding: "10px 16px 10px 16px", gap: 8, alignItems: "center" }}>
          {["Voce retributiva", "13^", "Importo mensile", "Importo annuo"].map((h, i) => (
            <span key={i} style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.65)", textTransform: "uppercase", letterSpacing: .7, textAlign: i > 1 ? "right" : i === 1 ? "center" : "left" }}>{h}</span>
          ))}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {VOCI.map((v, i) => (
              <VoceRow
                key={v.id}
                voce={v}
                valore={valori[v.id]}
                onChangeVal={val => onChangeAll({ ...valori, [v.id]: val })}
                idx={i}
              />
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f0f4f8", borderTop: "2px solid #dde5ef" }}>
              <td colSpan={3} style={{ padding: "11px 16px", fontSize: 13, fontWeight: 700, color: "#1a3a5c" }}>
                Anteprima totale ultimo miglio
              </td>
              <td style={{ padding: "11px 16px", textAlign: "right", fontSize: 14, fontWeight: 800, color: "#1a3a5c", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                {fmtEur(preview.totale)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
        <button onClick={onBack} style={styles.btnSecondary}>← Indietro</button>
        <button
          onClick={onCalcola}
          disabled={!hasAny}
          style={hasAny ? styles.btnPrimary : { ...styles.btnPrimary, opacity: .4, cursor: "not-allowed" }}
        >
          Calcola e blocca il risultato 🔒
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 – RISULTATO BLOCCATO
// ─────────────────────────────────────────────────────────────────────────────
function ResultCard({ label, sub, value, accent }) {
  return (
    <div style={{
      background: accent ? "linear-gradient(135deg, #1a3a5c 0%, #0d1b2a 100%)" : styles.card.background,
      border: accent ? "none" : "1px solid #e2e8f0",
      borderRadius: 12, padding: "18px 20px",
      boxShadow: accent ? "0 6px 24px rgba(13,27,42,.28)" : "0 2px 8px rgba(0,0,0,.06)"
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: .8, marginBottom: 4, color: accent ? "rgba(255,255,255,.55)" : "#8a96a5" }}>{label}</div>
      <div style={{ fontSize: 11, color: accent ? "rgba(255,255,255,.4)" : "#aab3be", marginBottom: 12 }}>{sub}</div>
      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "monospace", color: accent ? "#c9a228" : "#1a3a5c" }}>
        {fmtEur(value)}
      </div>
      {accent && <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 8 }}>BASE PENSIONABILE COMPLESSIVA</div>}
    </div>
  );
}

function StepRisultato({ risultato, onReset }) {
  const [copied, setCopied] = useState(false);
  const { ana, valori, annui, totaleVoci, tredicesima, totale, ts } = risultato;
  const vociPresenti = VOCI.filter(v => parseIt(valori[v.id]) > 0);
  const dataStr = new Date(ts).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });

  const buildText = () => {
    let t = `CALCOLO ULTIMO MIGLIO PENSIONE INPS ENTI LOCALI\nData: ${dataStr}\n`;
    if (ana.nome) t += `Dipendente: ${ana.nome}\n`;
    if (ana.ente) t += `Ente: ${ana.ente}\n`;
    if (ana.matricola) t += `Matricola: ${ana.matricola}\n`;
    t += `\n--- VOCI RETRIBUTIVE ---\n`;
    vociPresenti.forEach(v => {
      const m = parseIt(valori[v.id]);
      t += `${v.label}: ${fmtEur(m)} mensili × ${v.mult} = ${fmtEur(annui[v.id])} annui\n`;
    });
    t += `\n--- RISULTATO ---\n`;
    t += `Totale voci annualizzate: ${fmtEur(totaleVoci)}\n`;
    t += `13^ mensilità: ${fmtEur(tredicesima)}\n`;
    t += `TOTALE ULTIMO MIGLIO: ${fmtEur(totale)}\n`;
    return t;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2800);
    });
  };

  return (
    <div>
      {/* ── LOCKED BANNER ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#e8f5ee", border: "1px solid #b6ddc8", borderRadius: 10, padding: "12px 18px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🔒</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1d5e3d" }}>Calcolo completato — risultato non modificabile</div>
            <div style={{ fontSize: 12, color: "#3d8a61" }}>
              Elaborato il {dataStr}
              {ana.nome && ` · ${ana.nome}`}
              {ana.ente && ` · ${ana.ente}`}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#5a9475", textAlign: "right", lineHeight: 1.5 }}>
          {ana.matricola && <div>Mat. {ana.matricola}</div>}
          <div style={{ opacity: .7 }}>{dataStr}</div>
        </div>
      </div>

      {/* ── RESULT CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
        <ResultCard label="Totale voci annualizzate" sub="Somma di tutte le voci × mensilità" value={totaleVoci} />
        <ResultCard label="13^ mensilità" sub="Somma mensili voci valide per 13^" value={tredicesima} />
        <ResultCard label="Totale ultimo miglio" sub="Voce totale base pensionabile" value={totale} accent />
      </div>

      {/* ── DETAIL TABLE ── */}
      <div style={{ ...styles.card, padding: 0, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ background: "#f5f7fa", borderBottom: "1px solid #e2e8f0", padding: "10px 16px", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1a3a5c" }}>Dettaglio voci inserite</span>
          <span style={{ fontSize: 11, color: "#8a96a5" }}>· {vociPresenti.length} voci con valore &gt; 0</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fbfc", borderBottom: "1px solid #e2e8f0" }}>
              {["Voce retributiva", "13^", "×", "Mensile", "Annuo"].map((h, i) => (
                <th key={i} style={{ padding: "8px 14px", textAlign: i > 1 ? "right" : i === 1 ? "center" : "left", fontSize: 11, fontWeight: 700, color: "#8a96a5", textTransform: "uppercase", letterSpacing: .6 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vociPresenti.map((v, i) => {
              const mensile = parseIt(valori[v.id]);
              return (
                <tr key={v.id} style={{ background: i % 2 === 0 ? "#fff" : "#f9fbfc", borderBottom: "1px solid #edf1f5" }}>
                  <td style={{ padding: "8px 14px" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: "#0d1b2a" }}>{v.label}</div>
                    <div style={{ fontSize: 10.5, color: "#8a96a5", marginTop: 1 }}>{v.desc}</div>
                  </td>
                  <td style={{ padding: "8px 14px", textAlign: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: v.valido13 ? "#1d7a4e" : "#aab3be" }}>
                      {v.valido13 ? "✓" : "—"}
                    </span>
                  </td>
                  <td style={{ padding: "8px 14px", textAlign: "right", fontSize: 12, color: "#8a96a5", fontFamily: "monospace" }}>×{v.mult}</td>
                  <td style={{ padding: "8px 14px", textAlign: "right", fontSize: 12.5, fontFamily: "monospace", color: "#1a3a5c" }}>{fmtEur(mensile)}</td>
                  <td style={{ padding: "8px 16px", textAlign: "right", fontSize: 12.5, fontFamily: "monospace", fontWeight: 700, color: "#1a3a5c" }}>{fmtEur(annui[v.id])}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: "#1a3a5c" }}>
              <td colSpan={4} style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.8)" }}>
                TOTALE ULTIMO MIGLIO PENSIONE INPS ENTI LOCALI
              </td>
              <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 15, fontWeight: 800, color: "#c9a228", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                {fmtEur(totale)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── ACTIONS ── */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onReset} style={styles.btnSecondary}>+ Nuovo calcolo</button>
        <button onClick={handleCopy} style={{
          ...styles.btnSecondary,
          color: copied ? "#1d7a4e" : styles.btnSecondary.color,
          borderColor: copied ? "#b6ddc8" : styles.btnSecondary.borderColor,
          background: copied ? "#e8f5ee" : styles.btnSecondary.background
        }}>
          {copied ? "✓ Copiato!" : "📋 Copia testo"}
        </button>
        <button onClick={() => window.print()} style={styles.btnPrimary}>🖨 Stampa / Salva PDF</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRINT STYLES (injected globally)
// ─────────────────────────────────────────────────────────────────────────────
const PRINT_CSS = `
@media print {
  body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .no-print { display: none !important; }
  .print-header { display: block !important; }
  * { box-shadow: none !important; }
}
@media screen { .print-header { display: none !important; } }
`;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = {
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 2px 12px rgba(0,0,0,.06)"
  },
  label: {
    display: "block", fontSize: 12, fontWeight: 700, color: "#1a3a5c",
    marginBottom: 6, textTransform: "uppercase", letterSpacing: .7
  },
  input: {
    width: "100%", padding: "10px 13px", fontSize: 14, borderRadius: 8,
    border: "1.5px solid #d5dce5", outline: "none", background: "#fafbfc",
    color: "#0d1b2a", boxSizing: "border-box", fontFamily: "inherit",
    transition: "border-color .15s"
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #c9a228 0%, #a8841e 100%)",
    color: "#0d1b2a", border: "none", borderRadius: 9, padding: "12px 26px",
    fontSize: 14, fontWeight: 700, cursor: "pointer",
    boxShadow: "0 3px 12px rgba(168,132,30,.4)", letterSpacing: .2
  },
  btnSecondary: {
    background: "#f5f7fa", color: "#3a4a5a", borderRadius: 9,
    border: "1px solid #d5dce5", padding: "12px 22px",
    fontSize: 14, fontWeight: 600, cursor: "pointer"
  },
  stepNum: {
    width: 36, height: 36, borderRadius: "50%", background: "#1a3a5c",
    color: "white", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 15, fontWeight: 800, flexShrink: 0
  },
  sectionTitle: {
    display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STEPPER
// ─────────────────────────────────────────────────────────────────────────────
function Stepper({ current }) {
  const steps = ["Anagrafica", "Voci retributive", "Risultato"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 30 }}>
      {steps.map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 0, flex: i < 2 ? "1 1 auto" : "0 0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: i < current ? "#1d7a4e" : i === current ? "#c9a228" : "#e2e8f0",
              color: i <= current ? (i < current ? "#fff" : "#0d1b2a") : "#8a96a5",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800
            }}>
              {i < current ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 13, fontWeight: i === current ? 700 : 400, color: i === current ? "#0d1b2a" : "#8a96a5", whiteSpace: "nowrap" }}>
              {label}
            </span>
          </div>
          {i < 2 && <div style={{ flex: 1, height: 1, background: i < current ? "#1d7a4e" : "#dde5ef", margin: "0 10px" }} />}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0);
  const [ana, setAna] = useState({ nome: "", ente: "", matricola: "", data: today });
  const [valori, setValori] = useState(initValori);
  const [risultato, setRisultato] = useState(null);

  useEffect(() => {
    const s = document.createElement("style");
    s.id = "__pensione_print";
    s.textContent = PRINT_CSS;
    document.head.appendChild(s);
    return () => { document.getElementById("__pensione_print")?.remove(); };
  }, []);

  const handleCalcola = () => {
    const { annui, totaleVoci, tredicesima, totale } = calcola(valori);
    setRisultato({ ana: { ...ana }, valori: { ...valori }, annui, totaleVoci, tredicesima, totale, ts: Date.now() });
    setStep(2);
  };

  const handleReset = () => {
    setStep(0);
    setRisultato(null);
    setValori(initValori());
    setAna({ nome: "", ente: "", matricola: "", data: today });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>

      {/* ── PRINT HEADER ── */}
      <div className="print-header" style={{ padding: "0 0 16px", borderBottom: "2px solid #1a3a5c", marginBottom: 24, display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1a3a5c" }}>Immedia S.p.A.</div>
          <div style={{ fontSize: 11, color: "#637180" }}>www.immediaspa.com</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1a3a5c" }}>Calcolo Ultimo Miglio Pensione INPS</div>
          <div style={{ fontSize: 11, color: "#637180" }}>Enti Locali — {risultato && new Date(risultato.ts).toLocaleDateString("it-IT")}</div>
        </div>
      </div>

      {/* ── SCREEN HEADER ── */}
      <header className="no-print" style={{ background: "#1a3a5c", padding: "0 32px", boxShadow: "0 2px 12px rgba(0,0,0,.18)" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, background: "#c9a228", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#0d1b2a", fontSize: 14, letterSpacing: -.5 }}>IM</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Immedia S.p.A.</div>
              <div style={{ color: "rgba(255,255,255,.45)", fontSize: 10.5 }}>www.immediaspa.com</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#c9a228", fontWeight: 700, fontSize: 13, letterSpacing: .2 }}>Calcolatore Ultimo Miglio Pensione</div>
            <div style={{ color: "rgba(255,255,255,.5)", fontSize: 11 }}>INPS Enti Locali — CCNL Comparto Funzioni Locali</div>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: 980, margin: "0 auto", padding: "32px 24px 60px" }}>
        <div className="no-print">
          <Stepper current={step} />
        </div>

        {step === 0 && (
          <StepAnagrafica data={ana} onChange={setAna} onNext={() => setStep(1)} />
        )}
        {step === 1 && (
          <StepVoci valori={valori} onChangeAll={setValori} onBack={() => setStep(0)} onCalcola={handleCalcola} />
        )}
        {step === 2 && risultato && (
          <StepRisultato risultato={risultato} onReset={handleReset} />
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="no-print" style={{ background: "#1a3a5c", padding: "14px 32px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,.4)", fontSize: 11 }}>© Immedia S.p.A. — Applicativo ad uso interno</span>
          <span style={{ color: "rgba(255,255,255,.3)", fontSize: 11 }}>Calcolo Ultimo Miglio Pensione INPS Enti Locali · CCNL Funzioni Locali</span>
        </div>
      </footer>
    </div>
  );
}
