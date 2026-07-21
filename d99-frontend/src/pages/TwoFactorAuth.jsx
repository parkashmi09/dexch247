import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { verify2FAThunk } from "../features/user/userSlice.js";
import { telegram2faService } from "../apiservices/telegram2faService.js";

const LOGO = "/assets/brand/logo.png";

export default function TwoFactorAuth() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((s) => s.user);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (location.state?.userId) {
      setUserId(location.state.userId);
    } else {
      navigate("/login", { replace: true });
    }
  }, [location, navigate]);

  const verifyOtp = async (code) => {
    if (code.length !== 6) return;
    try {
      await dispatch(verify2FAThunk({ userId, otp: code })).unwrap();
      toast.success("Authentication Verified!");
      sessionStorage.setItem("showLoginPopup", "true");
      localStorage.setItem("showWelcomeModal", "true");
      setTimeout(() => navigate("/home", { replace: true }), 500);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Verification failed");
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    }
  };

  const handleChange = (el, idx) => {
    if (isNaN(el.value)) return;
    const next = otp.map((d, i) => (i === idx ? el.value : d));
    setOtp(next);
    if (el.value && idx < 5) inputRefs.current[idx + 1]?.focus();
    if (next.every((v) => v !== "")) verifyOtp(next.join(""));
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0)
      inputRefs.current[idx - 1]?.focus();
  };

  const handleResend = async () => {
    try {
      await telegram2faService.resendOTP(userId);
      toast.success("Code resent successfully!");
    } catch {
      toast.error("Failed to resend code.");
    }
  };

  return (
    <div className="wrapper">
      <div className="login-page">
        <div className="login-box login-auth-box">
          <div className="logo-login">
            <img src={LOGO} alt="Logo" />
          </div>

          <div className="login-form mt-4 login-auth">
            <h4 className="text-center login-title">
              Security Code Verification Using Telegram App
            </h4>
            <p>
              Enter 6-digit code from your telegram bot
              <a className="ms-2 pointer" onClick={handleResend}>
                Resend Code
              </a>
            </p>

            <div style={{ display: "flex" }}>
              {otp.map((val, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  <input
                    ref={(el) => (inputRefs.current[i] = el)}
                    aria-label={i === 0 ? "Please enter verification code. Digit 1" : `Digit ${i + 1}`}
                    autoComplete="off"
                    type="tel"
                    maxLength="1"
                    value={val}
                    style={{ width: "1em", textAlign: "center" }}
                    onChange={(e) => handleChange(e.target, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    onFocus={(e) => e.target.select()}
                    disabled={loading}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
