import {User} from "@/types/ApiType";



export interface PublicMessage {
    type: PublicMessageType;
}

export interface PublicUserMessage extends PublicMessage {
    mid: number;
    content: {
        text: string
    };
    creator: string;
    creatorName?: string;
    creatorEmail: string
    createDate: string;
    createAvatar: string;
}

export interface PublicUserStatusChangeMessage extends PublicMessage, User {
    status: UserChangeStatus,
    anonymous: boolean,
    sessionId: string
}


export interface PrivateMessage {
    type: PrivateMessageType;
}

export interface PrivateStatisticsMessage extends PrivateMessage{
    online: number;
    anonymous: number;
    users: User[]
}

export interface PrivateHistoryMessage extends PrivateMessage {
    messages: PublicUserMessage[]
    hasMore: boolean,
    lastMId?: number
}

export enum SendDestinations {
    HISTORY = '/app/message/history',
    SEND_MESSAGE = '/app/message/send',
}

export enum ReceiveDestinations {
    PUBLIC = '/topic/public',
    PRIVATE = '/user/topic/private',
}

export enum PublicMessageType {
    USER_STATUS_CHANGE = 'USER_STATUS_CHANGE',
    USER_MESSAGE = 'USER_MESSAGE',
}

export enum PrivateMessageType {
    STATISTICS = 'STATISTICS',
    HISTORY_MESSAGE = 'HISTORY_MESSAGE',
}

export enum UserChangeStatus {
    JOIN = 'JOIN',
    LEAVE = 'LEAVE',
}
