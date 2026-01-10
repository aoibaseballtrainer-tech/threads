#!/bin/bash

# Threads Analytics Pro 開発サーバー起動スクリプト

echo "🚀 Threads Analytics Pro 開発サーバーを起動します..."
echo ""

# Node.jsの確認
if ! command -v node &> /dev/null; then
    echo "❌ Node.jsがインストールされていません。"
    echo "以下のコマンドでインストールしてください："
    echo "  brew install node"
    echo "または https://nodejs.org/ からダウンロードしてください"
    exit 1
fi

echo "✅ Node.js バージョン: $(node --version)"
echo "✅ npm バージョン: $(npm --version)"
echo ""

# 依存関係の確認
if [ ! -d "node_modules" ]; then
    echo "📦 依存関係をインストール中..."
    npm install
    echo ""
fi

# .env.localファイルの確認
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.localファイルが見つかりません。"
    echo "以下の内容で.env.localファイルを作成してください："
    echo "  GEMINI_API_KEY=your_api_key_here"
    echo ""
    read -p "続行しますか？ (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🌐 開発サーバーを起動します..."
echo "📱 ブラウザで以下のURLにアクセスしてください："
echo "   http://localhost:3000"
echo ""
echo "停止するには Ctrl+C を押してください"
echo ""

npm run dev
