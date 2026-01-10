#!/bin/bash

# Threads Analytics Pro 開発サーバーを停止するスクリプト

PROJECT_DIR="/Users/aoi/Library/CloudStorage/GoogleDrive-aoi.baseball.trainer@gmail.com/その他のパソコン/マイ ノートパソコン/デスクトップ/Thraedsツール"
PID_FILE="$PROJECT_DIR/server.pid"

if [ ! -f "$PID_FILE" ]; then
    echo "サーバーは起動していません。"
    exit 0
fi

PID=$(cat "$PID_FILE")

if ps -p "$PID" > /dev/null 2>&1; then
    echo "🛑 サーバーを停止しています（PID: $PID）..."
    kill "$PID"
    
    # プロセスが停止するまで待つ
    for i in {1..10}; do
        if ! ps -p "$PID" > /dev/null 2>&1; then
            break
        fi
        sleep 1
    done
    
    # まだ動いていたら強制終了
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "強制終了します..."
        kill -9 "$PID"
    fi
    
    rm "$PID_FILE"
    echo "✅ サーバーを停止しました。"
else
    echo "サーバーは既に停止しています。"
    rm "$PID_FILE"
fi

# 念のため、viteプロセスも確認
pkill -f "vite" 2>/dev/null && echo "Viteプロセスも停止しました。"
