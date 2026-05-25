# ADR-0005: Three.js + React Three Fiber による 3D フィールド可視化

## ステータス

採用済み

## コンテキスト

サッカーフィールド上に選手・ボール・移動矢印を配置し、戦術をリアルタイムで可視化する必要がある。候補：

- **2D Canvas / SVG**: 実装が容易だが、カメラ操作・パース表現が困難
- **Three.js (vanilla)**: 高機能だが React との統合が手動
- **React Three Fiber (R3F)**: Three.js を React コンポーネントとして宣言的に記述可能

## 決定

React Three Fiber (`@react-three/fiber`) + `@react-three/drei` を採用。

Three.js オブジェクトを React コンポーネントとして記述し、React のライフサイクル管理・状態管理と統一する。

## 結果

### メリット
- 宣言的な 3D レンダリング（JSX で Three.js シーンを構築）
- React の状態管理と自然に統合（props 変更で再描画）
- カメラコントロール、ライティング、アニメーションを `drei` で簡潔に実装
- 複数ゲームモード（11人制、フットサル、8人制、ソサイチ）のピッチサイズ切替が容易

### トレードオフ
- バンドルサイズが比較的大きい（Three.js + R3F + drei）
- WebGL 非対応ブラウザでは動作しない
- 3D 特有のデバッグ難易度（座標系、カメラ位置）
