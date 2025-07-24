import React from 'react';
import { FaFilter } from 'react-icons/fa';
import PropTypes from 'prop-types';

export function PrimaryButton({
  icon = "",
  iconPlacement = "left",
  text,
  onClick,
  mode = "dark",
  ...props
}) {
  const isDark = mode === "dark";
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        minHeight: '38px',
        padding: '0px 24px',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        borderRadius: '32px',
        border: `1.5px solid #5BE49B`,
        background: isDark
          ? 'radial-gradient(72.6% 80.99% at 50% 50%, rgba(0, 0, 0, 0.50) 50.03%, #5BE49B 100%), rgba(255, 255, 255, 0.10)'
          : '#fff',
        color: isDark ? 'white' : '#1a2b22',
        fontWeight: 500,
        fontSize: '15px',
        cursor: 'pointer',
        outline: 'none',
        transition: 'box-shadow 0.2s, background 0.2s, color 0.2s',
        boxShadow: isDark
          ? '0 0 16px 0 #5BE49B33'
          : '0 2px 8px 0 rgba(91,228,155,0.08)',
        width: '100%', // default, but can be overridden
        ...props.style, // moved to the end for override
      }}
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

PrimaryButton.propTypes = {
  icon: PropTypes.node,
  mode: PropTypes.oneOf(['light', 'dark']),
};
