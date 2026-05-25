/**
 * @module SingletonLesson
 * @description レッスン: Singleton パターン。DB接続を1つだけに制限する仕組みを学ぶ。
 */
import { useState } from "react";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { LessonLayout } from "../LessonLayout";
import { CodeBlock } from "../CodeBlock";
import { DemoCanvas } from "../DemoCanvas";
import { PlayerMarker } from "../PlayerMarker";

const PROBLEM_CODE = `// ❌ 問題: new するたびに接続が増える
const db1 = new IndexedDBClient();  // 接続1
const db2 = new IndexedDBClient();  // 接続2
const db3 = new IndexedDBClient();  // 接続3

// リポジトリごとに別の接続を作ってしまう
class TeamRepository {
  private client = new IndexedDBClient();  // 接続4
}
class TacticRepository {
  private client = new IndexedDBClient();  // 接続5
}

// → リソースの無駄 & データ不整合のリスク`;

const SINGLETON_CODE = `// ✅ 解決: Singleton パターン
// src/infrastructure/repositories/indexeddb/IndexedDBClient.ts

export class IndexedDBClient {
  // 1. 唯一のインスタンスを保持する静的変数
  private static instance: IndexedDBClient;

  // 2. private constructor → 外部から new できない
  private constructor() {}

  // 3. インスタンスを取得する唯一の方法
  static getInstance(): IndexedDBClient {
    if (!IndexedDBClient.instance) {
      // 初回だけ生成
      IndexedDBClient.instance = new IndexedDBClient();
    }
    return IndexedDBClient.instance;
    // 2回目以降は同じインスタンスを返す
  }

  // DB接続もキャッシュする（遅延初期化）
  private db: IDBPDatabase | null = null;

  async getDB(): Promise<IDBPDatabase> {
    if (this.db) {
      return this.db;  // キャッシュされた接続を返す
    }
    this.db = await openDB("tactics_db", ...);
    return this.db;
  }
}`;

const USAGE_CODE = `// 使い方: どこから呼んでも同じインスタンス

// リポジトリA
class TeamRepository {
  private client = IndexedDBClient.getInstance();
}

// リポジトリB
class TacticRepository {
  private client = IndexedDBClient.getInstance();
}

// App.tsx での初期化
const client = IndexedDBClient.getInstance();
await client.getDB();

// 全部同じインスタンス！
// client === TeamRepository の client
//        === TacticRepository の client`;

const EVENTBUS_CODE = `// EventBus も Singleton パターンを使っている
// src/domain/events/EventBus.ts

export class EventBus {
  private static instance: EventBus;

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
}

// どこから subscribe/publish しても同じバスを共有
// → イベントが確実に届く`;

interface InstanceDemo {
  id: number;
  caller: string;
}

