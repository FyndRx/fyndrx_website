// Assistant replies come back as plain text with light markdown (bold, lists)
// from the LLM. This renders just enough of that to look right in a chat
// bubble — not a full markdown engine.
export function renderChatMarkdown(content: string | null | undefined): string {
  if (!content) return '';

  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const inline = (text: string) =>
    text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');

  const lines = escaped.split('\n');
  const htmlParts: string[] = [];
  let listBuffer: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listBuffer.length && listType) {
      htmlParts.push(`<${listType}>${listBuffer.join('')}</${listType}>`);
    }
    listBuffer = [];
    listType = null;
  };

  for (const rawLine of lines) {
    const bulletMatch = rawLine.match(/^\s*[-*]\s+(.*)$/);
    const numberedMatch = rawLine.match(/^\s*\d+\.\s+(.*)$/);

    if (bulletMatch) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listBuffer.push(`<li>${inline(bulletMatch[1])}</li>`);
      continue;
    }
    if (numberedMatch) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      listBuffer.push(`<li>${inline(numberedMatch[1])}</li>`);
      continue;
    }

    flushList();
    if (rawLine.trim() !== '') {
      htmlParts.push(`<p>${inline(rawLine)}</p>`);
    }
  }
  flushList();

  return htmlParts.join('');
}
