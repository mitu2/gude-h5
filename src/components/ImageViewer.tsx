'use client';

import React, {useState} from 'react';
import Modal from 'react-modal';

interface ImageViewerProps {
    src: string;
    alt?: string;
    onClose?: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({src, alt = '图片', onClose}) => {
    const [isOpen, setIsOpen] = useState(true);

    const closeModal = () => {
        setIsOpen(false);
        onClose?.()
    };

    // 自定义Modal样式
    const customStyles = {
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 1000,
        },
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            padding: '0',
            border: 'none',
            background: 'none',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'hidden',
        },
    };

    return (
            <Modal
                    isOpen={isOpen}
                    onRequestClose={closeModal}
                    style={customStyles}
                    contentLabel="图片查看器"
            >
                <div className="relative">
                    <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 transition-all cursor-pointer"
                            aria-label="关闭"
                    >
                        ✕
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                            src={src}
                            alt={alt}
                            className="max-w-[90vw] max-h-[90vh] object-contain"
                    />
                </div>
            </Modal>
    );
};

export default ImageViewer;