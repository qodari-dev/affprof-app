'use client';

import { api } from '@/clients/api';

/**
 * Deletes a file from Spaces that was uploaded by the current user.
 * Used to clean up orphaned uploads (e.g. user uploads then replaces before saving).
 */
export function useDeleteStorageFile() {
  return api.storage.deleteFile.useMutation({
    // Silent — no toast needed, this is a background cleanup
  });
}
