'use client';

import React, {useCallback, useEffect, useRef, useState} from "react";

interface AutoScrollProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    disable?: boolean;
    onScrollToTop?: () => void;
    loadingMore?: boolean;
}

const AutoScroll = (props: AutoScrollProps) => {
    const {
        disable = false,
        children,
        onScrollToTop,
        loadingMore = false,
        ...divProps
    } = props;

    const ref = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);
    const [oldScrollHeight, setOldScrollHeight] = useState(0);

    // 自动滚动到底部
    useEffect(() => {
        const element = ref.current;
        if (disable || !element) {
            return;
        }
        element.scrollTo({
            top: element.scrollHeight,
            behavior: "smooth"
        });
    }, [children, disable]);

    // 处理滚动事件，检测是否滚动到顶部
    const handleScroll = useCallback(() => {
        const element = ref.current;
        if (!element) return;

        // 当滚动位置接近顶部时触发加载更多
        if (element.scrollTop <= 0 && onScrollToTop) {
            // 记录当前滚动高度，以便加载后恢复位置
            const scrollHeight = element.scrollHeight;
            setOldScrollHeight(scrollHeight)
            isScrollingRef.current = true;
            onScrollToTop();

        }
    }, [onScrollToTop]);

    useEffect(() => {
        if (!isScrollingRef.current) {
            return;
        }
        const element = ref.current;
        if (!element) return;
        const scrollPosition = element.scrollTop;
        if (element.scrollHeight !== oldScrollHeight) {
            isScrollingRef.current = false;
        }
        element.scrollTop = element.scrollHeight - oldScrollHeight + scrollPosition;
        // eslint-disable-next-line
    }, [children]);

    // 添加滚动事件监听
    useEffect(() => {
        const element = ref.current;
        if (!element || !onScrollToTop) return;

        element.addEventListener('scroll', handleScroll);
        return () => {
            element.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll, onScrollToTop]);

    return (
            <div ref={ref} {...divProps}>
                {loadingMore && (
                        <div className="flex justify-center py-2 text-gray-500 text-sm">
                            加载更多消息...
                        </div>
                )}
                {children}
            </div>
    );
};

export default AutoScroll;