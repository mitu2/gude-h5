'use client';

import React, { useEffect, useRef } from "react";

interface AutoScrollProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    disable?: boolean;
}

const AutoScroll = (props: AutoScrollProps) => {
    const { disable = false, children, ...divProps } = props;
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const element = ref.current;
        if (disable || !element) {
            return
        }
        element.scrollTo({
            top: element.scrollHeight,
            behavior: "smooth"
        })
    }, [ children, disable ]);

    return <div ref={ref} {...divProps}>{children}</div>
};

export default AutoScroll;