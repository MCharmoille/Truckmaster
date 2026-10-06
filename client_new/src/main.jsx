import './date.js'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { APP_NAME } from './appName.js'
import './index.css'

document.title = APP_NAME

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
