import { createRoot } from 'react-dom/client'
import { App } from './App'

createRoot(document.getElementById('app') as Element).render(<App />)

// // calling IPC exposed from preload script
// window.electron.ipcRenderer.once('ipc-example', arg => {
//   // eslint-disable-next-line no-console
//   console.log(arg)
// })
// window.electron.ipcRenderer.myPing()
