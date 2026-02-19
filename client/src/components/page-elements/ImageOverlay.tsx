import React from "react";
import { IconClose } from "../icons/IconClose"

interface ImageOverlayProps {
    imageUrl: string
    alt?: string
    isOpen: boolean
    onClose: () => void
}

export  const ImageOverlay: React.FC<ImageOverlayProps> = ({ imageUrl, alt = "", isOpen, onClose }) => {
    if (!isOpen) return null

    return (
        <div className="tw-fixed tw-inset-0 tw-z-50 tw-bg-black/80 tw-flex tw-items-center tw-justify-center">
            <button
                className="tw-absolute tw-top-4 tw-right-4 tw-text-white tw-text-2xl tw-font-bold focus:tw-outline-none"
                onClick={onClose}
                aria-label="Close"
            >
                <IconClose className = "tw-text-color-white"/>
            </button>
            <img
                src={imageUrl}
                alt={alt}
                className="lg:tw-w-3/4 lg:tw-h-3/4 tw-max-w-full tw-max-h-full tw-object-contain tw-rounded-lg tw-shadow-lg"
            />
        </div>
    )
}

