// GPT-4o清書API モック実装

export interface GPTRefinementResult {
  refined_content: string;
  structure: {
    sections: string[];
    estimated_slides: number;
  };
  processing_time: number;
}

class MockGPTAPI {
  async refineContent(rawContent: string, category: string): Promise<GPTRefinementResult> {
    // 2-3秒の処理時間をシミュレート
    await new Promise(resolve => setTimeout(resolve, 2500));

    const refinedContent = this.generateRefinedContent(rawContent, category);
    const structure = this.analyzeStructure(refinedContent);

    return {
      refined_content: refinedContent,
      structure,
      processing_time: 2500
    };
  }

  private generateRefinedContent(rawContent: string, category: string): string {
    const templates = {
      procedure: this.generateProcedureTemplate(rawContent),
      checklist: this.generateChecklistTemplate(rawContent),
      faq: this.generateFAQTemplate(rawContent),
      general: this.generateGeneralTemplate(rawContent)
    };

    return templates[category as keyof typeof templates] || templates.general;
  }

  private generateProcedureTemplate(content: string): string {
    return `# 業務手順マニュアル

## 概要
このマニュアルは「${content.slice(0, 30)}...」に関する業務手順を定めたものです。

## 目的
- 業務の標準化と効率化
- ミスの防止と品質向上
- 新人スタッフの教育支援

## 対象者
- しおや消化器内科クリニック全スタッフ
- 新人研修対象者

## 手順

### 1. 準備段階
**必要な物品・資料：**
- システムアクセス権限
- 必要書類一式
- 確認チェックリスト

**注意事項：**
- 個人情報の取り扱いに十分注意する
- 不明な点は必ず上司に確認する

### 2. 実行段階
**具体的な手順：**

${content.split('\n').map((line, index) => {
  if (line.trim()) {
    return `${index + 1}. ${line.trim()}\n   - 実行後は必ず確認を行う\n   - 問題があれば直ちに報告する`;
  }
  return '';
}).filter(Boolean).join('\n\n')}

### 3. 完了・確認段階
**最終チェック項目：**
- 全ての手順が完了しているか
- 記録が適切に残されているか
- 次の担当者への引き継ぎ事項はないか

**記録・報告：**
- 実施日時と担当者名を記録
- 特記事項があれば報告書を作成
- 定期的な見直しと改善提案

## トラブルシューティング
よくある問題と対処法を記載

## 関連資料
- 院内規則
- 関連マニュアル
- 緊急連絡先一覧

## 改訂履歴
作成日：${new Date().toLocaleDateString('ja-JP')}
作成者：メドナビAI システム`;
  }

  private generateChecklistTemplate(content: string): string {
    const items = content.split('\n').filter(line => line.trim());
    
    return `# 業務チェックリスト

## 基本情報
- **対象業務：** ${items[0] || '業務項目'}
- **実施頻度：** 毎日/毎週/毎月
- **責任者：** 各部署責任者
- **最終更新：** ${new Date().toLocaleDateString('ja-JP')}

## チェック項目

### 開始前確認
- [ ] 必要な資料・物品の準備完了
- [ ] システムの動作確認
- [ ] 前回からの引き継ぎ事項確認
- [ ] 当日の特記事項確認

### 実施項目
${items.map((item, index) => `- [ ] ${item.trim()}`).join('\n')}

### 完了後確認
- [ ] 全項目の実施完了
- [ ] 記録の入力完了
- [ ] 次回への引き継ぎ事項記録
- [ ] 責任者への報告完了

## 注意事項
- **重要：** 各項目は必ず順番通りに実施する
- **記録：** チェック完了時刻と担当者名を記入
- **報告：** 異常や問題があれば直ちに責任者に報告

## 緊急時対応
問題発生時の連絡先：
- 日中：院長・事務長
- 夜間・休日：オンコール当番医

---
**このチェックリストは定期的に見直し、改善していきます。**`;
  }

