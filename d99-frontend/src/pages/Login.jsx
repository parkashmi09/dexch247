import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { loginThunk, setDemoUser } from "../features/user/userSlice.js";
import { changePassword } from "../apiservices/AuthService.js";
import { useWhitelabel } from "../hooks/useWhitelabel.js";

export default function Login() {
  const { logo: LOGO, apkUrl: APK_URL } = useWhitelabel();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, isAuthenticated } = useSelector((s) => s.user);

  const redirectTo = location.state?.from?.pathname ?? "/home";

  // Only redirect users who were ALREADY logged in when they landed on /login.
  // We capture the auth state once at mount: on a fresh first login the backend
  // still returns a token, so `isAuthenticated` flips to true mid-flow. Reacting
  // to that flip would navigate the user to /home and skip the mandatory
  // change-password screen below (rendered when passwordChanged === false).
  const [wasAuthenticatedOnMount] = useState(isAuthenticated);
  useEffect(() => {
    if (wasAuthenticatedOnMount) navigate(redirectTo, { replace: true });
  }, [wasAuthenticatedOnMount, navigate, redirectTo]);

  // APK download only on Android
  const [showApk, setShowApk] = useState(true);
  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setShowApk(!isIOS);
  }, []);

  // --- Login form state ---
  const [form, setForm] = useState({ username: "", password: "" });
  const [formErrors, setFormErrors] = useState({});

  // --- Password-change state (shown when backend says passwordChanged === false) ---
  const [requirePwdChange, setRequirePwdChange] = useState(false);
  const [pwdChangeToken, setPwdChangeToken] = useState(null);
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwdErrors, setPwdErrors] = useState({});
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  // --- Handlers ---

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onPwdChange = (e) =>
    setPwdForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();

    // Client-side validation
    const errs = {};
    if (!form.username.trim()) errs.username = "Username is required";
    if (!form.password) errs.password = "Password is required";
    setFormErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const data = await dispatch(
        loginThunk({ email: form.username, password: form.password })
      ).unwrap();

      // --- Condition 1: 2FA required ---
      if (data.require2FA) {
        navigate("/authentication/2", { state: { userId: data.userId } });
        return;
      }

      const token = data?.token || data?.accessToken || null;

      // --- Condition 2: Must change password before continuing ---
      if (data && data.passwordChanged === false) {
        toast("You must change your password before continuing.", {
          icon: "ℹ️",
        });
        setRequirePwdChange(true);
        setPwdChangeToken(token);
        return;
      }

      // --- Condition 3: Normal successful login ---
      sessionStorage.setItem("showLoginPopup", "true");
      localStorage.setItem("showWelcomeModal", "true");
      toast.success("Logged in");
      setTimeout(() => navigate("/home", { replace: true }), 400);
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : err?.message || "Login failed"
      );
    }
  };

  const handleDemoLogin = () => {
    dispatch(setDemoUser());
    localStorage.setItem("showWelcomeModal", "true");
    toast.success("Logged in as Demo");
    setTimeout(() => navigate("/home", { replace: true }), 300);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    const errs = {};
    if (!pwdForm.currentPassword)
      errs.currentPassword = "Current password required";
    if (!pwdForm.newPassword) errs.newPassword = "New password required";
    if (!pwdForm.confirmPassword)
      errs.confirmPassword = "Please confirm new password";
    if (
      pwdForm.newPassword &&
      pwdForm.confirmPassword &&
      pwdForm.newPassword !== pwdForm.confirmPassword
    )
      errs.confirmPassword = "Passwords do not match";
    setPwdErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Fix the errors before submitting.");
      return;
    }

    setPwdSubmitting(true);
    try {
      // Temporarily set token so axiosClient attaches it
      if (pwdChangeToken) localStorage.setItem("token", pwdChangeToken);

      const result = await changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });

      // If server returns a new token after password change, use it
      if (result?.token) localStorage.setItem("token", result.token);

      toast.success("Password changed successfully!");
      localStorage.setItem("showWelcomeModal", "true");
      setTimeout(
        () =>
          navigate("/home", {
            replace: true,
            state: { showFirstLoginRules: true },
          }),
        400
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to change password"
      );
    } finally {
      setPwdSubmitting(false);
    }
  };

  // --- Render: Password change form ---
  if (requirePwdChange) {
    return (
      <div className="wrapper">
        <div className="login-page">
          <div className="login-box">
            <div className="logo-login">
              <a href="/">
                <img src={LOGO} alt="Logo" />
              </a>
            </div>
            <div className="login-form mt-4">
              <h4 className="text-center login-title">
                Login <i className="fas fa-hand-point-down"></i>
              </h4>
              <form className="login-chage-pass" onSubmit={handlePasswordChange}>
                <div className="row row10">
                  <div className="mb-3 position-relative">
                    <label className="form-label text-start w-100">Current Password:</label>
                    <input
                      name="currentPassword"
                      type="password"
                      className="form-control"
                      placeholder="Enter Current password"
                      value={pwdForm.currentPassword}
                      onChange={onPwdChange}
                      disabled={pwdSubmitting}
                      autoComplete="current-password"
                    />
                    {pwdErrors.currentPassword && (
                      <small className="text-danger">{pwdErrors.currentPassword}</small>
                    )}
                  </div>
                </div>
                <div className="row row10">
                  <div className="mb-3 position-relative">
                    <label className="form-label text-start w-100">New Password:</label>
                    <input
                      name="newPassword"
                      type="password"
                      className="form-control"
                      placeholder="Enter New Password"
                      value={pwdForm.newPassword}
                      onChange={onPwdChange}
                      disabled={pwdSubmitting}
                      autoComplete="new-password"
                    />
                    {pwdErrors.newPassword && (
                      <small className="text-danger">{pwdErrors.newPassword}</small>
                    )}
                  </div>
                </div>
                <div className="row row10">
                  <div className="mb-4 position-relative">
                    <label className="form-label text-start w-100">Confirm Password:</label>
                    <input
                      name="confirmPassword"
                      type="password"
                      className="form-control"
                      placeholder="Confirm New Password"
                      value={pwdForm.confirmPassword}
                      onChange={onPwdChange}
                      disabled={pwdSubmitting}
                      autoComplete="new-password"
                    />
                    {pwdErrors.confirmPassword && (
                      <small className="text-danger">{pwdErrors.confirmPassword}</small>
                    )}
                  </div>
                </div>
                <div className="row row10">
                  <div className="mb-3">
                    <button
                      type="submit"
                      className="btn btn-primary btn-block w-100"
                      disabled={pwdSubmitting}
                    >
                      {pwdSubmitting ? "Updating..." : "Change Password"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Render: Login form ---
  return (
    <div className="wrapper">
      <div className="login-page">
        <div className="login-box">
          <div className="logo-login">
            <a href="/">
              <img src={LOGO} alt="Logo" />
            </a>
          </div>
          <div className="login-form mt-4">
            <h4 className="text-center login-title">
              Login <i className="fas fa-hand-point-down"></i>
            </h4>
            <form onSubmit={handleLogin}>
              <div className="mb-4 input-group position-relative">
                <input
                  name="username"
                  type="text"
                  className="form-control"
                  placeholder="Username"
                  value={form.username}
                  onChange={onChange}
                  autoComplete="username"
                  disabled={loading}
                />
                <span className="input-group-text">
                  <i className="fas fa-user"></i>
                </span>
              </div>
              {formErrors.username && (
                <small className="text-danger d-block mb-2" style={{ marginTop: -12 }}>
                  {formErrors.username}
                </small>
              )}

              <div className="mb-4 input-group position-relative">
                <input
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={form.password}
                  onChange={onChange}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <span className="input-group-text">
                  <i className="fas fa-key"></i>
                </span>
              </div>
              {formErrors.password && (
                <small className="text-danger d-block mb-2" style={{ marginTop: -12 }}>
                  {formErrors.password}
                </small>
              )}

              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={loading}
                >
                  {loading ? (
                    "Logging in..."
                  ) : (
                    <>
                      Login
                      <i className="fas fa-sign-in-alt float-end mt-1"></i>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-block mt-2"
                  onClick={handleDemoLogin}
                  disabled={loading}
                >
                  Login with Demo ID
                  <i className="fas fa-sign-in-alt float-end mt-1"></i>
                </button>
              </div>

              <small className="recaptchaTerms mt-1">
                This site is protected by reCAPTCHA and the Google{" "}
                <a href="https://policies.google.com/privacy">Privacy Policy</a>{" "}
                and{" "}
                <a href="https://policies.google.com/terms">Terms of Service</a>{" "}
                apply.
              </small>

              {showApk && (
                <p className="mt-1">
                  <a
                    href={APK_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2"
                  >
                    <i className="fab fa-android"></i> Download APK
                  </a>
                </p>
              )}

              <section className="footer footer-login">
                <div className="footer-top">
                  <div className="footer-links">
                    <nav className="navbar navbar-expand-sm">
                      <ul className="navbar-nav">
                        <li className="nav-item">
                          <a
                            className="nav-link"
                            href="/terms-and-conditions"
                            target="_blank"
                          >
                            Terms and Conditions
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            className="nav-link"
                            href="/responsible-gaming"
                            target="_blank"
                          >
                            Responsible Gaming
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                  <div className="support-detail">
                    <h2>24X7 Support</h2>
                    <p></p>
                  </div>
                  <div className="social-icons-box"></div>
                </div>
              </section>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
