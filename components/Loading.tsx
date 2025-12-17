import React from 'react';

const Loading: React.FC = () => (
  <div className="w-full h-40 flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600" />
  </div>
);

export default Loading;
