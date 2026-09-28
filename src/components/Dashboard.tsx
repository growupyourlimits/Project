import React from 'react';
import { DashboardPage } from '../pages/DashboardPage';

export const Dashboard: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  return (
    <div className="relative">
      <DashboardPage />
    </div>
  );
};
