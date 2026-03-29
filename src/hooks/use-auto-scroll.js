import { useCallback, useEffect, useRef } from 'react';
export function useAutoScroll(containerRef, { enabled = true, behavior = 'auto', bottomThreshold = 128, watch } = {}) {
    const isAtBottomRef = useRef(true);
    const scrollToBottom = useCallback(() => {
        const el = containerRef.current;
        if (!el)
            return;
        el.scrollTo({ top: el.scrollHeight, behavior });
    }, [behavior, containerRef]);
    useEffect(() => {
        const el = containerRef.current;
        if (!el || !enabled)
            return;
        const onScroll = () => {
            const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
            isAtBottomRef.current = distance <= bottomThreshold;
        };
        // initial stick
        isAtBottomRef.current = true;
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        // setTimeout(scrollToBottom, 0);
        Promise.resolve().then(scrollToBottom);
        el.addEventListener('scroll', onScroll, { passive: true });
        const ro = new ResizeObserver(() => {
            if (isAtBottomRef.current)
                scrollToBottom();
        });
        ro.observe(el);
        return () => {
            el.removeEventListener('scroll', onScroll);
            ro.disconnect();
        };
    }, [containerRef, enabled, bottomThreshold, scrollToBottom]);
    // Trigger scroll when watched values change, but only if user is near bottom
    useEffect(() => {
        if (!enabled)
            return;
        if (watch === undefined)
            return;
        if (isAtBottomRef.current)
            scrollToBottom();
    }, [enabled, watch, scrollToBottom]);
    return { scrollToBottom };
}
