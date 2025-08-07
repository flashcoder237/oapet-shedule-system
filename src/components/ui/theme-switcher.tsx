'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ui/theme-provider';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center bg-muted rounded-lg p-1 transition-colors">
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('light')}
        className="rounded-md h-8 w-8 p-0 hover:bg-background"
        title="Mode clair"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('dark')}
        className="rounded-md h-8 w-8 p-0 hover:bg-background"
        title="Mode sombre"
      >
        <Moon className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === 'system' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('system')}
        className="rounded-md h-8 w-8 p-0 hover:bg-background"
        title="Thème système"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  );
}