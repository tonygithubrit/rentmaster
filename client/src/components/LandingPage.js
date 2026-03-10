import { useState, useEffect, useRef } from "react";

const FEATURES = [
  { icon: "💰", title: "Smart Payment Tracking", desc: "Tenants notify landlords instantly after payment. Landlords confirm with one click. Full payment history always at your fingertips.", accent: "#3b82f6" },
  { icon: "🏠", title: "Property Management", desc: "Add properties, assign property managers, track occupancy and generate access codes for tenant onboarding.", accent: "#10b981" },
  { icon: "🔧", title: "Maintenance Requests", desc: "Tenants submit issues, landlords and property managers get notified instantly. Track every request from open to resolved.", accent: "#f59e0b" },
  { icon: "✨", title: "AI-Powered Insights", desc: "Generate lease agreements, get real-time market insights, and ask your AI property assistant anything.", accent: "#a855f7" },
];

const ROLES = [
  { role: "Landlord", icon: "🏡", color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)", perks: ["Manage all properties in one place", "Confirm rent & security deposits", "Assign property managers", "AI lease generation", "Full payment history"] },
  { role: "Tenant", icon: "🔑", color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", perks: ["View landlord payment details", "Notify payments instantly", "Upload payment receipts", "Submit maintenance requests", "Track request status"] },
  { role: "Property Manager", icon: "🤝", color: "#a855f7", bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.25)", perks: ["Manage assigned properties", "View tenant details", "Handle maintenance requests", "Track commissions earned", "AI market insights"] },
];

const STEPS = [
  { num: "01", title: "Create Account", desc: "Sign up as a landlord, tenant, or property manager in seconds." },
  { num: "02", title: "Set Up Properties", desc: "Add your properties and generate unique access codes for tenants." },
  { num: "03", title: "Connect Your Team", desc: "Tenants register with access codes. Assign property managers." },
  { num: "04", title: "Manage Everything", desc: "Track payments, maintenance, and get AI insights all in one place." },
];

function useVisible() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [featuresRef, featuresVisible] = useVisible();
  const [portalsRef, portalsVisible] = useVisible();
  const [stepsRef, stepsVisible] = useVisible();
  const [ctaRef, ctaVisible] = useVisible();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div style={s.root}>
      <style>{css}</style>

      {/* NAVBAR */}
      <nav style={{ ...s.nav, ...(scrolled ? s.navScrolled : {}) }}>
        <div style={s.navInner}>
          <span style={s.logo}>🏘️ <span style={s.logoBlue}>Rent</span>Master</span>
          <div className="nav-desktop" style={s.navLinks}>
            {["features", "portals", "how-it-works"].map((id) => (
              <button key={id} style={s.navLink} onClick={() => scrollTo(id)}>
                {id === "how-it-works" ? "How It Works" : id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>
          <div className="nav-desktop" style={s.navActions}>
            <a href="/get-started" style={s.loginBtn}>Login</a>
            <a href="/get-started" style={s.getStartedBtn}>Get Started</a>
          </div>
          <button className="hamburger" style={s.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
        {menuOpen && (
          <div style={s.mobileMenu}>
            {["features", "portals", "how-it-works"].map((id) => (
              <button key={id} style={s.mobileLink} onClick={() => scrollTo(id)}>
                {id === "how-it-works" ? "How It Works" : id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
            <a href="/get-started" style={{ ...s.mobileLink, textDecoration: "none" }}>Login</a>
            <a href="/get-started" style={{ ...s.mobileLink, color: "#3b82f6", fontWeight: 700, textDecoration: "none" }}>Get Started →</a>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroGrid} />
        <div style={s.heroOrb1} />
        <div style={s.heroOrb2} />
        <div className="hero-inner" style={s.heroInner}>
          <div style={s.heroLeft}>
            <div style={s.heroBadge}>✦ Property Management Reimagined</div>
            <h1 style={s.heroH1}>
              Take Control of<br />
              <span style={s.heroAccent}>Your Rental Empire</span>
            </h1>
            <p style={s.heroSub}>
              Manage tenants, track rent payments, handle maintenance requests, and get AI-powered insights — all from one powerful platform.
            </p>
            <div style={s.heroCtas}>
              <a href="/get-started" style={s.ctaPrimary}>Get Started Free →</a>
              <button style={s.ctaSecondary} onClick={() => scrollTo("how-it-works")}>See How It Works</button>
            </div>
            <div style={s.heroTrust}>
              <span style={s.trustDot} />
              Trusted by landlords, tenants & property managers worldwide
            </div>
          </div>
          <div className="hero-right" style={s.heroRight}>
            <div className="float-anim" style={s.mockup}>
              <div style={s.mockupBar}>
                <span style={{ ...s.dot, background: "#ff5f57" }} />
                <span style={{ ...s.dot, background: "#ffbd2e" }} />
                <span style={{ ...s.dot, background: "#28c840" }} />
                <span className="mockup-url" style={s.mockupUrl}>rentmaster.app/dashboard</span>
              </div>
              <div style={s.mockupBody}>
                <div className="mockup-sidebar" style={s.mockupSidebar}>
                  {["📊 Dashboard", "🏠 Properties", "👥 Tenants", "💰 Payments", "🛠️ Maintenance", "✨ AI Insights"].map((item) => (
                    <div key={item} style={s.sideItem}>{item}</div>
                  ))}
                </div>
                <div style={s.mockupMain}>
                  <div style={s.statsRow}>
                    {[{ l: "Total Revenue", v: "$48,200", c: "#3b82f6" }, { l: "Tenants", v: "24", c: "#10b981" }, { l: "Properties", v: "12", c: "#a855f7" }].map((st) => (
                      <div key={st.l} style={s.statCard}>
                        <div className="mockup-stat-val" style={{ ...s.statVal, color: st.c }}>{st.v}</div>
                        <div className="mockup-stat-label" style={s.statLabel}>{st.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={s.chart}>
                    <div style={s.chartLabel}>Income Trend</div>
                    <div style={s.chartBars}>
                      {[40, 65, 45, 80, 60, 90, 75, 95, 70, 85, 78, 100].map((h, i) => (
                        <div key={i} className="bar-anim" style={{ ...s.bar, height: `${h}%`, animationDelay: `${i * 0.06}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={s.section}>
        <div ref={featuresRef} style={s.sectionInner}>
          <div className={featuresVisible ? "fade-up visible" : "fade-up"}>
            <div style={s.badge}>Everything You Need</div>
            <h2 style={s.sectionH2}>Built for Modern<br />Property Management</h2>
            <p style={s.sectionSub}>Every tool you need to manage your rental business efficiently</p>
          </div>
          <div style={s.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className={featuresVisible ? "fade-up visible" : "fade-up"} style={{ ...s.featureCard, borderColor: f.accent + "33", transitionDelay: `${i * 0.1}s` }}>
                <div style={{ ...s.featureIcon, background: f.accent + "18", border: `1px solid ${f.accent}33` }}>{f.icon}</div>
                <h3 style={s.featureTitle}>{f.title}</h3>
                <p style={s.featureDesc}>{f.desc}</p>
                <div style={{ ...s.accentLine, background: f.accent }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTALS */}
      <section id="portals" style={{ ...s.section, background: "rgba(15,23,42,0.7)" }}>
        <div ref={portalsRef} style={s.sectionInner}>
          <div className={portalsVisible ? "fade-up visible" : "fade-up"}>
            <div style={s.badge}>Choose Your Portal</div>
            <h2 style={s.sectionH2}>Built for Everyone<br />in Rental Management</h2>
            <p style={s.sectionSub}>One platform, three powerful portals — each tailored to your role</p>
          </div>
          <div style={s.rolesGrid}>
            {ROLES.map((r, i) => (
              <div key={r.role} className={portalsVisible ? "fade-up visible" : "fade-up"} style={{ ...s.roleCard, background: r.bg, border: `1px solid ${r.border}`, transitionDelay: `${i * 0.15}s` }}>
                <div style={s.roleIcon}>{r.icon}</div>
                <h3 style={{ ...s.roleTitle, color: r.color }}>{r.role}</h3>
                <ul style={s.roleList}>
                  {r.perks.map((p) => (
                    <li key={p} style={s.rolePerk}><span style={{ color: r.color, marginRight: 8 }}>✓</span>{p}</li>
                  ))}
                </ul>
                <a href={`/auth/${r.role === "Property Manager" ? "agent" : r.role.toLowerCase()}?mode=register`} style={{ ...s.roleBtn, background: r.color }}>Get Started as {r.role} →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={s.section}>
        <div ref={stepsRef} style={s.sectionInner}>
          <div className={stepsVisible ? "fade-up visible" : "fade-up"}>
            <div style={s.badge}>Simple Process</div>
            <h2 style={s.sectionH2}>Up and Running<br />in Minutes</h2>
            <p style={s.sectionSub}>Four simple steps to transform how you manage rentals</p>
          </div>
          <div style={s.stepsGrid}>
            {STEPS.map((step, i) => (
              <div key={step.num} className={stepsVisible ? "fade-up visible" : "fade-up"} style={{ ...s.stepCard, transitionDelay: `${i * 0.12}s` }}>
                <div style={s.stepNum}>{step.num}</div>
                <h3 style={s.stepTitle}>{step.title}</h3>
                <p style={s.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ ...s.section, ...s.ctaBanner }}>
        <div ref={ctaRef} style={{ ...s.sectionInner, position: "relative" }}>
          <div style={s.ctaOrb} />
          <div className={ctaVisible ? "fade-up visible" : "fade-up"} style={{ textAlign: "center" }}>
            <h2 style={{ ...s.sectionH2, marginBottom: 16 }}>Start Managing Rentals Smarter</h2>
            <p style={{ color: "#64748b", fontSize: 16, marginBottom: 40 }}>Join thousands of landlords and tenants already using RentMaster</p>
            <a href="/get-started" style={s.ctaBannerBtn}>Create Free Account →</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <span style={s.logo}>🏘️ <span style={s.logoBlue}>Rent</span>Master</span>
        <p style={s.footerSub}>Property management, simplified.</p>
        <p style={s.footerCopy}>© 2026 RentMaster. All rights reserved.</p>
      </footer>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow-x: hidden; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-14px); }
  }
  @keyframes barGrow {
    from { transform: scaleY(0); opacity: 0; }
    to { transform: scaleY(1); opacity: 1; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes heroIn {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .fade-up { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .fade-up.visible { opacity: 1 !important; transform: translateY(0) !important; }
  .float-anim { animation: float 6s ease-in-out infinite; }
  .bar-anim { animation: barGrow 0.8s ease forwards; transform-origin: bottom; }

  .hero-inner { animation: heroIn 0.8s ease forwards; }

  @media (max-width: 900px) {
    .hero-inner { flex-direction: column !important; padding: 100px 20px 60px !important; gap: 40px !important; min-height: auto !important; }
    .hero-right { width: 100% !important; max-width: 100% !important; flex: none !important; }
    .nav-desktop { display: none !important; }
    .hamburger { display: flex !important; }
    .mockup-sidebar { width: 90px !important; }
.mockup-sidebar div { font-size: 9px !important; padding: 4px 5px !important; }
.mockup-stat-val { font-size: 11px !important; }
.mockup-stat-label { font-size: 7px !important; }
.mockup-url { font-size: 9px !important; }
  }
  @media (min-width: 901px) {
    .hamburger { display: none !important; }
  }
`;

const s = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#060d1f", color: "#e2e8f0", minHeight: "100vh", overflowX: "hidden" },
  nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, transition: "all 0.3s ease", padding: "18px 0" },
  navScrolled: { background: "rgba(6,13,31,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "12px 0" },
  navInner: { maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  logo: { fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#f1f5f9", whiteSpace: "nowrap", flexShrink: 0 },
  logoBlue: { color: "#3b82f6" },
  navLinks: { display: "flex", gap: 4 },
  navLink: { background: "none", border: "none", color: "#94a3b8", fontSize: 14, cursor: "pointer", padding: "8px 14px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" },
  navActions: { display: "flex", gap: 10, alignItems: "center", flexShrink: 0 },
  loginBtn: { color: "#94a3b8", textDecoration: "none", fontSize: 14, padding: "8px 14px", borderRadius: 8, whiteSpace: "nowrap" },
  getStartedBtn: { background: "#3b82f6", color: "white", textDecoration: "none", fontSize: 14, fontWeight: 600, padding: "10px 18px", borderRadius: 10, whiteSpace: "nowrap" },
  hamburger: { background: "none", border: "1px solid rgba(255,255,255,0.15)", color: "#e2e8f0", fontSize: 18, cursor: "pointer", padding: "6px 12px", borderRadius: 8, flexShrink: 0, alignItems: "center", justifyContent: "center" },
  mobileMenu: { background: "rgba(6,13,31,0.98)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 0 },
  mobileLink: { background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#94a3b8", fontSize: 16, cursor: "pointer", padding: "14px 0", textAlign: "left", fontFamily: "'DM Sans', sans-serif", display: "block" },
  hero: { position: "relative", overflow: "hidden", minHeight: "100vh" },
  heroBg: { position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.18) 0%, transparent 70%)", pointerEvents: "none" },
  heroGrid: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" },
  heroOrb1: { position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)", top: "5%", left: "0%", pointerEvents: "none" },
  heroOrb2: { position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)", bottom: "10%", right: "10%", pointerEvents: "none" },
  heroInner: { position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "120px 40px 80px", display: "flex", alignItems: "center", gap: 60, minHeight: "100vh" },
  heroLeft: { flex: 1, minWidth: 0 },
  heroRight: { flex: 1, minWidth: 0, maxWidth: 540 },
  heroBadge: { display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd", fontSize: 13, fontWeight: 500, padding: "6px 16px", borderRadius: 100, marginBottom: 28 },
  heroH1: { fontFamily: "'Syne', sans-serif", fontSize: "clamp(34px, 4.5vw, 62px)", fontWeight: 800, lineHeight: 1.1, color: "#f1f5f9", marginBottom: 24, letterSpacing: "-2px" },
  heroAccent: { background: "linear-gradient(135deg, #3b82f6, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub: { fontSize: 16, color: "#a8b8cc", lineHeight: 1.7, marginBottom: 36, maxWidth: 480 },
  heroCtas: { display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 },
  ctaPrimary: { background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white", textDecoration: "none", padding: "14px 26px", borderRadius: 12, fontSize: 15, fontWeight: 700, boxShadow: "0 0 30px rgba(59,130,246,0.35)", fontFamily: "'Syne', sans-serif" },
  ctaSecondary: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#e2e8f0", padding: "14px 26px", borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  heroTrust: { display: "flex", alignItems: "center", gap: 10, color: "#64748b", fontSize: 13 },
  trustDot: { width: 8, height: 8, borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite", flexShrink: 0 },
  mockup: { background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.1)" },
  mockupBar: { background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 16px", display: "flex", alignItems: "center", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  mockupUrl: { marginLeft: 10, fontSize: 11, color: "#475569", background: "rgba(255,255,255,0.04)", padding: "3px 12px", borderRadius: 6, flex: 1, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  mockupBody: { display: "flex", minHeight: 260 },
  mockupSidebar: { width: 130, borderRight: "1px solid rgba(255,255,255,0.05)", padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 },
  sideItem: { fontSize: 11, color: "#475569", padding: "6px 8px", borderRadius: 6 },
  mockupMain: { flex: 1, padding: 14, minWidth: 0 },
  statsRow: { display: "flex", gap: 8, marginBottom: 14 },
  statCard: { flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(255,255,255,0.06)", minWidth: 0 },
  statVal: { fontSize: 16, fontWeight: 700, fontFamily: "'Syne', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  statLabel: { fontSize: 9, color: "#475569", marginTop: 2 },
  chart: { background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.05)" },
  chartLabel: { fontSize: 10, color: "#475569", marginBottom: 10 },
  chartBars: { display: "flex", alignItems: "flex-end", gap: 3, height: 70 },
  bar: { flex: 1, background: "linear-gradient(to top, #3b82f6, #818cf8)", borderRadius: "3px 3px 0 0", transformOrigin: "bottom", minWidth: 0 },
  section: { padding: "90px 24px", position: "relative" },
  sectionInner: { maxWidth: 1200, margin: "0 auto", textAlign: "center" },
  badge: { display: "inline-block", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#93c5fd", fontSize: 13, fontWeight: 500, padding: "6px 16px", borderRadius: 100, marginBottom: 20 },
  sectionH2: { fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#f1f5f9", lineHeight: 1.15, marginBottom: 16, letterSpacing: "-1.5px" },
  sectionSub: { fontSize: 16, color: "#64748b", maxWidth: 480, margin: "0 auto 56px", lineHeight: 1.6 },
  featuresGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, textAlign: "left" },
  featureCard: { background: "rgba(15,23,42,0.8)", border: "1px solid", borderRadius: 16, padding: 24, position: "relative", overflow: "hidden" },
  featureIcon: { width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 18 },
  featureTitle: { fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, color: "#f1f5f9", marginBottom: 10 },
  featureDesc: { fontSize: 14, color: "#a8b8cc", lineHeight: 1.7 },
  accentLine: { position: "absolute", bottom: 0, left: 0, height: 2, width: "40%", borderRadius: "0 2px 0 0" },
  rolesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, textAlign: "left" },
  roleCard: { borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", gap: 14 },
  roleIcon: { fontSize: 36 },
  roleTitle: { fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 },
  roleList: { listStyle: "none", display: "flex", flexDirection: "column", gap: 8, flex: 1 },
  rolePerk: { fontSize: 14, color: "#a8b8cc", display: "flex", alignItems: "center" },
  roleBtn: { color: "white", textDecoration: "none", padding: "12px 18px", borderRadius: 10, fontSize: 14, fontWeight: 700, textAlign: "center", marginTop: 6, fontFamily: "'Syne', sans-serif", display: "block" },
  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, textAlign: "left" },
  stepCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 },
  stepNum: { fontFamily: "'Syne', sans-serif", fontSize: 44, fontWeight: 800, color: "rgba(59,130,246,0.2)", lineHeight: 1, marginBottom: 14 },
  stepTitle: { fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 },
  stepDesc: { fontSize: 14, color: "#a8b8cc", lineHeight: 1.6 },
  ctaBanner: { background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(168,85,247,0.08))", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  ctaOrb: { position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" },
  ctaBannerBtn: { display: "inline-block", background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white", textDecoration: "none", padding: "16px 34px", borderRadius: 14, fontSize: 17, fontWeight: 700, boxShadow: "0 0 40px rgba(59,130,246,0.4)", fontFamily: "'Syne', sans-serif" },
  footer: { padding: "48px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" },
  footerSub: { color: "#475569", fontSize: 14, marginTop: 12, marginBottom: 8 },
  footerCopy: { color: "#334155", fontSize: 13 },
};