import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 40 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-all duration-300 transform hover:scale-105`}
    >
      <defs>
        {/* Gradients for Swirling Flows */}
        <linearGradient id="purpleSwoosh" x1="100" y1="400" x2="350" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f46e5" /> {/* Indigo-600 */}
          <stop offset="60%" stopColor="#7c3aed" /> {/* Violet-600 */}
          <stop offset="100%" stopColor="#c084fc" /> {/* Purple-400 */}
        </linearGradient>

        <linearGradient id="blueArrow" x1="200" y1="350" x2="450" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan-500 */}
          <stop offset="50%" stopColor="#3b82f6" /> {/* Blue-500 */}
          <stop offset="100%" stopColor="#6366f1" /> {/* Indigo-500 */}
        </linearGradient>

        {/* Glow and Shadow Filters */}
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Orbiting Dashed Track (Top/Right Area) */}
      <path
        d="M 120,180 A 180,180 0 0,1 420,220"
        stroke="#38bdf8"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="15 20 M 10,15"
        strokeOpacity="0.7"
        filter="url(#logoGlow)"
      />

      <path
        d="M 150,140 A 210,210 0 0,1 450,170"
        stroke="#6366f1"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="25 25"
        strokeOpacity="0.4"
      />

      {/* Inner Circular Dashed Ring for Checkmark BG */}
      <circle
        cx="250"
        cy="255"
        r="110"
        stroke="#1e1b4b"
        strokeWidth="8"
        strokeDasharray="12 12"
        strokeOpacity="0.5"
      />
      <circle
        cx="250"
        cy="255"
        r="110"
        stroke="#4338ca"
        strokeWidth="3"
        strokeDasharray="8 15"
        strokeOpacity="0.4"
      />

      {/* Deep Purple Swirling Crescent Flow (Bottom Counter-Clockwise Swoosh) */}
      <path
        d="M 330,350 C 290,410 200,430 140,380 C 80,330 70,230 120,170 C 135,150 155,135 180,125 C 160,145 145,175 140,210 C 130,270 170,350 240,370 C 280,380 310,370 330,350 Z"
        fill="url(#purpleSwoosh)"
        filter="url(#logoGlow)"
      />
      
      {/* Outer Arrow Tip of the Purple Swoosh */}
      <path
        d="M 175,123 L 130,150 L 155,100 Z"
        fill="#7c3aed"
      />

      {/* Inner Swoosh with gradient and sharp arrow tip pointing counter-clockwise (down-left) */}
      <path
        d="M 160,320 C 200,380 280,380 340,330 C 400,280 400,180 340,130 M 200,345 L 140,320 L 180,285 Z"
        stroke="url(#purpleSwoosh)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dynamic Cyan/Blue Checkmark that shoots up-right into an arrow */}
      {/* Starting point (Left stem of checkmark), Corner point, Shooting tip of the Checkmark-Arrow */}
      <g filter="url(#logoGlow)">
        {/* Main Checkmark Body */}
        <path
          d="M 215,225 L 245,265 L 430,120 L 452,108 L 410,165 L 245,302 L 185,250 Z"
          fill="url(#blueArrow)"
        />

        {/* 3D Arrowhead Accents on the top right */}
        <path
          d="M 430,120 L 452,108 L 410,165 M 452,108 L 380,120 M 452,108 L 440,180"
          stroke="#e0f2fe"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Inner highlights of the Checkmark for shiny 3D futuristic look */}
        <path
          d="M 215,230 L 245,270 L 418,128"
          stroke="#22d3ee"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
      
      {/* Outer Glow dots representing flow particle effects */}
      <circle cx="160" cy="110" r="6" fill="#67e8f9" filter="url(#logoGlow)" />
      <circle cx="115" cy="150" r="5" fill="#a78bfa" />
      <circle cx="205" cy="425" r="4" fill="#818cf8" />
      <circle cx="345" cy="390" r="5" fill="#c084fc" />
      <circle cx="180" cy="90" r="3" fill="#67e8f9" />
    </svg>
  );
}
