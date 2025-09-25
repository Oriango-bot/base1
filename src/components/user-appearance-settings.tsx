
'use client';
import { useTheme } from 'next-themes';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Moon, Sun, Palette } from 'lucide-react';
import { useEffect, useState } from 'react';

const colors = {
    primary: [
        { name: 'Indigo', value: '231 48% 48%' },
        { name: 'Blue', value: '221 83% 53%' },
        { name: 'Green', value: '142 76% 36%' },
        { name: 'Orange', value: '25 95% 53%' },
        { name: 'Rose', value: '347 90% 49%' },
    ],
    accent: [
        { name: 'Violet', value: '261 44% 63%' },
        { name: 'Sky', value: '199 89% 49%' },
        { name: 'Amber', value: '41 96% 51%' },
        { name: 'Lime', value: '84 81% 48%' },
        { name: 'Pink', value: '336 86% 59%' },
    ]
}

export default function UserAppearanceSettings() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
        // On mount, apply saved colors from localStorage
        const savedPrimary = localStorage.getItem('theme-primary');
        const savedAccent = localStorage.getItem('theme-accent');
        if (savedPrimary) document.documentElement.style.setProperty('--primary', savedPrimary);
        if (savedAccent) document.documentElement.style.setProperty('--accent', savedAccent);
    }, []);

    const handleColorChange = (type: 'primary' | 'accent', value: string) => {
        document.documentElement.style.setProperty(`--${type}`, value);
        localStorage.setItem(`theme-${type}`, value);
    };

    if (!mounted) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Palette/> Appearance</CardTitle>
                <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="flex gap-2">
                        <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}><Sun className="mr-2" /> Light</Button>
                        <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}><Moon className="mr-2"/> Dark</Button>
                    </div>
                </div>

                 <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex flex-wrap gap-2">
                       {colors.primary.map(color => (
                            <Button key={color.name} variant="outline" size="icon" onClick={() => handleColorChange('primary', color.value)} title={color.name}>
                                <div className="h-6 w-6 rounded-full" style={{ backgroundColor: `hsl(${color.value})` }}/>
                            </Button>
                       ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Accent Color</Label>
                    <div className="flex flex-wrap gap-2">
                       {colors.accent.map(color => (
                            <Button key={color.name} variant="outline" size="icon" onClick={() => handleColorChange('accent', color.value)} title={color.name}>
                                <div className="h-6 w-6 rounded-full" style={{ backgroundColor: `hsl(${color.value})` }}/>
                            </Button>
                       ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
