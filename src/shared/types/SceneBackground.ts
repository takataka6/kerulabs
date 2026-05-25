export interface LinearGradientBackground {
  kind: "linear";
  from: string;
  mid: string | null;
  midPosition: number;
  midWidth: number;
  to: string;
  angle: number;
  presetId: string | null;
}

export type SceneBackgroundPreferenceV1 =
  | {
      version: 1;
      mode: "none";
    }
  | {
      version: 1;
      mode: "solid";
      color: string;
    }
  | {
      version: 1;
      mode: "gradient";
      gradient: LinearGradientBackground;
    }
  | {
      version: 1;
      mode: "image";
    };

export interface GradientPreset {
  id: string;
  name: string;
  from: string;
  mid: string | null;
  midPosition: number;
  midWidth: number;
  to: string;
  angle: number;
  colorCount: 2 | 3;
}
