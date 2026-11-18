// Desktop wrapper: shows only the game — no address bar, no tabs, no internet.
const { app, BrowserWindow, Menu, session } = require('electron');
const path = require('path');

if (!app.requestSingleInstanceLock()) app.quit();

let win;

function createWindow() {
  Menu.setApplicationMenu(null); // no menu bar and no browser shortcuts

  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 360,
    minHeight: 500,
    show: false,
    backgroundColor: '#ffd23f',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      devTools: false,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });

  // Block every request to the internet: the game and its fonts are local files.
  session.defaultSession.webRequest.onBeforeRequest(
    { urls: ['http://*/*', 'https://*/*', 'ws://*/*', 'wss://*/*'] },
    (_details, cb) => cb({ cancel: true })
  );

  // No new windows, and no leaving the game page.
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file:')) e.preventDefault();
  });
  win.webContents.on('zoom-changed', () => win.webContents.setZoomFactor(1));

  // F11 toggles full screen.
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') {
      win.setFullScreen(!win.isFullScreen());
      e.preventDefault();
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));
  win.once('ready-to-show', () => {
    win.maximize();
    win.show();
  });
}

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
