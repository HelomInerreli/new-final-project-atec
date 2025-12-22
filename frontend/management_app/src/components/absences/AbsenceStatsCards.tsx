import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { ComponentType } from "react";

interface AbsenceStatsCardsProps {
  total: number;
  approved: number;
  pending: number;
  Icon: ComponentType<{ className?: string }>;
  titleTotal: string;
  titleApproved: string;
  titlePending: string;
}

export default function AbsenceStatsCards({
  total, approved, pending, Icon, titleTotal, titleApproved, titlePending
}: AbsenceStatsCardsProps) {
  return (
    <div className="grid gap-6 mb-6 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{titleTotal}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{titleApproved}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{approved}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{titlePending}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pending}</div>
        </CardContent>
      </Card>
    </div>
  );
}