'use client';

import React from 'react';

interface IconProps {
    size?: number;
    color?: string;
    weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill';
    className?: string;
}

// ============================================
// NAVIGATION ICONS
// ============================================

// House Icon
export function House({ size = 24, color = 'currentColor', weight = 'regular', className }: IconProps) {
    if (weight === 'fill') {
        return (
            <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={color}>
                <path d="M20 20V10.83l1.29 1.29a1 1 0 0 0 1.42-1.41l-9.29-9.3a1.56 1.56 0 0 0-2.84 0l-9.29 9.3a1 1 0 0 0 1.42 1.41L4 10.83V20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2Z" />
            </svg>
        );
    }
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z" />
            <path d="M9 21V12h6v9" />
        </svg>
    );
}

// Clock Icon (History)
export function Clock({ size = 24, color = 'currentColor', weight = 'regular', className }: IconProps) {
    if (weight === 'fill') {
        return (
            <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={color}>
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm3.71 11.71a1 1 0 0 1-1.42 0L12 11.41V6a1 1 0 0 1 2 0v4.59l1.71 1.71a1 1 0 0 1 0 1.41Z" />
            </svg>
        );
    }
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 6v6l4 2" />
        </svg>
    );
}

// Gear Icon (Settings)
export function Gear({ size = 24, color = 'currentColor', weight = 'regular', className }: IconProps) {
    if (weight === 'fill') {
        return (
            <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={color}>
                <path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65A.488.488 0 0 0 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65ZM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z" />
            </svg>
        );
    }
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1V13a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        </svg>
    );
}

// ============================================
// RECORDING & AUDIO ICONS
// ============================================

// Microphone - Apple Voice Memos style
export function Microphone({ size = 24, color = 'currentColor', weight = 'regular', className }: IconProps) {
    if (weight === 'fill') {
        return (
            <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={color}>
                <rect x="8" y="2" width="8" height="13" rx="4" />
                <path d="M19 11a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V20H8a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2h-3v-2.08A7 7 0 0 0 19 11Z" />
            </svg>
        );
    }
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M18 11a6 6 0 0 1-12 0" />
            <line x1="12" y1="17" x2="12" y2="21" />
            <line x1="8" y1="21" x2="16" y2="21" />
        </svg>
    );
}

// Waveform
export function Waveform({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="12" x2="4" y2="12" />
            <line x1="8" y1="8" x2="8" y2="16" />
            <line x1="12" y1="4" x2="12" y2="20" />
            <line x1="16" y1="8" x2="16" y2="16" />
            <line x1="20" y1="12" x2="20" y2="12" />
        </svg>
    );
}

// Stop Circle - Apple style filled
export function StopCircle({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <circle cx="12" cy="12" r="10" />
            <rect x="9" y="9" width="6" height="6" rx="1" fill="white" />
        </svg>
    );
}

// Pause Circle - Apple style
export function PauseCircle({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <circle cx="12" cy="12" r="10" />
            <rect x="9" y="8" width="2" height="8" rx="0.5" fill="white" />
            <rect x="13" y="8" width="2" height="8" rx="0.5" fill="white" />
        </svg>
    );
}

// Play Circle - Apple style
export function PlayCircle({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <circle cx="12" cy="12" r="10" />
            <polygon points="10,8 16,12 10,16" fill="white" />
        </svg>
    );
}

// ============================================
// FILE & DOCUMENT ICONS
// ============================================

// Document
export function Document({ size = 24, color = 'currentColor', weight = 'regular', className }: IconProps) {
    if (weight === 'fill') {
        return (
            <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={color}>
                <path d="M20 8.94a1.31 1.31 0 0 0-.06-.27v-.09a1.07 1.07 0 0 0-.19-.28l-6-6a1.07 1.07 0 0 0-.28-.19h-.09a.88.88 0 0 0-.33-.11H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.94Zm-6-3.53L17.59 9H15a1 1 0 0 1-1-1V5.41ZM18 20H6V4h6v4a3 3 0 0 0 3 3h3v9Z" />
            </svg>
        );
    }
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
    );
}

