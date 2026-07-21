import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { Helmet } from '@dr.pogodin/react-helmet'
import './password-success.css'

function PasswordSuccess() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const dispatch = useDispatch()
  
  // Get transaction password from location state (will be set from API response later)
  const transactionPassword = location.state?.transactionPassword

  const handleBack = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <>
      <Helmet>
        <meta name="viewport" content="width=1020" />
      </Helmet>
      <div className="cp-success-box">
        <div className="text-center container">
          <h1>
            <span className="text-success">Success! Your password has been updated successfully.</span>
          </h1>
          <h1>
            Your transaction password is <span className="text-info token-box">{transactionPassword}</span>.
          </h1>
          <h2>
            Please remember this transaction password, from now on all transcation of the website can be done only with this password and keep one thing in mind, do not share this password with anyone.
          </h2>
          <h2 className="mt-3 text-dark">
            Thank you, Team {import.meta.env.VITE_PROJECT_NAME}
          </h2>
          
          <div className="font-hindi">
            <h1 className="mt-5">
              <span className="text-success">Success! आपका पासवर्ड बदला जा चुका है।</span>
            </h1>
            <h1>
              आपका लेनदेन पासवर्ड <span className="text-info token-box">{transactionPassword}</span> है।
            </h1>
            <h2>
              कृपया इस लेन-देन के पासवर्ड को याद रखें, अब से वेबसाइट के सभी हस्तांतरण केवल इस पासवर्ड से किए जा सकते हैं और एक बात का ध्यान रखें, इस पासवर्ड को किसी के साथ साझा न करें।
            </h2>
            <h2 className="mt-3 text-dark">
              धन्यवाद, टीम {import.meta.env.VITE_PROJECT_NAME}
            </h2>
          </div>
          
          <a 
            href="/admin" 
            className="btn btn-dark btn-lg mt-5" 
            style={{ minWidth: '200px' }}
            onClick={(e) => {
              e.preventDefault()
              handleBack()
            }}
          >
            <i className="fas fa-arrow-left mr-3"></i>Back
          </a>
        </div>
      </div>
    </>
  )
}

export default PasswordSuccess

