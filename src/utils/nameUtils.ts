import { PublicUserMessage } from "@/types/ChatType";
import { User } from "@/types/ApiType";

export function asShortName(fullName: string | undefined) {
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

export function getUserNameByMessage(message: PublicUserMessage): string {
    const { creatorName, creator } = message;
    if (creatorName && creator !== creatorName) {
        return `${creator}(${creatorName})`
    }
    return creator;
}

export function getUserNameByUser(user: User): string {
    const { nickname, account } = user;
    if (nickname && account !== nickname) {
        return `${account}(${nickname})`
    }
    return account || '';
}
