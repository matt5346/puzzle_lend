import React from 'react';
import { useParams } from 'react-router-dom';

const DashboardToken: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  console.log(assetId, 'assetId');

  return (
    <div className="App">
      <h1>DashboardToken</h1>
    </div>
  );
};

export default DashboardToken;
