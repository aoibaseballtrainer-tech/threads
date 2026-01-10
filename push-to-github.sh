#!/bin/bash

# GitHubにプッシュするスクリプト

cd "/Users/aoi/Library/CloudStorage/GoogleDrive-aoi.baseball.trainer@gmail.com/その他のパソコン/マイ ノートパソコン/デスクトップ/Thraedsツール"

echo "📦 Gitリポジトリを初期化中..."
git init

echo "📝 ファイルを追加中..."
git add .

echo "💾 コミット中..."
git commit -m "Initial commit: Threads Analytics Tool"

echo "🌿 メインブランチに設定中..."
git branch -M main

echo "🔗 GitHubリポジトリを接続中..."
git remote add origin https://github.com/aoibaseballtrainer-tech/threads.git

echo "🚀 GitHubにプッシュ中..."
git push -u origin main

echo "✅ 完了しました！"
