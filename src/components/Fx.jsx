import { useEffect } from "react";
import gsap from "gsap";

// Background blobs, custom cursor, magnetic buttons and card spotlight
export default function Fx() {
  useEffect(() => {
    const cur = document.getElementById("cur");
    const hover = matchMedia("(hover:hover)").matches;
    const cx = gsap.quickTo(cur, "x", { duration: 0.35, ease: "power3" });
    const cy = gsap.quickTo(cur, "y", { duration: 0.35, ease: "power3" });
    let last = null;
    const move = (e) => {
      const t = e.target.closest ? e.target : document.body;
      cur.style.opacity = 1;
      cx(e.clientX); cy(e.clientY);
      cur.classList.toggle("big", !!t.closest("button,a,input,.ct"));
      const card = t.closest(".card");
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      }
      const m = t.closest(".btn.lime,.ib");
      if (last && last !== m) gsap.to(last, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1,.4)" });
      if (m) {
        const r = m.getBoundingClientRect();
        gsap.to(m, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.4, ease: "power3.out" });
      }
      last = m;
    };
    if (hover) addEventListener("mousemove", move);
    const a = gsap.to(".b1", { x: 140, y: 70, duration: 9, repeat: -1, yoyo: true, ease: "sine.inOut" });
    const b = gsap.to(".b2", { x: -150, y: -90, duration: 11, repeat: -1, yoyo: true, ease: "sine.inOut" });
    return () => { removeEventListener("mousemove", move); a.kill(); b.kill(); };
  }, []);

  return (<><div className="blob b1" /><div className="blob b2" /><div className="cur" id="cur" /></>);
}
