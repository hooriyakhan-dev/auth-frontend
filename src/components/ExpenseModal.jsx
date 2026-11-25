import { useEffect, useState } from "react";
import gsap from "gsap";

export const CATS = [
  { name: "Food", emoji: "🍔", color: "#f08a70", type: "expense" },
  { name: "Transport", emoji: "🚗", color: "#7dd3c8", type: "expense" },
  { name: "Shopping", emoji: "🛍️", color: "#b79cf5", type: "expense" },
  { name: "Bills", emoji: "💡", color: "#e8c547", type: "expense" },
  { name: "Health", emoji: "💊", color: "#8bd77a", type: "expense" },
  { name: "Fun", emoji: "🎬", color: "#f5a35c", type: "expense" },
  { name: "Salary", emoji: "💼", color: "#c8f55a", type: "income" },
  { name: "Freelance", emoji: "💻", color: "#7dd3c8", type: "income" },
  { name: "Other", emoji: "✨", color: "#a3a28a", type: "both" },
];
export const catOf = (n) => CATS.find((c) => c.name === n) || CATS[CATS.length - 1];
const today = () => new Date().toISOString().slice(0, 10);

export default function ExpenseModal({ item, onClose, onSave }) {
  const editing = !!item?._id;
  const [f, setF] = useState({
    type: item?.type || "expense", title: item?.title || "", amount: item?.amount || "",
    category: item?.category || "Food", date: (item?.date || today()).slice(0, 10),
  });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const cats = CATS.filter((c) => c.type === f.type || c.type === "both");

  useEffect(() => {
    gsap.fromTo(".modal", { y: 60, scale: 0.88, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.7)" });
    gsap.from(".cats button", { scale: 0.5, opacity: 0, stagger: 0.04, delay: 0.25, duration: 0.5, ease: "back.out(2)" });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    await onSave({ ...(editing ? { _id: item._id } : {}), ...f, amount: Number(f.amount) });
    setBusy(false);
  };

  return (
    <div className="ov" onMouseDown={onClose}>
      <form className="modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>{editing ? "Edit transaction" : "New transaction"}</h3>
        <div className="seg">
          {["expense", "income"].map((t) => (
            <button type="button" key={t} className={f.type === t ? "on" : ""}
              onClick={() => setF((p) => ({ ...p, type: t, category: t === "income" ? "Salary" : "Food" }))}>{t}</button>
          ))}
        </div>
        <label>Title</label>
        <input className="in" placeholder="e.g. Lunch with friends" value={f.title} onChange={(e) => set("title", e.target.value)} required />
        <div className="two">
          <div><label>Amount (Rs)</label><input className="in" type="number" min="1" value={f.amount} onChange={(e) => set("amount", e.target.value)} required /></div>
          <div><label>Date</label><input className="in" type="date" value={f.date} onChange={(e) => set("date", e.target.value)} required /></div>
        </div>
        <label>Category</label>
        <div className="cats">
          {cats.map((c) => (
            <button type="button" key={c.name} className={f.category === c.name ? "on" : ""} onClick={() => set("category", c.name)}>{c.emoji} {c.name}</button>
          ))}
        </div>
        <button className="btn lime" disabled={busy}>{busy ? <span className="btn-spin" /> : editing ? "Save changes" : "Add transaction"}</button>
      </form>
    </div>
  );
}
