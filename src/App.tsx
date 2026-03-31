import { useState, useCallback } from 'react'
import './App.css'

function App() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    </div>
  )
}

export default App
