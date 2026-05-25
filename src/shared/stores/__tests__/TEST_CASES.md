# Shared Stores テストケース一覧

## playbackSpeedStore.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| playbackSpeedStore | getPlaybackSpeed | デフォルトの再生速度 1 を返す |
| playbackSpeedStore | setPlaybackSpeed | 再生速度を変更する |
| playbackSpeedStore | setPlaybackSpeed | 速度変更時にリスナーを通知する |
| playbackSpeedStore | setPlaybackSpeed | 同じ値を設定した場合はリスナーを通知しない |
| playbackSpeedStore | setPlaybackSpeed | 複数のリスナーに通知する |
| playbackSpeedStore | subscribePlaybackSpeed | 購読解除関数を返す |
| playbackSpeedStore | subscribePlaybackSpeed | 購読解除後はリスナーが通知されない |
| playbackSpeedStore | PLAYBACK_SPEED_OPTIONS | [0.25, 0.5, 1, 1.5] を含む |
