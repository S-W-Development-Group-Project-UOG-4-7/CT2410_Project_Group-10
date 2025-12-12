import { useEffect } from "react";

export default function BackgroundRain() {
  useEffect(() => {
    const container = document.createElement("div");
    container.className = "emoji-rain";
    document.body.appendChild(container);

    const icons = ["🥥", "🌴"];

    function createDrop() {
      const drop = document.createElement("div");
      drop.className = "emoji";

      drop.textContent = icons[Math.floor(Math.random() * icons.length)];

      drop.style.left = Math.random() * 100 + "vw";
      drop.style.fontSize = 10 + Math.random() * 10 + "px"; // smaller = nicer background
      drop.style.animationDuration = 4 + Math.random() * 4 + "s";

      container.appendChild(drop);

      setTimeout(() => drop.remove(), 7000);
    }

    const interval = setInterval(createDrop, 100);

    return () => {
      clearInterval(interval);
      container.remove();
    };
  }, []);

  return null;
}
