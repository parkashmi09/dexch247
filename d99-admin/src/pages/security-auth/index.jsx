import React, { useState, useRef } from 'react';
import Swal from 'sweetalert2';
import { useSelector, useDispatch } from 'react-redux';
import { authService } from '../../services/authService';
import { setCredentials } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../components/Layout';
import './style.css';

const SecurityAuth = () => {
  const [password, setPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('telegram');
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  
  /* New State for showing/hiding disable inputs */
  const [showDisableInput, setShowDisableInput] = useState(false);
  
  // Disable 2FA states
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);

  const dispatch = useDispatch();
  const { user, token, role } = useSelector((state) => state.auth);

  const isEnabled = user?.telegram2FAEnabled;

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: false
  });

  /* Combined handler for Get Connection ID: Verify Password first then Generate */
  const handleGetConnectionStep = async () => {
    if (!password) {
      Toast.fire({ icon: 'error', title: "Please enter your password" });
      return;
    }
    setIsLoading(true);
    try {
        // Step 1: Verify Password
        await authService.verifyPassword(password);
        
        // Step 2: Generate Code immediately
        const response = await authService.generate2FALink();
        if (response && response.code) {
          setGeneratedCode(response.code);
          Toast.fire({ icon: 'success', title: "Connection ID Generated" });
        }
    } catch (error) {
      Toast.fire({ icon: 'error', title: error.response?.data?.error || "Verification failed" });
      setGeneratedCode(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendDisableCode = async () => {
    setIsLoading(true);
    try {
        await authService.sendDisable2FACode();
        setShowDisableInput(true); // Show inputs after sending code
        Toast.fire({ icon: 'success', title: "Code sent to your Telegram!" });
    } catch (error) {
        Toast.fire({ icon: 'error', title: error.response?.data?.error || "Failed to send code" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async (codeOverride) => {
    const code = codeOverride || otp.join("");
    if (code.length !== 6) {
        if(!codeOverride) Toast.fire({ icon: 'error', title: "Please enter complete 6-digit code" });
        return;
    }

    setIsLoading(true);
    try {
        await authService.disable2FA({ otp: code });
        Toast.fire({ icon: 'success', title: "2FA Disabled Successfully" });
        setShowDisableInput(false);
        setOtp(new Array(6).fill("")); // Reset
        
        // Refresh Profile to update state
        // We can manually update Redux state for immediate feedback
        const updatedUser = { ...user, telegram2FAEnabled: false, telegramChatId: null };
        dispatch(setCredentials({ token, user: updatedUser, role }));

    } catch (error) {
        Toast.fire({ icon: 'error', title: error.response?.data?.error || "Failed to disable 2FA" });
        // Clear OTP on error if desired
        // setOtp(new Array(6).fill(""));
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Input handlers
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    
    if (element.nextSibling) {
        element.nextSibling.focus();
    }

    // Check for auto-submit
    if (newOtp.every(val => val !== "")) {
        handleDisable2FA(newOtp.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
          inputRefs.current[index - 1].focus();
      }
  };

  return (
    <Layout title="Security Auth - Diamond Admin">
    <div className="security-auth-container">
      <div className="page-header">
         <h2>Secure Auth Verification</h2>
      </div>

      <div className="auth-card">
        {/* Status Line */}
        <div className="status-line">
           Secure Auth Verification Status: 
           {isEnabled ? (
              <span className="status-badge-enabled" onClick={() => !showDisableInput && handleSendDisableCode()}>
                  Enabled
              </span>
           ) : (
              <span className="status-badge-disabled">Disabled</span>
           )}
        </div>

        {/* Enabled View - 2FA Challenge to Disable */}
        {isEnabled && (
             <div className="enabled-view">
                 {/* Only show inputs if showDisableInput is true, otherwise maybe just show status? 
                     The screenshot implies we immediately see the inputs? 
                     Actually, for security, usually you click "Disable" then get OTP.
                     But screenshot 2 shows "Security Code Verification" immediately.
                     Let's assume we triggered it or it's always visible to "verify presence" 
                     but logically we need to trigger SEND OTP first.
                     Let's keep the flow: User sees ENABLED. User clicks ENABLED or specific button.
                     Wait, user's screenshot 2 shows "Secure Auth Verification Status: Enabled" 
                     AND "Security Code Verification" form below it.
                     I implies the user is in a state where they can enter code.
                     I'll stick to: Click Status to trigger 'Send OTP' & Show Form.
                 */}
                  {!showDisableInput ? (
                    <div style={{marginTop: '20px'}}>
                         <p>Your account is secured with Telegram 2FA.</p>
                         <button className="btn-primary" onClick={handleSendDisableCode} disabled={isLoading}>
                            {isLoading ? 'Sending Code...' : 'Disable Secure Auth'}
                         </button>
                    </div>
                  ) : (
                    <div className="verification-section">
                        <h3>Security Code Verification</h3>
                        <p>Enter 6-digit code from your security auth verification App</p>
                        
                        <div className="otp-input-group">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    className="otp-box"
                                    type="text"
                                    maxLength="1"
                                    value={data}
                                    ref={(el) => inputRefs.current[index] = el}
                                    onChange={(e) => handleChange(e.target, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onFocus={(e) => e.target.select()}
                                    disabled={isLoading}
                                />
                            ))}
                        </div>
                        {/* Resend Link */}
                        <div className="resend-container">
                            <span className="resend-link" onClick={handleSendDisableCode}>Resend Code</span>
                        </div>
                    </div>
                  )}
             </div>
        )}

        {/* Disabled View - Setup Flow */}
        {!isEnabled && (
            <div className="disabled-view">
                 <p className="instruction-text">Please select below option to enable secure auth verification</p>
                 
                 {/* Tabs */}
                 <div className="auth-tabs">
                     <div 
                        className={`auth-tab ${activeTab === 'mobile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('mobile')}
                     >
                        Enable Using Mobile App
                     </div>
                     <div 
                        className={`auth-tab ${activeTab === 'telegram' ? 'active' : ''}`}
                        onClick={() => setActiveTab('telegram')}
                     >
                        Enable Using Telegram
                     </div>
                 </div>

                 <div className="tab-content">
                     {activeTab === 'mobile' && (
                         <div className="coming-soon">
                             Coming Soon
                         </div>
                     )}

                     {activeTab === 'telegram' && (
                         <>
                            {/* Step 1: Password & Get ID */}
                            {!generatedCode ? (
                                <div className="setup-step-1">
                                     <label>Please enter your login password to continue</label>
                                     <div className="input-with-button">
                                         <input 
                                             type="password" 
                                             className="form-control"
                                             placeholder=".........."
                                             value={password}
                                             onChange={(e) => setPassword(e.target.value)}
                                         />
                                         <button 
                                            className="btn-primary"
                                            onClick={handleGetConnectionStep}
                                            disabled={isLoading}
                                         >
                                             {isLoading ? 'Processing...' : 'Get Connection ID'}
                                         </button>
                                     </div>
                                </div>
                            ) : (
                                /* Step 2: Instructions */
                                <div className="setup-step-2">
                                     <p className="step-text">Please follow below instructions for the telegram 2-step verification</p>
                                     <div className="bot-instructions">
                                         <p>Find <a href="https://t.me/connect_lokesh_Bot" target="_blank" rel="noopener noreferrer">@connect_lokesh_Bot</a> in your telegram and type <span className="cmd-badge">/start</span> command. Bot will respond you.</p>
                                         <p>After this type <span className="cmd-badge">/connect {generatedCode}</span> and send it to BOT.</p>
                                         <p>Now your telegram account will be linked with your website account and 2-Step verification will be enabled.</p>
                                     </div>
                                </div>
                            )}
                         </>
                     )}
                 </div>
            </div>
        )}
      </div>
    </div>
    </Layout>
  );
};

export default SecurityAuth;
