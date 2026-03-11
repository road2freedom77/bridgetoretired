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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Sans+3:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #f7f4ef;
          font-family: 'Source Sans 3', sans-serif;
        }

        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background:
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(180, 150, 80, 0.08) 0%, transparent 70%),
            #f7f4ef;
        }

        .card {
          background: #ffffff;
          border: 1px solid #e8e2d9;
          border-radius: 2px;
          padding: 3rem 3.5rem;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 4px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
        }

        .wordmark {
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          letter-spacing: 0.04em;
          color: #1a1a1a;
          margin-bottom: 2.5rem;
        }

        .wordmark span {
          color: #b8922a;
        }

        .rule {
          height: 1px;
          background: linear-gradient(to right, #d4af6a 0%, #e8e2d9 50%);
          margin-bottom: 2.5rem;
          opacity: 0.6;
        }

        .heading {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.2;
          margin-bottom: 0.75rem;
          letter-spacing: -0.01em;
        }

        .subtext {
          font-size: 0.9rem;
          color: #888;
          line-height: 1.6;
          font-weight: 300;
          margin-bottom: 2rem;
        }

        .label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #555;
          margin-bottom: 0.5rem;
        }

        .input {
          width: 100%;
          padding: 0.8rem 1rem;
          border: 1px solid #ddd6cc;
          border-radius: 2px;
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.95rem;
          color: #1a1a1a;
          background: #faf8f5;
          outline: none;
          transition: border-color 0.2s;
          margin-bottom: 1rem;
        }

        .input:focus {
          border-color: #b8922a;
          background: #fff;
        }

        .input::placeholder {
          color: #bbb;
        }

        .btn {
          width: 100%;
          padding: 0.85rem 1rem;
          background: #1a1a1a;
          color: #f7f4ef;
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: none;
          border-radius: 2px;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }

        .btn:hover:not(:disabled) {
          background: #333;
        }

        .btn:active:not(:disabled) {
          transform: translateY(1px);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-msg {
          font-size: 0.82rem;
          color: #c0392b;
          margin-bottom: 0.75rem;
        }

        .success-wrap {
          text-align: center;
          padding: 1rem 0;
        }

        .success-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          display: block;
        }

        .success-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          color: #1a1a1a;
          margin-bottom: 0.6rem;
        }

        .success-body {
          font-size: 0.88rem;
          color: #888;
          line-height: 1.7;
          font-weight: 300;
        }

        .back-link {
          display: inline-block;
          margin-top: 1.5rem;
          font-size: 0.8rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #b8922a;
          text-decoration: none;
          border-bottom: 1px solid rgba(184,146,42,0.3);
          transition: border-color 0.2s;
        }

        .back-link:hover {
          border-color: #b8922a;
        }

        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(247,244,239,0.3);
          border-top-color: #f7f4ef;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 6px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .card { padding: 2rem 1.5rem; }
          .heading { font-size: 1.4rem; }
        }
      `}</style>

      <div className="page">
        <div className="card">
          <div className="wordmark">
            Bridge<span>To</span>Retired
          </div>
          <div className="rule" />

          {status === "success" ? (
            <div className="success-wrap">
              <span className="success-icon">✓</span>
              <h2 className="success-title">You've been unsubscribed.</h2>
              <p className="success-body">
                You won't receive any more emails from BridgeToRetired.<br />
                We're sorry to see you go.
              </p>
              <a href="/" className="back-link">← Back to site</a>
            </div>
          ) : (
            <>
              <h1 className="heading">Unsubscribe</h1>
              <p className="subtext">
                Enter your email address and we'll remove you from our list immediately.
              </p>

              <label className="label" htmlFor="email">Email address</label>
              <input
                id="email"
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setEmail(e.target.value);
                  setErrorMsg("");
                  if (status === "error") setStatus("idle");
                }}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleUnsubscribe()}
                disabled={status === "loading"}
              />

              {errorMsg && <p className="error-msg">{errorMsg}</p>}

              <button
                className="btn"
                onClick={handleUnsubscribe}
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <><span className="spinner" />Processing…</>
                ) : (
                  "Unsubscribe"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}