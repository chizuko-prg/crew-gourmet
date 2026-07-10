# Crew Gourmet

航空関係者おすすめのお店を、勤務後・ステイ中・帰宅前に短時間で探しやすくするスマートフォン優先のWebアプリです。

一般の口コミサイトやGoogleマップと情報量で競うものではなく、航空関係者の視点で候補を絞り、Googleマップへ自然につなぐ入口として設計しています。

## 主な機能

- ホーム：あいさつと目的別（飲み・朝食・深夜営業・一人向き 等）のワンタップ検索
- エリア選択：空港 → エリアの階層で店舗数とともに表示
- 店舗一覧：選択中の空港・エリア＋タグでの絞り込み
- 店舗詳細：おすすめ理由・特徴タグ・営業情報・Googleマップ導線
- お気に入り：ログイン不要、端末内（localStorage）にエリア別で保存
- 「アルコール残ってる？」導線：飲み系タグの店舗詳細のみに控えめに表示

## 技術構成

- Vite + React + TypeScript（スマートフォン優先）
- React Router（`/`, `/areas`, `/restaurants`, `/restaurants/:id`, `/favorites`）
- データ変換：Python + openpyxl（`scripts/convert-restaurants.py`）
- テスト：Vitest（UI・ロジック）／Python `unittest`（データ変換）

## ローカル起動方法

```bash
npm install
npm run dev
```

`npm run build` はコミット済みの公開用JSON（`src/data/restaurants.json`）のみを使ってビルドします。ビルド時にExcelを読み込むことはありません。

## Excel更新後のJSON生成方法

生のExcelマスター（`data/crew-gourmet-master.xlsx`）はこのリポジトリには含まれません（`.gitignore`対象）。お店データを更新する場合はローカルで以下を行います。

```bash
# 1. 更新済みのExcelを data/crew-gourmet-master.xlsx に配置する
pip install -r scripts/requirements.txt

# 2. 変換前チェック（書き込みなし）
npm run data:check

# 3. 公開用JSONを再生成
npm run data:build

# 4. 差分を確認してからコミットする
git diff src/data/restaurants.json
```

`src/data/restaurants.json` には画面表示・動作に必要な項目だけを出力し、出典URL・情報源・信頼度・ステータスの生データなどの内部管理情報は含めません。

## 写真・外部情報について

このアプリは店舗写真を保存・掲載しません。店舗詳細の「写真・場所をGoogleマップで見る」ボタンから、Googleマップ上の写真・地図・最新情報を確認できます。

## ご利用にあたっての注意

営業時間・定休日などは変更される場合があります。ご来店前にGoogleマップや公式情報をご確認ください。
