'use client';

import {makeAutoObservable} from 'mobx';
import {getLocalStorageItem, removeLocalStorageItem, setLocalStorageItem} from "@/utils/localStorages";
import {User} from "@/types/ApiType";


export class AuthStore {

    user?: User;
    isLoggedIn: boolean;

    constructor() {
        makeAutoObservable(this)
        this.user = JSON.parse(getLocalStorageItem('user', '{}'));
        this.isLoggedIn = !!getLocalStorageItem('token', '');
    }

    set token(token: string | undefined | null) {
        if (token) {
            setLocalStorageItem('token', token);
            this.isLoggedIn = true;
        } else {
            removeLocalStorageItem('token');
            this.isLoggedIn = false;
        }
    }

    setUser(user: User) {
        this.user = user;
        setLocalStorageItem('user', JSON.stringify(this.user));
    }

    get username() {
        return this.user?.nickname + '#' + this.user?.id;
    }
}


export const authStore = new AuthStore();

