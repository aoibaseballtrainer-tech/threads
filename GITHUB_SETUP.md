# GitHubセットアップ手順

## ステップ1: GitHubでリポジトリを作成

1. [GitHub](https://github.com) にログイン
2. 右上の「+」→「New repository」をクリック
3. リポジトリ名を入力（例：`threads-analytics-tool`）
4. **Public** または **Private** を選択
5. **「Initialize this repository with a README」はチェックしない**
6. 「Create repository」をクリック

## ステップ2: ターミナルでコマンドを実行

以下のコマンドを順番に実行してください：

```bash
# プロジェクトディレクトリに移動
cd "/Users/aoi/Library/CloudStorage/GoogleDrive-aoi.baseball.trainer@gmail.com/その他のパソコン/マイ ノートパソコン/デスクトップ/Thraedsツール"

# Gitリポジトリを初期化
git init

# すべてのファイルを追加
git add .

# 初回コミット
git commit -m "Initial commit: Threads Analytics Tool"

# メインブランチに設定
git branch -M main

# GitHubリポジトリをリモートとして追加（<YOUR_REPO_URL>を実際のURLに置き換え）
# 例: git remote add origin https://github.com/your-username/threads-analytics-tool.git
git remote add origin <YOUR_REPO_URL>

# GitHubにプッシュ
git push -u origin main
```

## ステップ3: GitHubリポジトリURLの取得方法

GitHubでリポジトリを作成すると、以下のようなURLが表示されます：
- HTTPS: `https://github.com/your-username/repo-name.git`
- SSH: `git@github.com:your-username/repo-name.git`

HTTPSの方が簡単です。

## 注意事項

- 初回プッシュ時にGitHubの認証が求められる場合があります
- Personal Access Tokenが必要な場合は、[GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens) で作成してください
- `.env` ファイルは `.gitignore` に含まれているので、機密情報はプッシュされません
