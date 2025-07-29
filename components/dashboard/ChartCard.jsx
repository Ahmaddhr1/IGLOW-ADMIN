import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ChartCard = ({ title, children }) => {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartCard;
