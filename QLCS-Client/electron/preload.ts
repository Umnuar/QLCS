import { ipcRenderer, contextBridge } from 'electron'

const ALLOWED_CHANNELS = new Set(['updater-event', 'main-process-message', 'time-offset-updated'])

const electronAPI = {
  store: {
    get: (key: string) => ipcRenderer.invoke('secure-store:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('secure-store:set', { key, value }),
    delete: (key: string) => ipcRenderer.invoke('secure-store:delete', key),
    clear: () => ipcRenderer.invoke('secure-store:clear'),
  },
  dialog: {
    openFile: (filters?: { name: string; extensions: string[] }[]) =>
      ipcRenderer.invoke('dialog:open-file', filters),
  },
  app: {
    getVersion: () => ipcRenderer.invoke('get-app-version'),
    setZoom: (level: number) => ipcRenderer.invoke('app:set-zoom', level),
    getZoomLevel: () => ipcRenderer.invoke('get-zoom-level'),
  },
  updater: {
    install: () => ipcRenderer.invoke('install-update'),
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  },
  on: (channel: string, callback: (...args: any[]) => void) => {
    if (!ALLOWED_CHANNELS.has(channel)) {
      console.warn(`Blocked attempt to listen on unauthorized channel: ${channel}`)
      return () => {}
    }
    const listener = (_event: any, ...args: any[]) => callback(...args)
    ipcRenderer.on(channel, listener)
    return () => ipcRenderer.removeListener(channel, listener)
  },
}

// Expose both window.electronAPI and window.api for full compatibility
contextBridge.exposeInMainWorld('electronAPI', electronAPI)
contextBridge.exposeInMainWorld('api', electronAPI)
