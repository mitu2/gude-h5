'use client';

import MDEditor, {MDEditorProps} from '@uiw/react-md-editor';
import rehypeSanitize from "rehype-sanitize";
import {Smile} from 'lucide-react';
import {getCommands, getExtraCommands} from "@uiw/react-md-editor/commands-cn";
import {ICommand} from "@uiw/react-md-editor/commands";
import EmojiPicker, {Theme} from "emoji-picker-react";
import React, {useState} from "react";
import Conditional from "@/components/Conditional";


function optional<T>(value: T | undefined, defaultValue: T): T {
    return value ? value : defaultValue;
}


interface MarkdownEditorProps extends MDEditorProps {

    emoji?: boolean;

}

export default function MarkdownEditor(props: MarkdownEditorProps) {

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const EmojiButton: ICommand = {
        name: "emoji",
        keyCommand: "emoji",
        value: "emoji",
        icon: <Smile className="w-3 h-3"/>,
        buttonProps: {"aria-label": "Insert title3"},
        execute: () => {
            setShowEmojiPicker(!showEmojiPicker)
        },
    }

    const commands = [
        ...optional(getCommands(), []),
        ...optional(props.commands, []),
    ]

    if (props.emoji) {
        commands.push(EmojiButton)
    }

    return (
        <div className="flex-1 overflow-y-auto p-1 space-y-2">
            <Conditional test={props.emoji || false} matchValue={true}>
                <div
                    className="absolute bottom-53 right-40 z-10"
                    style={{
                        display: showEmojiPicker ? 'block' : 'none'
                    }}
                >
                    <EmojiPicker
                        onEmojiClick={(emojiObject) => {
                            props.onChange?.(props.value + emojiObject.emoji)
                            setShowEmojiPicker(false)
                        }}
                        lazyLoadEmojis={true}
                        theme={Theme.AUTO}
                        width={280}
                        height={340}
                        getEmojiUrl={(unified, style) => `https://cdn.bootcdn.net/ajax/libs/emoji-datasource-apple/15.1.2/img/${style}/64/${unified}.png`}
                    />
                </div>
            </Conditional>
            <MDEditor
                {...props}
                previewOptions={{
                    ...props.previewOptions,
                    rehypePlugins: [[rehypeSanitize]],
                }}
                commands={commands}
                extraCommands={[
                    ...optional(getExtraCommands(), []),
                    ...optional(props.extraCommands, [])
                ]}
                components={{
                    ...optional(props.components, {}),
                }}
                lang={props.lang || "zh-CN"}
                preview={props.preview || 'edit'}
            />
        </div>

    );

}