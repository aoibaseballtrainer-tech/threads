# デプロイ手順

このアプリケーションを本番環境にデプロイする手順です。

## デプロイ方法

### 方法1: Vercel（推奨・最も簡単）

1. **Vercelアカウントを作成**
   - [Vercel](https://vercel.com) にアクセス
   - GitHubアカウントでサインアップ（推奨）

2. **プロジェクトをGitHubにプッシュ**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <あなたのGitHubリポジトリURL>
   git push -u origin main
   ```

3. **Vercelでデプロイ**
   - Vercelダッシュボードで「New Project」をクリック
   - GitHubリポジトリを選択
   - 設定は自動検出されます（Vite + React）
   - 「Deploy」をクリック

4. **環境変数の設定（必要に応じて）**
   - Vercelダッシュボード → プロジェクト → Settings → Environment Variables
   - `VITE_GEMINI_API_KEY` を追加（AI機能を使用する場合）

5. **デプロイ完了後**
   - Vercelから提供されるURL（例：`https://your-app.vercel.app`）を確認
   - Meta for Developersの「コールバックURLをリダイレクト」に以下を設定：
     ```
     https://your-app.vercel.app/oauth-callback.html
     ```

### 方法2: Netlify

1. **Netlifyアカウントを作成**
   - [Netlify](https://netlify.com) にアクセス
   - GitHubアカウントでサインアップ

2. **プロジェクトをGitHubにプッシュ**（上記と同じ）

3. **Netlifyでデプロイ**
   - Netlifyダッシュボードで「New site from Git」をクリック
   - GitHubリポジトリを選択
   - ビルド設定：
     - Build command: `npm run build`
     - Publish directory: `dist`
   - 「Deploy site」をクリック

4. **環境変数の設定**
   - Site settings → Environment variables
   - `VITE_GEMINI_API_KEY` を追加

5. **デプロイ完了後**
   - Netlifyから提供されるURL（例：`https://your-app.netlify.app`）を確認
   - Meta for Developersの「コールバックURLをリダイレクト」に以下を設定：
     ```
     https://your-app.netlify.app/oauth-callback.html
     ```

### 方法3: その他のホスティングサービス

- **GitHub Pages**: 静的サイトホスティング
- **Cloudflare Pages**: 高速なCDN
- **AWS Amplify**: AWS統合
- **Firebase Hosting**: Google Cloud統合

## デプロイ後の設定

### 1. Meta for DevelopersでコールバックURLを更新

1. Meta for Developers → アプリを選択
2. 「ユースケース > カスタマイズ」→「設定」を開く
3. 「コールバックURLをリダイレクト」に本番URLを設定：
   ```
   https://your-app-domain.com/oauth-callback.html
   ```
4. 「保存する」をクリック

### 2. アプリの基本設定を完了

1. 「設定」→「基本設定」を開く
2. 必須項目を入力：
   - アプリアイコン (1024 x 1024)
   - プライバシーポリシーのURL
   - カテゴリ
3. 「変更を保存」をクリック

### 3. 動作確認

1. デプロイされたURLにアクセス
2. 「自動取得」ボタンをクリック
3. OAuth認証が正常に動作するか確認

## トラブルシューティング

### コールバックURLエラー

- Meta for DevelopersのコールバックURLと実際のURLが一致しているか確認
- HTTPSでアクセスしているか確認
- ブラウザのコンソール（F12）でエラーを確認

### 環境変数が読み込まれない

- 環境変数名が `VITE_` で始まっているか確認
- デプロイ後に環境変数を再設定
- ビルドを再実行

## 注意事項

- 本番環境では、HTTPSが必須です（OAuth認証のため）
- 環境変数は機密情報なので、GitHubにコミットしないでください
- `.env` ファイルは `.gitignore` に追加してください
