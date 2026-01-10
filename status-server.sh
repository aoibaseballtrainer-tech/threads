#!/bin/bash

# Threads Analytics Pro 開発サーバーの状態を確認するスクリプト

PROJECT_DIR="/Users/aoi/Library/CloudStorage/GoogleDrive-aoi.baseball.trainer@gmail.com/その他のパソコン/マイ ノートパソコン/デスクトップ/Thraedsツール"
PID_FILE="$PROJECT_DIR/server.pid"
LOG_FILE="$PROJECT_DIR/server.log"

echo "📊 サーバー状態確認"
echo "=================="

if [ ! -f "$PID_FILE" ]; then
    echo "❌ サーバーは起動していません。"
    echo ""
    echo "起動するには: ./start-background.sh"
    exit 0
fi

PID=$(cat "$PID_FILE")

if ps -p "$PID" > /dev/null 2>&1; then
    echo "✅ サーバーは起動中です（PID: $PID）"
    echo "🌐 アクセスURL: http://localhost:3000"
    echo ""
    echo "最近のログ（最後の10行）:"
    echo "---"
    tail -10 "$LOG_FILE" 2>/dev/null || echo "ログファイルが見つかりません"
    echo "---"
    echo ""
    echo "停止するには: ./stop-server.sh"
    echo "ログをリアルタイムで見る: tail -f $LOG_FILE"
else
    echo "⚠️  PIDファイルは存在しますが、プロセスは実行されていません。"
    rm "$PID_FILE"
    echo ""
    echo "起動するには: ./start-background.sh"
fi
