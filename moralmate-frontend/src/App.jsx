

import SubmitRequestForm from "./components/SubmitRequestForm";
import { useState } from "react";
import {
  GraduationCap,
  ClipboardList,
  HeartPulse,
  ShieldAlert,
  Send,
  ArrowRight,
  Bell,
  UserCircle,
  Bot,
  Menu,
  X
} from "lucide-react";
import "./App.css";

const supportCategories = [
  {
    title: "Academic Support",
    description: "Lectures, assessments, extensions and study guidance",
    icon: GraduationCap,
    color: "navy"
  },
  {
    title: "Administrative Support",
    description: "Registration, records, fees and student services",
    icon: ClipboardList,
    color: "red"
  },
  {
    title: "Wellbeing Support",
    description: "Counselling, wellbeing and personal support",
    icon: HeartPulse,
    color: "gold"
  },
  {
    title: "Report a Concern",
    description: "Harassment, misconduct or safety-related concerns",
    icon: ShieldAlert,
    color: "navy"
  }
];

const sensitiveCategories = [
  "Wellbeing Support",
  "Report a Concern"
];

export default function App() {
  const [requests, setRequests] = useState(["Home"]);
  const [activePage, setActivePage] = useState("Home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm MoralMate, your NUST student support assistant. How can I help you today?"
    }
  ]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);



  function selectCategory(category) {
    setSelectedCategory(category);

    if (sensitiveCategories.includes(category)) {
      setActivePage("Human Support");
    } else {
      setActivePage("Submit Request");
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    const text = message.trim();
    if (!text || isLoading) return;

    if (text.length > 2000) {
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "Please keep your message within 2,000 characters."
      }]);
      return;
    }

    setMessages(prev => [...prev, { role: "user", text }]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Request failed");
      }

      if (data.escalate) {
        setMessages(prev => [...prev, {
          role: "assistant",
          text: "This request requires human review. MoralMate cannot make an automated decision for this category. Please contact the appropriate university support office through official channels. This prototype has NOT forwarded your message."
        }]);
        return;
      }

      setMessages(prev => [...prev, {
        role: "assistant",
        text: `${data.response || "No response available."}\n\nCategory: ${data.category || "unknown"}\nReason: ${data.explanation || "Not provided"}\nEthical principles: ${(data.principles || []).join(", ") || "Not specified"}`
      }]);
    } catch (error) {
      console.error("MoralMate API error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "Unable to connect to MoralMate. Please check that the backend is running on port 4000."
      }]);
    } finally {
      setIsLoading(false);
    }
  }



function saveRequest(request) {
  if (
    !request ||
    typeof request.description !== "string" ||
    !request.description.trim() ||
    !request.id
  ) {
    console.warn("Incomplete test request was not saved:", request);
    return;
  }

  const safeRequest = {
    ...request,
    category: request.category || "general",
    explanation: request.explanation || "No explanation provided",
    principles: Array.isArray(request.principles)
      ? request.principles
      : [],
    status: request.status || "Pending",
    createdAt: request.createdAt || new Date().toLocaleString(),
    reviewRequested: Boolean(request.reviewRequested)
  };

  setRequests(prev => [safeRequest, ...prev]);
  setActivePage("My Requests");
}


