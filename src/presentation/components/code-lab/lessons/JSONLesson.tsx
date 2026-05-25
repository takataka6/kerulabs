/**
 * @module JSONLesson
 * @description レッスン: JSON。データの保存・共有に使われるJSON形式の構造とルールを学ぶ。
 */
import { useState } from "react";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { LessonLayout } from "../LessonLayout";
import { CodeBlock } from "../CodeBlock";
import { DemoCanvas } from "../DemoCanvas";
import { MiniPitch } from "../MiniPitch";
import { PlayerMarker } from "../PlayerMarker";

const BASIC_CODE = `// JSON = JavaScript Object Notation
// データを「キー: 値」のペアで表現する

{
  "name": "Tanaka",
  "number": 10,
  "position": "mf",
  "isStarter": true
}

// ルール:
// - キーは必ずダブルクォート " で囲む
// - 文字列もダブルクォート
// - 末尾のカンマ（trailing comma）は禁止
// - コメントは書けない`;

const TYPES_CODE = `// JSON で使えるデータ型（6種類）

{
  "string":  "文字列",
  "number":  10,
  "boolean": true,
  "null":    null,
  "array":   [1, 2, 3],
  "object":  { "key": "value" }
}

// 使えないもの:
// - undefined
// - 関数
// - Date オブジェクト（文字列に変換が必要）`;

const APP_CODE = `// このアプリでの JSON の使い方

// 1. 多言語対応（i18n）
// src/shared/i18n/locales/ja.json
{
  "tactics.simulator": "戦術シミュレーター",
  "player.name": "名前",
  "player.number": "背番号"
}

// 2. バックアップ・復元
// kerulabs-backup-2026-03-14.json
{
  "teams": [{ "id": "...", "name": "..." }],
  "formations": [...],
  "tactics": [...]
}

// 3. 選手インポート
[
  { "name": "Tanaka", "number": 10, "position": "mf" },
  { "name": "Suzuki", "number": 9, "position": "fw" }
]`;

const PARSE_CODE = `// TypeScript で JSON を扱う

// オブジェクト → JSON文字列
const player = { name: "Tanaka", number: 10 };
const json = JSON.stringify(player);
// → '{"name":"Tanaka","number":10}'

// JSON文字列 → オブジェクト
const parsed = JSON.parse(json);
// → { name: "Tanaka", number: 10 }

// 整形して表示（第3引数 = インデント数）
const pretty = JSON.stringify(player, null, 2);
// → {
//     "name": "Tanaka",
//     "number": 10
//   }`;

interface PlayerData {
  name: string;
  number: number;
  position: string;
}

