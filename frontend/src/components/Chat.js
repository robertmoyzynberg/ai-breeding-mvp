import React, { useState, useEffect, useRef } from "react";
import { getChatHistory, sendChatMessage } from "../api/backend";
import "./Chat.css";

function Chat({ agentId, agent }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (agentId) {
      loadChatHistory();
    }
  }, [agentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      console.log("[Chat] Loading chat history for agent:", agentId);
      const history = await getChatHistory(agentId);
      console.log("[Chat] Chat history loaded:", history);
      setMessages(history || []);
    } catch (error) {
      console.error("[Chat] Error loading chat history:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setSending(true);
    setTyping(true);

    // Add user message immediately
    const newUserMessage = {
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      console.log("[Chat] Sending message:", userMessage);
      const response = await sendChatMessage(agentId, userMessage);
      console.log("[Chat] Response received:", response);

      // Simulate typing delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Add agent response
      const agentMessage = {
        role: "assistant",
        content: response.content,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error("[Chat] Error sending message:", error);
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        created_at: new Date().toISOString(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
      setTyping(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!agentId) {
    return (
      <div className="chat-container empty">
        <p>Select an agent to start chatting!</p>
      </div>
    );
  }

  return (
    <div className="chat-container" ref={chatContainerRef}>
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-agent-info">
          <div
            className="chat-avatar"
            style={{
              background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
            }}
          >
            {agent?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="chat-agent-details">
            <h3>{agent?.name || "Agent"}</h3>
            {agent?.traits && (
              <div className="chat-agent-stats">
                <span>💪 {agent.traits.strength || 0}</span>
                <span>🏃 {agent.traits.speed || 0}</span>
                <span>🧠 {agent.traits.intelligence || 0}</span>
              </div>
            )}
          </div>
        </div>
        {typing && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading">Loading chat history...</div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            <p>Start a conversation with {agent?.name || "this agent"}!</p>
            <p className="chat-hint">Ask about their personality, stats, or just say hello!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${message.role === "user" ? "user" : "agent"} ${message.error ? "error" : ""}`}
            >
              <div className="message-bubble">
                <div className="message-content">{message.content}</div>
                <div className="message-time">{formatTime(message.created_at)}</div>
              </div>
            </div>
          ))
        )}
        {typing && (
          <div className="chat-message agent">
            <div className="message-bubble typing">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form className="chat-input-form" onSubmit={handleSend}>
        <input
          type="text"
          className="chat-input"
          placeholder={`Message ${agent?.name || "agent"}...`}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          className="chat-send-button"
          disabled={!inputMessage.trim() || sending}
        >
          {sending ? "..." : "➤"}
        </button>
      </form>
    </div>
  );
}

export default Chat;

