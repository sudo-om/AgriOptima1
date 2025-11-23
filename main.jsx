import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // Changed from './AgriOptima.jsx' if you renamed it to App.jsx
import './index.css' // Import the base CSS/Tailwind file

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)