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
