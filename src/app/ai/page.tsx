'use client';

import React from 'react';
import { AIHub } from '@/components/ai/AIHub';

export default function AIPage() {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <AIHub 
        defaultTab="analysis"
        userType="admin"
        enableAutoRefresh={true}
      />
    </div>
  );
}