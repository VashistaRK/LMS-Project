import axios from 'axios';

const api = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface Note {
  heading?: string;
  content: string;
  type?: "text" | "pdf";
  fileUrl?: string;
  fileSize?: number;
  uploadedAt?: Date;
}

export interface DocumentData {
  docId: string;
  content?: unknown; // BlockNote JSON
  notes: Note[];
  pdfUrl?: string;
  pdfSize?: number;
  pdfGzipped?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class NotesAPI {
  private baseURL = `${api}/docs`;

  // Get document data
  async getDocument(docId: string): Promise<DocumentData> {
    try {
      const response = await axios.get(`${this.baseURL}/${docId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw new Error('Failed to fetch document');
    }
  }

  // Create or update document
  async saveDocument(docId: string, data: Partial<DocumentData>): Promise<DocumentData> {
    try {
      const response = await axios.put(`${this.baseURL}/${docId}`, data, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      console.error('Error saving document:', error);
      throw new Error('Failed to save document');
    }
  }

  // Upload PDF file
 async uploadPDF(
  docId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ pdfUrl: string; fileSize: number; docId: string }> {
  try {
    const formData = new FormData();
    formData.append("pdf", file);

    const response = await axios.post(`${this.baseURL}/${docId}/upload`, formData, {
      withCredentials: true, // ensure cookies/sessions work if needed
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    // ✅ Expect backend to return { message, docId, pdfSize }
    return {
      pdfUrl: `${this.baseURL}/${response.data.docId}/pdf`,
      fileSize: response.data.pdfSize,
      docId: response.data.docId,
    };
  } catch (error) {
    console.error("❌ Error uploading PDF:", error);

    // ✅ Robust error message extraction
    let errorMessage = "Failed to upload PDF";
    if (axios.isAxiosError(error)) {
      errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        errorMessage;
    }

    throw new Error(errorMessage);
  }
}


  // Delete PDF file
  async deletePDF(docId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${docId}/pdf`, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Error deleting PDF:', error);
      throw new Error('Failed to delete PDF');
    }
  }

  // Save manual notes
  async saveNotes(docId: string, notes: Note[]): Promise<DocumentData> {
    try {
      const response = await axios.put(`${this.baseURL}/${docId}`, {
        notes: notes.map(note => ({
          heading: note.heading || '',
          content: note.content,
          type: 'text'
        }))
      }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });

      return response.data;
    } catch (error) {
      console.error('Error saving notes:', error);
      throw new Error('Failed to save notes');
    }
  }

  // Save rich text content (BlockNote)
  async saveRichContent(docId: string, content: unknown): Promise<DocumentData> {
    try {
      const response = await axios.put(`${this.baseURL}/${docId}`, {
        content
      }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });

      return response.data;
    } catch (error) {
      console.error('Error saving rich content:', error);
      throw new Error('Failed to save rich content');
    }
  }

  // Validate file before upload
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Only PDF files are allowed' };
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    return { valid: true };
  }

  // Validate notes
  validateNotes(notes: Note[]): { valid: boolean; error?: string } {
    for (const note of notes) {
      if (!note.content.trim()) {
        return { valid: false, error: 'All notes must have content' };
      }
      if (note.heading && note.heading.length > 100) {
        return { valid: false, error: 'Note headings must be less than 100 characters' };
      }
      if (note.content.length > 5000) {
        return { valid: false, error: 'Note content must be less than 5000 characters' };
      }
    }
    return { valid: true };
  }
}

export const notesAPI = new NotesAPI();
