/**
 * @module ImageCropModal コンポーネント
 * @description 画像トリミングモーダルの単体テスト
 *
 * テスト方針:
 * - 画像未選択時・選択時のUI表示を検証
 * - ボタン操作によるコールバック呼び出しを検証
 * - onRemove の有無による削除ボタンの表示制御を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, screen, fireEvent } from "@testing-library/react";
import { ImageCropModal } from "../ImageCropModal";

// Mock react-easy-crop
vi.mock("react-easy-crop", () => ({
  default: ({ image }: { image: string }) => (
    <div data-testid="cropper" data-image={image} />
  ),
}));

// Mock LanguageContext
vi.mock("@presentation/contexts/LanguageContext", () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

// Mock Toast
vi.mock("../Toast", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

// Mock handleError
vi.mock("@shared/errors/handleError", () => ({
  handleError: vi.fn(),
}));

// Mock logger
vi.mock("@shared/logger", () => ({
  getLogger: () => ({ warn: vi.fn() }),
}));

// Mock AccessibleModal
vi.mock("../AccessibleModal", () => ({
  AccessibleModal: ({
    children,
    isOpen,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
  }) => (isOpen ? <div data-testid="accessible-modal">{children}</div> : null),
}));

describe("ImageCropModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("画像未選択時: ファイル選択ボタンが表示される", () => {
    render(<ImageCropModal onSave={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText("imageCrop.clickToSelect")).toBeInTheDocument();
    expect(screen.queryByTestId("cropper")).not.toBeInTheDocument();
  });

  it("初期画像あり: Cropperコンポーネントが表示される", () => {
    render(
      <ImageCropModal
        initialImage="data:image/png;base64,test"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    const cropper = screen.getByTestId("cropper");
    expect(cropper).toBeInTheDocument();
    expect(cropper).toHaveAttribute("data-image", "data:image/png;base64,test");
  });

  it("閉じるボタンでonCloseが呼ばれる", () => {
    const onClose = vi.fn();
    render(<ImageCropModal onSave={vi.fn()} onClose={onClose} />);
    const closeButton = screen.getByLabelText("imageCrop.close");
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("キャンセルボタンでonCloseが呼ばれる", () => {
    const onClose = vi.fn();
    render(<ImageCropModal onSave={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByText("imageCrop.cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("画像未選択時は保存ボタンが無効", () => {
    render(<ImageCropModal onSave={vi.fn()} onClose={vi.fn()} />);
    const saveButton = screen.getByText("imageCrop.save");
    expect(saveButton).toBeDisabled();
  });

  it("削除ボタンが表示される (onRemoveがある場合)", () => {
    render(
      <ImageCropModal onSave={vi.fn()} onClose={vi.fn()} onRemove={vi.fn()} />,
    );
    expect(screen.getByText("imageCrop.delete")).toBeInTheDocument();
  });

  it("削除ボタンが表示されない (onRemoveがない場合)", () => {
    render(<ImageCropModal onSave={vi.fn()} onClose={vi.fn()} />);
    expect(screen.queryByText("imageCrop.delete")).not.toBeInTheDocument();
  });

  it("カスタムタイトルが表示される", () => {
    render(
      <ImageCropModal
        onSave={vi.fn()}
        onClose={vi.fn()}
        title="カスタムタイトル"
      />,
    );
    expect(screen.getByText("カスタムタイトル")).toBeInTheDocument();
  });

  it("ズームスライダーで値が変更される", () => {
    render(
      <ImageCropModal
        initialImage="data:image/png;base64,test"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    const slider = screen.getByLabelText("imageCrop.zoom");
    expect(slider).toBeInTheDocument();
    fireEvent.change(slider, { target: { value: "2.5" } });
    expect(slider).toHaveValue("2.5");
  });

  it("別の画像を選択ボタンがファイル入力をトリガーする", () => {
    render(
      <ImageCropModal
        initialImage="data:image/png;base64,test"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, "click");
    fireEvent.click(screen.getByText("imageCrop.selectOtherImage"));
    expect(clickSpy).toHaveBeenCalled();
  });

  it("画像未選択時のファイル選択ボタンがファイル入力をトリガーする", () => {
    render(<ImageCropModal onSave={vi.fn()} onClose={vi.fn()} />);
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, "click");
    fireEvent.click(screen.getByText("imageCrop.clickToSelect"));
    expect(clickSpy).toHaveBeenCalled();
  });

  it("ファイル選択で画像ファイルを選択するとCropperが表示される", async () => {
    render(<ImageCropModal onSave={vi.fn()} onClose={vi.fn()} />);
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const file = new File(["dummy"], "test.png", { type: "image/png" });
    Object.defineProperty(file, "size", { value: 1024 });

    // Mock FileReader
    const mockResult = "data:image/png;base64,mockdata";
    const originalFileReader = global.FileReader;
    const mockFileReader = {
      readAsDataURL: vi.fn(),
      result: mockResult,
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
    };
    vi.spyOn(global, "FileReader").mockImplementation(
      () => mockFileReader as unknown as FileReader,
    );

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Trigger onload callback
    await act(async () => {
      mockFileReader.onload?.();
    });

    await screen.findByTestId("cropper");
    global.FileReader = originalFileReader;
  });

  it("削除ボタンでonRemoveとonCloseが呼ばれる", () => {
    const onRemove = vi.fn();
    const onClose = vi.fn();
    render(
      <ImageCropModal onSave={vi.fn()} onClose={onClose} onRemove={onRemove} />,
    );
    fireEvent.click(screen.getByText("imageCrop.delete"));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("保存ボタンはimageSrcがない場合は無効", () => {
    render(<ImageCropModal onSave={vi.fn()} onClose={vi.fn()} />);
    const saveButton = screen.getByText("imageCrop.save");
    expect(saveButton).toBeDisabled();
  });

  it("ズームスライダーの値を1から3の範囲で変更できる", () => {
    render(
      <ImageCropModal
        initialImage="data:image/png;base64,test"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    const slider = screen.getByLabelText("imageCrop.zoom");
    fireEvent.change(slider, { target: { value: "1" } });
    expect(slider).toHaveValue("1");
    fireEvent.change(slider, { target: { value: "3" } });
    expect(slider).toHaveValue("3");
  });

  it("非画像ファイルを選択するとエラーになりCropperは表示されない", () => {
    render(<ImageCropModal onSave={vi.fn()} onClose={vi.fn()} />);
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const file = new File(["dummy"], "test.txt", { type: "text/plain" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.queryByTestId("cropper")).not.toBeInTheDocument();
  });

  it("ファイルが空の場合は何も起きない", () => {
    render(<ImageCropModal onSave={vi.fn()} onClose={vi.fn()} />);
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [] } });

    expect(screen.queryByTestId("cropper")).not.toBeInTheDocument();
  });

  it("initialImage有りで保存ボタンをクリックするとhandleSaveが実行される（croppedAreaPixelsがnullの場合は何もしない）", () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(
      <ImageCropModal
        initialImage="data:image/png;base64,test"
        onSave={onSave}
        onClose={onClose}
      />,
    );

    // Save button is disabled when croppedAreaPixels is null
    const saveButton = screen.getByText("imageCrop.save");
    fireEvent.click(saveButton);

    // onSave should not be called since croppedAreaPixels is null
    expect(onSave).not.toHaveBeenCalled();
  });
});