  private generateFAQTemplate(content: string): string {
    return `# よくある質問（FAQ）

## 基本情報
- **対象：** ${content.slice(0, 50)}... に関する質問
- **最終更新：** ${new Date().toLocaleDateString('ja-JP')}
- **更新者：** メドナビAI システム

## よくある質問と回答

### Q1: 基本的な手順について
**Q:** ${content.split('?')[0] || '基本的な手順'}について教えてください。

**A:** 以下の手順で実施してください：
1. まず準備を行います
2. システムにログインします
3. 必要な項目を入力します
4. 確認・保存を行います

### Q2: トラブル時の対応
**Q:** エラーが発生した場合はどうすればいいですか？

**A:** 
- まずエラーメッセージを確認してください
- システムを一度ログアウトして再ログインしてみてください
- それでも解決しない場合は責任者に報告してください

### Q3: 記録・保存について
**Q:** 作業記録はどこに保存すればいいですか？

**A:** 
- 電子カルテシステムの指定フォルダに保存
- ファイル名は日付_担当者名の形式
- バックアップも必ず取ること

### Q4: 緊急時の対応
**Q:** 緊急事態が発生した場合の連絡先は？

**A:** 
- 日中：院長、事務長
- 夜間・休日：オンコール当番医
- システム障害：IT担当者

## 追加の質問
ご不明な点がございましたら、以下までお問い合わせください：
- 内線：1234
- メール：support@clinic.jp

---
**このFAQは随時更新されます。新しい質問があれば管理者までご連絡ください。**`;
  }

  private generateGeneralTemplate(content: string): string {
    return `# 業務マニュアル

## 文書管理情報
- **タイトル：** ${content.slice(0, 30)}... に関するマニュアル
- **文書番号：** DOC-${Date.now().toString().slice(-6)}
- **作成日：** ${new Date().toLocaleDateString('ja-JP')}
- **作成者：** メドナビAI システム
- **承認者：** 未承認
- **版数：** 1.0

## 目的・概要
このマニュアルは業務の標準化と効率化を目的として作成されました。
全てのスタッフが同じ品質のサービスを提供できるよう、手順を明確に定めています。

## 適用範囲
- 対象部署：全部署
- 対象者：全スタッフ
- 適用開始日：承認後

## 内容

### 基本事項
${content.split('\n').map(line => line.trim()).filter(Boolean).map(line => `- ${line}`).join('\n')}

### 詳細手順
1. **準備フェーズ**
   - 必要物品の確認
   - システムの起動確認
   - 前回からの引き継ぎ事項確認

2. **実行フェーズ**
   - 手順に従った作業実施
   - 各段階での確認作業
   - 問題発生時の対応

3. **完了フェーズ**
   - 最終確認の実施
   - 記録の作成・保存
   - 次回への引き継ぎ事項整理

## 品質管理
- 定期的な手順の見直し
- スタッフからのフィードバック収集
- 継続的な改善活動

## 関連文書
- 院内規則
- 緊急時対応マニュアル
- システム操作マニュアル

---
**このマニュアルに関するご質問・ご提案は管理者までお願いします。**`;
  }

  private analyzeStructure(content: string): { sections: string[], estimated_slides: number } {
    const lines = content.split('\n');
    const sections = lines
      .filter(line => line.startsWith('#'))
      .map(line => line.replace(/^#+\s*/, ''))
      .slice(0, 8); // 最大8セクション

    const estimated_slides = Math.max(3, Math.min(12, Math.ceil(content.length / 400)));

    return {
      sections,
      estimated_slides
    };
  }
}

// シングルトンインスタンス
let mockGPTAPI: MockGPTAPI | null = null;

export const getMockGPTAPI = (): MockGPTAPI => {
  if (!mockGPTAPI) {
    mockGPTAPI = new MockGPTAPI();
  }
  return mockGPTAPI;
};

export default MockGPTAPI;