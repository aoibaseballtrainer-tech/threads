import { ThreadsApiConfig } from '../types';

/**
 * アプリIDとapp secretからアクセストークンを取得（アプリトークン）
 * 注意: これはアプリレベルのトークンで、ユーザー投稿には通常ユーザートークンが必要です
 */
export const getAppAccessToken = async (
  appId: string,
  appSecret: string
): Promise<{ success: boolean; accessToken?: string; message: string }> => {
  try {
    // Graph API でアプリトークンを取得
    const response = await fetch(
      `https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`
    );
    const data = await response.json();

    if (data.access_token) {
      return {
        success: true,
        accessToken: data.access_token,
        message: 'アプリトークンを取得しました'
      };
    } else {
      return {
        success: false,
        message: data.error?.message || 'アプリトークンの取得に失敗しました'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `接続エラー: ${error.message || '不明なエラーが発生しました'}`
    };
  }
};

/**
 * OAuth認証でアクセストークンを自動取得（Threads API専用エンドポイント使用）
 * GASコードと同じ仕組みを使用
 */
export const getAccessTokenViaOAuth = async (
  appId: string,
  redirectUri?: string
): Promise<{ success: boolean; accessToken?: string; message: string }> => {
  return new Promise((resolve) => {
    // App IDの検証
    const trimmedAppId = appId ? appId.trim() : '';
    if (!trimmedAppId) {
      resolve({
        success: false,
        message: 'App IDが入力されていません。'
      });
      return;
    }

    // App IDの形式を検証（数字のみであることを確認）
    if (!/^\d+$/.test(trimmedAppId)) {
      resolve({
        success: false,
        message: `App IDの形式が正しくありません。数字のみである必要があります。現在の値: "${trimmedAppId}"`
      });
      return;
    }

    // コールバックURLを設定（本番環境では自動検出、開発環境ではlocalhost）
    const getCallbackUrl = () => {
      if (redirectUri) return redirectUri;
      // 本番環境では現在のURLから自動生成
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return `${window.location.origin}/oauth-callback.html`;
      }
      // 開発環境ではlocalhostを使用
      return 'https://localhost:3000/oauth-callback.html';
    };
    const callbackUrl = getCallbackUrl();
    
    // Threads API専用のOAuth認証URLを生成（GASコードと同じ）
    // GAS: THREADS_AUTH_URL = 'https://threads.net/oauth/authorize'
    const scopes = 'threads_basic,threads_content_publish';
    
    // URLパラメータを構築（client_idが確実に含まれるように）
    const params = new URLSearchParams({
      client_id: trimmedAppId,
      redirect_uri: callbackUrl,
      scope: scopes,
      response_type: 'code',
      display: 'popup'
    });
    const authUrl = `https://threads.net/oauth/authorize?${params.toString()}`;
    
    // デバッグ用（開発時のみ）
    console.log('OAuth認証URL (Threads API専用):', authUrl);
    console.log('使用しているApp ID:', trimmedAppId);
    console.log('App IDの長さ:', trimmedAppId.length);
    console.log('App IDが空でないか:', trimmedAppId.length > 0);
    console.log('コールバックURL:', callbackUrl);
    console.log('URLパラメータ:', params.toString());

    // ポップアップウィンドウで認証
    const width = 600;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    // URLが正しく生成されているか最終確認
    if (!authUrl.includes('client_id=') || !authUrl.includes(trimmedAppId)) {
      console.error('OAuth URL生成エラー: client_idが含まれていません');
      console.error('生成されたURL:', authUrl);
      resolve({
        success: false,
        message: `OAuth URLの生成に失敗しました。App IDが正しく含まれていません。App ID: ${trimmedAppId}`
      });
      return;
    }
    
    console.log('ポップアップを開きます:', authUrl);
    const popup = window.open(
      authUrl,
      'Threads認証',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      resolve({
        success: false,
        message: 'ポップアップがブロックされました。ブラウザの設定でポップアップを許可してください。'
      });
      return;
    }
    
    console.log('ポップアップが正常に開かれました');

    // ポップアップからのメッセージをリッスン
    const handleMessage = async (event: MessageEvent) => {
      console.log('メッセージを受信:', event.data.type, 'from:', event.origin, 'expected:', window.location.origin);
      
      // セキュリティチェック（同じオリジンからのみ）
      if (event.origin !== window.location.origin) {
        console.log('オリジン不一致のため無視:', event.origin, '!==', window.location.origin);
        return;
      }

      if (event.data.type === 'THREADS_OAUTH_SUCCESS') {
        console.log('アクセストークンを直接受信しました');
        messageReceived = true;
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        if (popup && !popup.closed) popup.close();
        resolve({
          success: true,
          accessToken: event.data.accessToken,
          message: 'アクセストークンを取得しました'
        });
      } else if (event.data.type === 'THREADS_OAUTH_CODE') {
        // 認証コードを取得した場合、トークンに交換する（Threads API専用）
        console.log('認証コードを受信しました:', event.data.code);
        messageReceived = true;
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        if (popup && !popup.closed) popup.close();
        
        // App Secretが必要なので、localStorageから取得を試みる
        const appSecret = localStorage.getItem(`threads_api_appSecret_${trimmedAppId}`) || '';
        
        console.log('App Secret取得:', appSecret ? '取得済み' : '未取得');
        console.log('App ID:', trimmedAppId);
        console.log('コールバックURL:', callbackUrl);
        
        if (!appSecret) {
          resolve({
            success: false,
            message: 'App Secretが必要です。App Secretを入力してから再度お試しください。'
          });
          return;
        }
        
        // 認証コードをトークンに交換
        console.log('トークン交換を開始します...');
        try {
          const tokenResult = await exchangeCodeForToken(
            event.data.code,
            trimmedAppId,
            appSecret,
            callbackUrl
          );
          
          console.log('トークン交換結果:', tokenResult.success ? '成功' : '失敗', tokenResult.message);
          resolve(tokenResult);
        } catch (error: any) {
          console.error('トークン交換エラー:', error);
          resolve({
            success: false,
            message: `トークン交換中にエラーが発生しました: ${error.message || '不明なエラー'}`
          });
        }
      } else if (event.data.type === 'THREADS_OAUTH_ERROR') {
        console.log('OAuthエラーを受信:', event.data.error);
        messageReceived = true;
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        if (popup && !popup.closed) popup.close();
        resolve({
          success: false,
          message: event.data.error || '認証に失敗しました'
        });
      }
    };

    console.log('メッセージリスナーを登録しました。オリジン:', window.location.origin);
    window.addEventListener('message', handleMessage);

    // ポップアップが閉じられた場合
    let messageReceived = false;
    const checkClosed = setInterval(() => {
      if (popup.closed && !messageReceived) {
        console.log('ポップアップが閉じられましたが、メッセージが受信されていません');
        clearInterval(checkClosed);
        // メッセージが来ていない場合のみキャンセルとみなす
        // ただし、メッセージが遅れて来る可能性があるので、少し待つ
        setTimeout(() => {
          if (!messageReceived) {
            console.log('メッセージが来なかったため、タイムアウトとみなします');
            window.removeEventListener('message', handleMessage);
            resolve({
              success: false,
              message: '認証が完了しませんでした。ポップアップが閉じられましたが、認証情報が受信されませんでした。'
            });
          }
        }, 2000);
      }
    }, 1000);

    // タイムアウト（5分）
    setTimeout(() => {
      clearInterval(checkClosed);
      window.removeEventListener('message', handleMessage);
      if (popup && !popup.closed) popup.close();
      // まだresolveされていない場合のみ
      resolve({
        success: false,
        message: '認証がタイムアウトしました。もう一度お試しください。'
      });
    }, 300000);
  });
};

