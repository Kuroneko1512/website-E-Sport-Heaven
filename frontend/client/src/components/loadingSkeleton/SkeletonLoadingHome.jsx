import React from 'react';
import { Skeleton, Card, Col, Row } from 'antd';

const SkeletonLoadingHome = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={16}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Col span={8} key={index}>
            <Card style={{ marginBottom: '16px' }}>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SkeletonLoadingHome;