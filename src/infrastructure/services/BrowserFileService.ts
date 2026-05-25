/**
 * @module BrowserFileService
 * @description ブラウザDOM API / Electron IPCを使ったファイル操作の実装。JSONのダウンロードとファイル選択ダイアログを提供する。
 */
import type { IFileService } from "@application/ports/output/services";

/** Electron のネイティブ API が使えるかどうかを判定する */
function isElectron(): boolean {
  return (
    typeof window !== "undefined" &&
    window.electron !== undefined &&
    typeof window.electron.saveJson === "function"
  );
}

/** ブラウザの DOM API / Electron IPC を使ったファイル操作の実装 */
export class BrowserFileService implements IFileService {
  downloadJson(json: string, filename: string): void {
    if (isElectron()) {
      // Electron: ネイティブ保存ダイアログを使用
      window.electron!.saveJson(json, filename);
      return;
    }

    // ブラウザ: Blob URL + <a> download
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  openFilePicker(accept: string): Promise<string> {
    if (isElectron()) {
      // Electron: ネイティブ開くダイアログを使用
      return window.electron!.openJson().then((content) => {
        if (content === null) {
          throw new Error("No file selected");
        }
        return content;
      });
    }

    // ブラウザ: <input type="file"> ダイアログ
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = accept;
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          reject(new Error("No file selected"));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () =>
          reject(reader.error ?? new Error("Failed to read file"));
        reader.readAsText(file);
      };
      input.click();
    });
  }
}
