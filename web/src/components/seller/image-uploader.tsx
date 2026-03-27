"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { uploadProductImage, deleteProductImage } from "@/lib/storage";
import { AIBackgroundRemove } from "@/components/seller/ai-background-remove";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function ImageUploader({
  images,
  onChange,
  maxImages = 5,
}: ImageUploaderProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bgRemoveIndex, setBgRemoveIndex] = useState<number | null>(null);

  const canUpload = images.length < maxImages;

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!user) {
        setError("You must be signed in to upload images.");
        return;
      }

      setError(null);
      const fileArray = Array.from(files);

      // Validate files
      const validFiles = fileArray.filter((file) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError("Only JPEG, PNG, and WebP images are accepted.");
          return false;
        }
        if (file.size > MAX_FILE_SIZE) {
          setError("Each image must be under 5 MB.");
          return false;
        }
        return true;
      });

      // Limit to remaining slots
      const slots = maxImages - images.length;
      const filesToUpload = validFiles.slice(0, slots);

      if (filesToUpload.length === 0) return;

      // Track uploading state per file
      const uploadIds = filesToUpload.map((f) => `${f.name}-${Date.now()}`);
      setUploading((prev) => {
        const next = new Set(prev);
        uploadIds.forEach((id) => next.add(id));
        return next;
      });

      const newUrls: string[] = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        try {
          const url = await uploadProductImage(filesToUpload[i], user.id);
          newUrls.push(url);
        } catch (err) {
          console.error("Upload failed:", err);
          setError("Failed to upload image. Please try again.");
        } finally {
          setUploading((prev) => {
            const next = new Set(prev);
            next.delete(uploadIds[i]);
            return next;
          });
        }
      }

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
      }
    },
    [user, images, maxImages, onChange],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
      // Reset input so re-selecting the same file triggers onChange
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleRemove = useCallback(
    async (url: string) => {
      try {
        await deleteProductImage(url);
      } catch (err) {
        console.error("Failed to delete image:", err);
      }
      onChange(images.filter((img) => img !== url));
    },
    [images, onChange],
  );

  const handleReplaceImage = useCallback(
    (index: number, newUrl: string) => {
      const updated = images.map((img, i) => (i === index ? newUrl : img));
      onChange(updated);
      setBgRemoveIndex(null);
    },
    [images, onChange],
  );

  const handleClick = useCallback(() => {
    if (canUpload) {
      fileInputRef.current?.click();
    }
  }, [canUpload]);

  const isUploading = uploading.size > 0;

  return (
    <div>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        onChange={handleFileSelect}
        className="sr-only"
        aria-label="Upload images"
      />

      {/* AI Background Removal panel */}
      {bgRemoveIndex !== null && images[bgRemoveIndex] && (
        <div className="mb-4 bg-lvl-carbon rounded-xl p-4 border border-lvl-slate/30">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-display font-bold tracking-wider text-lvl-yellow">
              AI BACKGROUND REMOVAL
            </p>
            <button
              type="button"
              onClick={() => setBgRemoveIndex(null)}
              className="text-lvl-smoke hover:text-lvl-white transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <AIBackgroundRemove
            imageUrl={images[bgRemoveIndex]}
            onReplace={(newUrl) => handleReplaceImage(bgRemoveIndex, newUrl)}
          />
        </div>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg overflow-hidden group"
            >
              <Image
                src={url}
                alt="Product image"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 33vw, 20vw"
              />
              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
              {/* AI Background Remove button */}
              <button
                type="button"
                onClick={() => setBgRemoveIndex(index)}
                className="absolute bottom-1 left-1 flex h-6 items-center gap-1 px-1.5 rounded-full bg-black/70 text-white text-[10px] font-body opacity-0 group-hover:opacity-100 transition-opacity hover:bg-lvl-yellow hover:text-lvl-black"
                aria-label="Remove background"
              >
                <Wand2 size={10} />
                BG
              </button>
            </div>
          ))}

          {/* Upload placeholders for in-progress uploads */}
          {Array.from(uploading).map((id) => (
            <div
              key={id}
              className="aspect-square rounded-lg bg-lvl-slate/30 flex items-center justify-center"
            >
              <Loader2 size={20} className="animate-spin text-lvl-smoke" />
            </div>
          ))}
        </div>
      )}

      {/* Drag and drop area */}
      {canUpload && (
        <button
          type="button"
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          disabled={isUploading}
          className={cn(
            "w-full h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors",
            dragOver
              ? "border-lvl-yellow bg-lvl-yellow/10"
              : "border-lvl-slate bg-lvl-slate/30 hover:border-lvl-yellow/50",
            isUploading && "opacity-60 cursor-not-allowed",
          )}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-lvl-smoke animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-lvl-smoke" />
          )}
          <span className="text-sm text-lvl-smoke font-body">
            {dragOver
              ? "Drop images here"
              : isUploading
                ? "Uploading..."
                : "Click or drag to upload images"}
          </span>
          <span className="text-xs text-lvl-smoke/60 font-body">
            JPEG, PNG, WebP - Max 5 MB each ({images.length}/{maxImages})
          </span>
        </button>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-400 font-body mt-2">{error}</p>
      )}
    </div>
  );
}

export { ImageUploader, type ImageUploaderProps };