export function JSONLesson() {
  const { language } = useLanguage();
  const [jsonInput, setJsonInput] = useState(
    '[\n  { "name": "Tanaka", "number": 10, "position": "mf" },\n  { "name": "Suzuki", "number": 9, "position": "fw" }\n]',
  );
  const [parsedPlayers, setParsedPlayers] = useState<PlayerData[]>([
    { name: "Tanaka", number: 10, position: "mf" },
    { name: "Suzuki", number: 9, position: "fw" },
  ]);
  const [parseError, setParseError] = useState<string | null>(null);
  const ja = language === "ja";

  const handleParse = () => {
    try {
      const data = JSON.parse(jsonInput);
      if (!Array.isArray(data)) {
        setParseError(
          ja ? "配列形式で入力してください" : "Please enter an array",
        );
        setParsedPlayers([]);
        return;
      }
      const players: PlayerData[] = data
        .filter(
          (d: Record<string, unknown>) =>
            typeof d.name === "string" && typeof d.number === "number",
        )
        .slice(0, 5);
      setParsedPlayers(players);
      setParseError(null);
    } catch {
      setParseError(ja ? "JSON の構文エラーです" : "JSON syntax error");
      setParsedPlayers([]);
    }
  };

  const positionToZ: Record<string, number> = {
    gk: -5,
    df: -3,
    mf: 0,
    fw: 3,
  };

  return (
    <LessonLayout lessonId="json">
      <div className="mb-8">
        <div className="text-4xl mb-3" aria-hidden="true">
          📄
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
          JSON
        </h1>
        <p className="text-slate-400">
          {ja
            ? "JSON（JavaScript Object Notation）は、データを構造化して保存・共有するための形式です。設定ファイル、API通信、データのインポート/エクスポートなど、あらゆる場面で使われます。"
            : "JSON (JavaScript Object Notation) is a format for structuring, storing, and sharing data. It's used everywhere: config files, API communication, data import/export, and more."}
        </p>
      </div>

      {/* 基本構造 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "基本構造" : "Basic Structure"}
        </h2>
        <CodeBlock code={BASIC_CODE} highlightLines={[4, 5, 6, 7, 8, 9]} />
      </section>

      {/* データ型 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "使えるデータ型" : "Available Data Types"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {[
            { type: "string", example: '"abc"', color: "text-amber-400" },
            { type: "number", example: "10", color: "text-blue-400" },
            {
              type: "boolean",
              example: "true / false",
              color: "text-emerald-400",
            },
            { type: "null", example: "null", color: "text-slate-400" },
            { type: "array", example: "[1, 2, 3]", color: "text-violet-400" },
            { type: "object", example: '{ "k": "v" }', color: "text-pink-400" },
          ].map((t) => (
            <div
              key={t.type}
              className="p-3 rounded-lg bg-slate-800/50 border border-slate-700"
            >
              <div className={`font-mono text-sm font-bold ${t.color}`}>
                {t.type}
              </div>
              <div className="text-slate-400 text-xs font-mono mt-1">
                {t.example}
              </div>
            </div>
          ))}
        </div>
        <CodeBlock
          code={TYPES_CODE}
          highlightLines={[3, 4, 5, 6, 7, 8, 9, 10]}
        />
      </section>

      {/* インタラクティブデモ */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja
            ? "試してみよう: JSONを編集してピッチに配置"
            : "Try It Out: Edit JSON and place on pitch"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              JSON.parse(input)
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={6}
                className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-blue-500 resize-none"
              />
            </label>
            <button
              type="button"
              onClick={handleParse}
              className="mt-2 w-full px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {ja ? "パースして配置" : "Parse & Place"}
            </button>
            {parseError && (
              <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                {parseError}
              </div>
            )}
          </div>
          <div className="rounded-xl bg-slate-950 border border-slate-700 p-4 font-mono text-xs">
            <div className="text-slate-500 mb-2">
              {"// "}
              {ja ? "パース結果" : "Parse result"}
            </div>
            {parsedPlayers.length > 0 ? (
              parsedPlayers.map((p, i) => (
                <div key={i} className="mb-1">
                  <span className="text-slate-400">players[{i}]</span>
                  <span className="text-slate-500"> = </span>
                  <span className="text-emerald-400">
                    {`{ name: "${p.name}", number: ${p.number} }`}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-slate-600">
                {ja ? "パース待ち..." : "Waiting for parse..."}
              </div>
            )}
          </div>
        </div>
        <DemoCanvas cameraPosition={[0, 12, -8]}>
          <MiniPitch />
          {parsedPlayers.map((p, i) => (
            <PlayerMarker
              key={`${p.name}-${i}`}
              position={[
                (i - (parsedPlayers.length - 1) / 2) * 2.5,
                0,
                positionToZ[p.position] ?? 0,
              ]}
              color={
                p.position === "gk"
                  ? "#eab308"
                  : p.position === "fw"
                    ? "#ef4444"
                    : "#3b82f6"
              }
              number={p.number}
              name={p.name}
            />
          ))}
        </DemoCanvas>
      </section>

      {/* このアプリでの使い方 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "このアプリでの使い方" : "Usage in This App"}
        </h2>
        <CodeBlock
          code={APP_CODE}
          highlightLines={[5, 6, 7, 8, 9, 13, 14, 15, 16, 17, 20, 21, 22, 23]}
        />
      </section>

      {/* JSON.stringify / JSON.parse */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "TypeScript での変換" : "Converting in TypeScript"}
        </h2>
        <CodeBlock code={PARSE_CODE} highlightLines={[5, 9, 13]} />
      </section>
    </LessonLayout>
  );
}
