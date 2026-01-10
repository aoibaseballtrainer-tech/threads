#!/bin/bash

# macOS起動時に自動でサーバーを起動する設定を行うスクリプト

PROJECT_DIR="/Users/aoi/Library/CloudStorage/GoogleDrive-aoi.baseball.trainer@gmail.com/その他のパソコン/マイ ノートパソコン/デスクトップ/Thraedsツール"
PLIST_FILE="$PROJECT_DIR/com.threads.analytics.plist"
LAUNCHD_PATH="$HOME/Library/LaunchAgents/com.threads.analytics.plist"

echo "🔧 macOS起動時の自動起動を設定します..."
echo ""

# plistファイルの存在確認
if [ ! -f "$PLIST_FILE" ]; then
    echo "❌ plistファイルが見つかりません: $PLIST_FILE"
    exit 1
fi

# LaunchAgentsディレクトリの確認
if [ ! -d "$HOME/Library/LaunchAgents" ]; then
    mkdir -p "$HOME/Library/LaunchAgents"
    echo "✅ LaunchAgentsディレクトリを作成しました"
fi

# 既存の設定を削除（あれば）
if [ -f "$LAUNCHD_PATH" ]; then
    echo "既存の設定を削除します..."
    launchctl unload "$LAUNCHD_PATH" 2>/dev/null
    rm "$LAUNCHD_PATH"
fi

# plistファイルをコピー
cp "$PLIST_FILE" "$LAUNCHD_PATH"
echo "✅ plistファイルをコピーしました"

# launchdに登録
launchctl load "$LAUNCHD_PATH"
echo "✅ launchdに登録しました"
echo ""
echo "設定完了！"
echo ""
echo "次回のmacOS起動時から、自動でサーバーが起動します。"
echo ""
echo "手動で起動するには: launchctl start com.threads.analytics"
echo "手動で停止するには: launchctl stop com.threads.analytics"
echo "設定を削除するには: launchctl unload $LAUNCHD_PATH && rm $LAUNCHD_PATH"
