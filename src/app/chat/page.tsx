'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, StompHeaders } from '@stomp/stompjs';
import { Avatar, Button, Card, CardBody, CardHeader, Spinner } from '@heroui/react';
import { MessageCircle, Send } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { API_URL } from '@/utils/env';
import { authStore } from '@/stores/AuthStore';
import { getLocalStorageItem } from "@/utils/localStorages";
import OnlineUserList from '@/components/OnlineUserList';
import {
    PrivateHistoryMessage,
    PrivateMessage,
    PrivateMessageType,
    PrivateStatisticsMessage,
    PublicMessage,
    PublicMessageType,
    PublicUserMessage,
    PublicUserStatusChangeMessage,
    UserChangeStatus
} from "@/types/ChatType";
import { User as IUser } from "@/types/ApiType";
import toast from "@/utils/notifications";
import VditorEditor from "@/components/editor/VditorEditor";
import Markdown from "@/components/editor/Markdown";
import styles from './page.module.css';
const ChatRoom = observer(() => {
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState<PublicUserMessage[]>([]);
    const [message, setMessage] = useState<string>('');
    const [onlineUsers, setOnlineUsers] = useState<IUser[]>([]);
    const { user, isLoggedIn } = authStore;
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    function getShortName(fullName: string | undefined) {
        if (!fullName) return '';
        const firstChar = fullName[0];
        // 如果第一个是中文
        if (/[\u4e00-\u9fa5]/.test(firstChar)) {
            return firstChar;
        }
        // 如果是字母开头
        const match = fullName.match(/^[A-Za-z]+/);
        if (match) {
            return match[0].slice(0, 3); // 连续字母最多取前三个
        }
        // 默认返回第一个字符
        return firstChar;
    }
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (connected) {
            return
        }
        const connectHeaders: StompHeaders = {}
        if (isLoggedIn) {
            connectHeaders['Authorization'] = `Bearer ${getLocalStorageItem('token', 'NONE')}`
        }
        const wsUrl = `${API_URL}/cr`;
        const client = new Client({
            connectHeaders,
            webSocketFactory: () => new SockJS(wsUrl),
            onConnect: () => {
                setConnected(true);
                setStompClient(client);
                // 订阅用户私人频道
                client.subscribe('/user/topic/private', (message) => {
                    const receivedMessage = JSON.parse(message.body) as PrivateMessage;
                    switch (receivedMessage.type) {
                        case PrivateMessageType.STATISTICS: {
                            const rm = receivedMessage as PrivateStatisticsMessage;
                            setOnlineUsers(rm.users)
                            client.publish({
                                destination: "/app/message/history",
                                body: JSON.stringify({
                                    mid: null,
                                    size: 20
                                }),
                            });
                            setLoading(false);
                            break
                        }
                        case PrivateMessageType.HISTORY_MESSAGE: {
                            const rm = receivedMessage as PrivateHistoryMessage;
                            setMessages(prevMessages => [...rm.messages, ...prevMessages]);
                            break
                        }
                    }
                });

                // 订阅公共聊天室频道
                client.subscribe('/topic/public', (message) => {
                    const receivedMessage = JSON.parse(message.body) as PublicMessage;
                    switch (receivedMessage.type) {
                        case PublicMessageType.USER_MESSAGE: {
                            const m = receivedMessage as PublicUserMessage;
                            setMessages(prevMessages => [...prevMessages, m]);
                            break
                        }
                        case PublicMessageType.USER_STATUS_CHANGE: {
                            const m = receivedMessage as PublicUserStatusChangeMessage;
                            if (!m.anonymous) {
                                setOnlineUsers(prevUsers => {
                                    const index = prevUsers.findIndex(user => user.id === m.id);
                                    switch (m.status) {
                                        case UserChangeStatus.JOIN: {
                                            return index === -1 ? [...prevUsers, {
                                                id: m.id,
                                                nickname: m.nickname,
                                                email: m.email
                                            }] : prevUsers;
                                        }
                                        case UserChangeStatus.LEAVE: {
                                            return index === -1 ? prevUsers : prevUsers.filter(user => user.id !== m.id)
                                        }
                                    }
                                });
                            }
                            break
                        }
                    }
                });

            },
            onStompError: (frame) => {
                console.error('STOMP错误:', frame);
                setLoading(false);
            },
            onWebSocketError: (event) => {
                console.error('WebSocket错误:', event);
                setLoading(false);
            }
        });

        client.activate();
    }, [connected, isLoggedIn]);

    const sendMessage = useCallback((m: string) => {
        if (!stompClient || !connected) {
            toast.error('未连接到聊天室！');
            return
        }
        if (!isLoggedIn) {
            toast.error('请先登录才能发送消息！');
            return
        }
        if (m && m.trim()) {
            const chatMessage = {
                content: JSON.stringify({
                    text: m
                }),
                type: 'TEXT'
            };

            stompClient.publish({
                destination: "/app/message/send",
                body: JSON.stringify(chatMessage),
            });

            setMessage('');
        } else {
            toast.error('请输入内容！');
        }
    }, [connected, isLoggedIn, message, stompClient])

    // 组件卸载时断开连接
    useEffect(() => {
        return () => {
            stompClient?.deactivate();
            setConnected(false);
            console.log('已断开连接');
        };
    }, []);

    return (
        <div
            className="flex flex-col  overflow-hidden ">
            <div className=" max-w-6xl w-full mx-auto p-4 flex" style={{ height: '85vh' }}>
                <div className="w-64 mr-4 hidden md:block">
                    <OnlineUserList users={onlineUsers} />
                </div>
                <Card
                    className="h-full flex flex-col backdrop-blur-sm bg-white/80 shadow-md border border-white/20 flex-1">
                    <CardHeader
                        className="flex-shrink-0 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-secondary/5">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <MessageCircle className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">实时聊天室</h1>
                                <p className="text-sm text-gray-500">与朋友们畅聊无阻</p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardBody className="flex-1 overflow-hidden p-0">
                        <div className="h-full flex flex-col">
                            {loading ? (
                                <div className="flex-1 flex items-center justify-center flex-col">
                                    <Spinner size="lg" color="primary" />
                                    <p className="ml-2 text-primary font-medium mt-4">正在连接聊天室...</p>
                                    <p className="text-sm text-gray-500 mt-2">请稍候，正在建立连接</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                        {messages.length > 0 ? (
                                            <>
                                                {messages.map((msg, index) => {
                                                    const isSelf = user && msg.creatorEmail === user.email;
                                                    // 点击回复时把消息内容放入输入框
                                                    const handleReply = () => {
                                                        // 这里你可以选择只插入文本，也可以加上 @用户名
                                                        // 使用 Markdown 引用语法，每行前加 >
                                                        const originalText = msg.content.text;
                                                        const quotedText = ` ##### 引用自 @${msg.creatorName}\n` +
                                                            originalText.split('\n').map(line => `> ${line}`).join('\n');
                                                        setMessage(prev => prev ? prev + '\n' + quotedText : quotedText);
                                                    };
                                                    return (
                                                        <div key={index}
                                                            className={`flex items-stretch mb-4 ${isSelf ? 'justify-end' : ''} animate-in fade-in duration-300 ${styles.hover}`}>
                                                            {!isSelf && (
                                                                <Avatar /*src={msg.creatorAvatar}*/
                                                                    // name={msg.creatorName}
                                                                    name={getShortName(msg.creatorName)}
                                                                    className="flex-shrink-0 mr-2" />
                                                            )}
                                                            <div className="flex flex-col max-w-[70%]">
                                                                <div className="flex items-center">
                                                                    <div
                                                                        className={`text-sm font-semibold ${isSelf ? 'text-right text-primary-600' : 'text-gray-800'}`}>
                                                                        {isSelf ? '你' : msg.creatorName + '#' + msg.creatorId}
                                                                    </div>
                                                                    <div
                                                                        className={`text-xs text-gray-500 ml-2 whitespace-nowrap ${isSelf ? 'text-right' : ''}`}>
                                                                        {new Date(msg.createDate).toLocaleString('zh-CN', {
                                                                            year: 'numeric',
                                                                            month: '2-digit',
                                                                            day: '2-digit',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                            second: '2-digit',
                                                                            hour12: false
                                                                        }).replace(/\//g, '-').replace(/,/, '')}
                                                                    </div>
                                                                </div>
                                                                <div className={`flex items-center justify-left`} style={{ position: 'revert' }}>
                                                                    <div
                                                                        className={`px-4 py-2 rounded-lg shadow break-words prose prose-sm`} style={{ minWidth: '200px' }}
                                                                    >
                                                                        <Markdown>{msg.content.text}</Markdown>

                                                                    </div>

                                                                </div>

                                                            </div>

                                                            <div className={`${styles.reply_box}`}>
                                                                <div className={`flex ${!isSelf ? styles.reply : styles.none}`} onClick={handleReply}>
                                                                💬
                                                                </div>
                                                            </div>

                                                            {isSelf && (
                                                                <Avatar /*src={msg.creatorAvatar}*/
                                                                    name={msg.creatorName}
                                                                    className="flex-shrink-0 ml-2" />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                <div ref={messagesEndRef} />
                                            </>
                                        ) : (
                                            <div className="flex-1 flex items-center justify-center flex-col">
                                                <div className="relative">
                                                    <MessageCircle className="w-20 h-20 text-gray-300 mb-6" />
                                                    <div
                                                        className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-700 mb-2">欢迎来到聊天室</h3>
                                                <p className="text-gray-500 text-center max-w-sm">还没有消息，发送第一条消息开始聊天吧！</p>
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className="p-4 bg-gray-50/50 backdrop-blur-sm border-t border-gray-100 relative flex items-end">
                                        <div className="flex-1">
                                            <VditorEditor
                                                value={message}
                                                onChange={setMessage}
                                                ctrlEnter={m => sendMessage(m)}
                                                cache={{
                                                    id: 'chat-vditor-editor'
                                                }}
                                                counter={{
                                                    enable: true
                                                }}
                                                toolbarConfig={{
                                                    pin: true
                                                }}
                                                toolbar={[
                                                    'emoji',
                                                    'link',
                                                    'upload',
                                                    'edit-mode',
                                                ]}
                                                height={180}
                                                placeholder='请输入你的消息, Ctrl + Enter 发送消息...'
                                                hint={{
                                                    extend: [
                                                        {
                                                            key: '@',
                                                            hint: (key) => {
                                                                if ('vanessa'.indexOf(key.toLocaleLowerCase()) > -1) {
                                                                    return [
                                                                        {
                                                                            value: '`@Vanessa`',
                                                                            html: '<img src="https://avatars0.githubusercontent.com/u/970828?s=60&v=4" alt="123"/> Vanessa',
                                                                        }]
                                                                }
                                                                return []
                                                            },
                                                        },
                                                        {
                                                            key: '#',
                                                            hint: (key) => {
                                                                if ('vditor'.indexOf(key.toLocaleLowerCase()) > -1) {
                                                                    return [
                                                                        {
                                                                            value: '#Vditor',
                                                                            html: '#Vditor ♏ 一款浏览器端的 Markdown 编辑器，支持所见即所得（富文本）、即时渲染（类似 Typora）和分屏预览模式。',
                                                                        }]
                                                                }
                                                                return []
                                                            },
                                                        }],
                                                }}
                                            />
                                        </div>
                                        <Button isIconOnly onPress={() => sendMessage(message)}
                                            className="h-10 px-4 py-4 absolute bottom-8 right-7">
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
});

export default ChatRoom;