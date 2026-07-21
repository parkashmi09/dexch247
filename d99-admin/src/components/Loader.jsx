import { useState, useEffect } from 'react'
import '../styles/loader.css'

function Loader() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Hide loader after page loads
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div 
      id="loader-full" 
      style={{ display: isLoading ? 'block' : 'none' }}
    >
      {/* Loader content */}
    </div>
  )
}

export default Loader

