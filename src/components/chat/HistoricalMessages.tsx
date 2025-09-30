import {PublicUserMessage} from "@/types/ChatType";
import React, {useState} from "react";
import {MessageCircle} from "lucide-react";
import {Avatar} from "@heroui/react";
import {asShortName, getUserNameByMessage} from "@/utils/nameUtils";
import {formatSimpleDate} from "@/utils/dateUtils";
import Markdown from "@/components/editor/Markdown";
import {authStore} from "@/stores/AuthStore";
import {observer} from "mobx-react-lite";
import ImageViewer from "@/components/ImageViewer";
import Conditional from "@/components/Conditional";


interface HistoricalMessagesProps {
    messages: PublicUserMessage[];
    onReplyMessage: (message: PublicUserMessage) => void;
}

const HistoricalMessages: React.FC<HistoricalMessagesProps> = observer((props) => {
    const {
        messages, onReplyMessage
    } = props;
    const {user} = authStore;
    const [imageViewer, setImageViewer] = useState({
        src: '',
        alt: '',
    })

    const handleImgClick = (src: string, alt?: string) => {
        console.log(src)
        setImageViewer({
            src,
            alt: alt || '',
        })
    }

    if (messages.length === 0) {
        return (
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
        )
    }
    const messagesNode = messages.map((msg, index) => {
        const isSelf = user && msg.creatorEmail === user.email;
        return (
                <div key={index}
                     className={`flex items-stretch mb-4 ${isSelf ? 'justify-end' : ''} animate-in fade-in duration-300 message-item`}>
                    <Conditional test={isSelf} matchValue={false}>
                        <Avatar
                                src={msg.createAvatar}
                                name={asShortName(msg.creatorName)}
                                className="flex-shrink-0 mr-2"/>
                    </Conditional>

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
                            >
                                <Markdown onImgClick={handleImgClick}>{msg.content.text}</Markdown>
                            </div>

                        </div>

                    </div>
                    <div className="flex items-center">
                        <div
                                className={`flex ${!isSelf && 'reply'} hidden`}
                                onClick={() => onReplyMessage(msg)}>
                            💬
                        </div>
                    </div>
                    <Conditional test={isSelf} matchValue={true}>
                        <Avatar
                                src={msg.createAvatar}
                                name={msg.creator}
                                className="flex-shrink-0 ml-2"/>
                    </Conditional>
                </div>
        );
    })

    return (
            <>
                {messagesNode}
                <Conditional test={!imageViewer.src} matchValue={false}>
                    <ImageViewer src={imageViewer.src} alt={imageViewer.alt}
                                 onClose={() => setImageViewer({src: '', alt: ''})}/>
                </Conditional>
            </>
    )

})


export default HistoricalMessages