'use client';

import React, {useEffect, useState} from 'react';
import SockJS from 'sockjs-client';
import {Client, StompHeaders} from '@stomp/stompjs';
import {Avatar, Button, Card, CardBody, Spinner} from '@heroui/react';
import {MessageCircle, Send} from 'lucide-react';
import {observer} from 'mobx-react-lite';
import {API_URL} from '@/utils/env';
import {authStore} from '@/stores/AuthStore';
import {getLocalStorageItem} from "@/utils/localStorageUtils";
import OnlineUserList from '@/components/chat/OnlineUserList';
import {
    PrivateHistoryMessage,
    PrivateMessage,
    PrivateMessageType,
    PrivateStatisticsMessage,
    PublicMessage,
    PublicMessageType,
    PublicUserMessage,
    PublicUserStatusChangeMessage,
    ReceiveDestinations,
    SendDestinations,
    UserChangeStatus
} from "@/types/ChatType";
import {User as IUser} from "@/types/ApiType";
import toast from "@/utils/notifications";
import VditorEditor from "@/components/editor/VditorEditor";
import Markdown from "@/components/editor/Markdown";
import {UserApis} from "@/utils/apis";
import {asShortName, getUserNameByMessage} from "@/utils/nameUtils";
import AutoScroll from "@/components/AutoScroll";
import {formatSimpleDate} from "@/utils/dateUtils";
import * as stompUtils from "@/utils/stompUtils";
import './page.css';

