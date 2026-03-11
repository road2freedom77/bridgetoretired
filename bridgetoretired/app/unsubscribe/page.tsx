"use client";

import React, { useState, ChangeEvent, KeyboardEvent } from "react";

export default function UnsubscribePage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleUnsubscribe = async () => {
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div
        style={{
          background: "#0D1420",
          border: "1px solid rgba(232,184,75,0.15)",
          borderRadius: "8px",
          padding: "3rem",
          width: "100%",
          maxWidth: "440px",
        }}
      >
        {/* Wordmark */}
        <div
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontSize: "1rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
            marginBottom: "2rem",
            color: "#fff",
          }}
        >
          Bridge<span style={{ color: "#E8B84B" }}>To</span>Retired
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "rgba(232,184,75,0.15)",
            marginBottom: "2rem",
          }}
        />

        {status === "success" ? (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "rgba(232,184,75,0.1)",
                border: "1px solid rgba(232,184,75,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                color: "#E8B84B",
                margin: "0 auto 1.5rem",
              }}
            >
              ✓
            </div>
            <h2
              style={{
                fontFamily: "var(--font-lora), serif",
                fontSize: "1.4rem",
                color: "#fff",
                marginBottom: "0.75rem",
              }}
            >
              You've been unsubscribed.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.4)",
                lineHeight: 1.7,
              }}
            >
              You won't receive any more emails from BridgeToRetired.
              <br />
              We're sorry to see you go.
            </p>
            <a
              href="/"
              style={{
                display: "inline-block",
                marginTop: "1.5rem",
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                color: "#E8B84B",
                textDecoration: "none",
                borderBottom: "1px solid rgba(232,184,75,0.3)",
              }}
            >
              ← Back to site
            </a>
          </div>
        ) : (
          <>
            <h1
              style={{
                fontFamily: "var(--font-lora), serif",
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "0.6rem",
                lineHeight: 1.2,
              }}
            >
              Unsubscribe
            </h1>
            <p
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.4)",
                lineHeight: 1.7,
                marginBottom: "2rem",
              }}
            >
              Enter your email and we'll remove you from our list immediately.
            </p>

            <label
              htmlFor="email"
              style={{
                display: "block",
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
                marginBottom: "0.5rem",
              }}
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                setErrorMsg("");
                if (status === "error") setStatus("idle");
              }}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                e.key === "Enter" && handleUnsubscribe()
              }
              disabled={status === "loading"}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "#141C28",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.85rem",
                color: "#fff",
                outline: "none",
                marginBottom: errorMsg ? "0.5rem" : "1rem",
                opacity: status === "loading" ? 0.5 : 1,
              }}
            />

            {errorMsg && (
              <p
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.75rem",
                  color: "#F87171",
                  marginBottom: "0.75rem",
                }}
              >
                {errorMsg}
              </p>
            )}

            <button
              onClick={handleUnsubscribe}
              disabled={status === "loading"}
              style={{
                width: "100%",
                padding: "0.85rem",
                background: "#E8B84B",
                color: "#0D1420",
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                border: "none",
                borderRadius: "6px",
                cursor: status === "loading" ? "not-allowed" : "pointer",
                opacity: status === "loading" ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {status === "loading" ? "Processing…" : "Unsubscribe"}
            </button>
          </>
        )}
      </div>
    </div>
  );
} 