/**
 * URLフラグメントからアクセストークンを取得（OAuthコールバック用）
 * Threads APIは response_type=code を使用するため、認証コードを取得してからトークンに交換する必要がある
 */
export const extractTokenFromUrl = (): { accessToken?: string; code?: string; error?: string } => {
  const hash = window.location.hash.substring(1);
  const search = window.location.search.substring(1);
  const hashParams = new URLSearchParams(hash);
  const searchParams = new URLSearchParams(search);
  
  // response_type=token の場合（直接トークンが返される）
  const accessToken = hashParams.get('access_token');
  
  // response_type=code の場合（認証コードが返される）
  const code = searchParams.get('code') || hashParams.get('code');
  
  const error = searchParams.get('error_description') || searchParams.get('error') || hashParams.get('error_description') || hashParams.get('error');
  
  if (accessToken) {
    // URLからトークンを削除（セキュリティのため）
    window.history.replaceState(null, '', window.location.pathname);
    return { accessToken };
  }
  
  if (code) {
    // 認証コードを取得した場合、トークンに交換する必要がある
    window.history.replaceState(null, '', window.location.pathname);
    return { code };
  }
  
  if (error) {
    window.history.replaceState(null, '', window.location.pathname);
    return { error };
  }
  
  return {};
};

/**
 * 認証コードをアクセストークンに交換（Threads API専用）
 * GASコード: THREADS_ACCESS_TOKEN_URL = 'https://graph.threads.net/oauth/access_token'
 */
