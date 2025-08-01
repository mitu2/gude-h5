
export function getLocalStorageItem(name: string, defaultValue: string) : string {
    if (!globalThis || !globalThis.localStorage) {
        return defaultValue;
    }
    return localStorage.getItem(name) || defaultValue;
}


export function setLocalStorageItem(name: string, value: string): boolean {
    if (!globalThis || !globalThis.localStorage) {
        return false;
    }
    localStorage.setItem(name, value)
    return true;
}

export function removeLocalStorageItem(name: string): boolean {
    if (!globalThis || !globalThis.localStorage) {
        return false;
    }
    localStorage.removeItem(name)
    return true;
}