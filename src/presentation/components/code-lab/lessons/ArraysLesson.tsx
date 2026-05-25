/**
 * @module ArraysLesson
 * @description レッスン2: 配列とループ。11人のスタメンを管理しながら配列と繰り返し処理を学ぶ。
 */
import { useState } from "react";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { LessonLayout } from "../LessonLayout";
import { CodeBlock } from "../CodeBlock";
import { DemoCanvas } from "../DemoCanvas";
import { MiniPitch } from "../MiniPitch";
import { PlayerMarker } from "../PlayerMarker";

const PLAYERS = [
  { name: "GK", number: 1, x: 0, z: -5.5, color: "#eab308" },
  { name: "CB", number: 4, x: -2.5, z: -3.5, color: "#3b82f6" },
  { name: "CB", number: 5, x: 0, z: -3.5, color: "#3b82f6" },
  { name: "CB", number: 3, x: 2.5, z: -3.5, color: "#3b82f6" },
  { name: "RB", number: 2, x: -4, z: -1.5, color: "#3b82f6" },
  { name: "LB", number: 6, x: 4, z: -1.5, color: "#3b82f6" },
  { name: "CM", number: 8, x: -1.5, z: 0, color: "#3b82f6" },
  { name: "CM", number: 10, x: 1.5, z: 0, color: "#3b82f6" },
  { name: "RW", number: 7, x: -3.5, z: 3, color: "#3b82f6" },
  { name: "ST", number: 9, x: 0, z: 4.5, color: "#3b82f6" },
  { name: "LW", number: 11, x: 3.5, z: 3, color: "#3b82f6" },
];

const CODE = `// 選手の配列を作る
const players = [
  { name: "GK", number: 1, x: 0,  z: -5.5 },
  { name: "CB", number: 4, x: -2.5, z: -3.5 },
  { name: "CB", number: 5, x: 0,  z: -3.5 },
  // ... 残り8人
];

// map で全員をピッチに配置する
players.map((player) => (
  <PlayerMarker
    name={player.name}
    number={player.number}
    position={[player.x, 0, player.z]}
  />
));

// filter で特定のポジションだけ抽出
const defenders = players.filter(
  (p) => p.name === "CB" || p.name === "RB" || p.name === "LB"
);`;

export function ArraysLesson() {
  const { language } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(11);
  const [filterPosition, setFilterPosition] = useState<string>("all");

  const filteredPlayers = PLAYERS.filter((p) => {
    if (filterPosition === "all") return true;
    if (filterPosition === "df") return ["CB", "RB", "LB"].includes(p.name);
    if (filterPosition === "mf") return ["CM"].includes(p.name);
    if (filterPosition === "fw") return ["RW", "LW", "ST"].includes(p.name);
    if (filterPosition === "gk") return p.name === "GK";
    return true;
  }).slice(0, visibleCount);

  return (
    <LessonLayout lessonId="arrays">
      <div className="mb-8">
        <div className="text-4xl mb-3" aria-hidden="true">
          👥
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
          {language === "ja" ? "配列とループ" : "Arrays & Loops"}
        </h1>
        <p className="text-slate-400">
          {language === "ja"
            ? "配列(Array)は複数のデータをまとめて管理する仕組みです。11人の選手を1つの配列に入れて、ループで全員をピッチに配置してみましょう。"
            : "An Array is a structure for managing multiple items together. Let's put 11 players into one array and place them all on the pitch using a loop."}
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {language === "ja" ? "map と filter" : "map and filter"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-blue-400 font-mono text-sm mb-1">.map()</div>
            <div className="text-slate-400 text-xs">
              {language === "ja"
                ? "配列の各要素に同じ処理を適用する。全員をピッチに配置するのに使う。"
                : "Apply the same operation to each element. Used to place all players on the pitch."}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-emerald-400 font-mono text-sm mb-1">
              .filter()
            </div>
            <div className="text-slate-400 text-xs">
              {language === "ja"
                ? "条件に合う要素だけを抽出する。DFだけ、FWだけなど。"
                : "Extract only elements that match a condition. Only defenders, only forwards, etc."}
            </div>
          </div>
        </div>
        <CodeBlock code={CODE} highlightLines={[10, 19]} />
      </section>

      <section>
        <h2 className="text-lg font-bold text-white mb-4">
          {language === "ja"
            ? "試してみよう: 表示する選手を変えてみよう"
            : "Try It Out: Change which players are displayed"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              {language === "ja" ? "表示人数" : "Players shown"}{" "}
              <span className="font-mono text-blue-400">
                .slice(0, {visibleCount})
              </span>
            </label>
            <input
              type="range"
              min={1}
              max={11}
              value={visibleCount}
              onChange={(e) => setVisibleCount(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="text-xs text-slate-500 text-right">
              {visibleCount} / 11
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              {language === "ja" ? "ポジションフィルター" : "Position filter"}{" "}
              <span className="font-mono text-emerald-400">.filter()</span>
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { value: "all", label: language === "ja" ? "全員" : "All" },
                { value: "gk", label: "GK" },
                { value: "df", label: "DF" },
                { value: "mf", label: "MF" },
                { value: "fw", label: "FW" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterPosition(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    filterPosition === opt.value
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DemoCanvas>
          <MiniPitch />
          {filteredPlayers.map((p, i) => (
            <PlayerMarker
              key={i}
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
