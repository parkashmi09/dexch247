import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// 1. CSS variables FIRST — every other stylesheet reads from these tokens.
import "./styles/variables.css";

// 2. Bootstrap baseline
import "bootstrap/dist/css/bootstrap.min.css";

// 3. Reference vendor + theme styles (override Bootstrap, in this exact order)
import "./styles/all.min.css";
import "./styles/fonts.css";
import "./styles/style.css";
import "./styles/casino.css";
import "./styles/flip.css";
import "./styles/theme.css";
import "./styles/responsive.css";

// 4. Project-local overrides (must be last)
import "./styles/app.css";
import "./styles/custom.css";

import App from "./App.jsx";
import { store } from "./store.js";
import { installAppHeight } from "./styles/app-height.js";
import { ExposureProvider } from "./hooks/useExposure.jsx";
import { initWhitelabel } from "./hooks/useWhitelabel.js";

installAppHeight();
initWhitelabel();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ExposureProvider>
        <BrowserRouter>
          <App />
          <Toaster position="top-right" />
        </BrowserRouter>
      </ExposureProvider>
    </Provider>
  </React.StrictMode>,
);