// Folder
export function Folder({ size = 24, color = 'currentColor', weight = 'regular', className }: IconProps) {
    if (weight === 'fill') {
        return (
            <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={color}>
                <path d="M20 6h-8l-1.41-1.41C10.21 4.21 9.7 4 9.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2Z" />
            </svg>
        );
    }
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2Z" />
        </svg>
    );
}

// Upload Cloud
export function CloudUpload({ size = 24, color = 'currentColor', weight = 'regular', className }: IconProps) {
    if (weight === 'fill') {
        return (
            <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={color}>
                <path d="M18.42 9.21a7 7 0 0 0-13.36 1.58A4 4 0 0 0 6 19h11a5 5 0 0 0 1.42-9.79ZM13 13v4h-2v-4H9l3-4 3 4h-2Z" />
            </svg>
        );
    }
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 16l-4-4-4 4" />
            <path d="M12 12v9" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
        </svg>
    );
}

// ============================================
// ACTION ICONS
// ============================================

// Trash
export function Trash({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
    );
}

// Pencil (Edit)
export function Pencil({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
        </svg>
    );
}

// Check
export function Check({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

// X (Close)
export function X({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

// Plus
export function Plus({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

// MagnifyingGlass (Search)
export function MagnifyingGlass({ size = 24, color = 'currentColor', weight = 'regular', className }: IconProps) {
    if (weight === 'fill') {
        return (
            <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={color}>
                <path d="M11 2a9 9 0 1 0 5.62 16.02l4.68 4.68a1 1 0 0 0 1.42-1.42l-4.68-4.68A9 9 0 0 0 11 2Zm0 16a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" />
            </svg>
        );
    }
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
        </svg>
    );
}

// External Link
export function ExternalLink({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    );
}

// ============================================
// USER & AUTH ICONS
// ============================================

// User
export function User({ size = 24, color = 'currentColor', weight = 'regular', className }: IconProps) {
    if (weight === 'fill') {
        return (
            <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={color}>
                <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5Z" />
            </svg>
        );
    }
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

// SignOut (Arrow Right from Box)
export function SignOut({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    );
}

// ============================================
// STATUS ICONS
// ============================================

// CheckCircle
export function CheckCircle({ size = 24, color = 'currentColor', weight = 'regular', className }: IconProps) {
    if (weight === 'fill') {
        return (
            <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={color}>
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm4.71 7.29-5 5a1 1 0 0 1-1.42 0l-2-2a1 1 0 0 1 1.42-1.42L11 12.17l4.29-4.29a1 1 0 0 1 1.42 1.41Z" />
            </svg>
        );
    }
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="9 12 11 14 15 10" />
        </svg>
    );
}

// WarningTriangle
export function Warning({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}

// Inbox (Empty state)
export function Inbox({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
            <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
        </svg>
    );
}

// Music Note
export function MusicNote({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
        </svg>
    );
}

// Refresh
export function Refresh({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
    );
}

// File (Generic file icon)
export function File({ size = 24, color = 'currentColor', weight = 'regular', className }: IconProps) {
    if (weight === 'fill') {
        return (
            <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={color}>
                <path d="M14.41 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.59L14.41 3ZM15 4.41L18.59 8H15V4.41ZM18 19H6V5h7v4a1 1 0 0 0 1 1h4v9Z" />
            </svg>
        );
    }
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
    );
}

// Cloud with Check (Success upload)
export function CloudCheck({ size = 24, color = 'currentColor', weight = 'regular', className }: IconProps) {
    if (weight === 'fill') {
        return (
            <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={color}>
                <path d="M18.42 8.21a7 7 0 0 0-13.36 1.58A4 4 0 0 0 6 18h11a5 5 0 0 0 1.42-9.79ZM16.71 11.29l-5 5a1 1 0 0 1-1.42 0l-2-2a1 1 0 0 1 1.42-1.42L11 14.17l4.29-4.29a1 1 0 0 1 1.42 1.41Z" />
            </svg>
        );
    }
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 18a5 5 0 0 0-.84-9H18a7 7 0 1 0-13.7 2" />
            <polyline points="9 13 11 15 15 11" />
        </svg>
    );
}

// Warning Circle (Error state)
export function WarningCircle({ size = 24, color = 'currentColor', weight = 'regular', className }: IconProps) {
    if (weight === 'fill') {
        return (
            <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={color}>
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 5a1 1 0 0 1 1 1v5a1 1 0 0 1-2 0V8a1 1 0 0 1 1-1Zm0 10a1 1 0 1 1 1-1 1 1 0 0 1-1 1Z" />
            </svg>
        );
    }
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}

// Arrow Right
export function ArrowRight({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    );
}

// ============================================
// PLAUD ENHANCEMENT ICONS
// ============================================

// Chat Bubble
export function ChatBubble({ size = 24, color = 'currentColor', weight = 'regular', className }: IconProps) {
    if (weight === 'fill') {
        return (
            <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={color}>
                <path d="M20 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3l3.29 3.29a1 1 0 0 0 1.42 0L15 18h5a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
            </svg>
        );
    }
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
        </svg>
    );
}

// Download
export function Download({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    );
}

// Star
export function Star({ size = 24, color = 'currentColor', weight = 'regular', className }: IconProps) {
    if (weight === 'fill') {
        return (
            <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={color}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
            </svg>
        );
    }
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
        </svg>
    );
}

// Sparkle (AI / Magic)
export function Sparkle({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.8 5.4L19 10l-5.2 3.8L15.2 19 12 16.2 8.8 19l1.4-5.2L5 10l5.2-1.6L12 3Z" />
            <line x1="19" y1="2" x2="19" y2="4" />
            <line x1="18" y1="3" x2="20" y2="3" />
            <line x1="4" y1="4" x2="4" y2="6" />
            <line x1="3" y1="5" x2="5" y2="5" />
        </svg>
    );
}

// ListChecks (Action Items / Checklist)
export function ListChecks({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 5.5L5 7l2.5-3" />
            <path d="M3.5 11.5L5 13l2.5-3" />
            <path d="M3.5 17.5L5 19l2.5-3" />
            <line x1="11" y1="6" x2="21" y2="6" />
            <line x1="11" y1="12" x2="21" y2="12" />
            <line x1="11" y1="18" x2="21" y2="18" />
        </svg>
    );
}

// ClipboardText (Minutes / Summary)
export function ClipboardText({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <line x1="8" y1="10" x2="16" y2="10" />
            <line x1="8" y1="14" x2="16" y2="14" />
            <line x1="8" y1="18" x2="12" y2="18" />
        </svg>
    );
}

// QuestionCircle (Q&A)
export function QuestionCircle({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}

// FileText (Plain text)
export function FileText({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    );
}

// ArrowLeft (Back)
export function ArrowLeft({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
        </svg>
    );
}

// Send (Chat input)
export function Send({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
    );
}

// Hash (Markdown)
export function Hash({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="9" x2="20" y2="9" />
            <line x1="4" y1="15" x2="20" y2="15" />
            <line x1="10" y1="3" x2="8" y2="21" />
            <line x1="16" y1="3" x2="14" y2="21" />
        </svg>
    );
}

// Lightbulb (Key Points)
export function Lightbulb({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18h6" />
            <path d="M10 22h4" />
            <path d="M12 2a7 7 0 0 0-4 12.73V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.27A7 7 0 0 0 12 2Z" />
        </svg>
    );
}

// Robot (AI Assistant)
export function Robot({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="8" width="18" height="12" rx="2" />
            <line x1="12" y1="3" x2="12" y2="8" />
            <circle cx="12" cy="3" r="1" />
            <circle cx="9" cy="14" r="1.5" />
            <circle cx="15" cy="14" r="1.5" />
            <path d="M9 18h6" />
        </svg>
    );
}

// Chevron Right
export function ChevronRight({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
        </svg>
    );
}

// Monitor (Screen/System Audio)
export function Monitor({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8" />
            <path d="M12 17v4" />
            <path d="M9 10l2 2 4-4" />
        </svg>
    );
}

// Microphone + Monitor combined
export function MicMonitor({ size = 24, color = 'currentColor', className }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="2" width="14" height="10" rx="1.5" />
            <path d="M10 16h8" />
            <path d="M14 12v4" />
            <path d="M3 12v1a2 2 0 0 0 2 2h1" />
            <path d="M3.5 8a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h0a1 1 0 0 1-1-1V8Z" />
        </svg>
    );
}

