export const extractDriveId = (url?: string): string | null => {
  if (!url) return null;
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)\//,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/file\/d\/([a-zA-Z0-9_-]+)$/,
    /\/uc\?export=download&id=([a-zA-Z0-9_-]+)/,
  ];
  for (const re of patterns) {
    const match = url.match(re);
    if (match?.[1]) return match[1];
  }
  return null;
};

export const toDrivePlayable = (
  url?: string
): { playable: string; preview: string } => {
  if (!url) return { playable: "", preview: "" };
  const id = extractDriveId(url);
  if (id) {
    return {
      playable: `https://drive.google.com/uc?export=download&id=${id}`,
      preview: `https://drive.google.com/file/d/${id}/preview`,
    };
  }
  return { playable: url, preview: "" };
};

interface Thumbnail {
  data: { data: number[] } | number[];
  contentType: string;
}

interface ThumbnailData {
  data: { type: string; data: number[] };
  contentType: string;
}

export const convertThumbnail = (thumbnail: Thumbnail | ThumbnailData | File) => {
  if (!thumbnail) return "";
  if (thumbnail instanceof File) {
    // Handle File type, perhaps return object URL or something, but for now return ""
    return "";
  }
  if (!thumbnail.data || !thumbnail.contentType) return "";
  try {
    let byteArray: number[];
    if (Array.isArray(thumbnail.data)) {
      byteArray = thumbnail.data;
    } else if (thumbnail.data.data) {
      byteArray = thumbnail.data.data;
    } else {
      return "";
    }
    const uint8Array = new Uint8Array(byteArray);
    let binary = "";
    const chunkSize = 0x8000;

    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    const base64 = btoa(binary);
    return `data:${thumbnail.contentType};base64,${base64}`;
  } catch (err) {
    console.error("Thumbnail conversion error:", err);
    return "";
  }
};
