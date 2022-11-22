import path from "path";

import { app, BrowserWindow, ipcMain, shell } from "electron";
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import serve from "electron-serve";
import ElectronStore from "electron-store";
import sourceMapSupport from "source-map-support";

// Initialize the main window as null
let mainWindow: BrowserWindow | null = null;

// Configure store
const store = new ElectronStore();

ipcMain.on(
  "electron-store-get",
  async (event, key) => (event.returnValue = store.get(key))
);

ipcMain.on("electron-store-set", async (event, key, value) =>
  store.set(key, value)
);

const isProd: boolean = process.env.NODE_ENV === "production";

if (isProd) {
  // Install source maps & serve the app
  sourceMapSupport.install();
  serve({ directory: "app" });
} else {
  // Set the user data path to a dev folder
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

const createWindow = async () => {
  // Install extensions
  if (!isProd) {
    installExtension([REACT_DEVELOPER_TOOLS])
      .then((name) => console.log(`[EXTENSIONS] Added:  ${name}`))
      .catch((err) => console.log("[EXTENSIONS] An error occurred: ", err));
  }

  // Configure assets
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, "assets")
    : path.join(__dirname, "../assets");

  const getAssetPath = (...paths: string[]): string =>
    path.join(RESOURCES_PATH, ...paths);

  // Create the window
  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath("icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "../app/preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  // Show the window
  mainWindow.on("ready-to-show", () => {
    console.log("[MAIN] Ready to show");

    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }

    mainWindow.show();
  });

  mainWindow.on("closed", () => (mainWindow = null));

  // Load the home page
  // TODO: Change to /
  if (isProd) {
    await mainWindow.loadURL("app://./home.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
  }

  // TODO: Custom context menu
  // https://github.com/electron-react-boilerplate/electron-react-boilerplate/blob/main/src/main/main.ts

  // Open URLs in the user's browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
};

app.on("window-all-closed", () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app
  .whenReady()
  .then(createWindow)
  .then(() => {
    app.on("activate", async () => {
      if (mainWindow === null) {
        await createWindow();
      }
    });
  })
  .catch(console.log);
