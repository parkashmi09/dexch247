import { useState } from 'react'
import Layout from '../../components/Layout'
import userService from '../../services/userService'
import './add-account.css'

/**
 * AddAccount Component
 * 
 * Page for adding a new user account.
 */
function AddAccount() {
  const [formData, setFormData] = useState({
    clientName: '',
    password: '',
    rpassword: '',
    fullName: '',
    city: '',
    phone: '',
    accountType: '',
    creditReference: '',
    comm: '',
    spart1: '',
    transactionPassword: ''
  })
  const [loading, setLoading] = useState(false)

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.clientName || !formData.password || !formData.accountType) {
      alert('Please fill in all required fields')
      return
    }

    if (formData.password !== formData.rpassword) {
      alert('Password and Retype Password do not match')
      return
    }

    // Password Validation
    if (!/[A-Z]/.test(formData.password)) {
      alert('Password must contain at least one uppercase letter')
      return
    }

    setLoading(true)
    try {
      let response;
      // Account Type: 6 = User, 4 = Master (Staff), 5 = Agent (Staff)
      // Assuming 4 and 5 are staff roles.
      
      if (formData.accountType === '6') {
        // Create User
        const payload = {
          username: formData.clientName,
          email: formData.clientName + '@gmail.com', // Generating dummy email as per request example or use input if available? User didn't specify email input in form, but in payload.
          // The form doesn't have email input, but the payload requires it. 
          // I'll use clientName + @gmail.com as a fallback or maybe I should check if there is an email field?
          // Looking at the form, there is no email field. I will use a generated one or empty if allowed.
          // The request example: "testUser1gmail.com" (typo? probably testUser1@gmail.com)
          password: formData.password,
          phone_number: formData.phone || '1234567890',
          country: formData.city || 'India',
          transactionPassword: formData.transactionPassword
        }
        response = await userService.createUser(payload)
      } else {
        const roleMap = {
          '4': 'MASTER',
          '5': 'AGENT' // Assuming Agent is also a staff role
        }

        // Validate percentage
        const percentage = parseFloat(formData.comm) || 0
        if (percentage < 0 || percentage > 100) {
            alert('Commission must be between 0 and 100')
            setLoading(false)
            return
        }
        
        const payload = {
          username: formData.clientName,
          email: formData.clientName + '@gmail.com',
          password: formData.password,
          role: roleMap[formData.accountType] || 'MASTER',
          percentage: percentage,
          transactionPassword: formData.transactionPassword,
          phone_number: formData.phone,
          city: formData.city,
          credit_ref: formData.creditReference
        }
        response = await userService.createStaff(payload)
      }
      
      if (response.success || response.message === 'User created successfully' || response.id) {
         console.log('Create account success:', response)
         alert('Account created successfully')
         
         // Reset form
         setFormData({
            clientName: '',
            password: '',
            rpassword: '',
            fullName: '',
            city: '',
            phone: '',
            accountType: '',
            creditReference: '',
            comm: '',
            spart1: '',
            transactionPassword: ''
         })
      } else {
         alert('Failed to create account: ' + (response.message || 'Unknown error'))
      }

    } catch (error) {
      console.error('Error creating account:', error)
      alert('Failed to create account: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Add Account - Diamond Admin">
      <div className="listing-grid">
        <div className="add-account">
          <h2 className="m-b-20">Add Account</h2>
          
          <form method="post" onSubmit={handleSubmit}>
            <div className="row">
              {/* Personal Detail Section */}
              <div className="col-6">
                <h4 className="mb-4 col-12">Personal Detail</h4>
                <div className="row">
                  <div className="col-6">
                    <div className="form-group">
                      <label htmlFor="clientname">Client Name:</label>
                      <input 
                        type="text" 
                        placeholder="Client Name" 
                        name="clientName" 
                        id="clientname"
                        className="form-control" 
                        value={formData.clientName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label htmlFor="password">User Password:</label>
                      <input 
                        type="password" 
                        placeholder="User Password" 
                        name="password" 
                        id="password"
                        className="form-control" 
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label htmlFor="rpassword">Retype Password:</label>
                      <input 
                        type="password" 
                        placeholder="Retype Password" 
                        name="rpassword" 
                        id="rpassword"
                        className="form-control"
                        value={formData.rpassword}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label htmlFor="fullname">Full Name:</label>
                      <input 
                        type="text" 
                        placeholder="Full Name" 
                        name="fullName" 
                        id="fullname"
                        className="form-control" 
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label htmlFor="city">City:</label>
                      <input 
                        type="text" 
                        placeholder="City" 
                        name="city" 
                        id="city"
                        className="form-control"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label htmlFor="phone">Phone:</label>
                      <input 
                        type="text" 
                        placeholder="Phone Number" 
                        name="phone" 
                        id="phone"
                        maxLength="15"
                        className="form-control"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Detail Section */}
              <div className="col-6">
                <h4 className="mb-4 col-12">Account Detail</h4>
                <div className="row">
                  <div className="col-6">
                    <div className="form-group">
                      <label htmlFor="accountType">Account Type:</label>
                      <select 
                        name="accountType" 
                        id="accountType"
                        className="form-control" 
                        value={formData.accountType}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Account Type</option>
                        <option value="4">Master</option>
                        <option value="5">Agent</option>
                        <option value="6">User</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label htmlFor="creditReference">Credit Reference:</label>
                      <input 
                        type="text" 
                        placeholder="Credit Reference" 
                        name="creditReference" 
                        id="creditReference"
                        className="form-control" 
                        value={formData.creditReference}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Commission Settings Section */}
            <div className="row mt-4">
              <div className="col-12">
                <h4 className="mb-4 col-md-12">Commission Settings</h4>
                <table className="table table-striped table-bordered">
                  <tbody>
                    <tr>
                      <td>Upline</td>
                      <td>0</td>
                    </tr>
                    <tr>
                      <td>Downline</td>
                      <td>
                        <input 
                          type="text" 
                          name="comm" 
                          id="comm"
                          placeholder="0" 
                          maxLength="4" 
                          className=""
                          value={formData.comm}
                          onChange={handleChange}
                          disabled={formData.accountType === '6'}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Our</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Partnership Section */}
            <div className="row mt-4">
              <div className="col-12">
                <h4 className="mb-4 col-md-12">Partnership</h4>
                <table className="table table-striped table-bordered">
                  <tbody>
                    <tr>
                      <td>Upline</td>
                      <td>0</td>
                    </tr>
                    <tr>
                      <td>Downline</td>
                      <td>
                        <div className="form-group">
                          <input 
                            type="text" 
                            name="spart1" 
                            placeholder="0" 
                            disabled={formData.accountType === '6'}
                            className=""
                            value={formData.spart1}
                            onChange={handleChange}
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>Our</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Transaction Password */}
            <div className="row mt-4">
              <div className="col-12">
                <div className="form-group col-3 float-right">
                  <label htmlFor="transactionPassword">Transaction Password:</label>
                  <input 
                    placeholder="Transaction Password" 
                    value={formData.transactionPassword} 
                    type="password" 
                    name="transactionPassword" 
                    id="transactionPassword"
                    className="form-control"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="row m-t-20">
              <div className="col-md-12">
                <div className="float-right">
                  <button 
                    type="submit" 
                    className="btn btn-submit"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default AddAccount

