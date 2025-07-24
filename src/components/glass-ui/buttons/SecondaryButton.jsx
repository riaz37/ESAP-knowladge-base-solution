import React from 'react';
import { FaFilter } from 'react-icons/fa';
import PropTypes from 'prop-types';

export function SecondaryButton({
  icon = "",
  iconPlacement = 'left',
  text,
  onClick,
  width = '80px',
  style,
  mode = 'dark',
  ...props
}) {
  const isDark = mode === 'dark';
  const defaultStyle = {
    display: 'flex',
    minHeight: '40px',
    minWidth: width,
    padding: '0px 12px',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    borderRadius: '32px',
    border: isDark ? '1px solid #FFF' : '1.5px solid #e5e7eb',
    background: isDark
      ? 'radial-gradient(72.6% 80.99% at 50% 50%, rgba(0, 0, 0, 0.50) 60.03%, #C8C8C8 100%), rgba(255, 255, 255, 0.10)'
      : '#fff',
    color: isDark ? 'white' : '#1a2b22',
    fontWeight: 500,
    fontSize: '15px',
    cursor: 'pointer',
    outline: 'none',
    transition: 'box-shadow 0.2s, background 0.2s, color 0.2s',
    boxShadow: isDark
      ? '0 0 16px 0 #FFFFFF33'
      : '0 2px 8px 0 rgba(0,0,0,0.06)',
  };

  return (
    <button
      onClick={onClick}
      style={{ ...defaultStyle, ...style }}
      {...props}
    >
      {icon && iconPlacement === 'left' && (
        <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
      )}
      <span>{text}</span>
      {icon && iconPlacement === 'right' && (
        <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
      )}
    </button>
  );
}

SecondaryButton.propTypes = {
  icon: PropTypes.node,
  mode: PropTypes.oneOf(['light', 'dark']),
};
