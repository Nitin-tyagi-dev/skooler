import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { io } from "socket.io-client";
import { Send, Search, MessageSquare, GraduationCap, ShieldAlert } from "lucide-react";
import Button from "../components/UI/Button";

const Messages = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch all messaging contacts
  const fetchContacts = async () => {
    try {
      const res = await api.messages.getContacts();
      setContacts(res);
    } catch (err) {
      console.error("Failed to load contacts:", err);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Fetch message history for selected contact
  const fetchChat = async (contactId) => {
    setLoadingMessages(true);
    try {
      const res = await api.messages.getChat(contactId);
      setMessages(res);
      // Mark read locally
      setContacts(prev =>
        prev.map(c => c._id === contactId ? { ...c, unreadCount: 0 } : c)
      );
    } catch (err) {
      console.error("Failed to load chat history:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const activeContactRef = useRef(null);

  useEffect(() => {
    activeContactRef.current = activeContact;
  }, [activeContact]);

  // Establish socket connection and subscribe to real-time events on mount
  useEffect(() => {
    fetchContacts();

    const socket = io("http://localhost:5000", {
      auth: {
        token: localStorage.getItem("skooler_token"),
      },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to websocket gateway");
    });

    socket.on("new_message", (message) => {
      const currentActive = activeContactRef.current;
      // Append message if it belongs to the active chat
      if (
        currentActive &&
        ((message.sender === user.id && message.receiver === currentActive._id) ||
         (message.sender === currentActive._id && message.receiver === user.id))
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });

        // Mark as read if the incoming message is from the active contact
        if (message.sender === currentActive._id) {
          api.messages.markRead(currentActive._id).catch(console.error);
        }
      }

      // Refresh contact list summaries (last message preview, unread count)
      fetchContacts();
    });

    return () => {
      socket.disconnect();
    };
  }, [user.id]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle contact selection
  const handleSelectContact = (contact) => {
    setActiveContact(contact);
    fetchChat(contact._id);
  };

  // Handle message sending with instant local append for snappy user feedback
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim() || !activeContact) return;

    const messageContent = content.trim();
    setContent(""); // Clear input field instantly

    try {
      const payload = {
        receiverId: activeContact._id,
        content: messageContent,
      };
      const response = await api.messages.send(payload);

      // Append sent message immediately to avoid waiting for WebSocket cycle
      setMessages((prev) => {
        if (prev.some((m) => m._id === response._id)) return prev;
        return [...prev, response];
      });

      // Refresh contacts to update the last message preview
      fetchContacts();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Format timestamp helper
  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateLabel = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Filter contacts by search query
  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - var(--navbar-height) - 64px)" }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: "16px", flexShrink: 0 }}>
        <div>
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">Direct real-time communication between Teachers and School Administrators</p>
        </div>
      </div>

      {/* Main Messaging Box Grid */}
      <div 
        className="card" 
        style={{ 
          display: "flex", 
          flex: 1, 
          padding: 0, 
          overflow: "hidden", 
          height: "100%",
          borderRadius: "var(--radius-sm)",
          backgroundColor: "var(--bg-primary)"
        }}
      >
        {/* Left contacts bar */}
        <div 
          style={{ 
            width: "320px", 
            borderRight: "1px solid var(--border-color)", 
            display: "flex", 
            flexDirection: "column",
            height: "100%"
          }}
        >
          {/* Search container */}
          <div style={{ padding: "16px", borderBottom: "1px solid var(--border-color)" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search contacts..."
                style={{ paddingLeft: "30px", fontSize: "13px", padding: "8px 12px 8px 30px" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Contacts scroll list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loadingContacts ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "24px", color: "var(--text-secondary)", fontSize: "13px" }}>
                Loading contacts...
              </div>
            ) : filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => {
                const isActive = activeContact && activeContact._id === contact._id;
                return (
                  <div
                    key={contact._id}
                    onClick={() => handleSelectContact(contact)}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--border-color)",
                      cursor: "pointer",
                      backgroundColor: isActive ? "var(--bg-secondary)" : "transparent",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      transition: "background-color 0.2s"
                    }}
                    className="contact-item"
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>{contact.name}</span>
                      {contact.unreadCount > 0 && (
                        <span 
                          className="badge badge-black" 
                          style={{ 
                            fontSize: "10px", 
                            padding: "2px 6px", 
                            borderRadius: "10px", 
                            minWidth: "18px", 
                            textAlign: "center" 
                          }}
                        >
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="badge badge-default" style={{ fontSize: "9px", padding: "2px 6px" }}>
                        {contact.role === "school_admin" ? "Admin" : "Teacher"}
                      </span>
                      {contact.lastMessage && (
                        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                          {formatDateLabel(contact.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {contact.lastMessage && (
                      <span 
                        style={{ 
                          fontSize: "12px", 
                          color: contact.unreadCount > 0 ? "var(--text-primary)" : "var(--text-secondary)", 
                          fontWeight: contact.unreadCount > 0 ? "600" : "400",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          marginTop: "2px"
                        }}
                      >
                        {contact.lastMessage.content}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px", textAlign: "center", gap: "10px" }}>
                <MessageSquare size={24} style={{ color: "var(--text-muted)" }} />
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No contacts found</span>
              </div>
            )}
          </div>
        </div>

        {/* Right chat screen */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", backgroundColor: "var(--bg-secondary)" }}>
          {activeContact ? (
            <>
              {/* Active Chat Header */}
              <div 
                style={{ 
                  padding: "16px 24px", 
                  backgroundColor: "var(--bg-primary)", 
                  borderBottom: "1px solid var(--border-color)", 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  flexShrink: 0
                }}
              >
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>{activeContact.name}</h3>
                  <span className="badge badge-default" style={{ fontSize: "9px", padding: "2px 6px", marginTop: "4px" }}>
                    {activeContact.role === "school_admin" ? "Administrator" : "Teacher"}
                  </span>
                </div>
              </div>

              {/* Message History list */}
              <div 
                style={{ 
                  flex: 1, 
                  overflowY: "auto", 
                  padding: "24px", 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "16px" 
                }}
              >
                {loadingMessages ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Loading conversation...</span>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((message) => {
                    const isSentByMe = message.sender === user.id;
                    return (
                      <div 
                        key={message._id} 
                        style={{ 
                          alignSelf: isSentByMe ? "flex-end" : "flex-start",
                          maxWidth: "70%",
                          display: "flex",
                          flexDirection: "column"
                        }}
                      >
                        <div 
                          style={{ 
                            padding: "10px 14px", 
                            borderRadius: isSentByMe ? "12px 12px 0px 12px" : "12px 12px 12px 0px",
                            backgroundColor: isSentByMe ? "var(--primary)" : "var(--bg-primary)",
                            color: isSentByMe ? "var(--bg-primary)" : "var(--text-primary)",
                            border: isSentByMe ? "none" : "1px solid var(--border-color)",
                            fontSize: "14px",
                            wordBreak: "break-word",
                            lineHeight: "1.4",
                            boxShadow: "var(--shadow-sm)"
                          }}
                        >
                          {message.content}
                        </div>
                        <span 
                          style={{ 
                            fontSize: "9px", 
                            color: "var(--text-muted)", 
                            marginTop: "4px", 
                            alignSelf: isSentByMe ? "flex-end" : "flex-start" 
                          }}
                        >
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "10px" }}>
                    <MessageSquare size={32} style={{ color: "var(--text-muted)" }} />
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No messages yet. Say hello!</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Composition Field */}
              <div 
                style={{ 
                  padding: "16px 24px", 
                  backgroundColor: "var(--bg-primary)", 
                  borderTop: "1px solid var(--border-color)",
                  flexShrink: 0
                }}
              >
                <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "12px" }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Write your message to ${activeContact.name}...`}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{ flex: 1, fontSize: "14px" }}
                  />
                  <Button type="submit" disabled={!content.trim()} style={{ padding: "10px 16px" }}>
                    <Send size={14} />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "16px", padding: "24px" }}>
              <div 
                style={{ 
                  width: "64px", 
                  height: "64px", 
                  borderRadius: "50%", 
                  backgroundColor: "var(--bg-primary)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  border: "1px solid var(--border-color)",
                  boxShadow: "var(--shadow-sm)"
                }}
              >
                <MessageSquare size={28} style={{ color: "var(--text-secondary)" }} />
              </div>
              <div style={{ textAlign: "center" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Select a Conversation</h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", maxWidth: "280px" }}>
                  Choose a contact from the list to start messaging in real-time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .contact-item:hover {
          background-color: var(--bg-accent) !important;
        }
      `}</style>
    </div>
  );
};

export default Messages;
