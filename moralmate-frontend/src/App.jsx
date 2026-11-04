import { useState } from "react";
import {
  GraduationCap,
  ClipboardList,
  HeartPulse,
  ShieldAlert,
  ArrowRight,
  UserCircle,
  Menu,
  X
} from "lucide-react";
import ChatPanel from "./components/ChatPanel";
import SubmitRequestForm from "./components/SubmitRequestForm";
import MyRequests from "./components/MyRequests";
import StaffReview from "./components/StaffReview";
import { strings } from "./i18n";
import "./App.css";

const supportCategories = [
  { title: "Academic Support", description: "Lectures, assessments, extensions and study guidance", icon: GraduationCap, color: "navy", target: "Submit Request" },
  { title: "Administrative Support", description: "Registration, records, fees and student services", icon: ClipboardList, color: "red", target: "Home" },
  { title: "Wellbeing Support", description: "Counselling, wellbeing and personal support", icon: HeartPulse, color: "gold", target: "Human Support", sensitive: "wellbeing" },
  { title: "Report a Concern", description: "Harassment, misconduct or safety-related concerns", icon: ShieldAlert, color: "navy", target: "Human Support", sensitive: "misconduct" }
];

const PAGES = ["Home", "Submit Request", "My Requests", "Staff Review", "About"];

// Interface language is fixed to English in this prototype. Multilingual
// support is planned future work (see src/i18n.js).
const language = "en";

export default function App() {
  const [activePage, setActivePage] = useState("Home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sensitiveTopic, setSensitiveTopic] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const L = strings(language);

  function navigate(page) {
    setActivePage(page);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  }

  function selectCategory(category) {
    if (category.sensitive) setSensitiveTopic(category.sensitive);
    if (category.target === "Home") {
      document.querySelector(".assistant-panel input")?.focus();
      return;
    }
    navigate(category.target);
  }

  const onSaved = () => setRefreshKey(k => k + 1);

  return (
    <div className="app">
      <header className="navbar">
        <div className="university-brand">
          <img src="/nust-logo.png" alt="NUST logo" className="nust-logo" />
          <div className="university-name">
            <strong>NAMIBIA UNIVERSITY</strong>
            <span>OF SCIENCE AND TECHNOLOGY</span>
          </div>
        </div>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          {PAGES.map(page => (
            <button key={page} className={activePage === page ? "nav-active" : ""} onClick={() => navigate(page)}>
              {L.nav[page]}
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <UserCircle size={27} />
          <span>Student</span>
        </div>

        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {activePage === "Home" && (
        <>
          <section className="hero">
            <div className="hero-content">
              <h1>Moral<span>Mate</span></h1>
              <h2>{L.heroTitle}</h2>
              <p>{L.heroText}</p>
              <div className="hero-buttons">
                <button className="btn-primary" onClick={() => navigate("Submit Request")}>
                  {L.start} <ArrowRight size={19} />
                </button>
                <button className="btn-outline" onClick={() => navigate("About")}>{L.learn}</button>
              </div>
            </div>
          </section>

          <section className="support-section">
            <div className="support-main">
              <h2>{L.help}</h2>
              <div className="support-grid">
                {supportCategories.map((category, index) => {
                  const Icon = category.icon;
                  const [title, description] = L.cards[index];
                  return (
                    <button className="support-card" key={category.title} onClick={() => selectCategory(category)}>
                      <div className={`support-icon ${category.color}`}><Icon size={30} /></div>
                      <div className="support-text">
                        <h3>{title}</h3>
                        <p>{description}</p>
                        {category.sensitive && <span className="human-only-tag">{L.humanOnly}</span>}
                      </div>
                      <ArrowRight size={22} />
                    </button>
                  );
                })}
              </div>
            </div>

            <ChatPanel language={language} onRequestSaved={onSaved} />
          </section>
        </>
      )}

      {activePage === "Submit Request" && (
        <section className="page-content">
          <SubmitRequestForm onSaved={onSaved} />
        </section>
      )}

      {activePage === "Human Support" && (
        <section className="page-content">
          <div className="human-support">
            <ShieldAlert size={42} />
            <h1>This one's for people</h1>
            <p>
              {sensitiveTopic === "misconduct"
                ? "Harassment, discrimination and misconduct reports are handled by trained NUST staff, not by the assistant."
                : "Counselling and wellbeing support comes from trained people, not the assistant."}
            </p>
            <p>Reach out to NUST Student Services or Student Counselling through the official channels. If you're in danger right now, call the police on 10111.</p>
            <p>You don't have to explain anything to MoralMate first, and nothing here gets saved.</p>
            <strong>This prototype doesn't send or forward anything.</strong>
          </div>
        </section>
      )}

      {activePage === "My Requests" && <MyRequests onNavigate={navigate} refreshKey={refreshKey} />}

      {activePage === "Staff Review" && <StaffReview />}

      {activePage === "About" && (
        <section className="page-content">
          <h1>About MoralMate</h1>
          <p>
            MoralMate is a student project for the Human-Centred AI course at NUST. It sorts student support
            requests, explains itself, and leaves the important calls to people.
          </p>
          <div className="about-grid">
            <div className="info-box">
              <h3>People stay in charge</h3>
              <p>Safety, wellbeing and misconduct stuff never gets handled by the assistant. It just shows you who to talk to, and once a chat goes there it stops replying on its own.</p>
            </div>
            <div className="info-box">
              <h3>Two kinds of checks</h3>
              <p>Extension requests get checked by a set of rules and by a model that learned from past examples. If they don't agree, it goes to a lecturer.</p>
            </div>
            <div className="info-box">
              <h3>It tells you why</h3>
              <p>Every reply has a "Why this answer?" button so you can see what it picked up and why.</p>
            </div>
            <div className="info-box">
              <h3>You can push back</h3>
              <p>Saved requests keep a record of what happened. You can contest any result, and only a lecturer (by name) can approve or decline.</p>
            </div>
          </div>
        </section>
      )}

      <footer className="footer">
        <div>
          <strong>NUST</strong>
          <span>Namibia University of Science and Technology</span>
        </div>
        <div>
          <strong>MoralMate: Student Support Portal</strong>
          <span>A Human-Centred AI Student Project</span>
        </div>
      </footer>
    </div>
  );
}
