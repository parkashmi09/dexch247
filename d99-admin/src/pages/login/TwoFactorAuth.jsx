import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/main/logo.png';
import './TwoFactorAuth.css';

const TwoFactorAuth = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { verify2FA, isVerifying2FA, isAuthenticated, user } = useAuth();
    
    // State from navigation
    const { staffId, ownerId } = location.state || {};
    
    // OTP State
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const inputRefs = useRef([]);

    // Toast configuration
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: false
    });

    useEffect(() => {
        // Redirect if no pending 2FA session (direct access prevention)
        if (!staffId && !ownerId) {
            navigate('/login');
        }
    }, [staffId, ownerId, navigate]);

     useEffect(() => {
        if (isAuthenticated && user) {
             if (user.first_login === false) {
                 navigate('/reset-password', { replace: true })
             } else {
                 navigate('/admin/market-analysis', { replace: true })
             }
        }
    }, [isAuthenticated, user, navigate]);


    const handleVerify = async (enteredOtp) => {
        try {
            const verifyData = {
                otp: enteredOtp,
                staffId,
                ownerId
            };

            const response = await verify2FA(verifyData);

            if (response?.success) {
                Toast.fire({
                    icon: 'success',
                    title: '2FA Verified Successfully'
                });
                // Navigation handled handled by useEffect on isAuthenticated change or onSuccess in useAuth
            }
        } catch (error) {
            const msg = error?.response?.data?.error || 'Verification failed';
            Toast.fire({
                icon: 'error',
                title: msg
            });
            // Clear OTP on error? Maybe not all of it.
        }
    };

    // OTP Input handlers
    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;
        
        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp); // Update state immediately for visual feedback
        
        // Focus next input
        if (element.value !== "" && element.nextSibling) {
            element.nextSibling.focus();
        }

        // Check for complete OTP
        if (newOtp.every(val => val !== "")) {
            handleVerify(newOtp.join(""));
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return; // Only allow digits

        const newOtp = [...otp];
        pastedData.split("").forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);
        
        // Focus appropriate box
        const nextIndex = Math.min(pastedData.length, 5);
        if(inputRefs.current[nextIndex]) {
             inputRefs.current[nextIndex].focus();
        }

        if (newOtp.every(val => val !== "")) {
            handleVerify(newOtp.join(""));
        }
    };

    return (
        <div className="two-factor-auth-page">
            <div className="auth-card-container">
                <div className="logo-container">
                    <img src={logo} alt="DIAMOND99" className="auth-logo" />
                </div>
                
                <h3 className="auth-title">Security Code Verification Using Telegram App</h3>
                <p className="auth-subtitle">Enter 6-digit code from your telegram bot <span className="resend-text">Resend Code</span></p>

                <div className="otp-container" onPaste={handlePaste}>
                    {otp.map((data, index) => (
                        <input
                            key={index}
                            className="otp-input-dark"
                            type="text"
                            maxLength="1"
                            value={data}
                            ref={(el) => inputRefs.current[index] = el}
                            onChange={(e) => handleChange(e.target, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onFocus={(e) => e.target.select()}
                            disabled={isVerifying2FA}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TwoFactorAuth;