const ChatRoom = observer(() => {
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [historicalMessages, setHistoricalMessages] = useState<PublicUserMessage[]>([]);
    const [message, setMessage] = useState<string>('');
    const [countUser, setCountUser] = useState<number>(0);
    const [onlineUsers, setOnlineUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);
    const [loadingMoreMessage, setLoadingMoreMessage] = useState<boolean>(false);
    const {user, isLoggedIn} = authStore;

    useEffect(() => {
        console.log('connecting...')
        const connectHeaders: StompHeaders = {}
        if (isLoggedIn) {
            connectHeaders['Authorization'] = `Bearer ${getLocalStorageItem('token', 'NONE')}`
        }
        const client = new Client({
            connectHeaders,
            webSocketFactory: () => new SockJS(`${API_URL}/cr`),
            onConnect: (frame) => {
                const {headers} = frame
                setSessionId(headers['user-name']);
                setStompClient(client);
                toast.info('聊天室连接成功')
            },
            onStompError: (frame) => {
                toast.error('STOMP错误: ' + frame);
                setLoading(false);
            },
            onWebSocketError: (event) => {
                toast.error('WebSocket错误: ' + event);
                setLoading(false);
            }
        });
        client.activate();

        // 组件卸载时断开连接
        return () => {
            setSessionId(null);
            client.deactivate();
            toast.error('聊天室已断开连接！')
        };
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (!stompClient) return
        // 订阅用户私人频道
        stompClient.subscribe(ReceiveDestinations.PRIVATE, (message) => {
            const receivedMessage = JSON.parse(message.body) as PrivateMessage;
            switch (receivedMessage.type) {
                case PrivateMessageType.STATISTICS: {
                    const rm = receivedMessage as PrivateStatisticsMessage;
                    setOnlineUsers(rm.users)
                    setCountUser(rm.online)
                    stompUtils.publishJSON(stompClient, SendDestinations.HISTORY, {
                        mid: null,
                        size: 20
                    })
                    setLoading(false);
                    break
                }
                case PrivateMessageType.HISTORY_MESSAGE: {
                    const rm = receivedMessage as PrivateHistoryMessage;
                    setHistoricalMessages(prevMessages => [...rm.messages, ...prevMessages]);
                    break
                }
            }
        });

        // 订阅公共聊天室频道
        stompClient.subscribe(ReceiveDestinations.PUBLIC, (message) => {
            const receivedMessage = JSON.parse(message.body) as PublicMessage;
            switch (receivedMessage.type) {
                case PublicMessageType.USER_MESSAGE: {
                    const m = receivedMessage as PublicUserMessage;
                    setHistoricalMessages(prevMessages => [...prevMessages, m]);
                    break
                }
                case PublicMessageType.USER_STATUS_CHANGE: {
                    const m = receivedMessage as PublicUserStatusChangeMessage;
                    if (m.anonymous) {
                        switch (m.status) {
                            case UserChangeStatus.JOIN: {
                                if (m.sessionId !== sessionId) {
                                    console.log('1: ', m.sessionId, sessionId)
                                    setCountUser(i => i + 1)
                                }
                                break
                            }
                            case UserChangeStatus.LEAVE: {
                                setCountUser(i => i - 1)
                                break
                            }
                        }
                    } else {
                        setOnlineUsers(prevUsers => {
                            const index = prevUsers.findIndex(user => user.id === m.id);
                            switch (m.status) {
                                case UserChangeStatus.JOIN: {
                                    if (index === -1) {
                                        setCountUser(i => i + 1)
                                        return [...prevUsers, {
                                            id: m.id,
                                            account: m.account,
                                            nickname: m.nickname,
                                            email: m.email,
                                            avatar: m.avatar,
                                        }]
                                    }
                                    return prevUsers
                                }
                                case UserChangeStatus.LEAVE: {
                                    if (index === -1) {
                                        return prevUsers
                                    }
                                    setCountUser(i => i - 1)
                                    return prevUsers.filter(user => user.id !== m.id)
                                }
                            }
                        });
                    }
                    break
                }
            }
        });

        // eslint-disable-next-line
    }, [stompClient]);

    const sendMessage = (m: string) => {
        if (!stompClient || !sessionId) {
            toast.error('未连接到聊天室！');
            return
        }
        if (!isLoggedIn) {
            toast.error('请先登录才能发送消息！');
            return
        }
        if (m && m.trim()) {
            setLoadingMoreMessage(false)
            stompUtils.publishJSON(stompClient, SendDestinations.SEND_MESSAGE, {
                content: JSON.stringify({
                    text: m
                }),
                type: 'TEXT'
            })
            setMessage('');
        } else {
            toast.error('请输入有效的内容！');
        }
    }


    const loadMoreMessage = () => {
        if (!stompClient) {
            return
        }
        setLoadingMoreMessage(true)
        setTimeout(() => {
            stompUtils.publishJSON(stompClient, SendDestinations.HISTORY, {
                mid: historicalMessages[0].mid,
                size: 20
            })
        }, 500)
    }

    return (
            <div
                    className="flex flex-col overflow-hidden">
                <div className=" max-w-6xl w-full mx-auto p-4 flex" style={{height: '90vh'}}>
                    <div className="w-64 mr-4 hidden md:block">
                        <OnlineUserList users={onlineUsers} count={countUser}/>
                    </div>
                    <Card
                            className="h-full flex flex-col backdrop-blur-sm bg-white/80 shadow-md border border-white/20 flex-1">
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
                                            <AutoScroll
                                                    disable={historicalMessages.length === 0 || loadingMoreMessage}
                                                    className="flex-1 overflow-y-auto p-6 space-y-4"
                                                    loadingMore={true}
                                                    onScrollToTop={loadMoreMessage}
                                            >
                                                {historicalMessages.length > 0 ? (
                                                        <>
                                                            {historicalMessages.map((msg, index) => {
                                                                const isSelf = user && msg.creatorEmail === user.email;
                                                                // 点击回复时把消息内容放入输入框
                                                                const handleReply = () => {
                                                                    // 这里你可以选择只插入文本，也可以加上 @用户名
                                                                    // 使用 Markdown 引用语法，每行前加 >
                                                                    const originalText = msg.content.text;
                                                                    const quotedText = ` ##### 引用自 @${msg.creator}\n` +
                                                                            originalText.split('\n').map(line => `> ${line}`).join('\n');
                                                                    setMessage(prev => prev ? prev + '\n' + quotedText + '\n\n\u200b' : quotedText + '\n\n\u200b');
                                                                };
                                                                return (
                                                                        <div key={index}
                                                                             className={`flex items-stretch mb-4 ${isSelf ? 'justify-end' : ''} animate-in fade-in duration-300 message-item`}>
                                                                            {!isSelf && (
                                                                                    <Avatar
                                                                                            src={msg.createAvatar}
                                                                                            name={asShortName(msg.creatorName)}
                                                                                            className="flex-shrink-0 mr-2"/>
                                                                            )}
                                                                            <div className="flex flex-col max-w-[70%]">
                                                                                <div className="flex items-center">
                                                                                    <div
                                                                                            className={`text-sm font-semibold ${isSelf ? 'text-right text-primary-600' : 'text-gray-800'}`}>
                                                                                        {isSelf ? '你' : getUserNameByMessage(msg)}
                                                                                    </div>
                                                                                    <div
                                                                                            className={`text-xs text-gray-500 ml-2 whitespace-nowrap ${isSelf ? 'text-right' : ''}`}>
                                                                                        {formatSimpleDate(msg.createDate)}
                                                                                    </div>
                                                                                </div>
                                                                                <div className={`flex items-center justify-left`}
                                                                                     style={{position: 'revert'}}>
                                                                                    <div
                                                                                            className={`px-4 py-2 rounded-lg shadow break-words prose prose-sm`}
                                                                                            style={{minWidth: '200px'}}
                                                                                            onClick={(e) => {
                                                                                                const target = e.target as HTMLElement;
                                                                                                if (target.tagName === "IMG") {
                                                                                                    setPreviewSrc((target as HTMLImageElement).src);
                                                                                                }
                                                                                            }}
                                                                                    >
                                                                                        <Markdown>{msg.content.text}</Markdown>
                                                                                    </div>

                                                                                </div>

                                                                            </div>

                                                                            <div className="flex items-center">
                                                                                <div
                                                                                        className={`flex ${!isSelf && 'reply'} hidden`}
                                                                                        onClick={handleReply}>
                                                                                    💬
                                                                                </div>
                                                                            </div>

                                                                            {isSelf && (
                                                                                    <Avatar
                                                                                            src={msg.createAvatar}
                                                                                            name={msg.creatorName}
                                                                                            className="flex-shrink-0 ml-2"/>
                                                                            )}
                                                                        </div>
                                                                );
                                                            })}
                                                        </>
                                                ) : (
                                                        <div className="flex-1 flex items-center justify-center flex-col">
                                                            <div className="relative">
                                                                <MessageCircle
                                                                        className="w-20 h-20 text-gray-300 mb-6"/>
                                                                <div
                                                                        className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
                                                            </div>
                                                            <h3 className="text-xl font-semibold text-gray-700 mb-2">欢迎来到聊天室</h3>
                                                            <p className="text-gray-500 text-center max-w-sm">还没有消息，发送第一条消息开始聊天吧！</p>
                                                        </div>
                                                )}
                                            </AutoScroll>
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
                                                                pin: false
                                                            }}
                                                            toolbar={[
                                                                'link',
                                                                'upload',
                                                                'emoji',
                                                                'edit-mode',
                                                            ]}
                                                            height={180}
                                                            placeholder='请输入你的消息, Ctrl + Enter 发送消息...'
                                                            hint={{
                                                                delay: 500,
                                                                extend: [
                                                                    {
                                                                        key: '@',
                                                                        hint: async (key) => (isLoggedIn ? (await UserApis.fuzzy(key) || []).map(user => ({
                                                                            value: `@${user.account}`,
                                                                            html: `<img src="${user.avatar}" alt="${user.account}"/> ${user.account}`,
                                                                        })) : [])
                                                                    },
                                                                ],
                                                            }}
                                                    />
                                                </div>
                                                <Button isIconOnly onPress={() => sendMessage(message)}
                                                        className="h-10 px-4 py-4 absolute bottom-8 right-7">
                                                    <Send className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                </div>
                {previewSrc && (
                        <div
                                className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                                onClick={() => setPreviewSrc(null)}
                        >
                            <img
                                    src={previewSrc}
                                    alt="preview"
                                    className="max-w-full max-h-full object-contain"
                            />
                        </div>
                )}
            </div>

    );
});

export default ChatRoom;