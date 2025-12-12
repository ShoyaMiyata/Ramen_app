"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Doc } from "../../../convex/_generated/dataModel";
import { ImageWithPlaceholder } from "@/components/ui/image-placeholder";

interface GalleryProps {
  noodles: Array<
    Doc<"noodles"> & {
      shop?: Doc<"shops"> | null;
      imageUrl?: string | null;
    }
  >;
}

export function Gallery({ noodles }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : noodles.length - 1);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex < noodles.length - 1 ? selectedIndex + 1 : 0);
  };

  if (noodles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>まだ写真がありません</p>
      </div>
    );
  }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-3 gap-1">
        {noodles.map((noodle, index) => (
          <button
            key={noodle._id}
            onClick={() => setSelectedIndex(index)}
            className="overflow-hidden"
          >
            <ImageWithPlaceholder
              src={noodle.imageUrl || ""}
              alt={noodle.ramenName}
              aspectRatio="square"
              className="hover:opacity-80 transition-opacity"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <button
                onClick={() => setSelectedIndex(null)}
                className="text-white p-2"
              >
                <X className="w-6 h-6" />
              </button>
              <span className="text-white text-sm">
                {selectedIndex + 1} / {noodles.length}
              </span>
              <div className="w-10" />
            </div>

            {/* Image */}
            <div className="flex-1 relative flex items-center justify-center">
              <button
                onClick={handlePrev}
                className="absolute left-2 p-2 text-white/70 hover:text-white z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <motion.img
                key={selectedIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={noodles[selectedIndex].imageUrl || ""}
                alt={noodles[selectedIndex].ramenName}
                loading="lazy"
                decoding="async"
                className="max-h-full max-w-full object-contain"
              />

              <button
                onClick={handleNext}
                className="absolute right-2 p-2 text-white/70 hover:text-white z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>

            {/* Info */}
            <Link
              href={`/noodles/${noodles[selectedIndex]._id}`}
              className="p-4 bg-black/50"
            >
              <p className="text-white font-medium">
                {noodles[selectedIndex].shop?.name}
              </p>
              <p className="text-white/70 text-sm">
                {noodles[selectedIndex].ramenName}
              </p>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
