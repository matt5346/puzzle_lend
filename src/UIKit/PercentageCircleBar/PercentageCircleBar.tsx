/* eslint-disable prettier/prettier */
/* eslint-disable no-sequences */
import React, { useEffect, useState } from 'react';

interface IProps {
  size: number;
  strokeWidth: number;
  percentage: number;
  color: string;
}

const getGreenToRed = (percent: any) => {
  const hue = Math.round(percent);
  return ['hsl(', hue, ', 50%, 50%)'].join('');
};

const PercentageCircleBar: React.FC<IProps> = ({ size, strokeWidth, percentage, color }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    setProgress(percentage);
  }, [percentage]);

  const viewBox = `0 0 ${size} ${size}`;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI * 2;
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash: number = (progress * circumference) / 100;

  return (
    <svg width={size} height={size} viewBox={viewBox}>
      <circle fill="none" stroke="#ccc" cx={size / 2} cy={size / 2} r={radius} strokeWidth={`${strokeWidth}px`} />
      <circle
        fill="none"
        stroke={getGreenToRed(percentage)}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={`${strokeWidth}px`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeLinecap="round"
        style={{ transition: 'all 0.5s' }}
      />
      <text fill="black" fontSize="40px" x="52%" y="30%" dy="20px" textAnchor="middle">
        {`${percentage}%`}
      </text>
      <text fontSize="36px" x="22%" y="50%" dy="20px" fill="#8082C5">Account</text>
      <text fontSize="36px" x="27%" y="70%" dy="20px" fill="#8082C5">Health</text>
    </svg>
  );
};

export default PercentageCircleBar;