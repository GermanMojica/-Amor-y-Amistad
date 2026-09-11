"use client";

import React, { useEffect, useState } from "react";

interface ParticleItem {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export default function AmbientParticles() {
  const [particles, setParticles] = useState<ParticleItem[]>([]);

  useEffect(() => {
    // Generar partículas de luz sutiles
    const items: ParticleItem[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: Math.random() * 92 + 4,
      size: Math.random() * 12 + 6,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 6,
      opacity: Math.random() * 0.25 + 0.1,
    }));
    setParticles(items);
  }, []);

  return (
    <div className="ambient-particles-container" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="luminous-particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}
