import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const DashboardCard = ({ title, value, icon, children }) => {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          {icon && <span>{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {value ? (
          <div className="text-2xl font-bold">{value}</div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
