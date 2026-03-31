import { useState, useEffect, useCallback } from 'react'
import './App.css'

function App() {
  const [apiKey, setApiKey] = useState('')
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    chrome.storage.local.get('geminiApiKey', (res: { geminiApiKey?: string }) => {
      if (res.geminiApiKey) {
        setApiKey(res.geminiApiKey)
        setApiKeyInput(res.geminiApiKey)
      }
    })
  }, [])

  const handleSaveKey = () => {
    const key = apiKeyInput.trim()
    if (!key) return
    chrome.storage.local.set({ geminiApiKey: key }, () => {
      setApiKey(key)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    })
  }

  const handleClearKey = () => {
    chrome.storage.local.remove('geminiApiKey', () => {
      setApiKey('')
      setApiKeyInput('')
      setResult('')
      setError('')
    })
  }

  const handleProcess = useCallback(() => {
    const text = input.trim()
    if (!text || loading) return

    setResult('')
    setError('')
    setLoading(true)

    chrome.runtime.sendMessage(
      { type: 'PROCESS_TEXT', text },
      (response: { result?: string; error?: string }) => {
        if (chrome.runtime.lastError) {
          setError(chrome.runtime.lastError.message ?? 'Unknown error')
        } else if (response?.error) {
          setError(response.error)
        } else {
          setResult(response?.result ?? '')
        }
        setLoading(false)
      }
    )
  }, [input, loading])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleProcess()
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Note Taker</h1>
      </header>

      <div className="api-key-area">
        <label className="label">Gemini API Key</label>
        <div className="api-key-row">
          <input
            type="password"
            className="api-key-input"
            placeholder="AIza..."
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
          />
          <button
            className="btn btn-small"
            onClick={handleSaveKey}
            disabled={!apiKeyInput.trim()}
          >
            {saved ? 'Saved!' : 'Save'}
          </button>
          {apiKey && (
            <button className="btn btn-small btn-danger" onClick={handleClearKey}>
              Clear
            </button>
          )}
        </div>
      </div>

      {apiKey && (
        <>
          <div className="input-area">
            <textarea
              className="text-input"
              placeholder="Paste your text here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={6}
              disabled={loading}
            />
            <button
              className="btn btn-primary"
              onClick={handleProcess}
              disabled={!input.trim() || loading}
            >
              {loading ? 'Processing...' : 'Generate Summary'}
            </button>
          </div>

          {(result || error) && (
            <div className="output-area">
              <h2>Summary</h2>
              {error && <p className="error">{error}</p>}
              {result && <pre className="result">{result}</pre>}
            </div>
          )}
        </>
      )}

      {!apiKey && (
        <p className="hint">Enter your API key to get started.</p>
      )}
    </div>
  )
}

export default App
