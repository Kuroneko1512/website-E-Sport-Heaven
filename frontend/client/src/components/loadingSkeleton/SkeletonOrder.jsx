import React from 'react';
import { Skeleton } from 'antd';

const SkeletonOrder = () => {
  return (
    <div className="border rounded-lg p-4 mb-6 shadow-sm">
      <div className="mb-4 text-base font-semibold">
        Mã đơn hàng: <i><Skeleton.Input active size="small" style={{ width: 120 }} /></i>
      </div>

      {/* Sản phẩm 1 */}
      <div className="flex items-start gap-4 mb-4">
        <Skeleton.Image active style={{ width: 64, height: 64, borderRadius: 8 }} />
        <div className="flex-1 space-y-1">
          <Skeleton.Input active size="small" style={{ width: 120 }} />
          <Skeleton.Input active size="small" style={{ width: 180 }} />
          <Skeleton.Input active size="small" style={{ width: 80 }} />
        </div>
        <Skeleton.Input active size="small" style={{ width: 60 }} />
      </div>

      {/* Sản phẩm 2 */}
      <div className="flex items-start gap-4 mb-4">
        <Skeleton.Image active style={{ width: 64, height: 64, borderRadius: 8 }} />
        <div className="flex-1 space-y-1">
          <Skeleton.Input active size="small" style={{ width: 120 }} />
          <Skeleton.Input active size="small" style={{ width: 80 }} />
        </div>
        <Skeleton.Input active size="small" style={{ width: 60 }} />
      </div>

      {/* Footer */}
      <div className="border-t pt-4 flex items-center justify-between">
        <div className="font-semibold">Tổng tiền: <Skeleton.Input active size="small" style={{ width: 80 }} /></div>
        <div className="flex gap-2">
          <Skeleton.Button active style={{ width: 60 }} />
          <Skeleton.Button active style={{ width: 80 }} />
        </div>
      </div>
    </div>
  );
};

export default SkeletonOrder;