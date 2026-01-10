# セットアップ手順

## Node.jsのインストールが必要です

現在、システムにNode.jsがインストールされていないため、開発サーバーを起動できません。

### インストール方法

#### 方法1: Node.js公式サイトからインストール（推奨）

1. [Node.js公式サイト](https://nodejs.org/) にアクセス
2. LTS（長期サポート）版をダウンロード
3. インストーラーを実行してインストール

#### 方法2: Homebrewを使用（Macの場合）

```bash
# Homebrewがインストールされていない場合
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.jsをインストール
brew install node
```

#### 方法3: nvmを使用（推奨 - バージョン管理が可能）

```bash
# nvmをインストール
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# ターミナルを再起動後
nvm install --lts
nvm use --lts
```

### インストール確認

インストール後、以下のコマンドで確認してください：

```bash
node --version
npm --version
```

### 開発サーバーの起動

Node.jsのインストールが完了したら、以下のコマンドで開発サーバーを起動できます：

```bash
cd "/Users/aoi/Library/CloudStorage/GoogleDrive-aoi.baseball.trainer@gmail.com/その他のパソコン/マイ ノートパソコン/デスクトップ/Thraedsツール"
./start.sh
```

または

```bash
npm install
npm run dev
```

起動後、ブラウザで `http://localhost:3000` にアクセスしてください。