export const exchangeCodeForToken = async (
  code: string,
  appId: string,
  appSecret: string,
  redirectUri: string
): Promise<{ success: boolean; accessToken?: string; message: string }> => {
  try {
    const url = `https://graph.threads.net/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`;
    
    console.log('トークン交換URL:', url.replace(/client_secret=[^&]+/, 'client_secret=***'));
    console.log('認証コード:', code.substring(0, 10) + '...');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('レスポンスステータス:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('レスポンスデータ:', data);
    
    if (data.access_token) {
      return {
        success: true,
        accessToken: data.access_token,
        message: 'アクセストークンを取得しました'
      };
    } else {
      const errorMessage = data.error?.message || data.error_description || data.error?.error_user_msg || 'アクセストークンの取得に失敗しました';
      const errorCode = data.error?.code || data.error?.error_code || '';
      return {
        success: false,
        message: errorCode ? `エラー (${errorCode}): ${errorMessage}` : errorMessage
      };
    }
  } catch (error: any) {
    console.error('fetchエラー:', error);
    return {
      success: false,
      message: `接続エラー: ${error.message || '不明なエラーが発生しました'}`
    };
  }
};

/**
 * アクセストークンからユーザーIDを自動取得
 */
export const getUserIdFromToken = async (
  accessToken: string
): Promise<{ success: boolean; userId?: string; message: string }> => {
  try {
    // Graph API でユーザー情報を取得
    const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${accessToken}`);
    const data = await response.json();

    if (data.id) {
      return {
        success: true,
        userId: data.id,
        message: 'ユーザーIDを取得しました'
      };
    } else {
      return {
        success: false,
        message: data.error?.message || 'ユーザーIDの取得に失敗しました'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `接続エラー: ${error.message || '不明なエラーが発生しました'}`
    };
  }
};

/**
 * Threads API への投稿を実行
 */
export const postToThreads = async (
  config: ThreadsApiConfig,
  text: string
): Promise<{ success: boolean; message: string; postId?: string; url?: string }> => {
  if (!config.accessToken) {
    return {
      success: false,
      message: 'アクセストークンが設定されていません。'
    };
  }

  // ユーザーIDが設定されていない場合は自動取得
  let userId = config.userId;
  if (!userId) {
    const userInfo = await getUserIdFromToken(config.accessToken);
    if (!userInfo.success) {
      return {
        success: false,
        message: `ユーザーIDの取得に失敗: ${userInfo.message}`
      };
    }
    userId = userInfo.userId!;
  }

  try {
    // Threads API エンドポイント
    const url = `https://graph.threads.net/v1.0/${userId}/threads`;
    
    // 投稿データ
    const formData = new URLSearchParams();
    formData.append('media_type', 'TEXT');
    formData.append('text', text);
    formData.append('access_token', config.accessToken);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (data.id) {
      // 投稿成功
      const postUrl = `https://threads.net/@${userId}/post/${data.id}`;
      return {
        success: true,
        message: '投稿に成功しました！',
        postId: data.id,
        url: postUrl
      };
    } else {
      // エラー
      const errorMessage = data.error?.message || data.error_message || '投稿に失敗しました';
      return {
        success: false,
        message: `エラー: ${errorMessage}`
      };
    }
  } catch (error: any) {
    console.error('Threads API Error:', error);
    return {
      success: false,
      message: `接続エラー: ${error.message || '不明なエラーが発生しました'}`
    };
  }
};

/**
 * Threads API の接続テスト
 */
export const testThreadsConnection = async (
  config: ThreadsApiConfig
): Promise<{ success: boolean; message: string; postId?: string; url?: string }> => {
  return await postToThreads(config, 'テスト投稿');
};
