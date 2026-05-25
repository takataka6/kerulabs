/**
 * @module FunctionsLesson
 * @description レッスン4: 関数。フォーメーション配置の計算を通じて関数の作り方と使い方を学ぶ。
 */
import { useState } from "react";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { LessonLayout } from "../LessonLayout";
import { CodeBlock } from "../CodeBlock";
import { DemoCanvas } from "../DemoCanvas";
import { MiniPitch } from "../MiniPitch";
import { PlayerMarker } from "../PlayerMarker";

type FormationKey = "4-3-3" | "4-4-2" | "3-5-2";

interface PlayerPosition {
  x: number;
  z: number;
  name: string;
  number: number;
  color: string;
}

function getFormation(formation: FormationKey): PlayerPosition[] {
  const gk: PlayerPosition = {
    x: 0,
    z: -5.5,
    name: "GK",
    number: 1,
    color: "#eab308",
  };

  const formations: Record<FormationKey, PlayerPosition[]> = {
    "4-3-3": [
      gk,
      { x: -3.5, z: -3.5, name: "LB", number: 3, color: "#3b82f6" },
      { x: -1.2, z: -4, name: "CB", number: 4, color: "#3b82f6" },
      { x: 1.2, z: -4, name: "CB", number: 5, color: "#3b82f6" },
      { x: 3.5, z: -3.5, name: "RB", number: 2, color: "#3b82f6" },
      { x: -2, z: -0.5, name: "CM", number: 6, color: "#3b82f6" },
      { x: 0, z: 0, name: "CM", number: 8, color: "#3b82f6" },
      { x: 2, z: -0.5, name: "CM", number: 10, color: "#3b82f6" },
      { x: -3.5, z: 3, name: "LW", number: 11, color: "#3b82f6" },
      { x: 0, z: 4.5, name: "ST", number: 9, color: "#3b82f6" },
      { x: 3.5, z: 3, name: "RW", number: 7, color: "#3b82f6" },
    ],
    "4-4-2": [
      gk,
      { x: -3.5, z: -3.5, name: "LB", number: 3, color: "#3b82f6" },
      { x: -1.2, z: -4, name: "CB", number: 4, color: "#3b82f6" },
      { x: 1.2, z: -4, name: "CB", number: 5, color: "#3b82f6" },
      { x: 3.5, z: -3.5, name: "RB", number: 2, color: "#3b82f6" },
      { x: -3.5, z: 0, name: "LM", number: 11, color: "#3b82f6" },
      { x: -1.2, z: -0.5, name: "CM", number: 6, color: "#3b82f6" },
      { x: 1.2, z: -0.5, name: "CM", number: 8, color: "#3b82f6" },
      { x: 3.5, z: 0, name: "RM", number: 7, color: "#3b82f6" },
      { x: -1.5, z: 4, name: "ST", number: 9, color: "#3b82f6" },
      { x: 1.5, z: 4, name: "ST", number: 10, color: "#3b82f6" },
    ],
    "3-5-2": [
      gk,
      { x: -2.5, z: -4, name: "CB", number: 4, color: "#3b82f6" },
      { x: 0, z: -4.5, name: "CB", number: 5, color: "#3b82f6" },
      { x: 2.5, z: -4, name: "CB", number: 3, color: "#3b82f6" },
      { x: -4, z: -1, name: "LWB", number: 6, color: "#3b82f6" },
      { x: -1.5, z: -0.5, name: "CM", number: 8, color: "#3b82f6" },
      { x: 0, z: 0.5, name: "CM", number: 10, color: "#3b82f6" },
      { x: 1.5, z: -0.5, name: "CM", number: 7, color: "#3b82f6" },
      { x: 4, z: -1, name: "RWB", number: 2, color: "#3b82f6" },
      { x: -1.5, z: 4, name: "ST", number: 9, color: "#3b82f6" },
      { x: 1.5, z: 4, name: "ST", number: 11, color: "#3b82f6" },
    ],
  };

  return formations[formation];
}

const CODE = `// 関数: 入力を受け取り、結果を返す
function getFormation(
  formation: string
): PlayerPosition[] {
  if (formation === "4-3-3") {
    return [
      { name: "GK", x: 0, z: -5.5 },
      { name: "LB", x: -3.5, z: -3.5 },
      { name: "CB", x: -1.2, z: -4 },
      // ... 残りの選手
    ];
  }
  if (formation === "4-4-2") {
    return [ /* 4-4-2 の配置 */ ];
  }
  // ...
}

// 関数を呼び出す
const positions = getFormation("4-3-3");
// → 11人分のポジション配列が返る`;

export function FunctionsLesson() {
  const { language } = useLanguage();
  const [formation, setFormation] = useState<FormationKey>("4-3-3");
  const players = getFormation(formation);

  return (
    <LessonLayout lessonId="functions">
      <div className="mb-8">
        <div className="text-4xl mb-3" aria-hidden="true">
          🔄
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
          {language === "ja" ? "関数" : "Functions"}
        </h1>
        <p className="text-slate-400">
          {language === "ja"
            ? "関数は「入力を受け取り、処理して、結果を返す」仕組みです。フォーメーション名を入力すると選手配置を返す関数を作ってみましょう。"
            : "A function takes input, processes it, and returns a result. Let's create a function that returns player positions based on a formation name."}
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {language === "ja"
            ? "関数の3つの要素"
            : "Three Elements of a Function"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-violet-400 font-bold text-sm mb-1">
              {language === "ja" ? "引数（入力）" : "Parameters (Input)"}
            </div>
            <div className="text-slate-400 text-xs">
              {language === "ja" ? 'formation: "4-3-3"' : 'formation: "4-3-3"'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-violet-400 font-bold text-sm mb-1">
              {language === "ja" ? "処理" : "Processing"}
            </div>
            <div className="text-slate-400 text-xs">
              {language === "ja"
                ? "フォーメーションに応じた座標を計算"
                : "Calculate coordinates based on formation"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-violet-400 font-bold text-sm mb-1">
              {language === "ja" ? "戻り値（出力）" : "Return Value (Output)"}
            </div>
            <div className="text-slate-400 text-xs">
              {language === "ja"
                ? "PlayerPosition[] (11人分の配置)"
                : "PlayerPosition[] (positions for 11)"}
            </div>
          </div>
        </div>
        <CodeBlock code={CODE} highlightLines={[2, 3, 4, 20]} />
      </section>

      <section>
        <h2 className="text-lg font-bold text-white mb-4">
          {language === "ja"
            ? "試してみよう: フォーメーションを切り替えよう"
            : "Try It Out: Switch formations"}
        </h2>

        <div className="mb-4">
          <label className="block text-xs text-slate-400 mb-2">
            <span className="font-mono text-violet-400">getFormation(</span>
            <span className="text-white font-bold">
              &quot;{formation}&quot;
            </span>
            <span className="font-mono text-violet-400">)</span>
          </label>
          <div className="flex gap-2">
            {(["4-3-3", "4-4-2", "3-5-2"] as FormationKey[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormation(f)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  formation === f
                    ? "bg-violet-600 text-white"
                    : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <DemoCanvas>
          <MiniPitch />
          {players.map((p, i) => (
            <PlayerMarker
              key={`${formation}-${i}`}
              position={[p.x, 0, p.z]}
              color={p.color}
              number={p.number}
              name={p.name}
            />
          ))}
        </DemoCanvas>
      </section>
    </LessonLayout>
  );
}
