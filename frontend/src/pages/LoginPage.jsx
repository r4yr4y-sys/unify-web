import { useEffect, useRef, useState } from "react";
import { animate, stagger, splitText } from "animejs";
import { useLocation, useNavigate } from "react-router-dom";
import AntigravityBackground from "../components/AntigravityBackground";
import unifyLogo from "../assets/unify official logo.png";

export default function LoginPage() {
  const [mode, setMode] = useState("sign-in");
  const headingRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isSignUp = mode === "sign-up";
  const heading = isSignUp ? "Welcome Aboard" : "Welcome Back";
  const subheading = isSignUp
    ? "Ready to make your life 10x simpler using Unify?"
    : "we missed you";
  const [hasCredentialMismatch, setHasCredentialMismatch] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const element = headingRef.current;
    if (
      !element ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return undefined;

    const text = splitText(element, { chars: true });
    const animation = animate(text.chars, {
      opacity: [0, 1],
      y: [10, 0],
      duration: 520,
      delay: stagger(35),
      ease: "outExpo",
    });

    return () => {
      animation.revert();
      text.revert();
    };
  }, [mode]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    const mismatch = isSignUp && password !== confirmPassword;

    setHasCredentialMismatch(mismatch);
    setErrorMessage(mismatch ? "Passwords do not match." : "");

    if (mismatch) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/${isSignUp ? "signup" : "signin"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to continue.");
      localStorage.setItem("authToken", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(error.message || "Unable to continue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-page__form-panel">
        <div className="login-form">
          <img className="login-form__logo" src={unifyLogo} alt="Unify" />
          <div className="login-form__intro">
            <h1 key={mode} ref={headingRef}>
              {heading}
            </h1>
            <p>{subheading}</p>
          </div>
          {location.state?.signedOut && (
            <p className="login-form__notice" role="status">
              You have been logged out successfully.
            </p>
          )}
          <div className="login-tabs" role="tablist" aria-label="Account type">
            <button
              className={`login-tabs__button ${!isSignUp ? "is-active" : ""}`}
              type="button"
              role="tab"
              aria-selected={!isSignUp}
              onClick={() => { setMode("sign-in"); setErrorMessage(""); setHasCredentialMismatch(false); }}
            >
              Sign In
            </button>
            <button
              className={`login-tabs__button ${isSignUp ? "is-active" : ""}`}
              type="button"
              role="tab"
              aria-selected={isSignUp}
              onClick={() => { setMode("sign-up"); setErrorMessage(""); setHasCredentialMismatch(false); }}
            >
              Sign Up
            </button>
          </div>
          <form className="login-form__fields" onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="text"
                name="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                name="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                placeholder="Enter your password"
                required
                minLength={isSignUp ? 8 : undefined}
              />
            </label>
            {isSignUp && (
              <label>
                Confirm Password
                <input
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                placeholder="Confirm your password"
                required
                />
              </label>
            )}
            <button
              className={`login-form__continue ${hasCredentialMismatch ? "is-error" : ""}`}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Please wait..." : "Continue"}
            </button>
            {errorMessage && <p className="login-form__error" role="alert">{errorMessage}</p>}
          </form>
          <div className="login-form__divider">
            <span>Or Continue With</span>
          </div>
          <div className="login-form__socials">
            <button
              className="login-form__social"
              type="button"
              aria-label="Continue with Google"
            >
              G
            </button>
            <button
              className="login-form__social login-form__social--apple"
              type="button"
              aria-label="Continue with Apple"
            >
              ●
            </button>
            <button
              className="login-form__social login-form__social--facebook"
              type="button"
              aria-label="Continue with Facebook"
            >
              f
            </button>
          </div>
        </div>
      </section>
      <AntigravityBackground />
    </main>
  );
}
