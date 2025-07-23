"use client";

import React, { useState, useEffect } from "react";
import {
  ICON_DATA,
  DESKTOP_ICON_COUNT,
  MOBILE_ICON_COUNT,
  DESKTOP_MIN_DISTANCE,
  MOBILE_MIN_DISTANCE,
} from "./config";
import { debounce, getRandomNumber, shuffleArray } from "./helpers";
import type { IconConfig, IconProps } from "./types";

const Icon: React.FC<IconProps> = ({
  icon,
  isHovered,
  isAnyIconHovered,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [hasError, setHasError] = useState<boolean>(false);
  const showTooltipOnLeft = parseInt(icon.position.left) > 75;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ ...icon.position, ...icon.style }}
      className={`
                absolute rounded-full transition-all duration-300 ease-in-out
                animate-float flex items-center justify-center group
                ${isHovered ? "z-20 scale-125" : "z-10"}
                ${
                  isAnyIconHovered
                    ? isHovered
                      ? "blur-0"
                      : "blur opacity-30"
                    : "blur-md"
                }
            `}
    >
      <div
        className="w-full h-full rounded-full transition-all duration-300 relative"
        style={{
          boxShadow: isHovered ? `0 0 35px 7px ${icon.colors.primary}` : "none",
          outline: isHovered ? `2px solid ${icon.colors.primary}` : "none",
          outlineOffset: "4px",
        }}
      >
        {!hasError ? (
          <img
            src={icon.data.iconUrl}
            alt={icon.data.name}
            onError={() => setHasError(true)}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full rounded-full"
            style={{ background: icon.colors.gradient }}
          />
        )}
      </div>
      <div
        className={`
                absolute transition-all duration-300 ease-in-out
                w-max rounded-md backdrop-blur-sm
                text-white text-left top-1/2 -translate-y-1/2
                ${
                  isHovered
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-90 pointer-events-none"
                }
                ${showTooltipOnLeft ? "right-full mr-6" : "left-full ml-6"}
            `}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs">{icon.data.name}</span>
        </div>
      </div>
    </div>
  );
};

const Background: React.FC = () => {
  const [hoveredIconId, setHoveredIconId] = useState<number | null>(null);
  const [icons, setIcons] = useState<IconConfig[]>([]);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  useEffect(() => {
    const debouncedHandleResize = debounce(() => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }, 250);
    if (typeof window !== "undefined") {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
      window.addEventListener("resize", debouncedHandleResize);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", debouncedHandleResize);
      }
    };
  }, []);

  useEffect(() => {
    if (dimensions.width === 0) return;
    const isMobile = dimensions.width < 768;
    const iconCount = isMobile ? MOBILE_ICON_COUNT : DESKTOP_ICON_COUNT;
    const minDistance = isMobile ? MOBILE_MIN_DISTANCE : DESKTOP_MIN_DISTANCE;
    const sizeRange = isMobile ? { min: 30, max: 60 } : { min: 40, max: 100 };
    const generatedIcons: IconConfig[] = [];
    const shuffledData = shuffleArray(ICON_DATA);
    const isOverlapping = (newIcon: IconConfig): boolean => {
      for (const existingIcon of generatedIcons) {
        const dx =
          (parseFloat(newIcon.position.left) / 100) * dimensions.width -
          (parseFloat(existingIcon.position.left) / 100) * dimensions.width;
        const dy =
          (parseFloat(newIcon.position.top) / 100) * dimensions.height -
          (parseFloat(existingIcon.position.top) / 100) * dimensions.height;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < minDistance) return true;
      }
      return false;
    };
    for (let i = 0; i < iconCount; i++) {
      let newIcon: IconConfig;
      let positionFound = false;
      let attempts = 0;
      while (!positionFound && attempts < 100) {
        const data = shuffledData[i];
        const size = getRandomNumber(sizeRange.min, sizeRange.max);
        const primaryHue = getRandomNumber(0, 360);
        const primaryColor = `hsl(${primaryHue}, 70%, 60%)`;
        const secondaryColor = `hsl(${getRandomNumber(0, 360)}, 70%, 50%)`;
        newIcon = {
          id: i,
          data: data,
          position: {
            top: `${getRandomNumber(5, 95)}%`,
            left: `${getRandomNumber(5, 95)}%`,
          },
          style: {
            width: `${size}px`,
            height: `${size}px`,
            animationDuration: `${getRandomNumber(20, 35)}s`,
            animationDelay: `${getRandomNumber(0, 15)}s`,
          },
          colors: {
            primary: primaryColor,
            gradient: `radial-gradient(circle, ${primaryColor}, ${secondaryColor})`,
          },
        };
        if (!isOverlapping(newIcon)) {
          positionFound = true;
          generatedIcons.push(newIcon);
        }
        attempts++;
      }
    }
    setIcons(generatedIcons);
  }, [dimensions]);

  const isAnyIconHovered = hoveredIconId !== null;

  return (
    <div className="fixed inset-0 bg-black">
      <style>
        {`@keyframes float { 0% { transform: translate(0, 0); } 25% { transform: translate(15px, -25px); } 50% { transform: translate(-20px, 15px); } 75% { transform: translate(20px, 30px); } 100% { transform: translate(0, 0); } } .animate-float { animation: float linear infinite; }`}
      </style>
      <div className="absolute inset-0 w-full h-full">
        {icons.map((icon) => (
          <Icon
            key={icon.id}
            icon={icon}
            isHovered={icon.id === hoveredIconId}
            isAnyIconHovered={isAnyIconHovered}
            onMouseEnter={() => setHoveredIconId(icon.id)}
            onMouseLeave={() => setHoveredIconId(null)}
          />
        ))}
      </div>
    </div>
  );
};

export default Background;
