"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// グローバルにスクロール位置を保存
const scrollPositions = new Map<string, number>();

export function useScrollRestoration() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isRestoringRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const containerRef = useRef<Element | null>(null);

  // pathname + search params で一意のキーを生成
  const key = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

  useEffect(() => {
    // スクロールコンテナを取得（MutationObserverで待機）
    const findScrollContainer = (): Promise<Element> => {
      return new Promise((resolve) => {
        const check = () => {
          const container = document.querySelector('[data-scroll-container="true"]');
          if (container) {
            console.log('[Scroll] Container found!');
            containerRef.current = container;
            resolve(container);
          } else {
            console.log('[Scroll] Container not found, waiting...');
          }
        };

        // 即座にチェック
        check();

        // 見つからない場合はMutationObserverで監視
        if (!containerRef.current) {
          const observer = new MutationObserver(() => {
            check();
            if (containerRef.current) {
              observer.disconnect();
            }
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true,
          });

          // 1秒後に強制終了
          setTimeout(() => {
            observer.disconnect();
            if (!containerRef.current) {
              console.log('[Scroll] Container not found after timeout, using window');
            }
          }, 1000);
        }
      });
    };

    // 現在のスクロール位置を取得
    const getCurrentScroll = (): number => {
      if (containerRef.current) {
        return containerRef.current.scrollTop;
      }
      return window.scrollY;
    };

    // スクロール位置を設定
    const setScroll = (position: number) => {
      if (containerRef.current) {
        containerRef.current.scrollTop = position;
      } else {
        window.scrollTo(0, position);
      }
    };

    // 保存されたスクロール位置を取得
    const savedScroll = scrollPositions.get(key) ||
      parseInt(sessionStorage.getItem(`scroll-${key}`) || "0", 10);

    console.log('[Scroll] Restoring for key:', key, 'savedScroll:', savedScroll);

    // 初期化処理
    const initialize = async () => {
      // コンテナを見つける
      await findScrollContainer();

      // スクロール位置の復元
      if (savedScroll > 0 && containerRef.current) {
        isRestoringRef.current = true;

        const attemptRestore = () => {
          if (!containerRef.current) return false;

          const maxScroll = containerRef.current.scrollHeight - containerRef.current.clientHeight;
          console.log('[Scroll] Attempting restore - maxScroll:', maxScroll, 'target:', savedScroll);

          if (maxScroll >= savedScroll * 0.8) {
            setScroll(savedScroll);
            const currentScroll = getCurrentScroll();
            console.log('[Scroll] Restored to:', currentScroll);

            setTimeout(() => {
              isRestoringRef.current = false;
            }, 200);
            return true;
          }
          return false;
        };

        // 段階的に復元を試行
        const timings = [0, 50, 100, 200, 400];
        let restored = false;

        for (const delay of timings) {
          await new Promise(resolve => setTimeout(resolve, delay));
          if (!restored && isRestoringRef.current) {
            restored = attemptRestore();
            if (restored) break;
          }
        }

        setTimeout(() => {
          isRestoringRef.current = false;
        }, 800);
      }

      // スクロール位置を保存
      let lastSaved = 0;
      const saveScroll = () => {
        if (isRestoringRef.current) return;

        const current = getCurrentScroll();

        // 10px以上の変化があれば保存
        if (Math.abs(current - lastSaved) > 10) {
          scrollPositions.set(key, current);
          sessionStorage.setItem(`scroll-${key}`, current.toString());
          lastSaved = current;
          console.log('[Scroll] Saved position:', current, 'for key:', key);
        }
      };

      // スクロールイベントハンドラー
      const handleScroll = () => {
        if (isRestoringRef.current) return;
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(saveScroll, 100);
      };

      // イベントリスナーを設定
      if (containerRef.current) {
        console.log('[Scroll] Listening to container scroll');
        containerRef.current.addEventListener("scroll", handleScroll, { passive: true } as any);
      } else {
        console.log('[Scroll] Listening to window scroll');
        window.addEventListener("scroll", handleScroll, { passive: true });
      }

      // 定期的に保存
      const saveInterval = setInterval(saveScroll, 300);

      // クリーンアップ関数を返す
      return () => {
        clearTimeout(scrollTimeoutRef.current);
        clearInterval(saveInterval);

        if (containerRef.current) {
          containerRef.current.removeEventListener("scroll", handleScroll as any);
        } else {
          window.removeEventListener("scroll", handleScroll);
        }

        // 最終保存
        if (!isRestoringRef.current) {
          const final = getCurrentScroll();
          if (final > 0) {
            scrollPositions.set(key, final);
            sessionStorage.setItem(`scroll-${key}`, final.toString());
            console.log('[Scroll] Final save:', final, 'for key:', key);
          }
        }
      };
    };

    let cleanup: (() => void) | undefined;

    initialize().then(fn => {
      cleanup = fn;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [key]);
}
