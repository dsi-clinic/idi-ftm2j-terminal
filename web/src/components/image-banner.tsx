"use client";

import Image from "next/image";

export function ImageBanner() {
  return (
    <div className="absolute inset-0" style={{ zIndex: 1 }}>
      <Image
        src="/mine_pool.jpg"
        alt="City skyline reflected in water at night"
        fill
        priority
        style={{
          objectFit: "cover",
          objectPosition: "center 60%",
          opacity: 0.7,
          mixBlendMode: "plus-lighter",
        }}
      />
    </div>
  );
}
