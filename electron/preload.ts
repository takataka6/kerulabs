import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  // Example: send message to main process
  send: (channel: string, data: unknown) => {
    // Whitelist channels
    const validChannels = ["toMain", "log-entry"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  // Example: receive message from main process
  receive: (channel: string, func: (...args: unknown[]) => void) => {
    const validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (_event, ...args) => func(...args));
    }
  },

  // File operations via native dialogs
  saveJson: (json: string, defaultFilename: string): Promise<boolean> =>
    ipcRenderer.invoke("file:save-json", json, defaultFilename),
  openJson: (): Promise<string | null> => ipcRenderer.invoke("file:open-json"),
});
