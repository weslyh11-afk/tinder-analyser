"use client";

import { useRef, useState } from "react";
import { PhotoFile } from "@/types";
import { fileToPhotoFile, validateImageFile } from "@/lib/imageUtils";

interface Props {
  photos: PhotoFile[];
  onChange: (photos: PhotoFile[]) => void;
}

export default function PhotoUploadGrid({ photos, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  // ── File handling ─────────────────────────────────────────────────
  async function handleFiles(files: FileList) {
    const remaining = 6 - photos.length;
    const toProcess = Array.from(files).slice(0, remaining);
    const results = await Promise.all(
      toProcess.map(async (file) => {
        const err = validateImageFile(file);
        if (err) { alert(err); return null; }
        return fileToPhotoFile(file);
      })
    );
    const valid = results.filter(Boolean) as PhotoFile[];
    if (valid.length) onChange([...photos, ...valid]);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  }

  function removePhoto(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  // ── Drag-to-reorder ───────────────────────────────────────────────
  function onDragStart(e: React.DragEvent, index: number) {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragEnter(index: number) {
    if (dragIndex !== null && index !== dragIndex) setDropIndex(index);
  }

  function onDragEnd() {
    if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
      const updated = [...photos];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(dropIndex, 0, moved);
      onChange(updated);
    }
    setDragIndex(null);
    setDropIndex(null);
  }

  const canAdd = photos.length < 6;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-400">
          {photos.length === 0
            ? "Voeg 1–6 foto's toe"
            : `${photos.length}/6 foto's — sleep om te sorteren`}
        </p>
        {canAdd && (
          <button
            onClick={() => inputRef.current?.click()}
            className="text-xs text-rose-400 hover:text-rose-300 border border-rose-500/40 hover:border-rose-400 px-3 py-1 rounded-full transition-colors"
          >
            + Foto&apos;s toevoegen
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Drop zone when empty */}
      {photos.length === 0 && (
        <div
          className="border-2 border-dashed border-gray-600 hover:border-rose-400 rounded-2xl py-12 flex flex-col items-center gap-3 cursor-pointer transition-colors"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <span className="text-4xl text-gray-600">📷</span>
          <p className="text-gray-400 text-sm">Klik of sleep foto&apos;s hierheen</p>
          <p className="text-gray-600 text-xs">Je kunt meerdere foto&apos;s tegelijk selecteren</p>
        </div>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo, i) => {
            const isDragging = dragIndex === i;
            const isTarget = dropIndex === i;
            return (
              <div
                key={photo.id}
                draggable
                onDragStart={(e) => onDragStart(e, i)}
                onDragEnter={() => onDragEnter(i)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={onDragEnd}
                className={`relative aspect-square rounded-xl overflow-hidden group cursor-grab active:cursor-grabbing transition-all
                  ${isDragging ? "opacity-40 scale-95" : "opacity-100"}
                  ${isTarget ? "ring-2 ring-rose-400 scale-105" : ""}
                `}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.base64}
                  alt={`Foto ${i + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />

                {/* Main badge */}
                {i === 0 && (
                  <div className="absolute top-2 left-2 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold pointer-events-none">
                    Hoofd
                  </div>
                )}

                {/* Drag handle hint */}
                <div className="absolute bottom-2 left-2 text-white/50 text-xs pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  ⠿ sleep
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/90 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  &times;
                </button>
              </div>
            );
          })}

          {/* Add more slot */}
          {canAdd && (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-600 hover:border-rose-400 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <span className="text-gray-500 text-2xl">+</span>
              <span className="text-gray-600 text-xs">Toevoegen</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
