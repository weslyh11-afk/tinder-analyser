"use client";

import { useRef } from "react";
import { PhotoFile } from "@/types";
import { fileToPhotoFile, validateImageFile } from "@/lib/imageUtils";

interface Props {
  photo: PhotoFile | null;
  index: number;
  onAdd: (photo: PhotoFile) => void;
  onRemove: () => void;
}

export default function PhotoSlot({ photo, index, onAdd, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const error = validateImageFile(file);
    if (error) {
      alert(error);
      return;
    }
    const photoFile = await fileToPhotoFile(file);
    onAdd(photoFile);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  return (
    <div
      className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
      onClick={() => !photo && inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />

      {photo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.base64}
            alt={`Photo ${index + 1}`}
            className="w-full h-full object-cover"
          />
          {index === 0 && (
            <div className="absolute top-2 left-2 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
              Main
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm transition-opacity opacity-0 group-hover:opacity-100"
          >
            &times;
          </button>
        </>
      ) : (
        <div className="w-full h-full bg-gray-800 border-2 border-dashed border-gray-600 hover:border-rose-400 flex flex-col items-center justify-center gap-1 transition-colors">
          <span className="text-gray-400 text-2xl">+</span>
          <span className="text-gray-500 text-xs">
            {index === 0 ? "Main photo" : `Photo ${index + 1}`}
          </span>
        </div>
      )}
    </div>
  );
}
