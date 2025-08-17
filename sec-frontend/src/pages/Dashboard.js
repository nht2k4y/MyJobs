import React from 'react';
import { getRole } from '../utils/auth';

export default function Dashboard() {
  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold mb-4">Chào mừng bạn</h2>
      <p>Vai trò của bạn là: <strong>{getRole()}</strong></p>
    </div>
  );
}
