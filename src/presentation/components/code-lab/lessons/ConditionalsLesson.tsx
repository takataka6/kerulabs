/**
 * @module ConditionalsLesson
 * @description レッスン3: 条件分岐。オフサイド判定を通じてif/elseを学ぶ。
 */
import { useState } from "react";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { LessonLayout } from "../LessonLayout";
import { CodeBlock } from "../CodeBlock";
import { DemoCanvas } from "../DemoCanvas";
import { MiniPitch } from "../MiniPitch";
import { PlayerMarker } from "../PlayerMarker";

const CODE = `// オフサイドの判定
function isOffside(
  attackerZ: number,
  defenseLineZ: number
): boolean {
  if (attackerZ > defenseLineZ) {
    return true;   // オフサイド！
  } else {
    return false;  // オンサイド（OK）
  }
}

// 使い方
const defenseLineZ = 3.0;
const attackerZ = 4.5;

if (isOffside(attackerZ, defenseLineZ)) {
  marker.color = "red";     // 赤く表示
} else {
  marker.color = "blue";    // 青で表示
}`;

export function ConditionalsLesson() {
  const { language } = useLanguage();
  const [attackerZ, setAttackerZ] = useState(2.0);
  const defenseLineZ = 3.0;
  const isOffside = attackerZ > defenseLineZ;

  // DF ラインの選手
  const defenders = [
    { x: -3, z: defenseLineZ },
    { x: -1, z: defenseLineZ },
    { x: 1, z: defenseLineZ },
    { x: 3, z: defenseLineZ },
  ];

  return (
    <LessonLayout lessonId="conditionals">
      <div className="mb-8">
        <div className="text-4xl mb-3" aria-hidden="true">
          🚩
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
          {language === "ja" ? "条件分岐" : "Conditionals"}
        </h1>
        <p className="text-slate-400">
          {language === "ja"
            ? "プログラムは条件によって異なる動作をします。if/else を使って「もし〜なら」という判断を書けます。オフサイドルールで学びましょう。"
            : "Programs can behave differently based on conditions. Using if/else, you can write 'if this, then that' logic. Let's learn through the offside rule."}
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {language === "ja" ? "if / else の仕組み" : "How if / else works"}
        </h2>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-6">
          <div className="text-slate-300 text-sm">
            {language === "ja" ? (
              <>
                <span className="text-red-400 font-bold">オフサイド</span>
                : 攻撃選手がDFラインより前（ゴール側）にいる場合、オフサイド。
                <br />
                <code className="text-blue-400">
                  if (attackerZ {">"} defenseLineZ)
                </code>{" "}
                → true なら赤、false なら青。
              </>
            ) : (
              <>
                <span className="text-red-400 font-bold">Offside</span>: When an
                attacker is ahead of the defensive line (closer to the goal).
                <br />
                <code className="text-blue-400">
                  if (attackerZ {">"} defenseLineZ)
                </code>{" "}
                → true = red, false = blue.
              </>
            )}
          </div>
        </div>
        <CodeBlock code={CODE} highlightLines={[6, 7, 8, 9, 10]} />
      </section>

      <section>
        <h2 className="text-lg font-bold text-white mb-4">
          {language === "ja"
            ? "試してみよう: 攻撃選手を動かしてみよう"
            : "Try It Out: Move the attacker"}
        </h2>

        <div className="mb-4">
          <label className="block text-xs text-slate-400 mb-1">
            {language === "ja" ? "攻撃選手の位置" : "Attacker position"}{" "}
            <span className="font-mono text-blue-400">
              attackerZ = {attackerZ.toFixed(1)}
            </span>
          </label>
          <input
            type="range"
            min={-1}
            max={6}
            step={0.1}
            value={attackerZ}
            onChange={(e) => setAttackerZ(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>{language === "ja" ? "自陣側" : "Own half"}</span>
            <span className="text-amber-400">
              {language === "ja" ? "DFライン" : "Defense line"} (z ={" "}
              {defenseLineZ})
            </span>
            <span>{language === "ja" ? "ゴール側" : "Goal side"}</span>
          </div>
        </div>

        <div
          className={`mb-4 p-3 rounded-lg text-sm font-bold text-center transition-colors ${isOffside ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-green-500/20 text-green-400 border border-green-500/30"}`}
        >
          {isOffside
            ? language === "ja"
              ? "🚩 オフサイド！ (attackerZ > defenseLineZ → true)"
              : "🚩 Offside! (attackerZ > defenseLineZ → true)"
            : language === "ja"
              ? "✅ オンサイド (attackerZ > defenseLineZ → false)"
              : "✅ Onside (attackerZ > defenseLineZ → false)"}
        </div>

        <DemoCanvas>
          <MiniPitch />

          {/* DFライン表示 */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={
                  new Float32Array([
                    -5,
                    0.02,
                    defenseLineZ,
                    5,
                    0.02,
                    defenseLineZ,
                  ])
                }
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#fbbf24" transparent opacity={0.8} />
          </line>

          {/* DF */}
          {defenders.map((d, i) => (
            <PlayerMarker
              key={`df-${i}`}
              position={[d.x, 0, d.z]}
              color="#3b82f6"
              number={2 + i}
              showName={false}
            />
          ))}

          {/* 攻撃選手 */}
          <PlayerMarker
            position={[0, 0, attackerZ]}
            color={isOffside ? "#ef4444" : "#22c55e"}
            number={9}
            name={isOffside ? "OFFSIDE" : "ONSIDE"}
          />
        </DemoCanvas>
      </section>
    </LessonLayout>
  );
}
