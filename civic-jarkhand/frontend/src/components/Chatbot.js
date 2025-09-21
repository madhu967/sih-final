// src/components/Chatbot.js
import React, { useState, useEffect, useRef } from "react";
import { FaRobot, FaTimes } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./Chatbot.css";

// Gemini API Key rotation
const GEMINI_KEYS = (process.env.REACT_APP_GEMINI_API_KEY || "").split(",");
let keyIndex = 0;
const getNextKey = () => {
  const key = GEMINI_KEYS[keyIndex];
  keyIndex = (keyIndex + 1) % GEMINI_KEYS.length;
  return key;
};
const createAIInstance = () => {
  const key = getNextKey();
  console.log("Using Gemini API Key:", key.slice(0, 6) + "...");
  return new GoogleGenerativeAI(key);
};

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

   const WEBSITE_CONTEXT = `
You are a helpful assistant for the CivicTracker Citizen Dashboard website.
You should only answer questions related to CivicTracker.  

Website Features:
- Citizens can register and log in to their account.
- Users can report civic issues using the "Report" button.
  - They can enter a title and description.
  - Optionally, they can upload an image.
  - They select a category: Potholes, Trash, Streetlight, Water Leakage, Other.
- Citizens can view the status of their reports in the Dashboard.
- The Leaderboard shows points earned for reporting issues.
- Users can view and edit their Profile details.
- Contact info for support: phone 999-999-9999, email citizen.support@example.com.
- Admins and Workers have separate dashboards for managing issues.

Rules for answering questions:
1. Answer clearly and concisely.
2. If the question is a greeting ("hi", "hello"), reply with a friendly greeting and ask how you can help.
3. If the question is related to website usage, explain step by step.
   Examples:
   - "How can I login as a citizen?" → "Go to /login, enter your email and password, then click 'Login'."
   - "How do I report a pothole?" → "Click 'Report', fill the title, description, optionally upload an image, select 'Potholes' as the category, then submit."
   - "How can I check my report status?" → "Go to Dashboard → My Reports, and you can see the status of each report."
   - "How do I update my profile?" → "Go to Profile, edit your details, and save."
4. If the question is unrelated to CivicTracker, respond: "I'm sorry, I can only answer questions related to CivicTracker."
`;


    try {
      const ai = createAIInstance();
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

      const conversationText = newMessages
        .map((m) => (m.role === "user" ? "User: " : "Assistant: ") + m.content)
        .join("\n");

      const prompt = `${WEBSITE_CONTEXT}\n\nConversation so far:\n${conversationText}\nAssistant:`;

      const result = await model.generateContent([{ text: prompt }]);
      const reply = result.response.text?.() || "Sorry, I couldn't generate a response.";

      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (error) {
      console.error("Gemini API error:", error);
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen ? (
        <div className="chatbot-window">
          <div className="chatbot-header">
            Citizen Bot
            <FaTimes className="chatbot-close" onClick={() => setIsOpen(false)} />
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chatbot-message ${msg.role === "user" ? "user" : "assistant"}`}
              >
                {msg.content}
              </div>
            ))}
            {loading && <div className="chatbot-typing">Bot is typing...</div>}
            <div ref={messagesEndRef}></div>
          </div>

          <div className="chatbot-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask a question..."
              className="chatbot-input"
            />
            <button onClick={sendMessage} className="chatbot-send-btn">
              Send
            </button>
          </div>
        </div>
      ) : (
        <button className="chatbot-toggle-btn" onClick={() => setIsOpen(true)}>
          <FaRobot />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
