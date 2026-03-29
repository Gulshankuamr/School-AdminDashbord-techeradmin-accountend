import React from "react";

/**
 * Reusable Spinner component
 * Props:
 *   white  — boolean, white color (for dark backgrounds)
 *   size   — number, diameter in px (default 13)
 */
const Spinner = ({ white = false, size = 13 }) => (
  <div
    style={{
      width: size,
      height: size,
      flexShrink: 0,
      border: `${size > 20 ? 4 : 2}px solid ${white ? "rgba(255,255,255,0.3)" : "#e2e8f0"}`,
      borderTopColor: white ? "#fff" : "#3b82f6",
      borderRadius: "50%",
      animation: "spin .7s linear infinite",
      display: "inline-block",
    }}
  />
);

export default Spinner;