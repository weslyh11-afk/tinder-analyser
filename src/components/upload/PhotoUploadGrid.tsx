"use client";

import { PhotoFile } from "@/types";
import PhotoSlot from "./PhotoSlot";

interface Props {
  photos: PhotoFile[];
  onChange: (photos: PhotoFile[]) => void;
}

export default function PhotoUploadGrid({ photos, onChange }: Props) {
  const slots = Array.from({ length: 6 }, (_, i) => photos[i] ?? null);

  function handleAdd(index: number, photo: PhotoFile) {
    const updated = [...photos];
    // Fill the specific slot or append
    if (index < photos.length) {
      updated[index] = photo;
    } else {
      updated.push(photo);
    }
    onChange(updated);
  }

  function handleRemove(index: number) {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-3">
        Upload 1–6 photos &mdash; first photo is your main profile picture
      </p>
      <div className="grid grid-cols-3 gap-3">
        {slots.map((photo, i) => (
          <PhotoSlot
            key={i}
            photo={photo}
            index={i}
            onAdd={(p) => handleAdd(i, p)}
            onRemove={() => handleRemove(i)}
          />
        ))}
      </div>
    </div>
  );
}
