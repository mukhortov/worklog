/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { app, BrowserWindow, shell, ipcMain, nativeTheme, session } from 'electron'
import { formatLongISODateTime } from '../service/date'
import MenuBuilder from './menu'
import { resolveHtmlPath } from './util'
import { Account, getAccount, removeAccount, saveAccount } from './account'
import {
  addWorklog,
  deleteWorklog,
  editWorklog,
  getCurrentUser,
  getIssues,
  getIssueWorklogs,
  getJiraSettings,
  getRecentIssues,
  searchIssue,
  serverInfo,
  testIssuesKey,
} from './api'

let mainWindow: BrowserWindow | null = null

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

const isDevelopment = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'

if (isDevelopment) {
  require('electron-debug')()
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer')
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS
  const extensions = ['REACT_DEVELOPER_TOOLS']

  return installer
    .default(
      extensions.map(name => installer[name]),
      forceDownload,
    )
    .catch(console.log)
}

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions()
  }

  mainWindow = new BrowserWindow({
    show: false,
    height: 400,
    width: 600,
    minHeight: 360,
    minWidth: 460,
    webPreferences: {
      // preload: app.isPackaged ? path.join(__dirname, 'preload.js') : path.join(__dirname, '../../.erb/dll/preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
    backgroundColor: '#333',
  })

  mainWindow.loadURL(resolveHtmlPath('index.html'))

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined')
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize()
    } else {
      mainWindow.show()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const menuBuilder = new MenuBuilder(mainWindow)
  menuBuilder.buildMenu()

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler(edata => {
    shell.openExternal(edata.url)
    return { action: 'deny' }
  })

  // Allow loading external images
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['img-src *'],
      },
    })
  })

  // Check if there're any saved accounts
  // TODO: Can be run on app start not on window creation
  mainWindow.webContents.on('did-finish-load', async () => {
    if (!(await getAccount())) {
      mainWindow?.webContents.send('request-log-in')
    }
  })

  // Force dark mode
  nativeTheme.themeSource = 'dark'
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed

  // From App Store review:
  // > We found that when the user closes the main application window there is no menu item to re-open it.
  // > It would be appropriate for the app to implement a Window menu that lists the main window so it can be reopened, or provide similar functionality in another menu item.
  // > Alternatively, if the application is a single-window app, it might be appropriate to save data and quit the app when the main window is closed.

  // if (process.platform !== 'darwin') {
  app.quit()
  // }
})

app
  .whenReady()
  .then(() => {
    createWindow()
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow()
    })
  })
  .catch(console.log)

/// Renderer Events

ipcMain.handle('set-title', (_, { title }) => {
  BrowserWindow?.getFocusedWindow()?.setTitle(title)
})

ipcMain.handle('get-server-settings', (_, serverUrl) => serverInfo(serverUrl))

ipcMain.handle('get-issues', (_, { startDate, endDate }) => getIssues(startDate, endDate))

ipcMain.handle('get-issue-worklogs', (_, { issueKey, startDate, endDate }) => {
  return getIssueWorklogs(issueKey, startDate, endDate)
})

ipcMain.handle('get-jira-settings', () => getJiraSettings())

ipcMain.handle('get-current-user', () => getCurrentUser())

ipcMain.handle('save-account', (_, { baseUrl, encodedKey }: Account) =>
  saveAccount(baseUrl, encodedKey).then(() =>
    getCurrentUser().catch(error => {
      removeAccount()
      throw error
    }),
  ),
)

ipcMain.handle('remove-account', () => removeAccount())

ipcMain.handle('test-issue-key', (_, issueKey) => testIssuesKey(issueKey))

ipcMain.handle('search-issues', (_, searchQuery) => searchIssue(searchQuery))

ipcMain.handle('get-resent-issues', () => getRecentIssues())

ipcMain.handle('add-worklog', (_, { issueKey, started, timeSpent }) => {
  return addWorklog(issueKey, formatLongISODateTime(started), timeSpent)
})

ipcMain.handle('edit-worklog', (_, { worklogId, issueKey, started, timeSpent }) => {
  return editWorklog(worklogId, issueKey, formatLongISODateTime(started), timeSpent)
})

ipcMain.handle('delete-worklog', (_, { worklogId, issueKey }) => deleteWorklog(worklogId, issueKey))
