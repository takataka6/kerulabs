/**
 * @module ObjectsLesson
 * @description レッスン5: オブジェクト。選手データの構造化を通じてオブジェクトの概念を学ぶ。
 */
import { useState } from "react";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { LessonLayout } from "../LessonLayout";
import { CodeBlock } from "../CodeBlock";
import { DemoCanvas } from "../DemoCanvas";
import { MiniPitch } from "../MiniPitch";
import { PlayerMarker } from "../PlayerMarker";

interface PlayerData {
  name: string;
  number: number;
  position: string;
  age: number;
  goals: number;
  x: number;
  z: number;
  color: string;
}

const PLAYERS: PlayerData[] = [
  {
    name: "Tanaka",
    number: 10,
    position: "MF",
    age: 26,
    goals: 12,
    x: 0,
    z: 0,
    color: "#3b82f6",
  },
  {
    name: "Suzuki",
    number: 9,
    position: "FW",
    age: 27,
    goals: 24,
    x: 0,
    z: 4.5,
    color: "#ef4444",
  },
  {
    name: "Yamada",
    number: 1,
    position: "GK",
    age: 28,
    goals: 0,
    x: 0,
    z: -5.5,
    color: "#eab308",
  },
  {
    name: "Sato",
    number: 11,
    position: "MF",
    age: 25,
    goals: 8,
    x: 2.5,
    z: 1,
    color: "#3b82f6",
  },
  {
    name: "Ito",
    number: 5,
    position: "DF",
    age: 27,
    goals: 3,
    x: -2,
    z: -3.5,
    color: "#22c55e",
  },
];

const CODE = `// オブジェクト: 関連するデータをまとめる
const player = {
  name: "Tanaka",       // 名前
  number: 10,            // 背番号
  position: "MF",        // ポジション
  age: 26,               // 年齢
  goals: 12,             // ゴール数
};

// プロパティにアクセスする
console.log(player.name);     // → "Tanaka"
console.log(player.goals);    // → 12

// 型を定義する (TypeScript)
interface Player {
  name: string;
  number: number;
  position: string;
  age: number;
  goals: number;
}`;

export function ObjectsLesson() {
  const { language } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedPlayer = selectedIndex !== null ? PLAYERS[selectedIndex] : null;

  return (
    <LessonLayout lessonId="objects">
      <div className="mb-8">
        <div className="text-4xl mb-3" aria-hidden="true">
          📋
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
          {language === "ja" ? "オブジェクト" : "Objects"}
        </h1>
        <p className="text-slate-400">
          {language === "ja"
            ? "オブジェクトは関連するデータをひとまとめにする仕組みです。選手の名前・背番号・ポジション・ゴール数などを1つのオブジェクトにまとめましょう。"
            : "An object groups related data together. Let's combine a player's name, number, position, and goals into a single object."}
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {language === "ja" ? "オブジェクトの構造" : "Object Structure"}
        </h2>
        <CodeBlock code={CODE} highlightLines={[2, 3, 4, 5, 6, 7, 8]} />
      </section>

      <section>
        <h2 className="text-lg font-bold text-white mb-4">
          {language === "ja"
            ? "試してみよう: 選手をクリックしてプロパティを確認しよう"
            : "Try It Out: Click a player to see their properties"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* 選手リスト */}
          <div className="space-y-2">
            {PLAYERS.map((p, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                  selectedIndex === i
                    ? "bg-blue-600/30 border border-blue-500"
                    : "bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50"
                }`}
              >
                <span className="text-white font-bold">{p.name}</span>
                <span className="text-slate-400 ml-2">#{p.number}</span>
              </button>
            ))}
          </div>

          {/* プロパティ表示 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm">
            {selectedPlayer ? (
              <>
                <div className="text-slate-500 mb-2">
                  {"// "}
                  {language === "ja" ? "プロパティ一覧" : "Properties"}
                </div>
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-400">player.</span>
                    <span className="text-emerald-400">name</span>
                    <span className="text-slate-400"> = </span>
                    <span className="text-amber-400">
                      &quot;{selectedPlayer.name}&quot;
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">player.</span>
                    <span className="text-emerald-400">number</span>
                    <span className="text-slate-400"> = </span>
                    <span className="text-blue-400">
                      {selectedPlayer.number}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">player.</span>
                    <span className="text-emerald-400">position</span>
                    <span className="text-slate-400"> = </span>
                    <span className="text-amber-400">
                      &quot;{selectedPlayer.position}&quot;
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">player.</span>
                    <span className="text-emerald-400">age</span>
                    <span className="text-slate-400"> = </span>
                    <span className="text-blue-400">{selectedPlayer.age}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">player.</span>
                    <span className="text-emerald-400">goals</span>
                    <span className="text-slate-400"> = </span>
                    <span className="text-blue-400">
                      {selectedPlayer.goals}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-slate-500">
                {language === "ja"
                  ? "← 選手を選択してください"
                  : "← Select a player"}
              </div>
            )}
          </div>
        </div>

        <DemoCanvas>
          <MiniPitch />
          {PLAYERS.map((p, i) => (
            <PlayerMarker
              key={i}
              position={[p.x, 0, p.z]}
              color={selectedIndex === i ? "#fbbf24" : p.color}
              number={p.number}
              name={p.name}
            />
          ))}
        </DemoCanvas>
      </section>
    </LessonLayout>
  );
}
