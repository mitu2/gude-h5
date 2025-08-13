'use client';

import {useCallback, useState, useEffect} from 'react';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {
    Avatar,
    Button,
    Navbar as HeroNavbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle
} from '@heroui/react';
import {Home, LogOut, MessageCircle, User} from 'lucide-react';
import {observer} from 'mobx-react-lite';
import {authStore} from '@/stores/AuthStore';
import {APP_NAME} from '@/utils/env';
import Conditional from "@/components/Conditional";
import {UserApis} from "@/utils/apis";

const Navbar = observer(() => {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const {user, isLoggedIn: isAuthenticated, username} = authStore;
    const router = useRouter();

    // 处理登出
    const handleLogout = useCallback(() => {
        authStore.token = '';
        authStore.clearUser()
        router.push('/');
    }, [router]);

    const menuItems = [
        {key: '/', label: '首页', icon: Home},
        {key: '/chat', label: '聊天室', icon: MessageCircle}
    ];


    useEffect(() => {
        if (isAuthenticated && !user?.id) {
            UserApis.getUserDetails().then(user => {
                authStore.setUser(user);
            })
        }
    }, [isAuthenticated, user]);

    

    return (
        <HeroNavbar isBordered maxWidth="xl" position="sticky"
                    className="bg-background/95 backdrop-blur-md border-b border-divider">
            <NavbarContent justify="start">
                <NavbarBrand>
                    <Link href="/" className="flex items-center space-x-2 group">
                        <span
                            className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                            {APP_NAME}
                        </span>
                    </Link>
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                {menuItems.map(item => (
                    <NavbarItem key={item.key}>
                        <Link
                            href={item.key}
                            className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                pathname === item.key
                                    ? 'text-primary bg-primary/10'
                                    : 'text-foreground/70 hover:text-primary'
                            }`}
                        >
                            <item.icon className="w-4 h-4"/>
                            {item.label}
                        </Link>
                    </NavbarItem>
                ))}
            </NavbarContent>

            <NavbarContent justify="end">
                <Conditional test={isAuthenticated && user} matchValue={true}>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="w-2 h-2 bg-success rounded-full"></div>
                            <span className="text-sm font-medium text-foreground/90">{username}</span>
                        </div>
                        <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            startContent={<LogOut className="w-4 h-4"/>}
                            onPress={handleLogout}
                            className="font-medium hover:bg-danger-100 transition-colors"
                        >
                            登出
                        </Button>
                    </div>
                </Conditional>
                <Conditional test={isAuthenticated && user} matchValue={false}>
                    <Button
                        as={Link}
                        href="/login"
                        color="primary"
                        variant="shadow"
                        size="sm"
                        className="font-medium bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 transform hover:scale-105 active:scale-95"
                        startContent={<User className="w-4 h-4"/>}
                    >
                        登录
                    </Button>
                </Conditional>
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="sm:hidden"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                />
            </NavbarContent>

            <NavbarMenu>
                {menuItems.map(item => (
                    <NavbarMenuItem key={item.key}>
                        <Link
                            href={item.key}
                            className={`flex items-center gap-2 p-2 rounded-md text-sm font-medium transition-colors ${
                                pathname === item.key
                                    ? 'text-primary bg-primary/10'
                                    : 'text-foreground/70 hover:text-primary'
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <item.icon className="w-4 h-4"/>
                            {item.label}
                        </Link>
                    </NavbarMenuItem>
                ))}
                {isAuthenticated && user && (
                    <>
                        <NavbarMenuItem>
                            <div className="flex items-center gap-2 p-2 text-sm font-medium text-foreground/60">
                                <Avatar
                                    size="sm"
                                    icon={<User className="w-4 h-4"/>}
                                    className="bg-primary"
                                />
                                {username}
                            </div>
                        </NavbarMenuItem>
                        <NavbarMenuItem>
                            <Button
                                fullWidth
                                color="danger"
                                variant="flat"
                                startContent={<LogOut className="w-4 h-4"/>}
                                onPress={handleLogout}
                                className="font-medium"
                            >
                                登出
                            </Button>
                        </NavbarMenuItem>
                    </>
                )}
            </NavbarMenu>
        </HeroNavbar>
    );
});

export default Navbar;