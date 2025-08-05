'use client';

import React, {useEffect, useState} from "react";

interface ConditionalProps<T> {
    test?: T,
    matchValue: boolean,
    children: React.ReactNode
}

export default function Conditional<T>(props: ConditionalProps<T>) {

    const [mounted, setMounted] = useState(false);
    const {test, children, matchValue} = props;

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null
    }

    if (!!test == matchValue) {
        return children;
    }

    return null;

}

