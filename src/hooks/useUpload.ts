"use client";

import { useState, useCallback } from "react";
import type { FileUploadState, UploadedFile } from "@/types";

export function useUpload() {
  const [state, setState] = useState<FileUploadState>({ status: "idle" });

  const upload = useCallback(async (file: File): Promise<UploadedFile | null> => {
    setState({ status: "uploading", progress: 0 });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      const result = await new Promise<UploadedFile>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setState({ status: "uploading", progress });
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data.file);
            } catch {
              reject(new Error("Invalid response from server."));
            }
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.error ?? "Upload failed."));
            } catch {
              reject(new Error("Upload failed."));
            }
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error during upload.")));
        xhr.addEventListener("abort", () => reject(new Error("Upload cancelled.")));

        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });

      setState({ status: "ready", file: result });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      setState({ status: "error", message });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, upload, reset };
}
