import React, { useImperativeHandle } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { Vector3 } from "three";
import { PlayerCameraController } from "../PlayerCameraController";

const mockSetLookAt = vi.fn();
const mockUpdate = vi.fn();
const mockGetPosition = vi.fn();
const mockGetTarget = vi.fn();
let frameCallback: ((state: unknown, delta: number) => void) | null = null;

const mockControls = {
  setLookAt: mockSetLookAt,
  update: mockUpdate,
  getPosition: mockGetPosition,
  getTarget: mockGetTarget,
  azimuthAngle: 0,
  minAzimuthAngle: -Infinity,
  maxAzimuthAngle: Infinity,
};

vi.mock("@react-three/fiber", () => ({
  useFrame: (callback: (state: unknown, delta: number) => void) => {
    frameCallback = callback;
  },
  useThree: () => ({
    gl: {
      domElement: {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    },
  }),
}));

vi.mock("@react-three/drei", () => ({
  CameraControls: React.forwardRef(function CameraControls(_, ref) {
    useImperativeHandle(ref, () => mockControls);
    return <div data-testid="camera-controls" />;
  }),
}));

describe("PlayerCameraController", () => {
  beforeEach(() => {
    frameCallback = null;
    mockSetLookAt.mockClear();
    mockUpdate.mockClear();
    mockGetPosition.mockImplementation((out: Vector3) => out.set(11, 12, 13));
    mockGetTarget.mockImplementation((out: Vector3) => out.set(1, 2, 3));
  });

  it("選手視点を解除した際に、入る前のカメラ視点へ戻す", () => {
    const { rerender } = render(
      <PlayerCameraController
        selectedPlayerIndex={0}
        playerPositions={{ 0: { x: 0, z: 0 } }}
        isPlayerView={false}
        isDraggingObject={false}
      />,
    );

    rerender(
      <PlayerCameraController
        selectedPlayerIndex={0}
        playerPositions={{ 0: { x: 0, z: 0 } }}
        isPlayerView={true}
        isDraggingObject={false}
      />,
    );

    frameCallback?.({}, 0.016);

    rerender(
      <PlayerCameraController
        selectedPlayerIndex={0}
        playerPositions={{ 0: { x: 0, z: 0 } }}
        isPlayerView={false}
        isDraggingObject={false}
      />,
    );

    frameCallback?.({}, 0.016);

    expect(mockSetLookAt).toHaveBeenLastCalledWith(11, 12, 13, 1, 2, 3, true);
  });
});
