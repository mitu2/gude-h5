'use client';

import Vditor from "vditor";
import "vditor/src/assets/less/index.less"
import {useEffect, useRef, useState} from "react";


interface VditorEditorProps extends IOptions {
    onChange?: (value: string) => void;
}

export default function VditorEditor(props: VditorEditorProps) {

    const {
        value, onChange, toolbar,
        input, focus, blur,
        esc, ctrlEnter, ...options
    } = props;
    const vditorRef = useRef<HTMLDivElement>(null);
    const [vditor, setVditor] = useState<Vditor | null>(null)
    const [mount, setMount] = useState(false);

    const onEvent = (callback?: (value: string) => void) => {
        return (v: string) => {
            onChange?.(v)
            callback?.(v)
        }
    }

    useEffect(() => {
        const ref = vditorRef.current;
        if (!ref) return;
        const v = new Vditor(ref, {
            after() {
                setMount(true)
                onChange?.(value || '')
            },
            ...options,
            input: onEvent(input),
            focus: onEvent(focus),
            blur: onEvent(blur),
            esc: onEvent(esc),
            ctrlEnter: onEvent(ctrlEnter),
            toolbar: toolbar || [
                "emoji",
                "headings",
                "bold",
                "italic",
                "strike",
                "link",
                "|",
                "list",
                "ordered-list",
                "check",
                "outdent",
                "indent",
                "|",
                "quote",
                "line",
                "code",
                "inline-code",
                "insert-before",
                "insert-after",
                "|",
                "upload",
                "record",
                "table",
                "|",
                "undo",
                "redo",
                "|",
                "edit-mode",
            ],
            cache: {
                after(markdown: string) {
                    onChange?.(markdown)
                },
                ...options.cache
            },
        })
        setVditor(v)
        return () => {
            vditor?.destroy();
        }
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (mount && vditor) {
            vditor.setValue(value || '');
        }
    }, [value])

    return (
        <div id="vditor" ref={vditorRef}>
        </div>
    )

}