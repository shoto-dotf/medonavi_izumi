// URLをリンクに変換するシンプルな関数
export const markdownToHtml = (text: string): string => {
  // URLをaタグに変換
  const linkifiedText = text.replace(
    /(https?:\/\/[^\s]+)/g, 
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
  );
  
  // 改行を<br>タグに変換
  return linkifiedText.replace(/\n/g, '<br>');
};