'use client';

import React, {useEffect, useState} from 'react';
import SockJS from 'sockjs-client';
import {Client, StompHeaders} from '@stomp/stompjs';
import {Button, Card, CardBody, Spinner} from '@heroui/react';
import {Send} from 'lucide-react';
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
import {UserApis} from "@/utils/apis";
import AutoScroll from "@/components/AutoScroll";
import * as stompUtils from "@/utils/stompUtils";
import './page.css';
import HistoricalMessages from "@/components/chat/HistoricalMessages";

const ChatRoom = observer(() => {
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [historicalMessages, setHistoricalMessages] = useState<PublicUserMessage[]>([]);
    const [message, setMessage] = useState<string>('');
    const [countUser, setCountUser] = useState<number>(0);
    const [onlineUsers, setOnlineUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMoreMessage, setLoadingMoreMessage] = useState<boolean>(false);
    const {isLoggedIn} = authStore;

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

    const handleReply = (message: PublicUserMessage) => {
        const originalText = message.content.text;
        const quotedText =
                `##### 引用自 @${message.creator}
                ${originalText
                        .split('\n')
                        .map(line => `> ${line}`)
                        .join('\n')
                }
                `
        setMessage(prev => prev ? prev + '\n' + quotedText + '\n\n\u200b' : quotedText + '\n\n\u200b');
    };

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
                                                <HistoricalMessages messages={historicalMessages}
                                                                    onReplyMessage={handleReply}/>
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
            </div>

    );
});

export default ChatRoom;