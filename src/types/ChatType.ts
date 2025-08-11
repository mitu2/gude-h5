import {User} from "@/types/ApiType";

export enum PublicMessageType {
    USER_STATUS_CHANGE = 'USER_STATUS_CHANGE',
    USER_MESSAGE = 'USER_MESSAGE',
}

export interface PublicMessage {
    type: PublicMessageType;
}

export interface PublicUserMessage extends PublicMessage {
    mid: number;
    content: {
        text: string
    };
    creatorId: number;
    creatorName?: string;
    creatorEmail: string
    createDate: string;
}

export enum UserChangeStatus {
    JOIN = 'JOIN',
    LEAVE = 'LEAVE',
}

export interface PublicUserStatusChangeMessage extends PublicMessage, User {
    status: UserChangeStatus,
    anonymous: boolean
}



export enum PrivateMessageType {
    STATISTICS = 'STATISTICS',
    HISTORY_MESSAGE = 'HISTORY_MESSAGE',
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