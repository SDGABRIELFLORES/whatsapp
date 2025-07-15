import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  valueColor?: string;
}

export default function StatsCard({ title, value, icon, valueColor = "text-slate-900" }: StatsCardProps) {
  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-sm">{title}</p>
            <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
          </div>
          <div className="text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
