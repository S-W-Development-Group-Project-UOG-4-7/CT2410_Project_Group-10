import React from "react";

export default function BackgroundRain() {
  const icons = ["🥥", "🌴"];

  // Create 80 falling emojis
  const drops = Array.from({ length: 80 }).map((_, i) => {
    const size = Math.random() * 14 + 8 + "px"; // small icons
    const left = Math.random() * 100 + "vw";
    const delay = Math.random() * -20 + "s"; // start at random time
    const duration = Math.random() * 10 + 8 + "s"; // slower, smooth rain

    return (
      <div
        key={i}
        className="rain-emoji"
        style={{
          fontSize: size,
          left: left,
          animationDelay: delay,
          animationDuration: duration,
        }}
      >
        {icons[Math.floor(Math.random() * icons.length)]}
      </div>
    );
  });

  return <div className="rain-container">{drops}</div>;
}
