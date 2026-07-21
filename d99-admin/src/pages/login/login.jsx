import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from '@dr.pogodin/react-helmet'
import Swal from 'sweetalert2'
import { useAuth } from '../../hooks/useAuth'
import { isExecutive, firstAllowedRoute } from '../../utils/permissions'
import logo from '../../assets/main/logo.png'
import './style.css'

function Login() {
  const navigate = useNavigate()
  const { loginAsync, isLoggingIn, isAuthenticated, verify2FA, isVerifying2FA } = useAuth()

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  // 2FA State
  const [show2FA, setShow2FA] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingIds, setPendingIds] = useState({ staffId: null, ownerId: null });

  const [errors, setErrors] = useState({
    username: '',
    password: '',
    general: ''
  })

  // Toast configuration
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: false,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  // Redirect if already authenticated
  const { user } = useAuth()
  useEffect(() => {
    if (isAuthenticated && user && !show2FA) {
      if (isExecutive()) {
        navigate(firstAllowedRoute(), { replace: true })
      } else if (user.first_login === false) {
        navigate('/reset-password', { replace: true })
      } else {
        navigate('/admin/market-analysis', { replace: true })
      }
    }
  }, [isAuthenticated, user, navigate, show2FA])

  const validateField = (name, value) => {
    let error = ''

    if (name === 'username') {
      if (!value || value.trim() === '') {
        error = 'The username field is required'
      }
      // Accept either email format or username format (no validation needed for username)
    } else if (name === 'password') {
      if (!value || value.trim() === '') {
        error = 'The password field is required'
      }
    }

    return error
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name]: value
    })

    // Real-time validation
    const error = validateField(name, value)
    setErrors({
      ...errors,
      [name]: error
    })
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    setErrors({
      ...errors,
      [name]: error
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate all fields
    const usernameError = validateField('username', formData.username)
    const passwordError = validateField('password', formData.password)

    setErrors({
      username: usernameError,
      password: passwordError,
      general: ''
    })

    // If no errors, proceed with login
    if (!usernameError && !passwordError) {
      try {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)

        const credentials = {
          password: formData.password
        }

        if (isEmail) {
          credentials.email = formData.username
        } else {
          credentials.username = formData.username
        }

        const response = await loginAsync(credentials)

        if (response?.require2FA) {
          // Navigate to 2FA page
          navigate('/loginauth/2', {
            state: {
              staffId: response.staffId,
              ownerId: response.ownerId
            }
          });
          Toast.fire({
            icon: 'info',
            title: 'Please enter 2FA Code sent to Telegram'
          });
          return;
        }

        if (response?.success) {
          Toast.fire({
            icon: 'success',
            title: 'Login successfully'
          });
          // Executive (multi-login) → land on their first granted page.
          if (response.__loginType === 'executive') {
            navigate(firstAllowedRoute(), { replace: true })
          } else if (response.first_login === false) {
            // first_login false → force password reset (per requirement)
            navigate('/reset-password', { replace: true })
          } else {
            navigate('/admin/market-analysis', { replace: true })
          }
        } else {
          const msg = response?.message || 'Login failed. Please try again.';
          setErrors({
            ...errors,
            general: msg
          })
          Toast.fire({
            icon: 'error',
            title: msg
          });
        }
      } catch (error) {
        const msg = error?.response?.data?.message || 'Login failed. Please check your credentials.';
        setErrors({
          ...errors,
          general: msg
        })
        Toast.fire({
          icon: 'error',
          title: msg
        });
      }
    }
  }

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    if (!otp) return;

    try {
      const verifyData = {
        otp,
        staffId: pendingIds.staffId,
        ownerId: pendingIds.ownerId
      };

      const response = await verify2FA(verifyData);

      if (response?.success) {
        Toast.fire({
          icon: 'success',
          title: '2FA Verified Successfully'
        });
        if (response.first_login === false) {
          navigate('/reset-password', { replace: true })
        } else {
          navigate('/admin/market-analysis', { replace: true })
        }
      }
    } catch (error) {
      const msg = error?.response?.data?.error || 'Verification failed';
      Toast.fire({
        icon: 'error',
        title: msg
      });
    }
  }

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(val);
  }

  return (
    <>
      <Helmet>
        <meta name="viewport" content="width=1020" />
      </Helmet>
      <section className="login-mn">
        <div className="log-logo m-b-18">
          <img src={logo} alt="DIAMOND EXCH 99" style={{ maxWidth: '250px', maxHeight: '100px' }} />
        </div>
        <div className="log-fld">
          <h2 className="text-center">{show2FA ? 'Security Verification' : 'Sign In'}</h2>

          {!show2FA ? (
            <form
              autoComplete="off"
              data-vv-scope="form-login"
              action=""
              method="POST"
              className="form-horizontal"
              onSubmit={handleSubmit}
            >

              <div id="input-group-1" role="group" className="form-group">
                <div>
                  <input
                    id="input-1"
                    name="username"
                    type="text"
                    placeholder="Username"
                    className="form-control"
                    autoComplete="username"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck="false"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isLoggingIn}
                  />
                  {errors.username && <span className="error">{errors.username}</span>}
                </div>
              </div>
              <div id="input-group-2" role="group" className="form-group">
                <div>
                  <input
                    id="input-2"
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="form-control form-control"
                    autoComplete="new-password"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck="false"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isLoggingIn}
                  />
                  {errors.password && <span className="error">{errors.password}</span>}
                </div>
              </div>
              <div className="form-group text-center">
                <button
                  type="submit"
                  className="btn btn btn-submit btn-login btn-primary"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? 'Logging in...' : 'Login'} <i className="fas fa-sign-in-alt"></i>
                </button>
              </div>
            </form>
          ) : (
            <form
              autoComplete="off"
              className="form-horizontal"
              onSubmit={handleVerify2FA}
            >
              <div className="form-group">
                <p className="text-center" style={{ color: '#fff' }}>Enter the 6-digit code sent to your Telegram.</p>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  className="form-control text-center"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength="6"
                  autoFocus
                />
              </div>
              <div className="form-group text-center mt-3">
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={isVerifying2FA || otp.length !== 6}
                >
                  {isVerifying2FA ? 'Verifying...' : 'Verify Code'}
                </button>
                <button
                  type="button"
                  className="btn btn-link mt-2"
                  onClick={() => setShow2FA(false)}
                  style={{ color: '#aaa' }}
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  )
}

export default Login

