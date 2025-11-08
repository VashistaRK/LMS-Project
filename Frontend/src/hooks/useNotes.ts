import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesAPI, type Note, type DocumentData } from '../services/notesApi';
import { toast } from 'sonner';

// Query keys
export const notesKeys = {
  all: ['notes'] as const,
  document: (docId: string) => [...notesKeys.all, 'document', docId] as const,
};

// Hook to fetch document data
export function useDocument(docId: string | undefined) {
  return useQuery({
    queryKey: notesKeys.document(docId || ''),
    queryFn: () => notesAPI.getDocument(docId!),
    enabled: !!docId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook to save document
export function useSaveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ docId, data }: { docId: string; data: Partial<DocumentData> }) =>
      notesAPI.saveDocument(docId, data),
  onSuccess: (_data, variables) => {
      // Update the cache
  queryClient.setQueryData(notesKeys.document(variables.docId), _data);
      toast.success('Document saved successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook to upload PDF
export function useUploadPDF() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ docId, file, onProgress }: { 
      docId: string; 
      file: File; 
      onProgress?: (progress: number) => void 
    }) => notesAPI.uploadPDF(docId, file, onProgress),
  onSuccess: (_data, variables) => {
      // Invalidate and refetch document data
      queryClient.invalidateQueries({ queryKey: notesKeys.document(variables.docId) });
      toast.success('PDF uploaded successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook to delete PDF
export function useDeletePDF() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (docId: string) => notesAPI.deletePDF(docId),
    onSuccess: (_, docId) => {
      // Invalidate and refetch document data
      queryClient.invalidateQueries({ queryKey: notesKeys.document(docId) });
      toast.success('PDF deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook to save manual notes
export function useSaveNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ docId, notes }: { docId: string; notes: Note[] }) =>
      notesAPI.saveNotes(docId, notes),
  onSuccess: (_data, variables) => {
      // Update the cache
  queryClient.setQueryData(notesKeys.document(variables.docId), _data);
      toast.success('Notes saved successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook to save rich text content
export function useSaveRichContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ docId, content }: { docId: string; content: unknown }) =>
      notesAPI.saveRichContent(docId, content),
    onSuccess: (_data, variables) => {
      // Update the cache
  queryClient.setQueryData(notesKeys.document(variables.docId), _data);
      toast.success('Content saved successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook to validate file
export function useValidateFile() {
  return (file: File) => notesAPI.validateFile(file);
}

// Hook to validate notes
export function useValidateNotes() {
  return (notes: Note[]) => notesAPI.validateNotes(notes);
}
