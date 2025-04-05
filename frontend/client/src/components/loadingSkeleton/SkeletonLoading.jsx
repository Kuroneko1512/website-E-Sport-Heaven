import React from "react";
import { Card, Skeleton } from "antd";

const SkeletonLoading = () => {
  return (
    <div className="grid grid-cols-4 gap-6">
      {/* Cột 1: Skeleton Filter */}
      <div className="col-span-1">
        <Card className="p-4">
          <Skeleton active title={{ width: "80%" }} paragraph={{ rows: 4 }} />
        </Card>
      </div>

      {/* Cột 3: Skeleton Products Grid */}
      <div className="col-span-3 grid grid-cols-3 gap-4">
        {[...Array(12)].map((_, index) => (
          <Card key={index} className="w-full">
            <Skeleton.Image active style={{ width: "19rem", height: "25rem" }} className="mb-4"/>
            <Skeleton active title={{ width: "60%" }} paragraph={{ rows: 1, width: ["80%"] }} />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoading;