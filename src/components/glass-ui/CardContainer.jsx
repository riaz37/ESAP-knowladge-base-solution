import React from 'react';

export function CardContainer({
  children,
  style = {},
  className = '',
  ...props
}) {
  return (
    <div
      className={`
        ${className}
        bg-white dark:bg-transparent border border-gray-200  shadow-lg
        
        dark:border-[3px_solid_var(--Glass-strock,rgba(221,255,237,0.27))]
        dark:backdrop-blur-2xl
      `}
      style={{
        display: 'flex',
        width: '300px',
        height: '902px',
        padding: '24px',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '30px',
        flexShrink: 0,
        borderRadius: '20px',
        border: "2px solid rgba(91,228,155,0.18)",
        // border: '3px solid var(--Glass-strock, rgba(221, 255, 237, 0.27))',
        // background:
        //   'linear-gradient(180deg, rgba(148, 255, 212, 0.25) 0%, rgba(148, 255, 212, 0.09) 52.11%, rgba(148, 255, 212, 0.02) 100%)',
        
        // backdropFilter: 'blur(32px)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