function requestReview(id) {
  setRequests(prev =>
    prev.map(request =>
      request.id === id
        ? {
            ...request,
            reviewRequested: true,
            status: "Review Requested"
          }
        : request
    )
  );
}


  function navigate(page) {
    setActivePage(page);
    setMenuOpen(false);
  }

  return (
    <div className="app">
      <header className="navbar">
        <div className="university-brand">
          <img
            src="/nust-logo.png"
            alt="NUST logo"
            className="nust-logo"
          />
          <div className="university-name">
            <strong>NAMIBIA UNIVERSITY</strong>
            <span>OF SCIENCE AND TECHNOLOGY</span>
          </div>
        </div>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          {["Home", "Submit Request", "My Requests", "About"].map(page => (
            <button
              key={page}
              className={activePage === page ? "nav-active" : ""}
              onClick={() => navigate(page)}
            >
              {page}
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <Bell size={22} />
          <UserCircle size={27} />
          <span>Student</span>
        </div>

        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {activePage === "Home" && (
        <>
          <section className="hero">
            <div className="hero-content">
              <h1>
                Moral<span>Mate</span>
              </h1>

              <h2>AI-Powered Student Support</h2>

              <p>
                Get the right support, faster. MoralMate helps you
                with academic and administrative enquiries and
                connects you to appropriate human support services.
              </p>

              <div className="hero-buttons">
                <button
                  className="btn-primary"
                  onClick={() => navigate("Submit Request")}
                >
                  Start a Support Request
                  <ArrowRight size={19} />
                </button>

                <button
                  className="btn-outline"
                  onClick={() => navigate("About")}
                >
                  Learn More
                </button>
              </div>
            </div>
          </section>

          <section className="support-section">
            <div className="support-main">
              <h2>How can we help you today?</h2>

              <div className="support-grid">
                {supportCategories.map(category => {
                  const Icon = category.icon;

                  return (
                    <button
                      className="support-card"
                      key={category.title}
                      onClick={() => selectCategory(category.title)}
                    >
                      <div className={`support-icon ${category.color}`}>
                        <Icon size={30} />
                      </div>

                      <div className="support-text">
                        <h3>{category.title}</h3>
                        <p>{category.description}</p>
                      </div>

                      <ArrowRight size={22} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="assistant-panel">
              <div className="assistant-header">
                <Bot size={27} />
                <div>
                  <h3>MoralMate Assistant</h3>
                  <span>Prototype assistant</span>
                </div>
              </div>

              <div className="chat-messages">
                {messages.map((item, index) => (
                  <div
                    key={index}
                    className={`chat-bubble ${item.role}`}
                  >
                    <span style={{ whiteSpace: "pre-line" }}>{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="suggestions">
                {[
                  "I need academic help",
                  "I have an admin question"
                ].map(text => (
                  <button
                    key={text}
                    onClick={() => setMessage(text)}
                  >
                    {text}
                  </button>
                ))}
              </div>

              <form className="chat-form" onSubmit={sendMessage}>
                <input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={isLoading ? "MoralMate is responding..." : "Type your message..."}
                  maxLength={2000}
                />
                <button type="submit" aria-label="Send message" disabled={isLoading}>
                  <Send size={19} />
                </button>
              </form>
            </div>
          </section>
        </>
      )}

      {activePage === "Submit Request" && (
            <section className="page-content">
          <SubmitRequestForm onSaveRequest={saveRequest} />
        </section>
      )}

      {activePage === "Human Support" && (
        <section className="page-content">
          <div className="human-support">
            <ShieldAlert size={42} />
            <h1>Human Support Required</h1>
            <p>
              This category is handled by qualified human
              support personnel, not the automated assistant.
            </p>
            <p>
              Please contact the appropriate NUST support office
              through official university channels.
            </p>
            <strong>
              This prototype does not yet submit or forward
              sensitive requests.
            </strong>
          </div>
        </section>
      )}

      
{activePage === "My Requests" && (
  <section className="page-content">
    <h1>My Support Requests</h1>
    <p>
      Fictional demonstration requests saved during this browser session.
      These records are not submitted to NUST.
    </p>

    {requests.length === 0 ? (
      <div className="info-box">
        <p>No test requests saved yet.</p>
        <button
          className="btn-primary"
          onClick={() => navigate("Submit Request")}
        >
          Create a Test Request
        </button>
      </div>
    ) : (
      <div className="requests-list">
        {requests
          .filter(request =>
    request &&
    typeof request.id === "string" &&
    request.id.trim() !== "" &&
    typeof request.description === "string" &&
    request.description.trim() !== ""
  )
        .map(request => (
          <article className="request-item" key={request.id}>
            <div className="request-item-header">
              <h3>{request.id}</h3>
              <span className="request-status">{request.status}</span>
            </div>

            <p><strong>Category:</strong> {request.category}</p>
            <p><strong>Created:</strong> {request.createdAt}</p>
            <p><strong>Description:</strong> {request.description}</p>
            <p><strong>Explanation:</strong> {request.explanation}</p>
            <p>
              <strong>Ethical principles:</strong>{" "}
              {Array.isArray(request.principles) && request.principles.length > 0
  ? request.principles.join(", ")
  : "Not specified"}
            </p>

            {!request.reviewRequested && (
              <button
                className="review-button"
                onClick={() => requestReview(request.id)}
              >
                Request Human Review
              </button>
            )}

            {request.reviewRequested && (
              <p className="review-notice">
                Human review requested in this prototype.
                No notification has been sent to staff.
              </p>
            )}
          </article>
        ))}
      </div>
    )}
  </section>
)}


      {activePage === "About" && (
        <section className="page-content">
          <h1>About MoralMate</h1>
          <p>
            MoralMate is a Human-Centred Artificial Intelligence
            student project designed to explore explainable,
            responsible support-request triage at NUST.
          </p>
          <div className="info-box">
            <h3>Human-Centred AI</h3>
            <p>
              MoralMate is designed to keep people in control
              of sensitive decisions while using AI to support
              lower-risk administrative processes.
            </p>
          </div>
        </section>
      )}

      <footer className="footer">
        <div>
          <strong>NUST</strong>
          <span>Namibia University of Science and Technology</span>
        </div>
        <div>
          <strong>MoralMate — Student Support Portal</strong>
          <span>A Human-Centred AI Student Project</span>
        </div>
      </footer>
    </div>
  );
}
