/* eslint-disable */
import type { CourseData, ThumbnailData } from "../types/course";

const FALLBACK_THUMB = "images/no-image.png";

export default function getThumbnailUrl(course: CourseData): string {
  const t = (course as any)?.thumbnail as
    | ThumbnailData
    | string
    | undefined
    | null;
  if (!t) return FALLBACK_THUMB;

  if (typeof t === "string") return t || FALLBACK_THUMB;

  // if backend sent an object with data + contentType
  try {
    const dataField = (t as ThumbnailData).data ?? (t as any);
    const contentType = (t as ThumbnailData).contentType ?? "image/png";

    // many backends send { data: { data: [numbers...] } }
    const maybeArray = (dataField as any)?.data ?? dataField;
    if (!maybeArray) return FALLBACK_THUMB;

    const byteArray = new Uint8Array(maybeArray);
    let binary = "";
    for (let i = 0; i < byteArray.length; i++) {
      binary += String.fromCharCode(byteArray[i]);
    }
    const base64 = btoa(binary);
    return `data:${contentType};base64,${base64}`;
  } catch (e) {
    // fallback safe
    console.error("getThumbnailUrl error:", e);
    return FALLBACK_THUMB;
  }
}
