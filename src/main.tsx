/* Main entry point for the application - renders the root React component */
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './main.css'

if (typeof window !== 'undefined') {
  const handleRuntimeError = (event: ErrorEvent | PromiseRejectionEvent) => {
    const message =
      event instanceof ErrorEvent ? event.message : (event as PromiseRejectionEvent).reason?.message
    if (
      message &&
      (message.includes('runtime.lastError') || message.includes('Extension context invalidated'))
    ) {
      console.log('Runtime error tratado corretamente')
      event.preventDefault()
    }
  }

  window.addEventListener('error', handleRuntimeError)
  window.addEventListener('unhandledrejection', handleRuntimeError)

  const _chrome = (window as any).chrome
  if (_chrome) {
    if (_chrome.runtime && _chrome.runtime.sendMessage) {
      const originalSendMessage = _chrome.runtime.sendMessage
      _chrome.runtime.sendMessage = function (...args: any[]) {
        try {
          return originalSendMessage.apply(this, args)
        } catch (err) {
          console.log('Runtime error tratado corretamente')
        }
      }
    }

    if (_chrome.tabs && _chrome.tabs.sendMessage) {
      const originalTabsSendMessage = _chrome.tabs.sendMessage
      _chrome.tabs.sendMessage = function (...args: any[]) {
        try {
          if (!args[0]) {
            console.log('Runtime error tratado corretamente')
            return
          }
          return originalTabsSendMessage.apply(this, args)
        } catch (err) {
          console.log('Runtime error tratado corretamente')
        }
      }
    }

    if (_chrome.tabs && _chrome.tabs.query) {
      const originalTabsQuery = _chrome.tabs.query
      _chrome.tabs.query = function (queryInfo: any, callback: any) {
        try {
          return originalTabsQuery.call(this, queryInfo, (tabs: any) => {
            if (_chrome.runtime?.lastError) {
              console.log('Runtime error tratado corretamente')
              if (callback) callback([])
              return
            }
            if (!tabs) {
              console.log('Runtime error tratado corretamente')
              if (callback) callback([])
              return
            }
            if (callback) callback(tabs)
          })
        } catch (err) {
          console.log('Runtime error tratado corretamente')
          if (callback) callback([])
        }
      }
    }

    if (_chrome.runtime && _chrome.runtime.onMessage && _chrome.runtime.onMessage.addListener) {
      const originalAddListener = _chrome.runtime.onMessage.addListener
      _chrome.runtime.onMessage.addListener = function (callback: any) {
        return originalAddListener.call(
          this,
          function (message: any, sender: any, sendResponse: any) {
            try {
              if (!sender || (!sender.tab && !sender.id)) {
                console.log('Runtime error tratado corretamente')
              }
              return callback(message, sender, sendResponse)
            } catch (err) {
              console.log('Runtime error tratado corretamente')
            }
          },
        )
      }
    }
  }
}

// @skip-protected: Do not remove. Required for React rendering.
createRoot(document.getElementById('root')!).render(<App />)
