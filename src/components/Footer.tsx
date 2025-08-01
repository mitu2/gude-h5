'use client';

import {APP_NAME} from '@/utils/env';

export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center space-y-4">
                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">
                            © {new Date().getFullYear()} {APP_NAME}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}