import { supabase, CompanyDocument, DocumentCategory } from './supabase';

export const DOCUMENTS_BUCKET = 'internal-documents';
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

interface UploadInput {
  file: File;
  title: string;
  category: DocumentCategory;
  document_date?: string | null;
  client_id?: string | null;
  project_id?: string | null;
  notes?: string | null;
}

const safeFileName = (name: string) => name.normalize('NFKD').replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').slice(-120);

/** Uploads a file to the private bucket and records it in `documents`. */
export async function uploadDocument(input: UploadInput): Promise<CompanyDocument> {
  if (input.file.size > MAX_DOCUMENT_BYTES) throw new Error('Files must be 25 MB or smaller.');

  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}-${safeFileName(input.file.name)}`;
  const { error: uploadError } = await supabase!.storage
    .from(DOCUMENTS_BUCKET)
    .upload(path, input.file, { contentType: input.file.type || undefined, upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const { data, error } = await supabase!
    .from('documents')
    .insert({
      title: input.title,
      category: input.category,
      storage_path: path,
      file_name: input.file.name,
      mime_type: input.file.type || null,
      size_bytes: input.file.size,
      document_date: input.document_date || null,
      client_id: input.client_id || null,
      project_id: input.project_id || null,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) {
    // Don't leave an orphaned file behind.
    await supabase!.storage.from(DOCUMENTS_BUCKET).remove([path]);
    throw new Error(error.message);
  }
  return data as CompanyDocument;
}

/** Opens a document through a short-lived signed URL. */
export async function openDocument(storagePath: string) {
  // Open the tab synchronously so pop-up blockers allow it, then point it at the file.
  const tab = window.open('', '_blank');
  const { data, error } = await supabase!.storage.from(DOCUMENTS_BUCKET).createSignedUrl(storagePath, 60);
  if (error || !data) {
    tab?.close();
    throw new Error(error?.message ?? 'Could not open the document.');
  }
  if (tab) tab.location.href = data.signedUrl;
  else window.location.href = data.signedUrl;
}

export async function deleteDocument(doc: Pick<CompanyDocument, 'id' | 'storage_path'>) {
  const { error } = await supabase!.from('documents').delete().eq('id', doc.id);
  if (error) throw new Error(error.message);
  await supabase!.storage.from(DOCUMENTS_BUCKET).remove([doc.storage_path]);
}

export const formatBytes = (bytes: number | null) => {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};
