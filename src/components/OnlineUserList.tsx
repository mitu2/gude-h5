import React from 'react';
import {Avatar, Card, CardBody, CardHeader} from '@heroui/react';
import {User as IUser} from "@/types/ApiType";
import {User} from "lucide-react";

interface OnlineUserListProps {
    users: IUser[];
}

const OnlineUserList: React.FC<OnlineUserListProps> = ({users}) => {
    return (
        <Card className="h-full flex flex-col backdrop-blur-sm bg-white/80 shadow-md border border-white/20">
            <CardHeader
                className="flex-shrink-0 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-secondary/5">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <User className="w-6 h-6 text-primary"/>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">在线用户</h1>
                        <div className="text-sm"><span className="text-gray-700">当前在线人数: </span>{users.length}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardBody className="flex-1 overflow-y-auto p-4">
                {users.length > 0 ? (
                    <div className="space-y-3">
                        {users.map(user => (
                            <div key={user.id} className="flex items-center space-x-3">
                                <Avatar size="sm" icon={<User className="w-4 h-4"/>} className="bg-primary/10"/>
                                <span className="font-medium text-gray-700">{user.nickname + "#" + user.id}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        暂无在线用户
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

export default OnlineUserList;