import { Card, CardContent, CardHeader, CardTitle } from '@salesos/ui';
import { LucideIcon } from 'lucide-react';

interface ReferralStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export function ReferralStatsCard({
  title,
  value,
  icon: Icon,
  description,
}: ReferralStatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-slate-500 dark:text-slate-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
