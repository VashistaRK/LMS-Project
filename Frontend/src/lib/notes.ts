/* eslint-disable */
export function normalizeBlockNoteContent(raw: unknown): any[] | null {
  try {
    if (!raw) return null;

    // If it's already an array of blocks, return as-is
    if (Array.isArray(raw)) return raw;

    // Try common shapes for BlockNote content
    const asObj = (value: any): any | null => {
      if (!value) return null;
      if (Array.isArray(value)) return value;
      // top-level blocks
      if (Array.isArray(value.blocks)) return value.blocks;
      if (Array.isArray(value.topLevelBlocks)) return value.topLevelBlocks;
      // nested shapes sometimes used when serializing the full document
      if (value.document) {
        if (Array.isArray(value.document.blocks)) return value.document.blocks;
        if (Array.isArray(value.document.topLevelBlocks)) return value.document.topLevelBlocks;
      }
      // other common fallback
      if (value.content && Array.isArray(value.content.blocks)) return value.content.blocks;
      return null;
    };

    // If it's a string, try parse
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return asObj(parsed);
      } catch (err) {
        return null;
      }
    }

    if (typeof raw === 'object' && raw !== null) {
      return asObj(raw as any);
    }

    return null;
  } catch (err) {
    console.error('normalizeBlockNoteContent error', err);
    return null;
  }
}
