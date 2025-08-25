import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>('system');
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        // Save theme to localStorage
        localStorage.setItem('theme', theme);

        // Apply theme to document
        const root = document.documentElement;

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.toggle('dark', systemTheme === 'dark');
            setIsDark(systemTheme === 'dark');
        } else {
            root.classList.toggle('dark', theme === 'dark');
            setIsDark(theme === 'dark');
        }
    }, [theme]);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = () => {
            if (theme === 'system') {
                const systemTheme = mediaQuery.matches ? 'dark' : 'light';
                root.classList.toggle('dark', systemTheme === 'dark');
                setIsDark(systemTheme === 'dark');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'system';
            return 'light';
        });
    };

    const value: ThemeContextType = {
        theme,
        setTheme,
        isDark,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};






