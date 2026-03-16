"use client";

import Image from "next/image";

export function SkylineSVG() {
  return (
    <div className="absolute inset-0" style={{ zIndex: 1 }}>
      <Image
        src="/skyline.jpg"
        alt="City skyline reflected in water at night"
        fill
        priority
        style={{
          objectFit: "cover",
          objectPosition: "center 60%",
          opacity: 0.55,
          mixBlendMode: "luminosity",
        }}
      />
    </div>
  );
}
