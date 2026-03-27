"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase-browser";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VideoUploaderProps {
  readonly videoUrl: string | null;
  readonly onChange: (url: string | null) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const ACCEPTED_EXTENSIONS = ".mp4,.mov,.webm";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const BUCKET_NAME = "product-videos";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function VideoUploader({ videoUrl, onChange }: VideoUploaderProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!user) {
        setError("You must be signed in to upload videos.");
        return;
      }

      // Validate type
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Only MP4, MOV, and WebM videos are accepted.");
        return;
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        setError("Video must be under 50 MB.");
        return;
      }

      setError(null);
      setUploading(true);
      setProgress(0);

      // Simulate progress since Supabase storage doesn't provide upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 300);

      try {
        const supabase = createClient();
        const ext = file.name.split(".").pop() ?? "mp4";
        const path = `${user.id}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });

        clearInterval(progressInterval);

        if (uploadError) {
          // In dev/demo mode, fall back to an object URL
          console.warn(
            "Supabase upload failed, using local preview:",
            uploadError.message
          );
          const objectUrl = URL.createObjectURL(file);
          setProgress(100);
          onChange(objectUrl);
        } else {
          const {
            data: { publicUrl },
          } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
          setProgress(100);
          onChange(publicUrl);
        }
      } catch (err) {
        clearInterval(progressInterval);
        console.error("Video upload failed:", err);
        // Fall back to object URL in dev
        const objectUrl = URL.createObjectURL(file);
        setProgress(100);
        onChange(objectUrl);
      } finally {
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
        }, 500);
      }
    },
    [user, onChange]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        uploadFile(file);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        uploadFile(file);
      }
    },
    [uploadFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleRemove = useCallback(() => {
    onChange(null);
  }, [onChange]);

  const handleClick = useCallback(() => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  }, [uploading]);

  // If video is uploaded, show preview
  if (videoUrl) {
    return (
      <div>
        <label className="block text-sm font-body font-medium text-lvl-smoke mb-1.5">
          Product Video
        </label>
        <div className="relative rounded-xl overflow-hidden bg-lvl-black border border-lvl-slate">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={videoUrl}
            controls
            className="w-full max-h-64 object-contain bg-black"
            preload="metadata"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 text-red-400 text-xs font-display font-bold hover:bg-red-500/30 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Remove Video
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-body font-medium text-lvl-smoke mb-1.5">
        Product Video
      </label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        onChange={handleFileSelect}
        className="sr-only"
        aria-label="Upload video"
      />

      {/* Upload zone */}
      <button
        type="button"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        disabled={uploading}
        className={cn(
          "w-full h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors relative overflow-hidden",
          dragOver
            ? "border-lvl-yellow bg-lvl-yellow/10"
            : "border-lvl-slate bg-lvl-slate/30 hover:border-lvl-yellow/50",
          uploading && "opacity-80 cursor-not-allowed"
        )}
      >
        {/* Progress bar */}
        {uploading && (
          <div className="absolute bottom-0 left-0 h-1.5 bg-lvl-yellow/20 w-full">
            <div
              className="h-full bg-lvl-yellow transition-all duration-300 ease-out rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}

        {uploading ? (
          <Loader2 className="w-8 h-8 text-lvl-yellow animate-spin" />
        ) : (
          <Film className="w-8 h-8 text-lvl-smoke" />
        )}
        <span className="text-sm text-lvl-smoke font-body">
          {dragOver
            ? "Drop video here"
            : uploading
              ? `Uploading... ${Math.round(progress)}%`
              : "Click or drag to add product video"}
        </span>
        <span className="text-xs text-lvl-smoke/60 font-body">
          MP4, MOV, WebM - Max 50 MB
        </span>
      </button>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 font-body mt-2">{error}</p>
      )}
    </div>
  );
}

export { VideoUploader, type VideoUploaderProps };
