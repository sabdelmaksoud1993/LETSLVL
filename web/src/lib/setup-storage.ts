/**
 * Supabase Storage Bucket Setup Instructions
 * ============================================
 *
 * This file documents how to create the required storage bucket
 * for product image uploads. Run these steps via the Supabase Dashboard
 * or use the Supabase CLI.
 *
 * --- Option 1: Supabase Dashboard ---
 *
 * 1. Go to your Supabase project dashboard
 * 2. Navigate to Storage in the left sidebar
 * 3. Click "New bucket"
 * 4. Bucket name: "product-images"
 * 5. Check "Public bucket" (so images can be accessed via public URLs)
 * 6. Click "Create bucket"
 *
 * 7. Set up Storage Policies:
 *    - Go to the "product-images" bucket -> Policies tab
 *
 *    Policy 1: Allow public read access
 *      Name: "Public read access"
 *      Allowed operation: SELECT
 *      Target roles: anon, authenticated
 *      Policy definition: true
 *
 *    Policy 2: Allow authenticated users to upload
 *      Name: "Authenticated upload"
 *      Allowed operation: INSERT
 *      Target roles: authenticated
 *      Policy definition:
 *        (bucket_id = 'product-images') AND
 *        (auth.role() = 'authenticated') AND
 *        ((storage.foldername(name))[1] = auth.uid()::text)
 *
 *    Policy 3: Allow users to delete their own images
 *      Name: "Owner delete"
 *      Allowed operation: DELETE
 *      Target roles: authenticated
 *      Policy definition:
 *        (bucket_id = 'product-images') AND
 *        ((storage.foldername(name))[1] = auth.uid()::text)
 *
 * --- Option 2: Supabase SQL Editor ---
 *
 * Run the following SQL in the Supabase SQL Editor:
 *
 * -- Create the storage bucket
 * INSERT INTO storage.buckets (id, name, public)
 * VALUES ('product-images', 'product-images', true);
 *
 * -- Allow public read access
 * CREATE POLICY "Public read access"
 *   ON storage.objects FOR SELECT
 *   USING (bucket_id = 'product-images');
 *
 * -- Allow authenticated users to upload to their own folder
 * CREATE POLICY "Authenticated upload"
 *   ON storage.objects FOR INSERT
 *   WITH CHECK (
 *     bucket_id = 'product-images'
 *     AND auth.role() = 'authenticated'
 *     AND (storage.foldername(name))[1] = auth.uid()::text
 *   );
 *
 * -- Allow users to delete their own images
 * CREATE POLICY "Owner delete"
 *   ON storage.objects FOR DELETE
 *   USING (
 *     bucket_id = 'product-images'
 *     AND (storage.foldername(name))[1] = auth.uid()::text
 *   );
 *
 * --- Option 3: Supabase RPC for bid_count increment ---
 *
 * The realtime.ts module tries to call an RPC function to atomically
 * increment the bid count. Create it via SQL Editor:
 *
 * CREATE OR REPLACE FUNCTION increment_bid_count(
 *   auction_id_input UUID,
 *   new_bid_amount NUMERIC
 * )
 * RETURNS void
 * LANGUAGE plpgsql
 * SECURITY DEFINER
 * AS $$
 * BEGIN
 *   UPDATE auctions
 *   SET
 *     current_bid = new_bid_amount,
 *     bid_count = bid_count + 1
 *   WHERE id = auction_id_input;
 * END;
 * $$;
 *
 * --- File size limit ---
 *
 * By default Supabase allows up to 50MB per file.
 * For product images, consider setting a 5MB limit in the bucket config:
 *   Dashboard -> Storage -> product-images -> Settings -> File size limit: 5242880
 *
 * --- Accepted MIME types ---
 *
 * Optionally restrict to image types:
 *   Allowed MIME types: image/jpeg, image/png, image/webp
 */

export {};
