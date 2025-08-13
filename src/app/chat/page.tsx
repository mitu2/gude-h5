'use client';

import React, {useEffect, useRef, useState} from 'react';
import SockJS from 'sockjs-client';
import {Client, StompHeaders} from '@stomp/stompjs';
import {Avatar, Card, CardBody, CardHeader, Spinner} from '@heroui/react';
import {MessageCircle} from 'lucide-react';
import {observer} from 'mobx-react-lite';
import {API_URL} from '@/utils/env';
import {authStore} from '@/stores/AuthStore';
import {getLocalStorageItem} from "@/utils/localStorages";
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
import {User as IUser} from "@/types/ApiType";
import MarkdownEditor from "@/components/editor/MarkdownEditor";
import toast from "@/utils/notifications";
import MDEditor from '@uiw/react-md-editor';

const ChatRoom = observer(() => {
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState<PublicUserMessage[]>([]);
    const [message, setMessage] = useState('');
    const [onlineUsers, setOnlineUsers] = useState<IUser[]>([]);
    const {user, isLoggedIn} = authStore;
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    };

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


    // 发送消息
    const sendMessage = () => {
        if (!stompClient || !connected) {
            toast.error('未连接到聊天室！');
            return
        }
        if (!isLoggedIn) {
            toast.error('请先登录才能发送消息！');
            return
        }
        if (message.trim()) {
            const chatMessage = {
                content: JSON.stringify({
                    text: message
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
    };


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
            <div className=" max-w-6xl w-full mx-auto p-4 flex" style={{height: '85vh'}}>
                <div className="w-64 mr-4 hidden md:block">
                    <OnlineUserList users={onlineUsers}/>
                </div>
                <Card
                    className="h-full flex flex-col backdrop-blur-sm bg-white/80 shadow-md border border-white/20 flex-1">
                    <CardHeader
                        className="flex-shrink-0 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-secondary/5">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <MessageCircle className="w-6 h-6 text-primary"/>
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
                                    <Spinner size="lg" color="primary"/>
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
                                                    return (
                                                        <div key={index}
                                                             className={`flex items-start ${isSelf ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                                                            {!isSelf && (
                                                                <Avatar /*src={msg.creatorAvatar}*/
                                                                    name={msg.creatorName}
                                                                    className="flex-shrink-0 mr-3"/>
                                                            )}
                                                            <div
                                                                className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} min-w-[40%] max-w-[90%] break-words`}>
                                                                <div
                                                                    className={`text-xs mb-1 ${isSelf ? 'mr-2' : 'ml-2'}`}>
                                                                    {isSelf ? '你' : msg.creatorName + '#' + msg.creatorId}
                                                                </div>
                                                                <div
                                                                    className={`max-w-[70%] break-words ${isSelf ? 'ml-8' : 'mr-8'} rounded-lg px-3 py-2 shadow-md  border border-gray-200`}>
                                                                    <MDEditor.Markdown
                                                                        source={msg.content.text}
                                                                    />
                                                                    <div
                                                                        className={`text-xs mt-2 text-right whitespace-nowrap`}>
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
                                                            </div>
                                                            {isSelf && (
                                                                <Avatar /*src={msg.creatorAvatar}*/
                                                                    name={msg.creatorName}
                                                                    className="flex-shrink-0 ml-3"/>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                <div ref={messagesEndRef}/>
                                            </>
                                        ) : (
                                            <div className="flex-1 flex items-center justify-center flex-col">
                                                <div className="relative">
                                                    <MessageCircle className="w-20 h-20 text-gray-300 mb-6"/>
                                                    <div
                                                        className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-700 mb-2">欢迎来到聊天室</h3>
                                                <p className="text-gray-500 text-center max-w-sm">还没有消息，发送第一条消息开始聊天吧！</p>
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className="p-4 bg-gray-50/50 backdrop-blur-sm border-t border-gray-100 relative">
                                        <MarkdownEditor
                                            value={message}
                                            onChange={(newVal = '') => setMessage(newVal)}
                                            emoji={true}
                                            textareaProps={{
                                                maxLength: 500,
                                                placeholder: '请输入你的消息,  Ctrl + Enter 发送消息...',
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.ctrlKey && e.key === 'Enter') {
                                                    sendMessage()
                                                }
                                            }}
                                        />
                                        {/*<form onSubmit={sendMessage} className="flex items-end space-x-3">*/}
                                        {/*    <Input*/}
                                        {/*        type="text"*/}
                                        {/*        placeholder="输入消息..."*/}
                                        {/*        value={message}*/}
                                        {/*        onValueChange={setMessage}*/}
                                        {/*        className="flex-1"*/}
                                        {/*        variant="bordered"*/}
                                        {/*        maxLength={200}*/}
                                        {/*        isDisabled={!connected}*/}
                                        {/*        size="lg"*/}
                                        {/*        classNames={{*/}
                                        {/*            input: "text-base",*/}
                                        {/*            inputWrapper: "bg-white/80 backdrop-blur-sm"*/}
                                        {/*        }}*/}
                                        {/*    />*/}
                                        {/*    <Button*/}
                                        {/*        type="button"*/}
                                        {/*        isIconOnly*/}
                                        {/*        color="default"*/}
                                        {/*        size="lg"*/}
                                        {/*        onPress={() => setShowEmojiPicker(!showEmojiPicker)}*/}
                                        {/*        className="bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-lg transition-all duration-300"*/}
                                        {/*    >*/}
                                        {/*        <Smile className="w-5 h-5"/>*/}
                                        {/*    </Button>*/}
                                        {/*    <Button*/}
                                        {/*        type="submit"*/}
                                        {/*        color="primary"*/}
                                        {/*        isDisabled={!connected || !isLoggedIn || !message.trim()}*/}
                                        {/*        size="lg"*/}
                                        {/*        className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-lg hover:shadow-primary/25 transition-all duration-300"*/}
                                        {/*    >*/}
                                        {/*        发送*/}
                                        {/*    </Button>*/}
                                        {/*</form>*/}
                                        {/*<div className="absolute bottom-24 right-4 z-10" style={{*/}
                                        {/*    display: showEmojiPicker ? 'block' : 'none'*/}
                                        {/*}}>*/}
                                        {/*    <EmojiPicker*/}
                                        {/*        onEmojiClick={(emojiObject) => {*/}
                                        {/*            setMessage(prevMsg => prevMsg + emojiObject.emoji);*/}
                                        {/*            setShowEmojiPicker(false);*/}
                                        {/*        }}*/}
                                        {/*        lazyLoadEmojis={true}*/}
                                        {/*        theme={Theme.AUTO}*/}
                                        {/*        width={300}*/}
                                        {/*        getEmojiUrl={(unified, style) => `https://cdn.bootcdn.net/ajax/libs/emoji-datasource-apple/15.1.2/img/${style}/64/${unified}.png`}*/}
                                        {/*    />*/}
                                        {/*</div>*/}
                                        {/*<div className="mt-3 flex items-center justify-center">*/}
                                        {/*    <Chip*/}
                                        {/*        color={connected ? "success" : "danger"}*/}
                                        {/*        variant="dot"*/}
                                        {/*        size="sm"*/}
                                        {/*        classNames={{*/}
                                        {/*            base: "px-3 py-1",*/}
                                        {/*            content: "text-xs font-medium"*/}
                                        {/*        }}*/}
                                        {/*    >*/}
                                        {/*        {connected ? "🟢 已连接" : "🔴 未连接"}*/}
                                        {/*    </Chip>*/}
                                        {/*</div>*/}
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