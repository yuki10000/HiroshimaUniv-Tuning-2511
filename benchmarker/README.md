# benchmarker (k6)

このディレクトリでは k6 を使った負荷試験スクリプトを管理します。ローカルでの実行を想定しています。

推奨のワークフロー:

- まずローカルに k6 をインストールして実行（デバッグ）
- 再現性が必要なら Docker を利用

ファイル構成:

- `scripts/products-test.js` — `/api/products` の専用負荷テスト
- `scripts/search-test.js` — `/api/search` の専用負荷テスト
- `scripts/health-test.js` — `/api/health` の専用負荷テスト（正常とエラーの両方）
- `docker/Dockerfile` — Docker イメージ（任意）
- `logs/` — 実行ログ保存先（gitignore に追加済み）

実行方法（ローカル Homebrew などで k6 がインストール済みの場合）:

```sh
# ベーシック実行
k6 run benchmarker/scripts/load-test.js

# 環境変数でパラメータを上書き
BASE_URL=http://localhost:8080 K6_VUS=100 K6_DURATION=120s k6 run benchmarker/scripts/load-test.js

# スモークテスト
k6 run benchmarker/scripts/smoke-test.js

# API 別のテスト
# 製品一覧テスト
k6 run benchmarker/scripts/products-test.js

# 検索テスト
k6 run benchmarker/scripts/search-test.js

# ヘルスチェックの正常/エラー確認
k6 run benchmarker/scripts/health-test.js
```

Docker を使う場合（ホストに k6 が無くても実行可）:

```sh
# ワンライナー（ファイルを stdin で渡す）
docker run --rm -i grafana/k6 run - < benchmarker/scripts/load-test.js

# あるいは付属の Dockerfile をビルドして使う
docker build -t my-k6 -f benchmarker/docker/Dockerfile .
docker run --rm my-k6
```

注意:

- デフォルトの `BASE_URL` は `http://localhost:8080` です（バックエンドのデフォルトポートに合わせています）。
- 負荷実験は実行マシンの CPU/RAM に依存します。高い VU を指定する場合は分散実行や専用のマシンを検討してください。
