# Notion Integration 設定ガイド

## 現在の問題
- Notion APIトークンが無効になっています（401 Unauthorized エラー）
- データベースにアクセスできない状態です

## 解決手順

### 1. Notion Integration の再作成

1. **Notion Integration管理画面にアクセス**
   ```
   https://www.notion.so/my-integrations
   ```

2. **新しいIntegrationを作成**
   - 名前: `メドナビAI`
   - ワークスペース: `しおや消化器内科クリニック`
   - 機能: `Read content`, `Update content`

3. **Internal Integration Secretをコピー**
   - Configuration タブから取得
   - 形式: `secret_` で始まる52文字

### 2. 環境変数の更新

`.env`ファイルの以下の行を更新：
```bash
# 新しいAPIトークンに置き換え
VITE_NOTION_API_KEY=secret_YOUR_NEW_INTEGRATION_SECRET
```

### 3. データベースへの権限設定

1. **データベースページにアクセス**
   ```
   https://notion.so/1cd3f0bae9be80d39922ef80780358e1
   ```

2. **Connectionを追加**
   - ページの「...」メニュー → 「+ Add connections」
   - 新しく作成したIntegrationを選択
   - アクセス権限を確認

### 4. 動作確認

```bash
# APIトークンのテスト
curl -H "Authorization: Bearer YOUR_NEW_TOKEN" \
     -H "Notion-Version: 2022-06-28" \
     https://api.notion.com/v1/users/me

# データベースアクセスのテスト
curl -H "Authorization: Bearer YOUR_NEW_TOKEN" \
     -H "Notion-Version: 2022-06-28" \
     -X POST \
     https://api.notion.com/v1/databases/1cd3f0bae9be80d39922ef80780358e1/query
```

### 5. 正常なレスポンス例

**ユーザー情報取得成功時:**
```json
{
  "object": "user",
  "id": "your-user-id",
  "name": "Your Name",
  "avatar_url": "...",
  "type": "person",
  "person": {
    "email": "your-email@example.com"
  }
}
```

**データベースクエリ成功時:**
```json
{
  "object": "list",
  "results": [
    {
      "object": "page",
      "id": "page-id",
      "properties": {
        "マニュアル名": {
          "title": [
            {
              "plain_text": "マニュアル名"
            }
          ]
        }
      }
    }
  ]
}
```

## 現在のフォールバック機能

APIトークンが無効でも、以下の機能は動作します：
- サンプルデータでのデモ表示
- UI コンポーネントの動作確認
- 基本的なマニュアル管理機能

## トラブルシューティング

### よくあるエラー

1. **401 Unauthorized**
   - APIトークンが無効または期限切れ
   - 新しいIntegrationを作成して解決

2. **403 Forbidden** 
   - データベースへのアクセス権限がない
   - Connectionの追加が必要

3. **404 Not Found**
   - データベースIDが間違っている
   - データベースが削除されている

### 確認事項

- [ ] Integrationが正常に作成されている
- [ ] APIトークンが正しく設定されている
- [ ] データベースにConnectionが追加されている
- [ ] データベースIDが正しい
- [ ] ワークスペースの管理権限がある

## 連絡先

技術的な問題や設定でお困りの場合は、開発チームまでお問い合わせください。