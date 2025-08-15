'use client';

import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {oneLight as HStyle} from 'react-syntax-highlighter/dist/esm/styles/prism'
import './github-markdown.css';
import {Code} from "@heroui/code";

// 复制主题并覆盖背景色
const CStyle = {
    ...HStyle,
    'pre[class*="language-"]': {
        ...HStyle['pre[class*="language-"]'],
        background: 'none',     // 移除背景
        backgroundColor: 'transparent' // 确保透明
    },
    'code[class*="language-"]': {
        ...HStyle['code[class*="language-"]'],
        background: 'none'
    }
};

interface MarkdownProps {
    /**
     * Markdown.
     */
    children?: string | null | undefined;
}

export default function Markdown(props: MarkdownProps) {

    const {children} = props;

    return (
        <div className="markdown-body">
            <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
                components={{
                    code({className, children, }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return <Code color="default">
                            <SyntaxHighlighter
                                language={match ? match[1] : "txt"}
                                PreTag='span'
                                style={CStyle}
                            >
                                {String(children)}
                            </SyntaxHighlighter>
                        </Code>
                    },
                }}
            >{children}</ReactMarkdown>
        </div>
    )
}