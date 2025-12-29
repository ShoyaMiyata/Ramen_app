"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// グローバルにスクロール位置を保存
const globalScrollPositions = new Map<string, number>();

export function useScrollRestoration() {
  const pathname = usePathname();
  const isRestoringRef = useRef(false);
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    console.log("[ScrollRestore] pathname:", pathname);

    // 復元は一度だけ
    if (!hasRestoredRef.current) {
      // 保存されたスクロール位置を取得
      let savedScroll = globalScrollPositions.get(pathname);
      if (!savedScroll) {
        const stored = sessionStorage.getItem(`scroll-${pathname}`);
        if (stored) {
          savedScroll = parseInt(stored, 10);
        }
      }

      console.log("[ScrollRestore] savedScroll:", savedScroll);

      if (savedScroll && savedScroll > 0) {
        hasRestoredRef.current = true;
        isRestoringRef.current = true;

        const restore = () => {
          // windowのスクロールを試みる
          window.scrollTo(0, savedScroll);

          // カスタムスクロール要素も探す
          const scrollContainers = document.querySelectorAll('[style*="overflow"]');
          scrollContainers.forEach((container) => {
            if (container.scrollHeight > container.clientHeight) {
              container.scrollTop = savedScroll;
            }
          });

          console.log("[ScrollRestore] scrollTo:", savedScroll, "window:", window.scrollY);
        };

        // 即座に実行
        restore();

        // 複数のタイミングで実行（DOMの読み込みを待つ）
        const timings = [0, 10, 50, 100, 150, 200, 300, 500, 700, 1000];
        timings.forEach((delay) => {
          setTimeout(restore, delay);
        });

        setTimeout(() => {
          isRestoringRef.current = false;
        }, 1100);
      }
    }

    // スクロール位置を保存する関数
    let lastSavedScroll = 0;
    const saveScroll = () => {
      if (!isRestoringRef.current) {
        // windowのスクロール位置を確認
        let currentScroll = window.scrollY;

        // windowがスクロールしていない場合、カスタムスクロール要素を探す
        if (currentScroll === 0) {
          const scrollContainers = document.querySelectorAll('[style*="overflow"]');
          for (const container of scrollContainers) {
            if (container.scrollTop > 0) {
              currentScroll = container.scrollTop;
              break;
            }
          }
        }

        if (currentScroll > 0 && Math.abs(currentScroll - lastSavedScroll) > 10) {
          globalScrollPositions.set(pathname, currentScroll);
          sessionStorage.setItem(`scroll-${pathname}`, currentScroll.toString());
          lastSavedScroll = currentScroll;
          console.log("[ScrollRestore] saved:", pathname, "=", currentScroll);
        }
      }
    };

    // 定期的に保存（200ms）
    const saveInterval = setInterval(saveScroll, 200);

    // windowのスクロールイベント
    const handleWindowScroll = () => {
      if (!isRestoringRef.current) {
        saveScroll();
      }
    };

    window.addEventListener("scroll", handleWindowScroll, { passive: true });

    // カスタムスクロール要素のイベントも監視
    let scrollContainerObserver: MutationObserver | null = null;

    const setupScrollListeners = () => {
      const scrollContainers = document.querySelectorAll('[style*="overflow"]');
      scrollContainers.forEach((container) => {
        container.addEventListener("scroll", saveScroll, { passive: true } as any);
      });
    };

    // DOM変更を監視して新しいスクロール要素を検知
    scrollContainerObserver = new MutationObserver(() => {
      setupScrollListeners();
    });

    if (document.body) {
      scrollContainerObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style"],
      });
    }

    setupScrollListeners();

    return () => {
      window.removeEventListener("scroll", handleWindowScroll);
      clearInterval(saveInterval);
      scrollContainerObserver?.disconnect();

      // カスタムスクロール要素のリスナーを削除
      const scrollContainers = document.querySelectorAll('[style*="overflow"]');
      scrollContainers.forEach((container) => {
        container.removeEventListener("scroll", saveScroll as any);
      });

      // クリーンアップ時に最終位置を保存
      saveScroll();
    };
  }, [pathname]);

  // pathnameが変わったら復元フラグをリセット
  useEffect(() => {
    hasRestoredRef.current = false;
  }, [pathname]);
}
