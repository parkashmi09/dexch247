import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import Toast from '../../utils/toast'
import { authService } from '../../services/authService'

/**
 * GlobalSettings Component
 * 
 * Page for configuring global application settings.
 * Currently supports: Buffer Time.
 */
function GlobalSettings() {
  const [bufferTime, setBufferTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [platformConfig, setPlatformConfig] = useState({})

  // Fetch current settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setFetching(true)
        const response = await authService.getOwnerProfile()
        
        if (response && response.success && response.data) {
          const userData = response.data
          let config = {}

          // Handle platform_configurations (might be string or object)
          if (userData.platform_configurations) {
            try {
              config = typeof userData.platform_configurations === 'string' 
                ? JSON.parse(userData.platform_configurations) 
                : userData.platform_configurations
            } catch (e) {
              console.error('Failed to parse platform_configurations:', e)
            }
          }

          setPlatformConfig(config)
          
          if (config.buffer_time) {
            setBufferTime(config.buffer_time)
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
        Toast.fire({
          icon: 'error',
          title: 'Failed to load settings'
        })
      } finally {
        setFetching(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Prepare payload
      // If the backend expects the entire platform_configurations object or string
      // We update our local config copy
      const updatedConfig = {
        ...platformConfig,
        buffer_time: bufferTime
      }

      // Assume backend expects { platform_configurations: JSON.stringify(updatedConfig) } 
      // or similar. The requirement is to "connect this with that".
      // We will send the object structure. If backend needs string, this might need adjustment.
      // Based on screenshot, it looks like a JSON column.
      
      const payload = {
        platform_configurations: updatedConfig
      }

      const response = await authService.updatePlatformConfigurations(payload)

      if (response && response.success) {
        setPlatformConfig(updatedConfig)
        Toast.fire({
          icon: 'success',
          title: 'Settings saved successfully'
        })
      } else {
        throw new Error(response?.message || 'Update failed')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      Toast.fire({
        icon: 'error',
        title: 'Failed to save settings: ' + (error.response?.data?.message || error.message)
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Global Settings - Diamond Admin">
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-flex align-items-center justify-content-between">
            <h4 className="mb-0 font-size-18">Global Settings</h4>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-body">
              {/* <h4 className="card-title mb-4">General Configuration</h4> */}

              {fetching ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group row mb-4">
                    <label htmlFor="bufferTime" className="col-sm-3 col-form-label">
                      Buffer Time (sec)
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="number"
                        className="form-control"
                        id="bufferTime"
                        placeholder="Enter buffer time in seconds"
                        value={bufferTime}
                        onChange={(e) => setBufferTime(e.target.value)}
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group row justify-content-end">
                    <div className="col-sm-9">
                      <button
                        type="submit"
                        className="btn btn-primary w-md"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Settings'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default GlobalSettings
