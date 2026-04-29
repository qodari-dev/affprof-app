import imageCompression from 'browser-image-compression';

type ImageCompressionProfile = {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  initialQuality: number;
};

export const IMAGE_UPLOAD_COMPRESSION_PROFILES = {
  brandLogo: {
    maxSizeMB: 1,
    maxWidthOrHeight: 2048,
    initialQuality: 0.95,
  },
  productImage: {
    maxSizeMB: 0.6,
    maxWidthOrHeight: 1280,
    initialQuality: 0.88,
  },
} satisfies Record<string, ImageCompressionProfile>;

function toWebpFileName(fileName: string) {
  if (!fileName.includes('.')) {
    return `${fileName}.webp`;
  }

  return fileName.replace(/\.[^.]+$/, '.webp');
}

export async function compressImageForUpload(file: File, profile: ImageCompressionProfile): Promise<File> {
  const compressed = await imageCompression(file, {
    maxSizeMB: profile.maxSizeMB,
    maxWidthOrHeight: profile.maxWidthOrHeight,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: profile.initialQuality,
  });

  return new File([compressed], toWebpFileName(file.name), {
    type: 'image/webp',
    lastModified: file.lastModified,
  });
}
