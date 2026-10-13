import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AntigravityBackground from "../components/AntigravityBackground";
import unifyLogo from "../assets/unify official logo.png";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function EmailActionPage({ kind }) {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const token = searchParams.get("token");
  const isVerify = kind === "verify";

  useEffect(() => {
    if (!isVerify || !token) return undefined;
    let active = true;
    fetch(`${apiUrl}/api/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        if (active) {
          setStatus("success");
          setMessage(result.message);
        }
      })
      .catch((error) => {
        if (active) {
          setStatus("error");
          setMessage(error.message || "This verification link is invalid or has expired.");
        }
      });
    return () => { active = false; };
  }, [isVerify, token]);

  const submit = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const password = form.get("password");
    const confirmPassword = form.get("confirmPassword");
    if (!isVerify && token && password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }
    const endpoint = isVerify ? "resend-verification" : token ? "reset-password" : "forgot-password";
    const body = isVerify ? { email: form.get("email") } : token ? { token, password } : { email: form.get("email") };
    setStatus("loading");
    try {
      const response = await fetch(`${apiUrl}/api/auth/${endpoint}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to continue.");
      setStatus("success");
      setMessage(result.message);
      formElement.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Unable to continue. Please try again.");
    }
  };

  const title = isVerify ? "Verify your email" : token ? "Choose a new password" : "Reset your password";
  const description = isVerify
    ? token ? "Confirming your email address…" : "Enter your email to request another verification link."
    : token ? "Enter a new password for your Unify account." : "Enter your email and we will send a reset link if an account exists.";

  return <main className="login-page"><section className="login-page__form-panel"><div className="login-form">
    <img className="login-form__logo" src={unifyLogo} alt="Unify" />
    <div className="login-form__intro"><h1>{title}</h1><p>{description}</p></div>
    {isVerify && token && !status && <p className="login-form__notice" role="status">Verifying your email…</p>}
    {(!isVerify || !token) && <form className="login-form__fields" onSubmit={submit}>
      {!token && <label>Email<input type="email" name="email" autoComplete="email" required /></label>}
      {!isVerify && token && <><label>New password<input type="password" name="password" autoComplete="new-password" minLength="8" required /></label><label>Confirm password<input type="password" name="confirmPassword" autoComplete="new-password" minLength="8" required /></label></>}
      <button className="login-form__continue" type="submit" disabled={status === "loading"}>{status === "loading" ? "Please wait..." : isVerify ? "Resend verification email" : token ? "Reset password" : "Send reset link"}</button>
    </form>}
    {message && <p className={status === "error" ? "login-form__error" : "login-form__notice"} role={status === "error" ? "alert" : "status"}>{message}</p>}
    <p className="login-form__notice"><Link to="/login">Back to sign in</Link></p>
  </div></section><AntigravityBackground /></main>;
}
