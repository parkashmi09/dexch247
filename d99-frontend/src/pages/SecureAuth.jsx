import { useState, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Nav, Tab } from "react-bootstrap";
import toast from "react-hot-toast";
import Layout from "../components/layout/Layout.jsx";
import { telegram2faService } from "../apiservices/telegram2faService.js";
import { fetchUserProfileThunk } from "../features/user/userSlice.js";

const APK_URL = "https://dataobj.ecoassetsservice.com/secure-auth-apk/SecureAuthApp-2.0.apk";
const BOT_URL = "https://t.me/connect_lokesh_Bot";

export default function SecureAuth() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.user.user);
  const isEnabled = user?.telegram2FAEnabled;

  // Telegram tab state
  const [telegramPassword, setTelegramPassword] = useState("");
  const [generatedCode, setGeneratedCode] = useState(null);

  // Google Auth tab state
  const [googlePassword, setGooglePassword] = useState("");

  const [loading, setLoading] = useState(false);

  // Disable 2FA states
  const [showDisableOtp, setShowDisableOtp] = useState(false);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);

  // Random 6-digit verification code for Android App tab
  const verificationCode = useMemo(() => String(Math.floor(100000 + Math.random() * 900000)), []);

  const handleGetConnectionId = async () => {
    if (!telegramPassword) { toast.error("Please enter your password"); return; }
    setLoading(true);
    try {
      await telegram2faService.verifyPassword(telegramPassword);
      const code = await telegram2faService.getLinkCode();
      setGeneratedCode(code);
      toast.success("Connection ID Generated");
    } catch (err) {
      toast.error(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEnableGoogleAuth = async () => {
    if (!googlePassword) { toast.error("Please enter your password"); return; }
    toast.error("Google Auth not available yet");
  };

  const handleEnabledClick = async () => {
    setLoading(true);
    try {
      await telegram2faService.sendDisableCode();
      setShowDisableOtp(true);
      toast.success("Code sent to your Telegram!");
    } catch (err) {
      toast.error(err.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleDisableOtpChange = (el, idx) => {
    if (isNaN(el.value)) return;
    const next = otp.map((d, i) => (i === idx ? el.value : d));
    setOtp(next);
    if (el.value && idx < 5) inputRefs.current[idx + 1]?.focus();
    if (next.every((v) => v !== "")) handleDisable2FA(next.join(""));
  };

  const handleDisableOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const handleDisable2FA = async (code) => {
    if (code.length !== 6) return;
    setLoading(true);
    try {
      await telegram2faService.disable2FA(code);
      toast.success("2FA Disabled Successfully");
      setShowDisableOtp(false);
      setOtp(new Array(6).fill(""));
      dispatch(fetchUserProfileThunk());
    } catch (err) {
      toast.error(err.message || "Failed to disable 2FA");
      setOtp(new Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout variant="report-page">
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">Secure Auth Verification</h4>
        </div>
        <div className="card-body">
          <div className="container-fluid mt-3 secure-auth">
            <div className="row justify-content-center">
              <div className="col-md-9 text-center">
                <div>
                  <span>Secure Auth Verification Status:</span>
                  {isEnabled ? (
                    <b
                      className="bg-success p-2 text-white ms-3"
                      style={{ cursor: "pointer" }}
                      onClick={handleEnabledClick}
                    >Enabled</b>
                  ) : (
                    <b className="bg-danger p-2 text-white ms-3">Disabled</b>
                  )}
                </div>

                {/* Disable 2FA OTP */}
                {isEnabled && showDisableOtp && (
                  <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6 mt-3">
                      <div className="login-form mt-4 login-auth">
                        <h4 className="text-center login-title">Security Code Verification</h4>
                        <p>Enter 6-digit code to disable Secure Auth</p>
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
                                onChange={(e) => handleDisableOtpChange(e.target, i)}
                                onKeyDown={(e) => handleDisableOtpKeyDown(e, i)}
                                onFocus={(e) => e.target.select()}
                                disabled={loading}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enable flow */}
                {!isEnabled && (
                  <>
                    <div className="mt-1">Please select below option to enable secure auth verification</div>

                    <Tab.Container id="secure-auth-tabs" defaultActiveKey="2">
                      <Nav variant="tabs">
                        <Nav.Item><Nav.Link eventKey="1">Android App</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="2">Telegram</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="3">Google Auth</Nav.Link></Nav.Item>
                      </Nav>
                      <Tab.Content>
                        {/* Android App Tab */}
                        <Tab.Pane eventKey="1">
                          <div>Please enter below auth code in your 'Secure Auth Verification App'.</div>
                          <div className="verification-code mt-1">{verificationCode}</div>
                          <div className="mt-1">
                            <b>If you haven't downloaded,<br />please download 'Secure Auth Verification App' from below link.</b>
                          </div>
                          <div className="mt-1">Using this app you will receive auth code during login authentication</div>
                          <div className="mt-1">
                            <a target="_blank" rel="noreferrer" href={APK_URL}>
                              <button className="btn btn-success">
                                <div><i className="fab fa-android"></i></div>
                                <div className="ms-2"><b>DOWNLOAD</b><br /><span>On the android</span></div>
                              </button>
                            </a>
                          </div>
                        </Tab.Pane>

                        {/* Telegram Tab */}
                        <Tab.Pane eventKey="2">
                          <div className="mt-2">Please enter your login password to continue</div>
                          <div className="login-password mt-1">
                            <input
                              type="password"
                              className="form-control"
                              placeholder="Enter your login password"
                              value={telegramPassword}
                              onChange={(e) => setTelegramPassword(e.target.value)}
                            />
                            <button
                              className="btn btn-success"
                              disabled={!telegramPassword || loading}
                              onClick={handleGetConnectionId}
                            >
                              {loading ? "Loading..." : "Get Connection ID"}
                            </button>
                          </div>
                          {generatedCode && (
                            <div className="mt-3 follow-instruction">
                              <h4 className="mb-3"><b>Please follow below instructions for the telegram 2-step verification</b></h4>
                              <p>Find <a target="_blank" rel="noreferrer" href={BOT_URL} className="text-primary">@cfz_2fa_bot</a> in your telegram and type <kbd>/start</kbd> command. Bot will respond you.</p>
                              <p>After this type <kbd>/connect {generatedCode}</kbd> and send it to BOT.</p>
                              <p>Now your telegram account will be linked with your website account and 2-Step verification will be enabled.</p>
                              <hr />
                              <div className="font-hindi mt-4">
                                <h4 className="mb-3"><b>कृपया टेलीग्राम 2-Step verification के लिए नीचे दिए गए निर्देशों का पालन करें:</b></h4>
                                <p>अपने टेलीग्राम में <a target="_blank" rel="noreferrer" href={BOT_URL} className="text-primary">@cfz_2fa_bot</a> खोजें और कमांड <kbd>/start</kbd> टाइप करें. BOT आपको जवाब देगा.</p>
                                <p className="text-dark">इसके बाद <kbd>/connect {generatedCode}</kbd> टाइप करें और इसे BOT पर भेजें.</p>
                                <p>अब आपका टेलीग्राम account आपके वेबसाइट account से जुड़ जाएगा और 2-Step veriication चालू हो जाएगा.</p>
                              </div>
                            </div>
                          )}
                        </Tab.Pane>

                        {/* Google Auth Tab */}
                        <Tab.Pane eventKey="3">
                          <div className="mt-2">Please enter your login password to continue</div>
                          <div className="login-password mt-1">
                            <input
                              type="password"
                              className="form-control"
                              placeholder="Enter your login password"
                              value={googlePassword}
                              onChange={(e) => setGooglePassword(e.target.value)}
                            />
                            <button
                              className="btn btn-success"
                              disabled={!googlePassword || loading}
                              onClick={handleEnableGoogleAuth}
                            >
                              Enabe Google Auth
                            </button>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Tab.Container>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

