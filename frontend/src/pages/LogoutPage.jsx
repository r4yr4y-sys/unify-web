import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login", { replace: true, state: { signedOut: true } });
  }, [navigate]);

  return (
    <main className="logout-page" aria-live="polite">
      <p>Signing you out…</p>
    </main>
  );
}
