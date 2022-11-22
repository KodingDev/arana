import { contextBridge, ipcRenderer } from "electron";

// Configure store
contextBridge.exposeInMainWorld("electron", {
  store: {
    get(key) {
      return ipcRenderer.sendSync("electron-store-get", key);
    },
    set(key, value) {
      ipcRenderer.send("electron-store-set", key, value);
    },
  },
});
