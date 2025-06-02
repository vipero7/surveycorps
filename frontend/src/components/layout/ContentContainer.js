import React from 'react';

const ContentContainer = ({ children, maxWidth = '7xl', padding = true }) => {
  const maxWidthClass = {
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={`${maxWidthClass[maxWidth]} mx-auto ${padding ? 'py-6 sm:px-6 lg:px-8' : ''}`}>
      <div className={padding ? 'px-4 py-6 sm:px-0' : ''}>{children}</div>
    </div>
  );
};

export default ContentContainer;
