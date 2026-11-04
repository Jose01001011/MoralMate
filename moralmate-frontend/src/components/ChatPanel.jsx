import { useEffect, useRef, useState } from "react";
import { Bot, Send, UserRound, RotateCcw, ChevronDown, ShieldAlert, Phone } from "lucide-react";
import { api, getStudentRef } from "../api";
import { strings } from "../i18n";
import AssessmentCard from "./AssessmentCard";

const GREETING = { role: "assistant", greeting: true, reply: { kind: "info", text: "" } };

export default function ChatPanel({ language, onRequestSaved }) {
  const L = strings(language);
  const [sessionId, setSessionId] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  async function send(text) {
    const clean = (text ?? message).trim();
    if (!clean || isLoading) return;
    setMessages(prev => [...prev, { role: "user", text: clean }]);
    setMessage("");
    setIsLoading(true);
    try {
      const data = await api.agent({ sessionId, message: clean, language, studentRef: getStudentRef() });
      setSessionId(data.sessionId);
      setMessages(prev => [...prev, { role: "assistant", reply: data.reply, llmUsed: data.llmUsed }]);
      if (data.reply.kind === "saved" && onRequestSaved) onRequestSaved(data.reply.requestId);
    } catch (err) {
      console.error("MoralMate API error:", err);
      setMessages(prev => [...prev, { role: "assistant", reply: { kind: "error", text: L.offline } }]);
    } finally {
      setIsLoading(false);
    }
  }

  async function newConversation() {
    if (sessionId) api.resetAgent(sessionId).catch(() => {});
    setSessionId(null);
    setMessages([GREETING]);
  }

  const last = messages[messages.length - 1];
  const locked = last?.reply?.kind === "escalation";

  return (
    <div className="assistant-panel">
      <div className="assistant-header">
        <Bot size={27} />
        <div>
          <h3>{L.assistantTitle}</h3>
          <span>{L.assistantSub}</span>
        </div>
        <div className="assistant-actions">
          <button type="button" className="person-button" onClick={() => send(L.talkToPerson)} title={L.talkToPerson}>
            <UserRound size={16} /> {L.talkToPerson}
          </button>
          <button type="button" className="icon-button" onClick={newConversation} title={L.newChat} aria-label={L.newChat}>
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="chat-messages" aria-live="polite">
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="chat-bubble user"><span>{m.text}</span></div>
          ) : (
            // The greeting is rendered in the current language at display time.
            <AssistantMessage key={i} reply={m.greeting ? { kind: "info", text: L.greeting } : m.reply} L={L} llmUsed={m.llmUsed} />
          )
        )}
        {isLoading && <div className="chat-bubble assistant typing">…</div>}
        <div ref={endRef} />
      </div>

      {!locked && (
        <div className="suggestions">
          {(last?.reply?.options?.length ? last.reply.options : messages.length === 1 ? L.suggestions : []).map(text => (
            <button key={text} type="button" onClick={() => send(text)} disabled={isLoading}>{text}</button>
          ))}
        </div>
      )}
      {locked && (
        <div className="locked-note">
          <ShieldAlert size={16} /> This chat is with people only now.
          <button type="button" onClick={newConversation}>{L.newChat}</button>
        </div>
      )}

      <form className="chat-form" onSubmit={e => { e.preventDefault(); send(); }}>
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={isLoading ? L.responding : L.placeholder}
          maxLength={2000}
          aria-label="Message"
        />
        <button type="submit" aria-label="Send message" disabled={isLoading}>
          <Send size={19} />
        </button>
      </form>
    </div>
  );
}

function AssistantMessage({ reply, L, llmUsed }) {
  const [open, setOpen] = useState(reply.kind === "escalation");
  const hasDetail = reply.explanation || reply.principles?.length;

  return (
    <div className={`chat-bubble assistant kind-${reply.kind}`}>
      <span style={{ whiteSpace: "pre-line" }}>{reply.text}</span>

      {reply.resources?.length > 0 && (
        <div className="resource-list">
          <strong>{L.resources}</strong>
          {reply.resources.map(r => (
            <div key={r.name} className="resource">
              <Phone size={14} />
              <div><b>{r.name}</b>: {r.contact}<small>{r.note}</small></div>
            </div>
          ))}
        </div>
      )}

      {reply.assessment && <AssessmentCard assessment={reply.assessment} compact />}

      {hasDetail && (
        <div className="why">
          <button type="button" className="why-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
            {L.why} <ChevronDown size={14} className={open ? "rot" : ""} />
          </button>
          {open && (
            <div className="why-body">
              {reply.explanation && <p>{reply.explanation}</p>}
              {reply.principles?.length > 0 && <p><b>{L.principles}:</b> {reply.principles.join(", ")}</p>}
              {llmUsed && <p className="llm-tag">A language model helped word this. It can't make decisions.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
