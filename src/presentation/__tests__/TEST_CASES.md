# 3D Calculations テストケース一覧

## threeCalculations.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| BallTrajectory計算 | computeArchHeight | lowタイプ: 距離に0.08を掛けた値を返す |
| BallTrajectory計算 | computeArchHeight | lowタイプ: 距離が短い場合は最小値0.3を返す |
| BallTrajectory計算 | computeArchHeight | highタイプ: 距離に0.45を掛けた値を返す |
| BallTrajectory計算 | computeArchHeight | highタイプ: 距離が短い場合は最小値1.5を返す |
| BallTrajectory計算 | computeArchHeight | curveLeftタイプ: 距離に0.25を掛けた値を返す |
| BallTrajectory計算 | computeArchHeight | curveLeftタイプ: 距離が短い場合は最小値0.8を返す |
| BallTrajectory計算 | computeArchHeight | curveRightタイプ: 距離に0.3を掛けた値を返す |
| BallTrajectory計算 | computeArchHeight | curveRightタイプ: 距離が短い場合は最小値1.0を返す |
| BallTrajectory計算 | computeArchHeight | デフォルト: 距離に0.2を掛けた値を返す |
| BallTrajectory計算 | computeArchHeight | デフォルト: 距離が短い場合は最小値0.5を返す |
| BallTrajectory計算 | computeArchHeight | 距離0の場合は最小値を返す |
| BallTrajectory計算 | computeCurveOffset | curveLeftは負のオフセットを返す |
| BallTrajectory計算 | computeCurveOffset | curveRightは正のオフセットを返す |
| BallTrajectory計算 | computeCurveOffset | curveLeft: 距離が短い場合は最小オフセット-0.8を返す |
| BallTrajectory計算 | computeCurveOffset | curveRight: 距離が短い場合は最小オフセット0.8を返す |
| BallTrajectory計算 | computeCurveOffset | デフォルトはオフセット0を返す |
| BallTrajectory計算 | computeCurveOffset | lowタイプはオフセット0を返す |
| BallTrajectory計算 | computeCurveOffset | highタイプはオフセット0を返す |
| BallTrajectory計算 | computePerpendicularVector | +X方向の移動に対して垂直ベクトルを返す |
| BallTrajectory計算 | computePerpendicularVector | +Z方向の移動に対して垂直ベクトルを返す |
| BallTrajectory計算 | computePerpendicularVector | 斜め方向でも単位ベクトルの長さが1になる |
| BallTrajectory計算 | computePerpendicularVector | 距離0の場合はゼロベクトルを返す |
| BallTrajectory計算 | computePerpendicularVector | 元ベクトルと垂直であることを内積で検証 |
| BallTrajectory計算 | generateCurvePoints | 51個のポイントを生成する（50セグメント） |
| BallTrajectory計算 | generateCurvePoints | 始点が最初のポイントに一致する |
| BallTrajectory計算 | generateCurvePoints | 終点が最後のポイントに一致する |
| BallTrajectory計算 | generateCurvePoints | 放物線の頂点（t=0.5）のY座標が archHeight + 0.15 に一致する |
| BallTrajectory計算 | generateCurvePoints | カーブオフセット0の場合は直線上のXZ座標になる |
| BallTrajectory計算 | generateCurvePoints | カーブオフセットがある場合はXZ座標がずれる |
| BallTrajectory計算 | generateCurvePoints | Y座標にベースオフセット0.15が加算される |
| BallTrajectory計算 | generateCurvePoints | セグメント数を変更できる |
| BallTrajectory計算 | generateDashSegments | 短い曲線でも最低1つのダッシュセグメントが生成される |
| BallTrajectory計算 | generateDashSegments | 各セグメントが最低2ポイントを持つ |
| BallTrajectory計算 | generateDashSegments | 長い曲線では複数のダッシュセグメントが生成される |
| BallTrajectory計算 | generateDashSegments | カスタムのダッシュ長・ギャップ長を使用できる |
| BallTrajectory計算 | computeBallAnimationPosition | t=0の時は最初のポイントを返す |
| BallTrajectory計算 | computeBallAnimationPosition | ポイント間を補間する |
| BallTrajectory計算 | computeBallAnimationPosition | アニメーションがループする |
| Sceneカメラ・インタラクション計算 | isFieldClick | 移動距離が閾値以下ならクリックと判定する |
| Sceneカメラ・インタラクション計算 | isFieldClick | 移動距離が閾値を超えたらクリックと判定しない |
| Sceneカメラ・インタラクション計算 | isFieldClick | 同じ位置ならクリックと判定する |
| Sceneカメラ・インタラクション計算 | isFieldClick | 距離がちょうど5pxの場合はクリックと判定する |
| Sceneカメラ・インタラクション計算 | isFieldClick | カスタム閾値を指定できる |
| Sceneカメラ・インタラクション計算 | clampToFieldBounds | 範囲内の座標はそのまま返す |
| Sceneカメラ・インタラクション計算 | clampToFieldBounds | minXを下回る座標はminXにクランプされる |
| Sceneカメラ・インタラクション計算 | clampToFieldBounds | maxXを上回る座標はmaxXにクランプされる |
| Sceneカメラ・インタラクション計算 | clampToFieldBounds | minZを下回る座標はminZにクランプされる |
| Sceneカメラ・インタラクション計算 | clampToFieldBounds | maxZを上回る座標はmaxZにクランプされる |
| Sceneカメラ・インタラクション計算 | clampToFieldBounds | X・Z両方が範囲外の場合は両方クランプされる |
| Sceneカメラ・インタラクション計算 | getDefaultCameraParams | futsalモードでY=8, Z=-5, targetZ=0を返す |
| Sceneカメラ・インタラクション計算 | getDefaultCameraParams | societyモードでY=9, Z=-5.5, targetZ=0を返す |
| Sceneカメラ・インタラクション計算 | getDefaultCameraParams | eight_asideモードでY=10, Z=-6, targetZ=0を返す |
| Sceneカメラ・インタラクション計算 | getDefaultCameraParams | デフォルト（football）でY=12, Z=-8, targetZ=-2を返す |
| Sceneカメラ・インタラクション計算 | getDefaultCameraParams | 不明なゲームモードでもデフォルト値を返す |
| Sceneカメラ・インタラクション計算 | clampYaw | 範囲内の値はそのまま返す |
| Sceneカメラ・インタラクション計算 | clampYaw | 正の上限を超える値はクランプされる |
| Sceneカメラ・インタラクション計算 | clampYaw | 負の下限を下回る値はクランプされる |
| Sceneカメラ・インタラクション計算 | clampYaw | ±5π/6の境界値はそのまま返す |
| Sceneカメラ・インタラクション計算 | clampPitch | 範囲内の値はそのまま返す |
| Sceneカメラ・インタラクション計算 | clampPitch | ±π/4を超える値はクランプされる |
| Sceneカメラ・インタラクション計算 | clampPitch | 境界値はそのまま返す |
| Sceneカメラ・インタラクション計算 | decayAngle | 角度に0.95を掛けて返す |
| Sceneカメラ・インタラクション計算 | decayAngle | 0.001未満の場合は0にスナップする |
| Sceneカメラ・インタラクション計算 | decayAngle | 負の値も正しく減衰する |
| Sceneカメラ・インタラクション計算 | decayAngle | 負の値が閾値未満で0にスナップする |
| Sceneカメラ・インタラクション計算 | decayAngle | カスタム減衰係数を指定できる |
| Sceneカメラ・インタラクション計算 | decayAngle | カスタムスナップ閾値を指定できる |
| Sceneカメラ・インタラクション計算 | decayAngle | 大きな値は0にスナップしない |
| Sceneカメラ・インタラクション計算 | computePlayerViewCamera | yaw=0でカメラが選手の背後（-Z方向）に位置する |
| Sceneカメラ・インタラクション計算 | computePlayerViewCamera | 注視点が選手の前方（+Z方向）に位置する |
| Sceneカメラ・インタラクション計算 | computePlayerViewCamera | dirSign=-1（相手チーム）でカメラ方向が反転する |
| Sceneカメラ・インタラクション計算 | computePlayerViewCamera | pitchAngleが注視点のY座標に影響する |
| Sceneカメラ・インタラクション計算 | computePlayerViewCamera | 選手位置がオフセットに反映される |
| Player位置・アニメーション計算 | lerpPosition | 係数0.08で目標に近づく |
| Player位置・アニメーション計算 | lerpPosition | 係数0の場合は現在位置のまま |
| Player位置・アニメーション計算 | lerpPosition | 係数1の場合は目標位置に到達する |
| Player位置・アニメーション計算 | lerpPosition | 目標と現在が同じ場合は変化しない |
| Player位置・アニメーション計算 | lerpPosition | 負の座標でも正しく補間する |
| Player位置・アニメーション計算 | shouldClearDragEndPos | 差が0.01未満の場合はtrueを返す |
| Player位置・アニメーション計算 | shouldClearDragEndPos | 差が0.01以上の場合はfalseを返す |
| Player位置・アニメーション計算 | shouldClearDragEndPos | Xのみ差がある場合はfalseを返す |
| Player位置・アニメーション計算 | shouldClearDragEndPos | Zのみ差がある場合はfalseを返す |
| Player位置・アニメーション計算 | shouldClearDragEndPos | 完全一致の場合はtrueを返す |
| Player位置・アニメーション計算 | shouldClearDragEndPos | カスタム閾値を指定できる |
| Player位置・アニメーション計算 | computeSelectionRingPulse | time=0でベース値を返す |
| Player位置・アニメーション計算 | computeSelectionRingPulse | パルスのscaleが適切な範囲に収まる |
| Player位置・アニメーション計算 | computeSelectionRingPulse | パルスのopacityが適切な範囲に収まる |
| OpponentMarker色計算 | deriveEmissiveColor | 白色(#ffffff)から0.4倍の灰色を生成する |
| OpponentMarker色計算 | deriveEmissiveColor | 赤色(#ff0000)からダーク赤を生成する |
| OpponentMarker色計算 | deriveEmissiveColor | 黒色(#000000)は黒のまま |
| OpponentMarker色計算 | deriveEmissiveColor | カスタムファクターを指定できる |
| OpponentMarker色計算 | deriveOpponentColors | 色未指定の場合はデフォルト値を返す |
| OpponentMarker色計算 | deriveOpponentColors | 色未指定: undefined を渡した場合もデフォルト |
| OpponentMarker色計算 | deriveOpponentColors | 色指定時はdiskが入力色、textが白になる |
| OpponentMarker色計算 | deriveOpponentColors | 色指定時はemissiveが導出される |
| ジオメトリユーティリティ | computeLineAngle | +X方向のatan2はπ/2を返す |
| ジオメトリユーティリティ | computeLineAngle | +Z方向のatan2は0を返す |
| ジオメトリユーティリティ | computeLineAngle | 斜め方向の角度が正しい |
| ジオメトリユーティリティ | computeLineAngle | 同じ点の角度は0を返す |
| ジオメトリユーティリティ | computeMidpoint | 2点の中点を計算する |
| ジオメトリユーティリティ | computeMidpoint | 同じ点の中点は同じ点になる |
| ジオメトリユーティリティ | computeMidpoint | 負の座標でも正しく計算する |
| ジオメトリユーティリティ | computeLineLength | 3-4-5の三角形で距離5を返す |
| ジオメトリユーティリティ | computeLineLength | 同じ点の距離は0を返す |
| ジオメトリユーティリティ | computeLineLength | 水平方向の距離が正しい |
| ジオメトリユーティリティ | computeLineLength | 垂直方向の距離が正しい |
