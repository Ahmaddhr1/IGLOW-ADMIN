import React from "react";

const StatItem = ({ label, value }) => {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
};

export default StatItem;
