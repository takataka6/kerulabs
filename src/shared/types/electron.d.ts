/** electron/preload.ts で公開される Electron API の型定義 */
interface ElectronAPI {
  send: (channel: string, data: unknown) => void;
  receive: (channel: string, func: (...args: unknown[]) => void) => void;
  saveJson: (json: string, defaultFilename: string) => Promise<boolean>;
  openJson: () => Promise<string | null>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export {};
