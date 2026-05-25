/**
 * @module VariablesLesson
 * @description レッスン1: 変数と型。選手の名前・背番号・ポジションを通じて変数とデータ型を学ぶ。
 */
import { useState } from "react";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { LessonLayout } from "../LessonLayout";
import { CodeBlock } from "../CodeBlock";
import { DemoCanvas } from "../DemoCanvas";
import { MiniPitch } from "../MiniPitch";
import { PlayerMarker } from "../PlayerMarker";

const CODE = `// 変数を宣言する
const name: string = "Tanaka";   // 文字列 (string)
const number: number = 10;        // 数値 (number)
const isStarter: boolean = true;  // 真偽値 (boolean)

// 変数の値を使って選手マーカーを表示する
<PlayerMarker
  name={name}       // → "Tanaka"
  number={number}   // → 10
  color={isStarter ? "#3b82f6" : "#64748b"}
/>`;

export function VariablesLesson() {
  const { language } = useLanguage();
  const [playerName, setPlayerName] = useState("Tanaka");
  const [playerNumber, setPlayerNumber] = useState(10);
  const [isStarter, setIsStarter] = useState(true);

  return (
    <LessonLayout lessonId="variables">
      <div className="mb-8">
        <div className="text-4xl mb-3" aria-hidden="true">
          🏷️
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
          {language === "ja" ? "変数と型" : "Variables & Types"}
        </h1>
        <p className="text-slate-400">
          {language === "ja"
            ? "プログラミングでは、データに名前をつけて保存できます。これを「変数」と呼びます。サッカー選手のプロフィールを例に学びましょう。"
            : "In programming, you can store data with a name. This is called a 'variable'. Let's learn using a soccer player's profile."}
        </p>
      </div>

      {/* 解説 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {language === "ja"
            ? "3つの基本的なデータ型"
            : "Three Basic Data Types"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-emerald-400 font-mono text-sm mb-1">
              string
            </div>
            <div className="text-white font-bold mb-1">
              {language === "ja" ? "文字列" : "Text"}
            </div>
            <div className="text-slate-400 text-xs">
              {language === "ja"
                ? '名前など。 "Tanaka"'
                : 'Names, etc. "Tanaka"'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-blue-400 font-mono text-sm mb-1">number</div>
            <div className="text-white font-bold mb-1">
              {language === "ja" ? "数値" : "Number"}
            </div>
            <div className="text-slate-400 text-xs">
              {language === "ja" ? "背番号など。 10" : "Jersey number, etc. 10"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-amber-400 font-mono text-sm mb-1">boolean</div>
            <div className="text-white font-bold mb-1">
              {language === "ja" ? "真偽値" : "True/False"}
            </div>
            <div className="text-slate-400 text-xs">
              {language === "ja"
                ? "スタメンかどうか。 true"
                : "Is starter? true"}
            </div>
          </div>
        </div>
        <CodeBlock code={CODE} highlightLines={[2, 3, 4]} />
      </section>

      {/* インタラクティブデモ */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">
          {language === "ja"
            ? "試してみよう: 変数の値を変えてみよう"
            : "Try It Out: Change the variable values"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              <span className="font-mono text-emerald-400">name</span>: string
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                maxLength={12}
              />
            </label>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              <span className="font-mono text-blue-400">number</span>: number
              <input
                type="number"
                value={playerNumber}
                onChange={(e) =>
                  setPlayerNumber(
                    Math.max(1, Math.min(99, parseInt(e.target.value) || 1)),
                  )
                }
                className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                min={1}
                max={99}
              />
            </label>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              <span className="font-mono text-amber-400">isStarter</span>:{" "}
              boolean
            </label>
            <button
              onClick={() => setIsStarter(!isStarter)}
              className={`w-full px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                isStarter
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-400"
              }`}
            >
              {isStarter ? "true" : "false"}
            </button>
          </div>
        </div>

        <DemoCanvas>
          <MiniPitch />
          <PlayerMarker
            position={[0, 0, 0]}
            color={isStarter ? "#3b82f6" : "#64748b"}
            number={playerNumber}
            name={playerName}
          />
        </DemoCanvas>
      </section>
    </LessonLayout>
  );
}
