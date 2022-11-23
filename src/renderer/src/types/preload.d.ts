// noinspection JSUnusedGlobalSymbols
interface Window {
  electron: {
    store: {
      get: (key: string) => unknown;
      set: (key: string, val: unknown) => void;
    };
  };
}
