# デザインパターンマップ

本プロジェクトで使用しているデザインパターンとその適用箇所の一覧。

## アーキテクチャパターン

| パターン | 説明 | 適用箇所 |
|---------|------|---------|
| **Clean Architecture** | レイヤー分離による関心の分離 | `src/` 全体（domain → application → infrastructure ← presentation） |
| **Ports & Adapters** | インターフェースによる依存逆転 | `application/ports/` + `infrastructure/repositories/` |

## 生成パターン

| パターン | 説明 | 適用箇所 |
|---------|------|---------|
| **Factory Method** | リポジトリ実装のインスタンス生成を集約 | `infrastructure/factories/RepositoryFactory.ts` |
| **Singleton** | DB接続・イベントバスの一意性を保証 | `IndexedDBClient.getInstance()`, `EventBus.getInstance()` |
| **Static Factory** | エンティティの生成をバリデーション付きで実行 | `Player.create()`, `Team.create()`, `Formation.create()`, `TeamManual.create()` |

## 構造パターン

| パターン | 説明 | 適用箇所 |
|---------|------|---------|
| **Repository** | データアクセスをドメインから分離 | `IndexedDBTeamRepository`, `IndexedDBTacticRepository`, `IndexedDBGlossaryRepository`, `IndexedDBPluginRepository`, `IndexedDBTeamManualRepository`, `IndexedDBFormationRepository` |
| **Service Locator** | モジュールシングルトンによる依存解決 | `application/ServiceContainer.ts` (`getContainer()`) |
| **Barrel Export** | モジュール公開APIの集約 | 各レイヤーの `index.ts` |

## 振る舞いパターン

| パターン | 説明 | 適用箇所 |
|---------|------|---------|
| **Observer (Pub/Sub)** | 戦術実行イベントの発行・購読 | `domain/events/EventBus.ts`, `TacticEvent.ts` |
| **Interactor (Use Case)** | ビジネスロジックのオーケストレーション | `TacticInteractor`, `TeamInteractor`, `FormationInteractor`, `GlossaryInteractor`, `PluginInteractor`, `TeamManualInteractor` |
| **Strategy** | ゲームモード別ピッチサイズの切替 | `shared/constants/pitchConfig.ts` |

## DDD パターン

| パターン | 説明 | 適用箇所 |
|---------|------|---------|
| **Entity** | 一意ID + ミュータブルな属性 | `Team`, `Player`, `Tactic`, `Formation`, `Glossary`, `Plugin`, `TeamManual` |
| **Value Object** | イミュータブル + 値による等価判定 | `EntityId`, `Color`, `PlayerId`, `TeamId`, `TacticId`, `FormationId`, `GlossaryId`, `PluginId`, `TeamManualId`, `Position`, `Phase`, `GameMode` |
| **Domain Event** | ドメイン内の重要な出来事を通知 | `TacticStartedEvent`, `PlayerMovementStartedEvent`, `BallPassDisplayedEvent` |

## React パターン

| パターン | 説明 | 適用箇所 |
|---------|------|---------|
| **Custom Hook Composition** | 複合的な状態管理をフックに集約 | `useTacticCreation`, `useTeamManagement`, `useOpponents`, `useSketchOverlay`, `useUndoRedo` 等 |
| **Query/Mutation Hook** | TanStack Query によるデータアクセス抽象化 | `useAllTactics`, `useSaveTactic`, `useTeams`, `useGlossaries`, `useTeamManuals`, `usePlugins` 等 |
| **Context Provider** | グローバル状態管理 | `LanguageContext`, `TacticsViewerContext`, `TacticsExecutionContext`, `TacticsTeamContext`, `TacticsUIContext` |
| **Error Boundary** | レンダリングエラーのキャッチ | `presentation/components/ui/ErrorBoundary.tsx` |
| **Compound Component** | 関連するUIを親子コンポーネントで構成 | `TacticsModals`, `RightControlsColumn` |

## インフラパターン

| パターン | 説明 | 適用箇所 |
|---------|------|---------|
| **Higher-Order Function** | DB操作の共通エラーハンドリング | `infrastructure/repositories/indexeddb/withDB.ts` |
| **Data Mapper** | ドメインエンティティ ↔ DB レコードの変換 | 各リポジトリの `mapToDomain()` / `mapToPersistence()` |
| **Migration** | スキーマのバージョン管理と段階的更新 | `infrastructure/repositories/indexeddb/migrations.ts` |
| **Schema Validation** | Zod によるランタイム型検証 | `infrastructure/schemas/teamSchema.ts`, `pluginSchema.ts`, `teamManualSchema.ts` 等 |

## パターン適用図

```
┌─────────────────────────────────────────────────────┐
│ Presentation Layer                                   │
│  ┌─────────────┐  ┌────────────┐  ┌──────────────┐ │
│  │ Custom Hook  │  │ Query Hook │  │ React Context│ │
│  │ Composition  │  │ (TanStack) │  │ (i18n, etc.) │ │
│  └──────┬──────┘  └─────┬──────┘  └──────────────┘ │
│         │               │                            │
│         └───────┬───────┘                            │
│                 ▼                                     │
├─────────────────────────────────────────────────────┤
│ Application Layer                                    │
│  ┌──────────────┐  ┌─────────────────┐              │
│  │  Interactor   │  │ Service Locator │              │
│  │  (Use Case)   │  │ (getContainer)  │              │
│  └──────┬───────┘  └────────────────┘              │
│         │                                            │
│         ▼  Ports (Interface)                         │
├─────────────────────────────────────────────────────┤
│ Domain Layer                                         │
│  ┌────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │ Entity │ │ Value Object │ │ Domain Event     │  │
│  │ (DDD)  │ │ (Immutable)  │ │ (Observer/PubSub)│  │
│  └────────┘ └──────────────┘ └──────────────────┘  │
├─────────────────────────────────────────────────────┤
│ Infrastructure Layer                                 │
│  ┌────────────┐ ┌──────────┐ ┌───────────────────┐ │
│  │ Repository │ │ Singleton│ │ Data Mapper       │ │
│  │ (IndexedDB)│ │ (Client) │ │ (Domain ↔ Record) │ │
│  └────────────┘ └──────────┘ └───────────────────┘ │
│  ┌────────────┐ ┌──────────┐ ┌───────────────────┐ │
│  │ Factory    │ │ withDB   │ │ Migration         │ │
│  │ (Repo作成) │ │ (HOF)    │ │ (Schema Version)  │ │
│  └────────────┘ └──────────┘ └───────────────────┘ │
└─────────────────────────────────────────────────────┘
```
