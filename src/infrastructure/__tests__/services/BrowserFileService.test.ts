/**
 * @module BrowserFileService
 * @description ブラウザ環境でのファイル操作サービスの単体テスト
 *
 * テスト方針:
 * - window.electron = undefined でブラウザパスを強制
 * - DOM API（createElement, click, showOpenFilePicker等）をモック化
 * - downloadJson: Blob生成→aタグクリック→URL解放の流れを検証
 * - openFilePicker: ファイル選択ダイアログとFileReader処理を検証
 * - Electron環境は対象外（ブラウザパスのみテスト）
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BrowserFileService } from "../../services/BrowserFileService";

// isElectron は BrowserFileService 内のローカル関数なので、
// window.electron を undefined にして常にブラウザパスを通す
beforeEach(() => {
  Object.defineProperty(window, "electron", {
    value: undefined,
    writable: true,
    configurable: true,
  });
});

describe("BrowserFileService", () => {
  let service: BrowserFileService;

  beforeEach(() => {
    service = new BrowserFileService();

    // jsdom には URL.createObjectURL / revokeObjectURL が存在しないため直接スタブする
    if (!URL.createObjectURL) {
      URL.createObjectURL = vi.fn();
    }
    if (!URL.revokeObjectURL) {
      URL.revokeObjectURL = vi.fn();
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("downloadJson", () => {
    function setupDownloadMocks() {
      const mockClick = vi.fn();
      const mockAnchor: Record<string, unknown> = {
        href: "",
        download: "",
        click: mockClick,
      };

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        if (tag === "a") return mockAnchor as unknown as HTMLAnchorElement;
        return originalCreateElement(tag);
      });
      const appendSpy = vi
        .spyOn(document.body, "appendChild")
        .mockImplementation((node) => node);
      const removeSpy = vi
        .spyOn(document.body, "removeChild")
        .mockImplementation((node) => node);
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test-url");
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

      return { mockAnchor, mockClick, appendSpy, removeSpy };
    }

    it("Blob URL を作成して <a> 要素をクリックする", () => {
      const { mockAnchor, mockClick } = setupDownloadMocks();

      service.downloadJson('{"key":"value"}', "test.json");

      expect(URL.createObjectURL).toHaveBeenCalledOnce();
      expect(mockAnchor.href).toBe("blob:test-url");
      expect(mockClick).toHaveBeenCalledOnce();
    });

    it("ファイル名が <a> の download 属性に設定される", () => {
      const { mockAnchor } = setupDownloadMocks();

      service.downloadJson("{}", "my-data.json");

      expect(mockAnchor.download).toBe("my-data.json");
    });

    it("<a> 要素がクリック後に body から削除される", () => {
      const { mockAnchor, appendSpy, removeSpy } = setupDownloadMocks();

      service.downloadJson("{}", "test.json");

      expect(appendSpy).toHaveBeenCalledWith(mockAnchor);
      expect(removeSpy).toHaveBeenCalledWith(mockAnchor);
    });

    it("Blob URL が setTimeout で解放される", () => {
      vi.useFakeTimers();

      setupDownloadMocks();

      service.downloadJson("{}", "test.json");

      expect(URL.revokeObjectURL).not.toHaveBeenCalled();

      vi.advanceTimersByTime(10_000);

      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test-url");

      vi.useRealTimers();
    });

    it("Electron 環境では window.electron.saveJson を呼ぶ", () => {
      const mockSaveJson = vi.fn();
      Object.defineProperty(window, "electron", {
        value: { saveJson: mockSaveJson, openJson: vi.fn() },
        writable: true,
        configurable: true,
      });

      service.downloadJson('{"key":"value"}', "test.json");

      expect(mockSaveJson).toHaveBeenCalledWith('{"key":"value"}', "test.json");
    });
  });

  describe("openFilePicker", () => {
    it("ファイルが選択されない場合はエラーを投げる", async () => {
      const mockInput: Record<string, unknown> = {
        type: "",
        accept: "",
        click: vi.fn(),
        onchange: null,
        files: null,
      };

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        if (tag === "input") return mockInput as unknown as HTMLInputElement;
        return originalCreateElement(tag);
      });

      const promise = service.openFilePicker(".json");

      // openFilePicker 内で onchange が設定された後にトリガー
      const handler = mockInput.onchange as (ev: Event) => void;
      handler.call(mockInput, new Event("change"));

      await expect(promise).rejects.toThrow("No file selected");
    });

    it("ファイルが選択された場合はファイル内容を返す", async () => {
      const fileContent = '{"data":"test"}';
      const mockFile = new File([fileContent], "test.json", {
        type: "application/json",
      });

      const mockInput: Record<string, unknown> = {
        type: "",
        accept: "",
        click: vi.fn(),
        onchange: null,
        files: { 0: mockFile, length: 1 } as unknown as FileList,
      };
      // files?.[0] にアクセスできるように設定
      Object.defineProperty(mockInput.files, "0", { value: mockFile });

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        if (tag === "input") return mockInput as unknown as HTMLInputElement;
        return originalCreateElement(tag);
      });

      const promise = service.openFilePicker(".json");

      // openFilePicker 内で onchange が設定された後にトリガー
      const handler = mockInput.onchange as (ev: Event) => void;
      handler.call(mockInput, new Event("change"));

      const result = await promise;
      expect(result).toBe(fileContent);
    });

    it("FileReader でエラーが発生した場合は reject する", async () => {
      const mockFile = new File(["content"], "test.json", {
        type: "application/json",
      });

      // FileReader のモック（onerror をトリガーする）
      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as ((ev: ProgressEvent) => void) | null,
        onerror: null as ((ev: ProgressEvent) => void) | null,
        result: null,
        error: new DOMException("Read failed", "NotReadableError"),
      };

      vi.spyOn(globalThis, "FileReader").mockImplementation(
        () => mockFileReader as unknown as FileReader,
      );

      const mockInput: Record<string, unknown> = {
        type: "",
        accept: "",
        click: vi.fn(),
        onchange: null,
        files: { 0: mockFile, length: 1 } as unknown as FileList,
      };
      Object.defineProperty(mockInput.files, "0", { value: mockFile });

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        if (tag === "input") return mockInput as unknown as HTMLInputElement;
        return originalCreateElement(tag);
      });

      const promise = service.openFilePicker(".json");

      // onchange をトリガー
      const handler = mockInput.onchange as (ev: Event) => void;
      handler.call(mockInput, new Event("change"));

      // FileReader.readAsText が呼ばれた後に onerror をトリガー
      if (mockFileReader.onerror) {
        mockFileReader.onerror(new ProgressEvent("error"));
      }

      await expect(promise).rejects.toThrow();
    });

    it("FileReader エラーが null の場合はデフォルトエラーメッセージを使う", async () => {
      const mockFile = new File(["content"], "test.json", {
        type: "application/json",
      });

      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as ((ev: ProgressEvent) => void) | null,
        onerror: null as ((ev: ProgressEvent) => void) | null,
        result: null,
        error: null, // error が null
      };

      vi.spyOn(globalThis, "FileReader").mockImplementation(
        () => mockFileReader as unknown as FileReader,
      );

      const mockInput: Record<string, unknown> = {
        type: "",
        accept: "",
        click: vi.fn(),
        onchange: null,
        files: { 0: mockFile, length: 1 } as unknown as FileList,
      };
      Object.defineProperty(mockInput.files, "0", { value: mockFile });

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        if (tag === "input") return mockInput as unknown as HTMLInputElement;
        return originalCreateElement(tag);
      });

      const promise = service.openFilePicker(".json");

      const handler = mockInput.onchange as (ev: Event) => void;
      handler.call(mockInput, new Event("change"));

      if (mockFileReader.onerror) {
        mockFileReader.onerror(new ProgressEvent("error"));
      }

      await expect(promise).rejects.toThrow("Failed to read file");
    });

    it("Electron 環境では window.electron.openJson を呼ぶ", async () => {
      const mockOpenJson = vi.fn().mockResolvedValue('{"data":"electron"}');
      Object.defineProperty(window, "electron", {
        value: { saveJson: vi.fn(), openJson: mockOpenJson },
        writable: true,
        configurable: true,
      });

      const result = await service.openFilePicker(".json");

      expect(mockOpenJson).toHaveBeenCalled();
      expect(result).toBe('{"data":"electron"}');
    });

    it("Electron 環境でファイルが選択されなかった場合はエラーを投げる", async () => {
      const mockOpenJson = vi.fn().mockResolvedValue(null);
      Object.defineProperty(window, "electron", {
        value: { saveJson: vi.fn(), openJson: mockOpenJson },
        writable: true,
        configurable: true,
      });

      await expect(service.openFilePicker(".json")).rejects.toThrow(
        "No file selected",
      );
    });
  });
});
