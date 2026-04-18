import { tsr } from '@ts-rest/serverless/next';
import { getAuthContext } from '@/server/utils/auth-context';
import { genericTsRestErrorResponse, throwHttpError } from '@/server/utils/generic-ts-rest-error';
import { deleteSpacesObject } from '@/server/utils/storage/spaces-presign';
import { contract } from '../contracts';

export const storageHandler = tsr.router(contract.storage, {
  deleteFile: async ({ body }, { request }) => {
    try {
      const auth = await getAuthContext(request);

      // Key format: {env}/{appSlug}/{userId}/{resource}/{uuid}.{ext}
      // Validate the key belongs to the authenticated user before deleting.
      const keyUserId = body.fileKey.split('/')[2];
      if (keyUserId !== auth.userId) {
        throwHttpError({
          status: 403,
          message: 'You do not have permission to delete this file',
          code: 'FORBIDDEN',
        });
      }

      await deleteSpacesObject(body.fileKey);

      return { status: 200 as const, body: { ok: true as const } };
    } catch (e) {
      return genericTsRestErrorResponse(e, {
        genericMsg: 'Error deleting file',
      });
    }
  },
});
