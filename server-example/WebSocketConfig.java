package com.example.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 注册STOMP端点，客户端将使用这个端点连接到WebSocket服务器
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // 允许所有来源的跨域请求，生产环境应该限制
                .withSockJS(); // 启用SockJS回退选项
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 启用一个简单的基于内存的消息代理，将消息返回给前缀为"/topic"的目的地
        registry.enableSimpleBroker("/topic");
        
        // 设置应用程序目的地前缀
        // 客户端发送消息的目的地应该以"/app"开头
        registry.setApplicationDestinationPrefixes("/app");
    }
}