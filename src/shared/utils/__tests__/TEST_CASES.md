# Shared Utils テストケース一覧

## rafThrottle.test.ts

| describe | テストケース |
| --- | --- |
| rafThrottle | コールバックを RAF でスロットルする |
| rafThrottle | 同一フレーム内の複数呼び出しを最後の引数で1回にまとめる |
| rafThrottle | フレームをまたぐと再度実行される |
| rafThrottle | cancel() でペンディング中の RAF をキャンセルできる |
| rafThrottle | cancel() 後も再利用できる |
