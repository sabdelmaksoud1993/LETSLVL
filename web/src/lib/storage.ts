import { createClient } from "@/lib/supabase-browser";

const BUCKET_NAME = "product-images";

/**
 * Upload a product image to Supabase Storage.
 * Path: {sellerId}/{timestamp}-{filename}
 * Returns the public URL of the uploaded image.
 */
export async function uploadProductImage(
  file: File,
  sellerId: string,
): Promise<string> {
  const supabase = createClient();

  // Sanitize filename: remove special characters, keep extension
  const ext = file.name.split(".").pop() ?? "jpg";
  const safeName = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 50);
  const timestamp = Date.now();
  const path = `${sellerId}/${timestamp}-${safeName}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

  return publicUrl;
}

/**
 * Delete a product image from Supabase Storage.
 * Extracts the storage path from the public URL.
 */
export async function deleteProductImage(url: string): Promise<void> {
  const supabase = createClient();

  // Extract path from public URL
  // URL format: {supabase_url}/storage/v1/object/public/{bucket}/{path}
  const bucketPrefix = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const idx = url.indexOf(bucketPrefix);

  if (idx === -1) {
    console.error("Could not extract storage path from URL:", url);
    return;
  }

  const path = decodeURIComponent(url.slice(idx + bucketPrefix.length));

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}
