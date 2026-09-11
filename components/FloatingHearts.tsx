"use client";

import React, { useEffect, useState } from "react";

interface HeartItem {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<HeartItem[]>([]);

  useEffect(() => {
    // Generar 14 corazones flotantes con propiedades aleatorias
    const items: HeartItem[] = Array.from({ length: 14 }, (_, i) => ({
      id: i,
      left: Math.random() * 94 + 3,
      size: Math.random() * 16 + 12,
      duration: Math.random() * 8 + 9,
      delay: Math.random() * 7,
      opacity: Math.random() * 0.3 + 0.15,
    }));
    setHearts(items);
  }, []);

  return (
    <div className="floating-hearts-container" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="heart-particle"
          style={{
            left: `${h.left}%`,
            fontSize: `${h.size}px`,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
            opacity: h.opacity,
          }}
        >
          ❤️
        </span>
      ))}
    </div>
  );
}
