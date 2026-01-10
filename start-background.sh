#!/bin/bash

# Threads Analytics Pro 開発サーバーをバックグラウンドで起動するスクリプト

PROJECT_DIR="/Users/aoi/Library/CloudStorage/GoogleDrive-aoi.baseball.trainer@gmail.com/その他のパソコン/マイ ノートパソコン/デスクトップ/Thraedsツール"
LOG_FILE="$PROJECT_DIR/server.log"
PID_FILE="$PROJECT_DIR/server.pid"

cd "$PROJECT_DIR" || exit 1

# 既に起動している場合は停止
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo "既にサーバーが起動しています（PID: $OLD_PID）"
        echo "停止するには: ./stop-server.sh"
        exit 1
    fi
    rm "$PID_FILE"
fi

# Node.jsの確認
if ! command -v node &> /dev/null; then
    echo "❌ Node.jsがインストールされていません。"
    exit 1
fi

# 依存関係の確認
if [ ! -d "node_modules" ]; then
    echo "📦 依存関係をインストール中..."
    npm install --no-audit --no-fund
fi

# ログファイルをクリア
> "$LOG_FILE"

echo "🚀 開発サーバーをバックグラウンドで起動します..."
echo "📝 ログファイル: $LOG_FILE"
echo "🛑 停止するには: ./stop-server.sh"

# バックグラウンドで起動
nohup npm run dev > "$LOG_FILE" 2>&1 &
SERVER_PID=$!

# PIDを保存
echo $SERVER_PID > "$PID_FILE"

# 少し待って起動確認
sleep 3

if ps -p "$SERVER_PID" > /dev/null 2>&1; then
    echo "✅ サーバーが起動しました（PID: $SERVER_PID）"
    echo "🌐 アクセスURL: http://localhost:3000"
    echo ""
    echo "ログを確認: tail -f $LOG_FILE"
    echo "停止する: ./stop-server.sh"
else
    echo "❌ サーバーの起動に失敗しました。ログを確認してください: $LOG_FILE"
    rm "$PID_FILE"
    exit 1
fi
