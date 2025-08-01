'use client';

import { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { Button, Card, CardBody, CardHeader, Input, Chip, Avatar, Divider, Spinner } from '@heroui/react';
import { Send, User, MessageCircle, Link as LinkIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { useAuthStore } from '@/stores/StoreProvider';
import { API_URL } from '@/utils/env';

interface ChatMessage {
  sender: string;
  content: string;
  timestamp: string;
}

const ChatRoom = observer(() => {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const authStore = useAuthStore();
  const { user, isLoggedIn: isAuthenticated } = authStore;
  const [loading, setLoading] = useState(true);

  // 连接到WebSocket服务器
  const connect = () => {
    if (!user) return;
    
    // 使用环境变量中的API URL
    const wsUrl = `${API_URL}/cr`;
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      onConnect: () => {
        setConnected(true);
        setStompClient(client);
        setLoading(false);
        
        // 订阅公共聊天室频道
        client.subscribe('/topic/public', (message) => {
          const receivedMessage = JSON.parse(message.body) as ChatMessage;
          setMessages(prevMessages => [...prevMessages, receivedMessage]);
        });
        
        // 发送用户加入消息
        client.publish({
          destination: "/app/chat.addUser",
          body: JSON.stringify({
            sender: user.username,
            content: user.username + ' 加入了聊天室',
            type: 'JOIN'
          })
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
  };

  // 断开连接
  const disconnect = () => {
    if (stompClient) {
      stompClient.deactivate();
      setConnected(false);
      console.log('已断开连接');
    }
  };

  // 发送消息
  const sendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (message.trim() && stompClient && user) {
      const chatMessage = {
        sender: user.username,
        content: message,
        timestamp: new Date().toISOString(),
        type: 'CHAT'
      };
      
      stompClient.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(chatMessage)
      });
      setMessage('');
    }
  };

  // 检查用户是否已登录，如果未登录则重定向到登录页面并带上返回地址
  useEffect(() => {
    if (!isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      router.replace(`/login?returnTo=${encodeURIComponent(currentPath)}`);
    } else {
      connect();
    }
  }, [isAuthenticated, router]);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 组件卸载时断开连接
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex-1 max-w-6xl w-full mx-auto p-4">
        <Card className="h-full flex flex-col backdrop-blur-sm bg-white/80 shadow-2xl border border-white/20">
          <CardHeader className="flex-shrink-0 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-secondary/5">
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
                      messages.map((msg, index) => {
                        const isSelf = user && msg.sender === user.username;
                        return (
                          <div key={index} className={`flex ${isSelf ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                            <div className={`max-w-xs md:max-w-md ${isSelf ? 'ml-12' : 'mr-12'}`}>
                              <div className={`rounded-2xl px-4 py-3 shadow-lg ${isSelf ? 'bg-gradient-to-r from-primary to-primary-600 text-white' : 'bg-white border border-gray-200'}`}>
                                <div className="flex items-center mb-2">
                                  <Avatar
                                    size="sm"
                                    icon={<User className="w-4 h-4" />}
                                    className={`${isSelf ? 'bg-white/20' : 'bg-primary/10'} mr-2`}
                                  />
                                  <span className={`font-semibold text-sm ${isSelf ? 'text-white' : 'text-gray-700'}`}>
                                    {msg.sender} {isSelf && <span className="opacity-75">(我)</span>}
                                  </span>
                                </div>
                                <div className={`text-sm leading-relaxed ${isSelf ? 'text-white' : 'text-gray-700'}`}>
                                  {msg.content}
                                </div>
                                <div className={`text-xs mt-2 ${isSelf ? 'text-white/70' : 'text-gray-500'} text-right`}>
                                  {new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex-1 flex items-center justify-center flex-col">
                        <div className="relative">
                          <MessageCircle className="w-20 h-20 text-gray-300 mb-6" />
                          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">欢迎来到聊天室</h3>
                        <p className="text-gray-500 text-center max-w-sm">还没有消息，发送第一条消息开始聊天吧！</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  <div className="p-4 bg-gray-50/50 backdrop-blur-sm border-t border-gray-100">
                    <form onSubmit={sendMessage} className="flex items-end space-x-3">
                      <Input
                        type="text"
                        placeholder="输入消息..."
                        value={message}
                        onValueChange={setMessage}
                        className="flex-1"
                        variant="bordered"
                        isDisabled={!connected}
                        size="lg"
                        classNames={{
                          input: "text-base",
                          inputWrapper: "bg-white/80 backdrop-blur-sm"
                        }}
                      />
                      <Button
                        type="submit"
                        color="primary"
                        isDisabled={!connected || !message.trim()}
                        isIconOnly
                        size="lg"
                        className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-primary/25 transition-all duration-300"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </form>
                    <div className="mt-3 flex items-center justify-center">
                      <Chip
                        color={connected ? "success" : "danger"}
                        variant="dot"
                        size="sm"
                        classNames={{
                          base: "px-3 py-1",
                          content: "text-xs font-medium"
                        }}
                      >
                        {connected ? "🟢 已连接" : "🔴 未连接"}
                      </Chip>
                    </div>
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