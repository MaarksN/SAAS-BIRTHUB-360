'use client';

import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { HelpCircle } from 'lucide-react';

export function OnboardingTour() {
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    // Client-side only
    const seen = localStorage.getItem('salesos_tour_seen');
    setHasSeenTour(!!seen);
  }, []);

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        {
            element: 'aside nav',
            popover: {
                title: 'Navigation',
                description: 'Access all your tools here. From Lead Generation to Market Intelligence.'
            }
        },
        {
            element: 'aside input',
            popover: {
                title: 'Search Tools',
                description: 'Quickly find the right tool for your task by typing here.'
            }
        },
        {
            element: 'main',
            popover: {
                title: 'Workspace',
                description: 'This is where your main work happens. Dashboards, reports, and tool interfaces appear here.'
            }
        },
        {
            element: '[href="/dashboard/settings/data"]',
            popover: {
                title: 'Data Management',
                description: 'Import leads or export your data easily from this new section.'
            }
        }
      ],
      onDestroyed: () => {
        localStorage.setItem('salesos_tour_seen', 'true');
        setHasSeenTour(true);
      }
    });

    driverObj.drive();
  };

  useEffect(() => {
      if (!hasSeenTour) {
          setTimeout(() => startTour(), 1000);
      }
  }, [hasSeenTour]);

  return (
    <button
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors"
        onClick={startTour}
        title="Start Tour"
    >
        <HelpCircle className="w-6 h-6 text-blue-600" />
    </button>
  );
}
