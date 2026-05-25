/**
 * @module HomePage
 * @description アプリケーションのホームページコンポーネント。機能カード一覧・言語切替・データバックアップ管理を表示する。
 */
import { useState, useCallback, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { IS_ELECTRON } from "@shared/constants";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { useToast, useConfirm } from "@presentation/components/ui";
import { useAppBackup } from "@presentation/hooks/useAppBackup";
import { useSeedSampleData } from "@presentation/hooks/useSeedSampleData";
import { PageShell } from "@presentation/components/layout";
import { STAGGER_DELAY_MS } from "@shared/constants";

const GITHUB_URL = "https://github.com/takataka6/kerulabs";

function HomeCardIcon({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function HeaderActionIcon({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function GitHubIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
    </svg>
  );
}

// タクティカルボード: ヒーローの右カラムに表示するフォーメーション図
// ピッチ: viewBox 0 0 320 420, 境界: y=16〜404 (388px), ハーフウェイ: y=210
// 自チーム(青): 下側ゴール守備・上方向攻撃 (4-3-3)
// 相手チーム(スレート): 上側ゴール守備・下方向攻撃 (4-4-2)
function TacticalFormation() {
  const blue = "#3b82f6";

  const ourTeam: { x: number; y: number; d: number }[] = [
    // GK
    { x: 160, y: 388, d: 0 },
    // 4 Defenders — 水平ライン y=300
    { x: 52, y: 300, d: 0.08 },
    { x: 128, y: 300, d: 0.14 },
    { x: 192, y: 300, d: 0.2 },
    { x: 268, y: 300, d: 0.26 },
    // 3 Midfielders — 水平ライン y=222
    { x: 78, y: 222, d: 0.32 },
    { x: 160, y: 222, d: 0.38 },
    { x: 242, y: 222, d: 0.44 },
    // 3 Forwards — 水平ライン y=135
    { x: 62, y: 135, d: 0.5 },
    { x: 160, y: 135, d: 0.56 },
    { x: 258, y: 135, d: 0.62 },
  ];

  const theirTeam: { x: number; y: number }[] = [
    // GK
    { x: 160, y: 28 },
    // 4 Defenders — 水平ライン y=112
    { x: 52, y: 112 },
    { x: 128, y: 112 },
    { x: 192, y: 112 },
    { x: 268, y: 112 },
    // 4 Midfielders — 水平ライン y=192
    { x: 62, y: 192 },
    { x: 138, y: 192 },
    { x: 182, y: 192 },
    { x: 258, y: 192 },
    // 2 Strikers — 水平ライン y=268
    { x: 120, y: 268 },
    { x: 200, y: 268 },
  ];

  return (
    <div className="relative select-none" aria-hidden="true">
      {/* 背後のグロー */}
      <div className="absolute -inset-6 bg-blue-500/5 rounded-3xl blur-3xl pointer-events-none" />
      <svg
        viewBox="0 0 320 420"
        className="relative w-full"
        style={{ filter: "drop-shadow(0 8px 32px rgba(59,130,246,0.18))" }}
      >
        {/* ピッチ背景 */}
        <rect x="0" y="0" width="320" height="420" rx="12" fill="#080f1e" />

        {/* フィールドストライプ */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect
            key={i}
            x="16"
            y={16 + i * 65}
            width="288"
            height="32"
            fill={i % 2 === 0 ? "#090f20" : "#080f1e"}
          />
        ))}

        {/* ピッチライン */}
        <g stroke="#1a3557" strokeWidth="1.2" fill="none">
          <rect x="16" y="16" width="288" height="388" />
          <line x1="16" y1="210" x2="304" y2="210" />
          <circle cx="160" cy="210" r="44" />
          <circle cx="160" cy="210" r="3" fill="#1a3557" stroke="none" />
          <rect x="86" y="16" width="148" height="90" />
          <rect x="116" y="16" width="88" height="44" />
          <rect x="86" y="314" width="148" height="90" />
          <rect x="116" y="362" width="88" height="44" />
          <rect x="130" y="10" width="60" height="10" strokeWidth="1.5" />
          <rect x="130" y="400" width="60" height="10" strokeWidth="1.5" />
          <path d="M 16 29 A 13 13 0 0 1 29 16" />
          <path d="M 291 16 A 13 13 0 0 1 304 29" />
          <path d="M 16 391 A 13 13 0 0 0 29 404" />
          <path d="M 291 404 A 13 13 0 0 0 304 391" />
        </g>

        {/* 相手チーム (スレート) */}
        {theirTeam.map((p, i) => (
          <g key={`opp-${i}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r="8"
              fill="#1e3656"
              stroke="#2d5486"
              strokeWidth="1"
            />
            <circle
              cx={p.x - 1}
              cy={p.y - 1.5}
              r="2"
              fill="white"
              opacity="0.12"
            />
          </g>
        ))}

        {/* 自チーム (ブルー) */}
        {ourTeam.map((p, i) => (
          <g key={`us-${i}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r="13"
              fill={blue}
              opacity="0.12"
              className="animate-pulse"
              style={{ animationDelay: `${p.d}s` }}
            />
            <circle cx={p.x} cy={p.y} r="7.5" fill={blue} />
            <circle
              cx={p.x - 1.5}
              cy={p.y - 2}
              r="2.5"
              fill="white"
              opacity="0.3"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

function SeedIcon({ className = "" }: { className?: string }) {
  return (
    <HeaderActionIcon className={className}>
      <path d="M4 9.5 12 5l8 4.5-8 4.5L4 9.5Z" />
      <path d="M4 9.5V15l8 4 8-4V9.5" opacity="0.7" />
      <path d="M8.5 11.8 12 13.8l3.5-2" opacity="0.7" />
    </HeaderActionIcon>
  );
}

function ResetIcon({ className = "" }: { className?: string }) {
  return (
    <HeaderActionIcon className={className}>
      <path d="M6 7h12" />
      <path d="M9 7V5.5h6V7" opacity="0.7" />
      <path d="M8 7.5v10a1.5 1.5 0 0 0 1.5 1.5h5A1.5 1.5 0 0 0 16 17.5v-10" />
      <path d="M10.5 10.5v5M13.5 10.5v5" opacity="0.7" />
    </HeaderActionIcon>
  );
}

function ExportIcon({ className = "" }: { className?: string }) {
  return (
    <HeaderActionIcon className={className}>
      <path d="M12 4v10" />
      <path d="m8.5 7.5 3.5-3.5 3.5 3.5" />
      <path d="M5 14.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5" opacity="0.7" />
    </HeaderActionIcon>
  );
}

function ImportIcon({ className = "" }: { className?: string }) {
  return (
    <HeaderActionIcon className={className}>
      <path d="M12 20V10" />
      <path d="m8.5 16.5 3.5 3.5 3.5-3.5" />
      <path d="M5 9.5V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3.5" opacity="0.7" />
    </HeaderActionIcon>
  );
}

function TacticsIcon({ className = "" }: { className?: string }) {
  return (
    <HomeCardIcon className={className}>
      <rect x="10" y="12" width="44" height="40" rx="6" opacity="0.9" />
      <path d="M32 12v40M10 32h44" opacity="0.55" />
      <circle cx="20" cy="22" r="2.5" />
      <circle cx="26" cy="40" r="2.5" />
      <circle cx="44" cy="24" r="2.5" />
      <circle cx="40" cy="42" r="2.5" />
      <path d="M22.5 22h10l9.5 2" opacity="0.8" />
      <path d="M28.5 40 35 34l5 8" opacity="0.8" />
      <path d="m35 34 4-1-1 4" opacity="0.8" />
    </HomeCardIcon>
  );
}

function GlossaryIcon({ className = "" }: { className?: string }) {
  return (
    <HomeCardIcon className={className}>
      <path d="M18 14h24a6 6 0 0 1 6 6v26a4 4 0 0 0-4-4H20a6 6 0 0 0-6 6V20a6 6 0 0 1 6-6Z" />
      <path d="M20 42h24" opacity="0.55" />
      <path d="M24 24h14M24 30h10" opacity="0.8" />
      <path d="M40 23h8v10h-8l-4 4V27l4-4Z" />
      <path d="M42.5 26.5h3M42.5 29.5h2" opacity="0.8" />
    </HomeCardIcon>
  );
}

function ManualIcon({ className = "" }: { className?: string }) {
  return (
    <HomeCardIcon className={className}>
      <path d="M18 16h18a6 6 0 0 1 6 6v28H22a6 6 0 0 0-6 6V22a6 6 0 0 1 6-6Z" />
      <path d="M42 22h4a4 4 0 0 1 4 4v24H30a6 6 0 0 0-6 6" opacity="0.8" />
      <path d="M24 26h10M24 32h12M24 38h8" opacity="0.75" />
      <path d="m38 18 7 7" opacity="0.55" />
    </HomeCardIcon>
  );
}

function CodeLabIcon({ className = "" }: { className?: string }) {
  return (
    <HomeCardIcon className={className}>
      <path d="M20 18 10 32l10 14" />
      <path d="M44 18 54 32 44 46" />
      <path d="m36 14-8 36" opacity="0.9" />
      <path d="M24 24h18" opacity="0.45" />
      <path d="M22 40h18" opacity="0.45" />
      <circle cx="46" cy="24" r="3" opacity="0.8" />
    </HomeCardIcon>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { language, setLanguage, t } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const backup = useAppBackup(showToast, t);
  const { handleSeed, isSeeding } = useSeedSampleData(showToast, t);

  const handleSeedWithConfirm = useCallback(async () => {
    if (await confirm({ message: t("app.seed.confirm") })) {
      await handleSeed();
    }
  }, [handleSeed, t, confirm]);

  const handleResetWithConfirm = useCallback(async () => {
    if (
      await confirm({ message: t("app.backup.resetConfirm"), variant: "red" })
    ) {
      backup.handleReset();
    }
  }, [backup, t, confirm]);

  const APP_CARDS = [
    {
      id: "tactics-simulator",
      title: t("tactics.simulator"),
      subtitle: t("tactics.simulator.subtitle"),
      icon: <TacticsIcon className="h-full w-full" />,
      gradient: "from-blue-600 to-blue-500",
      topLine: "from-blue-500 via-blue-400 to-blue-600",
      hoverShadow: "hover:shadow-blue-500/10",
      description: t("tactics.simulator.description"),
      available: true,
    },
    {
      id: "glossary",
      title: t("glossary"),
      subtitle: t("glossary.subtitle"),
      icon: <GlossaryIcon className="h-full w-full" />,
      gradient: "from-emerald-600 to-emerald-500",
      topLine: "from-emerald-500 via-emerald-400 to-emerald-600",
      hoverShadow: "hover:shadow-emerald-500/10",
      description: t("glossary.description"),
      available: true,
    },
    {
      id: "team-manual",
      title: t("manual"),
      subtitle: t("manual.subtitle"),
      icon: <ManualIcon className="h-full w-full" />,
      gradient: "from-amber-600 to-amber-500",
      topLine: "from-amber-500 via-amber-400 to-amber-600",
      hoverShadow: "hover:shadow-amber-500/10",
      description: t("manual.description"),
      available: true,
    },
    {
      id: "code-lab",
      title: t("code.lab"),
      subtitle: t("code.lab.subtitle"),
      icon: <CodeLabIcon className="h-full w-full" />,
      gradient: "from-purple-600 to-purple-500",
      topLine: "from-purple-500 via-purple-400 to-purple-600",
      hoverShadow: "hover:shadow-purple-500/10",
      description: t("code.lab.description"),
      available: true,
    },
  ];

  const topControls = (
    <div
      className="absolute top-3 sm:top-6 left-3 sm:left-6 right-3 sm:right-6 z-40 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 items-start"
      {...(IS_ELECTRON && {
        style: { WebkitAppRegion: "no-drag" } as React.CSSProperties,
      })}
    >
      {/* 左: サンプルデータ挿入 + オールリセット */}
      <div className="flex flex-wrap items-start gap-2 sm:gap-3 sm:justify-start">
        <button
          onClick={handleSeedWithConfirm}
          disabled={isSeeding}
          className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-2xl px-3 py-2 text-xs font-semibold transition-all duration-300 text-emerald-400 hover:text-white hover:bg-emerald-800/50 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SeedIcon className="h-2 w-2 shrink-0" />
          {t("app.seed")}
        </button>
        <button
          onClick={handleResetWithConfirm}
          disabled={backup.isResetting}
          className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-2xl px-3 py-2 text-xs font-semibold transition-all duration-300 text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ResetIcon className="h-2 w-2 shrink-0" />
          {t("app.backup.reset")}
        </button>
      </div>

      {/* 右: GitHub + バックアップ + 言語選択 */}
      <div className="flex flex-wrap items-start gap-2 sm:gap-3 sm:justify-end">
        {/* バックアップ */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden">
          <div className="flex">
            <button
              onClick={backup.handleExport}
              disabled={backup.isExporting}
              className="px-3 py-2 text-xs font-semibold transition-all duration-300 text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ExportIcon className="h-2 w-2 shrink-0" />
              {t("app.backup.export")}
            </button>
            <button
              onClick={backup.handleImport}
              disabled={backup.isImporting}
              className="px-3 py-2 text-xs font-semibold transition-all duration-300 text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImportIcon className="h-2 w-2 shrink-0" />
              {t("app.backup.import")}
            </button>
          </div>
        </div>

        {/* 言語選択 */}
        <nav aria-label={t("a11y.languageSwitch")}>
          <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden">
            <div
              className="flex"
              role="group"
              aria-label={t("a11y.languageSwitch")}
            >
              <button
                onClick={() => setLanguage("ja")}
                aria-pressed={language === "ja"}
                className={`px-3 py-2 text-xs font-semibold transition-all duration-300 ${
                  language === "ja"
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                🇯🇵 日本語
              </button>
              <button
                onClick={() => setLanguage("en")}
                aria-pressed={language === "en"}
                className={`px-3 py-2 text-xs font-semibold transition-all duration-300 ${
                  language === "en"
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                🇺🇸 English
              </button>
            </div>
          </div>
        </nav>

        {/* GitHub リンク */}
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-2xl px-3.5 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-300 flex items-center gap-2"
        >
          <GitHubIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline text-xs sm:text-sm font-semibold">
            GitHub
          </span>
        </a>
      </div>
    </div>
  );

  return (
    <PageShell
      backgroundOrbs={[
        { color: "bg-blue-500/10", position: "top-left" },
        { color: "bg-purple-500/10", position: "bottom-right" },
        { color: "bg-green-500/5", position: "center" },
      ]}
      overlay={topControls}
      contentClassName="relative z-10 container mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-12"
    >
      {/* ── ヒーローセクション ─────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8 lg:gap-10 items-center mb-14 sm:mb-16">
        {/* 左: テキスト */}
        <header className="text-center lg:text-left">
          {/* OSSバッジ */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700/50 bg-slate-800/60 backdrop-blur-sm text-xs text-slate-400 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span>Open Source</span>
            <span className="text-slate-600 mx-0.5">·</span>
            <span>Soccer Tactics</span>
          </div>

          <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-6">
            {t("app.title")}
          </h1>

          {/* アクセントライン */}
          <div className="w-14 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mb-6 mx-auto lg:mx-0" />

          <p className="text-lg sm:text-xl text-slate-300 font-medium leading-relaxed mb-3">
            {t("app.subtitle")}
          </p>
          <p className="text-sm text-slate-500 leading-relaxed mb-8">
            {t("app.description")}
          </p>

          {/* スタットピル */}
          <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start">
            {[
              { label: "4 Modules", accent: false },
              { label: "Open Source", accent: true },
              { label: "Local-first", accent: false },
              { label: "Multi-language", accent: false },
            ].map(({ label, accent }) => (
              <span
                key={label}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  accent
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-slate-700/50 bg-slate-800/40 text-slate-400"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </header>

        {/* 右: タクティカルボード (デスクトップのみ) */}
        <div className="hidden lg:block">
          <TacticalFormation />
        </div>
      </section>

      {/* ── フィーチャーセクション ────────────────────────────────── */}
      <section>
        {/* セクションラベル */}
        <div className="flex items-center gap-4 mb-9">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-800 to-slate-700/50" />
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-slate-500 flex-shrink-0">
            Modules
          </p>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-800 to-slate-700/50" />
        </div>

        {/* カードグリッド */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-4xl mx-auto">
          {APP_CARDS.map((app, index) => (
            <button
              key={app.id}
              onClick={() => app.available && navigate(`/${app.id}`)}
              onMouseEnter={() => setHoveredCard(app.id)}
              onMouseLeave={() => setHoveredCard(null)}
              disabled={!app.available}
              className={`group relative rounded-2xl border transition-all duration-500 text-left overflow-hidden animate-slide-in-up ${
                app.available
                  ? `bg-slate-900/50 border-slate-700/50 hover:bg-slate-800/70 hover:scale-[1.02] hover:shadow-xl ${app.hoverShadow} cursor-pointer hover:border-slate-600/50`
                  : "bg-slate-900/30 border-slate-800 cursor-not-allowed opacity-60"
              }`}
              style={{ animationDelay: `${index * STAGGER_DELAY_MS}ms` }}
            >
              {/* カラートップアクセントライン */}
              <div className={`h-px w-full bg-gradient-to-r ${app.topLine}`} />

              {/* ホバーグラデーションオーバーレイ */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500`}
              />

              {/* コンテンツ */}
              <div className="relative z-10 p-5 sm:p-7">
                <div className="flex items-start gap-4">
                  {/* アイコンバッジ */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${app.gradient} p-2.5 sm:p-3 text-white shadow-lg transition-all duration-500 ${hoveredCard === app.id ? "scale-110 rotate-3" : ""}`}
                    aria-hidden="true"
                  >
                    {app.icon}
                  </div>

                  {/* テキスト */}
                  <div className="flex-1 min-w-0 pt-1">
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-1.5">
                      {app.title}
                    </h2>
                    <p className="text-slate-400 text-sm font-medium mb-3">
                      {app.subtitle}
                    </p>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {app.description}
                    </p>
                  </div>
                </div>

                {/* 矢印インジケーター */}
                {app.available && (
                  <div
                    className={`absolute bottom-5 right-6 transition-all duration-300 ${hoveredCard === app.id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`}
                    aria-hidden="true"
                  >
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── フッター ─────────────────────────────────────────────── */}
      <footer className="text-center mt-12 sm:mt-14 text-slate-500 text-xs sm:text-sm">
        <p>{t("app.version").replace("{version}", __APP_VERSION__)}</p>
        <p className="hidden">{t("app.footer")}</p>
      </footer>
    </PageShell>
  );
}
