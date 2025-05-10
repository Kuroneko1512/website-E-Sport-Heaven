import React from 'react'
import { Card, Skeleton } from "antd";

const SkeletonBestseller = () => {
    return (
          <div className="grid grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="w-full">
                <Skeleton.Image active style={{ width: "19rem", height: "22rem" }} className="mb-4"/>
                <Skeleton active title={{ width: "60%" }} paragraph={{ rows: 1, width: ["80%"] }} />
              </Card>
            ))}
          </div>
      );
}

export default SkeletonBestseller
