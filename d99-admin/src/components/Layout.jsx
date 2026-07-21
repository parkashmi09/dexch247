import { useEffect } from 'react'
import { Helmet } from '@dr.pogodin/react-helmet'
import Header from './Header'
import Sidebar from './Sidebar'

/**
 * Layout Component
 * 
 * Provides the main layout structure for authenticated pages.
 * Includes Header, Sidebar, and main content area.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title for Helmet
 * @param {React.ReactNode} props.children - Content to render in main area
 */
function Layout({ title = 'Diamond Admin', children }) {
  // Ensure sidebar is hidden by default
  useEffect(() => {
    // Set immediately to prevent flash
    document.body.classList.add('vertical-collpsed')
    
    return () => {
      // Cleanup: Remove class when component unmounts
      document.body.classList.remove('vertical-collpsed')
    }
  }, [])

  return (
    <div id="layout-wrapper">
      <Helmet>
        <title>{title}</title>
        <meta name="viewport" content="width=1020" />
      </Helmet>
      <Header />
      <Sidebar />
      <div className="main-content">
        <div className="page-content">
          <div className="container-fluid pt-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout

