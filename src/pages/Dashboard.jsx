import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useAuth } from "../context/AuthContext";
import { expApi } from "../api";
import Icon from "../components/Icons";
import ExpenseModal, { catOf } from "../components/ExpenseModal";

const money = (n) => "Rs " + Math.round(n).toLocaleString();
const W = 640, H = 170, P = 18;

// animate a number inside an element (React never renders children there)
const tween = (el, to, fmt) => {
  if (!el) return;
  const o = { v: 0 };
  gsap.to(o, { v: to, duration: 1.8, ease: "power3.out", onUpdate: () => { el.textContent = fmt(o.v); } });
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const root = useRef();
  const refs = { kb: useRef(), ki: useRef(), ke: useRef(), ks: useRef(), gp: useRef(), gsp: useRef(), gl: useRef(), arc: useRef(), nd: useRef(), sc: useRef(), tl: useRef(), gc: useRef() };
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [cf, setCf] = useState(null);
  const [limit, setLimit] = useState(() => Number(localStorage.getItem("limit")) || 55000);

  useEffect(() => { expApi.get("/").then((r) => setItems(r.data.items)).finally(() => setLoading(false)); }, []);

  const save = async (data) => {
    try {
      if (data._id) {
        const r = await expApi.put(`/${data._id}`, data);
        setItems((p) => p.map((x) => (x._id === data._id ? r.data.item : x)));
      } else {
        const r = await expApi.post("/", data);
        setItems((p) => [r.data.item, ...p]);
      }
      setModal(null);
    } catch { alert("Could not save. Please try again."); }
  };
  const remove = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    await expApi.delete(`/${id}`);
    setItems((p) => p.filter((x) => x._id !== id));
  };
  const editLimit = () => {
    const v = Number(prompt("Monthly budget limit (Rs)", limit));
    if (v > 0) { setLimit(v); localStorage.setItem("limit", v); }
  };

  const S = useMemo(() => {
    let inc = 0, exp = 0, m30 = 0;
    const bc = {}, now = new Date(), cut = Date.now() - 30 * 864e5;
    const ms = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return { y: d.getFullYear(), m: d.getMonth(), l: d.toLocaleString("en", { month: "short" }), n: 0 };
    });
    items.forEach((x) => {
      const d = new Date(x.date), s = ms.find((m) => m.y === d.getFullYear() && m.m === d.getMonth());
      if (x.type === "income") { inc += x.amount; if (s) s.n += x.amount; }
      else { exp += x.amount; if (s) s.n -= x.amount; bc[x.category] = (bc[x.category] || 0) + x.amount; if (d.getTime() >= cut) m30 += x.amount; }
    });
    let run = 0;
    const pts = ms.map((m) => (run += m.n));
    const mn = Math.min(...pts, 0), mx = Math.max(...pts, 1);
    const xy = pts.map((v, i) => [P + (i * (W - 2 * P)) / 5, H - P - ((v - mn) / (mx - mn || 1)) * (H - 2 * P)]);
    let d = "M" + xy[0].join(" ");
    for (let i = 1; i < xy.length; i++) { const [a, b] = xy[i - 1], [c, e] = xy[i], m2 = (a + c) / 2; d += `C${m2} ${b} ${m2} ${e} ${c} ${e}`; }
    return { inc, exp, m30, ms, xy, d, list: Object.entries(bc).sort((a, b) => b[1] - a[1]) };
  }, [items]);

  const bal = S.inc - S.exp;
  const pct = Math.min(S.m30 / limit, 1);
  const shown = items.filter((x) => (filter === "all" || x.type === filter) && (!cf || x.category === cf) && x.title.toLowerCase().includes(q.toLowerCase())).slice(0, 15);
  const hr = new Date().getHours();
  const greet = `${hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening"}, ${user.name.split(" ")[0]}`;

  /* page intro (once) + 3D tilt */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".rise", { opacity: 1 });
      gsap.timeline({ defaults: { ease: "power4.out" } })
        .fromTo(".side", { x: -90, opacity: 0 }, { x: 0, opacity: 1, duration: 1 })
        .fromTo(".bar", { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, "<.1")
        .fromTo(".nav a", { x: -26, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, stagger: 0.06 }, "<.2")
        .fromTo(".gr span", { y: 64, opacity: 0, rotateX: -80 }, { y: 0, opacity: 1, rotateX: 0, duration: 0.9, stagger: 0.025 }, "<.1")
        .fromTo(".hd small,.hd p,.hd .acts", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, "<.3")
        .fromTo(".hero,.gc,.strip,.tl", { y: 80, opacity: 0, scale: 0.92 }, { y: 0, opacity: 1, scale: 1, duration: 1.15, stagger: 0.14, ease: "back.out(1.3)" }, "<.2");
    }, root);
    const off = [];
    root.current.querySelectorAll(".hero,.gc").forEach((c) => {
      gsap.set(c, { transformPerspective: 900 });
      const rx = gsap.quickTo(c, "rotationX", { duration: 0.5, ease: "power3" }), ry = gsap.quickTo(c, "rotationY", { duration: 0.5, ease: "power3" });
      const mv = (e) => { const r = c.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - 0.5) * 8); rx(-((e.clientY - r.top) / r.height - 0.5) * 8); };
      const lv = () => { rx(0); ry(0); };
      c.addEventListener("mousemove", mv); c.addEventListener("mouseleave", lv);
      off.push(() => { c.removeEventListener("mousemove", mv); c.removeEventListener("mouseleave", lv); });
    });
    return () => { ctx.revert(); off.forEach((f) => f()); };
  }, []);

  /* data-driven animations: numbers, chart line, gauge, category bars */
  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      tween(refs.kb.current, Math.abs(bal), (v) => (bal < 0 ? "-" : "") + money(v));
      tween(refs.ki.current, S.inc, (v) => "+" + money(v));
      tween(refs.ke.current, S.exp, (v) => "-" + money(v));
      refs.ks.current.textContent = S.inc ? Math.round((bal / S.inc) * 100) + "%" : "0%";
      gsap.fromTo(".ln", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut" });
      gsap.fromTo(".ar", { opacity: 0 }, { opacity: 1, duration: 1.4, delay: 0.5 });
      gsap.fromTo(".pt", { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, transformOrigin: "50% 50%", duration: 0.5, stagger: 0.25, delay: 0.3, ease: "back.out(3)" });
      const g = { v: 0 };
      gsap.to(g, { v: pct * 100, duration: 2, ease: "power3.out", onUpdate: () => {
        refs.arc.current.setAttribute("stroke-dasharray", `${g.v} 100`);
        refs.gp.current.textContent = g.v.toFixed(1) + "%";
      } });
      gsap.fromTo(refs.nd.current, { rotation: -90, svgOrigin: "100 100" }, { rotation: -90 + pct * 180, svgOrigin: "100 100", duration: 2.4, ease: "elastic.out(1,.45)" });
      gsap.to(".pb i", { width: (i, t) => t.dataset.w + "%", duration: 1.2, ease: "power3.out" });
      gsap.from(".ct", { y: 34, opacity: 0, duration: 0.7, stagger: 0.07, clearProps: "transform,opacity" });
    }, root);
    return () => ctx.revert();
  }, [items, loading, limit]);

  /* list animation */
  const key = shown.map((x) => x._id).join();
  useEffect(() => { gsap.from(".txs li", { x: -34, opacity: 0, duration: 0.65, stagger: 0.05, ease: "power3.out", clearProps: "all" }); }, [key]);

  const scrollTo = (r) => (r ? r.current.scrollIntoView({ behavior: "smooth", block: "start" }) : scrollTo2());
  const scrollTo2 = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const theme = () => { const d = document.documentElement; d.dataset.theme = d.dataset.theme === "light" ? "dark" : "light"; };
  const navItems = [["home", "Overview", null], ["list", "Transactions", refs.tl], ["pie", "Budgets", refs.gc], ["target", "Goals"], ["bars", "Reports"], ["card", "Cards"], ["gear", "Settings"]];

  return (
    <div className="app" ref={root}>
      <aside className="side card rise">
        <div className="top"><div className="logo"><Icon name="logo" /></div><div><b>Spendly</b><small>Personal finance desk</small></div></div>
        <nav className="nav">
          {navItems.map(([i, t, r], n) => <a key={t} className={n === 0 ? "on" : ""} onClick={() => r !== undefined && scrollTo(r)}><Icon name={i} />{t}</a>)}
        </nav>
        <div className="me"><div className="av">{user.name[0].toUpperCase()}</div><div><b>{user.name.split(" ")[0]}</b><small>Premium member</small></div>
          <button className="out" onClick={logout} title="Log out"><Icon name="out" /></button></div>
      </aside>

      <div className="main">
        <header className="bar card rise">
          <div className="crumb">Spendly &nbsp;›&nbsp; <b>Overview</b></div>
          <div className="search"><Icon name="search" /><input placeholder="Search transactions..." value={q} onChange={(e) => setQ(e.target.value)} /><kbd>⌘K</kbd></div>
          <button className="btn lime" onClick={() => setModal({})}><Icon name="plus" />New</button>
          <button className="ib" onClick={theme} title="Theme"><Icon name="sun" /></button>
          <button className="ib" onClick={logout} title="Log out"><Icon name="out" /></button>
        </header>

        <div className="hd rise">
          <div><small>Overview</small><h1 className="gr">{greet.split("").map((c, i) => <span key={i} style={{ display: "inline-block", whiteSpace: "pre" }}>{c}</span>)}</h1>
            <p>Your money at a glance. Everything is synced to MongoDB Atlas and updates in real time.</p></div>
          <div className="acts"><button className="btn lime" onClick={() => setModal({})}><Icon name="card" />Add transaction</button></div>
        </div>

        <div className="g2">
          <div className="card hero rise">
            <div className="chips"><span className="chip"><i />{bal >= 0 ? "Healthy" : "Overspent"}</span><span className="chip">Last 6 months</span></div>
            <div className="bigv" ref={refs.kb}></div><div className="cap">Total balance</div>
            <div className="mini"><div>Income<b className="g" ref={refs.ki}></b></div><div>Expenses<b className="r" ref={refs.ke}></b></div><div>Savings rate<b ref={refs.ks}></b></div></div>
            <div className="chart">
              <svg viewBox={`0 0 ${W} ${H + 22}`}>
                <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c8f55a" stopOpacity=".35" /><stop offset="1" stopColor="#c8f55a" stopOpacity="0" /></linearGradient></defs>
                <path className="ar" d={`${S.d}L${S.xy[5][0]} ${H}L${S.xy[0][0]} ${H}Z`} fill="url(#ag)" />
                <path className="ln" pathLength="1" d={S.d} />
                {S.xy.map((p, i) => (<g key={i}><circle className="pt" cx={p[0]} cy={p[1]} r="5" /><text className="lbl" x={p[0]} y={H + 16} textAnchor="middle">{S.ms[i].l}</text></g>))}
              </svg>
            </div>
          </div>

          <div className="card gc rise" ref={refs.gc}>
            <h4>Budget used<span className="tag">{pct < 0.7 ? "Under 70%" : "Watch out"}</span></h4>
            <small>Spending in the last 30 days against your monthly limit.</small>
            <div className="gauge"><svg viewBox="0 0 200 118">
              <defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stopColor="#e8c547" /><stop offset="1" stopColor="#c8f55a" /></linearGradient></defs>
              <path d="M20 100A80 80 0 0 1 180 100" fill="none" stroke="var(--line)" strokeWidth="16" strokeLinecap="round" />
              <path ref={refs.arc} d="M20 100A80 80 0 0 1 180 100" pathLength="100" fill="none" stroke="url(#gg)" strokeWidth="16" strokeLinecap="round" strokeDasharray="0 100" />
              <g ref={refs.nd}><line x1="100" y1="100" x2="100" y2="36" stroke="var(--txt)" strokeWidth="3" strokeLinecap="round" /></g>
              <circle cx="100" cy="100" r="9" fill="var(--bg)" stroke="var(--txt)" strokeWidth="3" />
            </svg></div>
            <div className="gv"><b ref={refs.gp}></b><small>today</small></div>
            <div className="gs"><div>Spent<b>{money(S.m30)}</b></div><div>Left<b>{money(Math.max(limit - S.m30, 0))}</b></div><div style={{ cursor: "pointer" }} onClick={editLimit} title="Click to change">Limit<b>{money(limit)}</b></div></div>
          </div>
        </div>

        <div className="card strip rise">
          <button className="nx" onClick={() => refs.sc.current.scrollBy(-340, 0)}><Icon name="left" /></button>
          <div className="sc" ref={refs.sc}>
            {S.list.length === 0 && <div className="em" style={{ flex: 1 }}>Add an expense to see your categories</div>}
            {S.list.map(([n, v]) => { const c = catOf(n); return (
              <button key={n} className={"ct" + (cf === n ? " on" : "")} onClick={() => setCf(cf === n ? null : n)}>
                <span className="e">{c.emoji}</span><b>{n}</b><small>{money(v)} · {Math.round((v / S.exp) * 100)}%</small>
                <div className="pb"><i data-w={(v / S.exp) * 100} style={{ background: c.color }} /></div>
              </button>); })}
          </div>
          <button className="nx" onClick={() => refs.sc.current.scrollBy(340, 0)}><Icon name="right" /></button>
        </div>

        <div className="card tl rise" ref={refs.tl}>
          <div className="tlh"><h4>{cf ? `${cf} transactions` : "Recent transactions"}</h4>
            <div className="seg">{["all", "expense", "income"].map((t) => <button key={t} className={filter === t ? "on" : ""} onClick={() => setFilter(t)}>{t}</button>)}</div></div>
          {loading && <div className="em">Loading...</div>}
          {!loading && shown.length === 0 && <div className="em">🧾 Nothing here yet. Add your first transaction!</div>}
          <ul className="txs">
            {shown.map((x) => { const c = catOf(x.category); return (
              <li key={x._id}>
                <span className="emo" style={{ background: c.color + "2e", color: c.color }}>{c.emoji}</span>
                <div className="inf"><b>{x.title}</b><small>{x.category} · {new Date(x.date).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}</small></div>
                <b className={"amt " + (x.type === "income" ? "g" : "r")}>{x.type === "income" ? "+" : "-"}{money(x.amount)}</b>
                <button className="ed" onClick={() => setModal(x)} title="Edit"><Icon name="edit" size={16} /></button>
                <button className="del" onClick={() => remove(x._id)} title="Delete"><Icon name="trash" size={16} /></button>
              </li>); })}
          </ul>
        </div>
      </div>

      {modal && <ExpenseModal item={modal} onClose={() => setModal(null)} onSave={save} />}
    </div>
  );
}