export function SingletonLesson() {
  const { language } = useLanguage();
  const [instances, setInstances] = useState<InstanceDemo[]>([]);
  const [singletonMode, setSingletonMode] = useState(true);
  const [nextId, setNextId] = useState(1);
  const ja = language === "ja";

  const callers = [
    { name: "TeamRepository", color: "text-blue-400" },
    { name: "TacticRepository", color: "text-emerald-400" },
    { name: "FormationRepository", color: "text-amber-400" },
    { name: "App.tsx", color: "text-violet-400" },
  ];

  const handleGetInstance = (caller: string) => {
    if (singletonMode) {
      // Singleton: 常にID=1を返す
      const existing = instances.find((i) => i.id === 1);
      if (!existing) {
        setInstances([{ id: 1, caller }]);
      } else {
        // 既存インスタンスを返す（追加しない）
        setInstances((prev) =>
          prev.map((i) => (i.id === 1 ? { ...i, caller } : i)),
        );
      }
    } else {
      // new: 毎回新しいインスタンス
      setInstances((prev) => [...prev, { id: nextId, caller }]);
      setNextId((n) => n + 1);
    }
  };

  const handleReset = () => {
    setInstances([]);
    setNextId(1);
  };

  return (
    <LessonLayout lessonId="singleton">
      <div className="mb-8">
        <div className="text-4xl mb-3" aria-hidden="true">
          🔒
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
          {ja ? "Singleton パターン" : "Singleton Pattern"}
        </h1>
        <p className="text-slate-400">
          {ja
            ? "Singleton は「インスタンスを1つだけに制限する」パターンです。DB接続のように、複数あるとリソースの無駄やデータ不整合が起きるものに使います。"
            : "Singleton restricts a class to a single instance. Used for things like DB connections where multiples cause resource waste or data inconsistency."}
        </p>
      </div>

      {/* 問題 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja
            ? "問題: new するたびに増える"
            : "Problem: new Creates More Each Time"}
        </h2>
        <CodeBlock code={PROBLEM_CODE} highlightLines={[2, 3, 4, 8, 11]} />
      </section>

      {/* インタラクティブデモ */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja
            ? "試してみよう: new vs getInstance"
            : "Try It Out: new vs getInstance"}
        </h2>

        <div className="flex gap-3 mb-4">
          <button
            type="button"
            onClick={() => {
              setSingletonMode(true);
              handleReset();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              singletonMode
                ? "bg-green-600 text-white"
                : "bg-slate-700 text-slate-400 hover:bg-slate-600"
            }`}
          >
            getInstance() — Singleton
          </button>
          <button
            type="button"
            onClick={() => {
              setSingletonMode(false);
              handleReset();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              !singletonMode
                ? "bg-red-600 text-white"
                : "bg-slate-700 text-slate-400 hover:bg-slate-600"
            }`}
          >
            new — {ja ? "毎回生成" : "Create Each Time"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* 呼び出しボタン */}
          <div>
            <div className="text-xs text-slate-400 mb-2 font-bold">
              {ja
                ? "クリックしてインスタンスを要求"
                : "Click to request instance"}
            </div>
            <div className="space-y-2">
              {callers.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handleGetInstance(c.name)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
                >
                  <span className={c.color}>{c.name}</span>
                  <span className="text-slate-500 ml-1">
                    {singletonMode
                      ? ".getInstance()"
                      : " = new IndexedDBClient()"}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="mt-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {ja ? "リセット" : "Reset"}
            </button>
          </div>

          {/* インスタンス表示 */}
          <div className="rounded-xl bg-slate-950 border border-slate-700 p-4">
            <div className="text-xs text-slate-400 mb-2 font-bold">
              {ja ? "生成されたインスタンス" : "Created instances"}
            </div>
            {instances.length === 0 ? (
              <div className="text-slate-600 text-xs">
                {ja ? "← ボタンを押してみよう" : "← Try pressing a button"}
              </div>
            ) : (
              <div className="space-y-2">
                {instances.map((inst, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded bg-slate-800 text-xs font-mono"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        singletonMode
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {inst.id}
                    </div>
                    <span className="text-slate-400">
                      IndexedDBClient #{inst.id}
                    </span>
                    <span className="text-slate-600 ml-auto">
                      ← {inst.caller}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div
              className={`mt-3 p-2 rounded text-xs font-bold text-center ${
                singletonMode
                  ? "bg-green-500/10 text-green-400"
                  : instances.length > 1
                    ? "bg-red-500/10 text-red-400"
                    : "bg-slate-800 text-slate-500"
              }`}
            >
              {singletonMode
                ? ja
                  ? `✓ 常に同じインスタンス（#1）`
                  : `✓ Always the same instance (#1)`
                : instances.length > 1
                  ? ja
                    ? `✗ ${instances.length}個のインスタンスが存在`
                    : `✗ ${instances.length} instances exist`
                  : ja
                    ? "まだ1つ"
                    : "Only one so far"}
            </div>
          </div>
        </div>
      </section>

      {/* 3Dデモ: 接続の可視化 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "接続の可視化" : "Visualizing Connections"}
        </h2>
        <DemoCanvas cameraPosition={[0, 10, -6]}>
          {/* 中央のDB */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.2, 32]} />
            <meshStandardMaterial
              color={singletonMode ? "#22c55e" : "#ef4444"}
              emissive={singletonMode ? "#22c55e" : "#ef4444"}
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.7, 0.8, 32]} />
            <meshBasicMaterial
              color={singletonMode ? "#22c55e" : "#ef4444"}
              transparent
              opacity={0.3}
            />
          </mesh>
          {/* Repo markers */}
          {instances.length > 0 && (
            <>
              <PlayerMarker
                position={[-3, 0, -2]}
                color="#3b82f6"
                number={1}
                name="Team"
                showName
              />
              <PlayerMarker
                position={[3, 0, -2]}
                color="#f59e0b"
                number={2}
                name="Tactic"
                showName
              />
              <PlayerMarker
                position={[-3, 0, 2]}
                color="#8b5cf6"
                number={3}
                name="Formation"
                showName
              />
              {!singletonMode && instances.length > 3 && (
                <PlayerMarker
                  position={[3, 0, 2]}
                  color="#ef4444"
                  number={4}
                  name="App"
                  showName
                />
              )}
            </>
          )}
        </DemoCanvas>
        <div className="mt-2 text-center text-xs text-slate-500">
          {singletonMode
            ? ja
              ? "全リポジトリが1つのDB接続（緑の中央マーカー）を共有"
              : "All repositories share one DB connection (green center marker)"
            : ja
              ? "リポジトリごとに別の接続が生まれる（赤）"
              : "Each repository creates its own connection (red)"}
        </div>
      </section>

      {/* 実際のコード */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja
            ? "実際のコード: IndexedDBClient"
            : "Actual Code: IndexedDBClient"}
        </h2>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
          <p className="text-slate-300 text-sm">
            {ja
              ? "3つの要素でSingletonを実現します: ①静的変数でインスタンスを保持、②private constructorで外部からのnewを禁止、③getInstanceで唯一のアクセス手段を提供。"
              : "Three elements make a Singleton: ①static variable holds the instance, ②private constructor prevents external new, ③getInstance provides the only access."}
          </p>
        </div>
        <CodeBlock
          code={SINGLETON_CODE}
          highlightLines={[6, 9, 12, 13, 14, 15, 16, 17, 18, 19]}
        />
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "使い方" : "Usage"}
        </h2>
        <CodeBlock code={USAGE_CODE} highlightLines={[5, 10, 14]} />
      </section>

      {/* EventBus も Singleton */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "もう一つの例: EventBus" : "Another Example: EventBus"}
        </h2>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
          <p className="text-slate-300 text-sm">
            {ja
              ? "EventBus も Singleton です。全コンポーネントが同じバスを共有するからこそ、イベントが確実に届きます。"
              : "EventBus is also a Singleton. All components share the same bus, ensuring events are reliably delivered."}
          </p>
        </div>
        <CodeBlock
          code={EVENTBUS_CODE}
          highlightLines={[5, 6, 7, 8, 9, 10, 11, 12]}
        />
      </section>
    </LessonLayout>
  );
}
