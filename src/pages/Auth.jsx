import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/Icons";

export default function Auth({ start = "login" }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const root = useRef();
  const [mode, setMode] = useState(start === "register" ? "up" : "in");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const up = mode === "up";
  const onChange = (e) => setF({ ...f, [e.target.name]: e.target.value });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".au", { y: 70, scale: 0.92, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 1.2, ease: "expo.out" });
      gsap.from(".au .row1,.au .tabs,.au h2,.au p.s,.au form", { y: 26, opacity: 0, duration: 0.8, stagger: 0.09, delay: 0.35, ease: "power3.out" });
    }, root);
    return () => ctx.revert();
  }, []);

  const switchTo = (m) => {
    setMode(m); setError("");
    gsap.fromTo(".au h2,.au p.s", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      up ? await register(f.name, f.email, f.password) : await login(f.email, f.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Cannot reach the server");
      gsap.fromTo(".au", { x: -8 }, { x: 0, duration: 0.6, ease: "elastic.out(1,.3)" });
    } finally { setBusy(false); }
  };

  return (
    <div className="authv" ref={root}>
      <div className="au card">
        <div className="row1">
          <div className="logo"><Icon name="logo" /></div>
          <div><b>Spendly</b><br /><small style={{ color: "var(--mut)" }}>Personal finance desk</small></div>
        </div>
        <div className="tabs">
          <button className={!up ? "on" : ""} onClick={() => switchTo("in")}>Log in</button>
          <button className={up ? "on" : ""} onClick={() => switchTo("up")}>Sign up</button>
        </div>
        <h2>{up ? "Create your account" : "Welcome back"}</h2>
        <p className="s">{up ? "Start tracking in under a minute." : "Enter your details to continue."}</p>
        {error && <div className="alert">{error}</div>}
        <form onSubmit={submit}>
          {up && (<><label>Full name</label><input className="in" name="name" placeholder="Your name" value={f.name} onChange={onChange} required /></>)}
          <label>Email</label>
          <input className="in" type="email" name="email" placeholder="you@example.com" value={f.email} onChange={onChange} required />
          <label>Password</label>
          <input className="in" type="password" name="password" placeholder={up ? "Min. 6 characters" : "Your password"} value={f.password} onChange={onChange} required minLength={up ? 6 : undefined} />
          <button className="btn lime" disabled={busy}>{busy ? <span className="btn-spin" /> : up ? "Create account" : "Log in"}</button>
        </form>
      </div>
    </div>
  );
}
