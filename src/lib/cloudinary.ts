export function getCloudinaryImageUrl(publicId: string, options?: { width?: number; quality?: string }) {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloud) {
    return publicId;
  }

  const width = options?.width ? `w_${options.width},` : "";
  const quality = options?.quality ? `q_${options.quality},` : "q_auto,";
  return `https://res.cloudinary.com/${cloud}/image/upload/${width}${quality}f_auto/${publicId}`;
}
