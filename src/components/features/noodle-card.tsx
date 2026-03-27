"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { Heart, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ImageWithPlaceholder } from "@/components/ui/image-placeholder";
import { motion, AnimatePresence } from "framer-motion";

interface NoodleCardProps {
  noodle: Doc<"noodles"> & {
    user?: Doc<"users"> | null;
    shop?: Doc<"shops"> | null;
    imageUrl?: string | null;
    imageUrls?: string[];
  };
  showUser?: boolean;
  currentUserId?: Id<"users">;
  hideGenres?: boolean;
}

function HeartParticle({ index }: { index: number }) {
  const angle = (index / 6) * 360;
  const distance = 30 + Math.random() * 20;
  const rad = (angle * Math.PI) / 180;

  return (
    <motion.div
      initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      animate={{
        opacity: 0,
        scale: 0,
        x: Math.cos(rad) * distance,
        y: Math.sin(rad) * distance,
      }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="absolute"
    >
      <Heart className="w-3 h-3 fill-red-500 text-red-500" />
    </motion.div>
  );
}

export function NoodleCard({ noodle, showUser = true, currentUserId, hideGenres }: NoodleCardProps) {
  const router = useRouter();
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const lastTapRef = useRef<number>(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const allImages = noodle.imageUrls && noodle.imageUrls.length > 0 ? noodle.imageUrls : noodle.imageUrl ? [noodle.imageUrl] : [];

  const isLiked = useQuery(
    api.likes.isLiked,
    currentUserId ? { userId: currentUserId, noodleId: noodle._id } : "skip"
  );

  const likeCount = useQuery(api.likes.getCount, { noodleId: noodle._id });
  const commentCount = useQuery(api.comments.getCount, { noodleId: noodle._id });
  const toggleLike = useMutation(api.likes.toggle);

  const isOwner = currentUserId === noodle.userId;

  const triggerLikeAnimation = useCallback(() => {
    setIsLikeAnimating(true);
    setShowParticles(true);
    setTimeout(() => setIsLikeAnimating(false), 400);
    setTimeout(() => setShowParticles(false), 600);
  }, []);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId || isOwner) return;
    triggerLikeAnimation();
    await toggleLike({ userId: currentUserId, noodleId: noodle._id });
  };

  const handleDoubleTap = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        if (!currentUserId || isOwner) return;
        setShowDoubleTapHeart(true);
        setTimeout(() => setShowDoubleTapHeart(false), 1000);
        if (!isLiked) {
          triggerLikeAnimation();
          await toggleLike({ userId: currentUserId, noodleId: noodle._id });
        }
      }
      lastTapRef.current = now;
    },
    [currentUserId, isOwner, isLiked, noodle._id, toggleLike, triggerLikeAnimation]
  );

  const handleShopClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (noodle.shopId) {
      router.push(`/shops/${noodle.shopId}`);
    }
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (noodle.userId) {
      router.push(`/users/${noodle.userId}`);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    handleDoubleTap(e);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 50) {
      if (touchDeltaX.current < 0 && currentImageIndex < allImages.length - 1) {
        setCurrentImageIndex(prev => prev + 1);
      } else if (touchDeltaX.current > 0 && currentImageIndex > 0) {
        setCurrentImageIndex(prev => prev - 1);
      }
    }
    touchDeltaX.current = 0;
  };

  return (
    <div>
      <Link href={`/noodles/${noodle._id}`}>
        {allImages.length > 0 && (
          <div
            className="relative left-1/2 -translate-x-1/2 w-screen"
            onClick={handleCardClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="overflow-hidden aspect-square">
              <div
                className="flex transition-transform duration-300 ease-out h-full"
                style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
              >
                {allImages.map((url, idx) => (
                  <div key={idx} className="w-full flex-shrink-0 h-full">
                    <ImageWithPlaceholder
                      src={url}
                      alt={`${noodle.ramenName} ${idx + 1}`}
                      aspectRatio="square"
                      className="w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            {allImages.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                {allImages.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-colors",
                      idx === currentImageIndex ? "bg-white" : "bg-white/40"
                    )}
                  />
                ))}
              </div>
            )}

            {showUser && noodle.user && (
              <div
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUserClick(e); }}
                className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 px-4 py-3 cursor-pointer"
                style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)" }}
              >
                {noodle.user.imageUrl ? (
                  <img
                    src={noodle.user.imageUrl}
                    alt={noodle.user.name || ""}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-white/80" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-white truncate block drop-shadow-sm">
                    {noodle.user.name || "ユーザー"}
                  </span>
                  {noodle.shop && (
                    <span
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShopClick(e); }}
                      className="text-xs text-white/70 truncate block drop-shadow-sm"
                    >
                      {noodle.shop.name}
                      {noodle.shop.station && ` · ${noodle.shop.station}`}
                    </span>
                  )}
                </div>
              </div>
            )}

            <AnimatePresence>
              {showDoubleTapHeart && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.3, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                  }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <Heart className="w-20 h-20 fill-white text-white drop-shadow-lg" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="px-4 pt-2.5 pb-3">
          <div className="flex items-center gap-4 mb-2">
            {currentUserId && !isOwner ? (
              <button
                onClick={handleLike}
                className="relative flex items-center justify-center"
              >
                <motion.div
                  animate={isLikeAnimating ? { scale: [1, 1.3, 0.9, 1.1, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <Heart
                    className={cn(
                      "w-6 h-6 transition-colors",
                      isLiked
                        ? "fill-red-500 text-red-500"
                        : "text-gray-900 hover:text-gray-600"
                    )}
                  />
                </motion.div>
                <AnimatePresence>
                  {showParticles &&
                    Array.from({ length: 6 }).map((_, i) => (
                      <HeartParticle key={i} index={i} />
                    ))}
                </AnimatePresence>
              </button>
            ) : currentUserId && isOwner ? (
              <div className="flex items-center">
                <Heart className="w-6 h-6 text-gray-900" />
              </div>
            ) : null}

            <Link
              href={`/noodles/${noodle._id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center"
            >
              <MessageCircle className="w-6 h-6 text-gray-900 hover:text-gray-600 transition-colors" />
            </Link>

            <div className="ml-auto">
              <StarRating value={noodle.evaluation} readonly size="sm" />
            </div>
          </div>

          {likeCount !== undefined && likeCount > 0 && (
            <motion.p
              key={likeCount}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-semibold text-gray-900 mb-1"
            >
              {likeCount.toLocaleString()}件のいいね
            </motion.p>
          )}

          <div className="mb-1">
            <span className="font-bold text-gray-900 text-sm">
              {noodle.ramenName}
            </span>
          </div>

          {!hideGenres && noodle.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1">
              {noodle.genres.map((genre) => (
                <Badge key={genre} rarity="common" className="text-[10px]">
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          {noodle.comment && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {showUser && noodle.user && (
                <span className="font-semibold mr-1">{noodle.user.name}</span>
              )}
              {noodle.comment}
            </p>
          )}

          {commentCount !== undefined && commentCount > 0 && (
            <Link
              href={`/noodles/${noodle._id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-gray-500 mt-1 block"
            >
              コメント{commentCount}件をすべて見る
            </Link>
          )}

          {noodle.visitDate && (
            <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-wide">
              {formatDate(noodle.visitDate)}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
