// Settings store - app configuration

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    autoRefreshInterval: number; // in seconds
    autoRefreshEnabled: boolean;
    showOnlyTiered: boolean; // Only show coins in a tier

    // Actions
    setAutoRefreshInterval: (seconds: number) => void;
    toggleAutoRefresh: () => void;
    toggleShowOnlyTiered: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            autoRefreshInterval: 60, // 60 seconds default
            autoRefreshEnabled: true,
            showOnlyTiered: false,

            setAutoRefreshInterval: (seconds) => {
                set({ autoRefreshInterval: Math.max(30, Math.min(300, seconds)) });
            },

            toggleAutoRefresh: () => {
                set(state => ({ autoRefreshEnabled: !state.autoRefreshEnabled }));
            },

            toggleShowOnlyTiered: () => {
                set(state => ({ showOnlyTiered: !state.showOnlyTiered }));
            },
        }),
        {
            name: 'meme-screener-settings',
        }
    )
);
