'use client';

import React from 'react';

export const DropdownMenu = ({ children }: any) => <div>{children}</div>;

export const DropdownMenuTrigger = ({ children }: any) => <div>{children}</div>;

export const DropdownMenuContent = ({ children }: any) => (
  <div style={{ border: '1px solid #ddd', padding: 8 }}>{children}</div>
);

export const DropdownMenuItem = ({ children, onClick }: any) => (
  <div onClick={onClick} style={{ padding: 6, cursor: 'pointer' }}>
    {children}
  </div>
);

export const DropdownMenuSeparator = () => (
  <div style={{ height: '1px', backgroundColor: '#ddd', margin: '4px 0' }} />
);