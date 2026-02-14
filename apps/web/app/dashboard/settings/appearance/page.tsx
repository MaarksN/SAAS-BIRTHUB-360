'use client';

import { useTheme } from 'next-themes';
import { Button } from '@salesos/ui';
import { Moon, Sun, Monitor, Contrast } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import { useState, useEffect } from 'react';

export default function AppearanceSettings() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if high contrast is active (via body class)
    setHighContrast(document.body.classList.contains('high-contrast'));
  }, []);

  const toggleHighContrast = () => {
      if (document.body.classList.contains('high-contrast')) {
          document.body.classList.remove('high-contrast');
          setHighContrast(false);
      } else {
          document.body.classList.add('high-contrast');
          setHighContrast(true);
      }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appearance</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Customize how SalesOS looks and feels.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="flex flex-col h-auto py-4 px-6 gap-2"
            >
                <Sun className="w-6 h-6" />
                <span>Light</span>
            </Button>
            <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="flex flex-col h-auto py-4 px-6 gap-2"
            >
                <Moon className="w-6 h-6" />
                <span>Dark</span>
            </Button>
            <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => setTheme('system')}
                className="flex flex-col h-auto py-4 px-6 gap-2"
            >
                <Monitor className="w-6 h-6" />
                <span>System</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle>Accessibility</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="flex items-center justify-between">
                  <div>
                      <h4 className="font-medium">High Contrast Mode</h4>
                      <p className="text-sm text-slate-500">Increases contrast for better readability.</p>
                  </div>
                  <Button
                      variant={highContrast ? 'default' : 'outline'}
                      onClick={toggleHighContrast}
                  >
                      <Contrast className="w-4 h-4 mr-2" />
                      {highContrast ? 'Enabled' : 'Disabled'}
                  </Button>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
