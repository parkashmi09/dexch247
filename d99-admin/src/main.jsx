import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from '@dr.pogodin/react-helmet'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { store } from './store/store'
import 'bootstrap/dist/js/bootstrap.bundle.min'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './styles/index.css'
// import './table.css'
import App from './App.jsx'
// import { USE_RESPONSIVE_VIEWPORT } from './hooks/useViewport'

// if (USE_RESPONSIVE_VIEWPORT) {
//   const meta = document.createElement('meta')
//   meta.name = 'viewport'
//   meta.content = 'width=device-width, initial-scale=1.0'
//   document.head.appendChild(meta)
// }

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
)
