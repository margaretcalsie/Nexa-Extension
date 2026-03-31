import { generateNotes } from './SWhelpers/generate'

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log("Service Worker: I am awake!");
  
  if (message.type === 'PROCESS_TEXT') {
    generateNotes(message.text)
      .then((result) => sendResponse({ result }))
      .catch((err) =>
        sendResponse({ error: err instanceof Error ? err.message : 'Unknown error' })
      )
    return true
  }
})
