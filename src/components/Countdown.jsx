import { useState, useEffect } from "react";

const DEADLINE = new Date("2026-03-23T23:59:59");

function getTimeLeft() {
  const diff = DEADLINE - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function isVotingOpen() {
  return Date.now() < DEADLINE.getTime();
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!timeLeft) {
    return (
      <div className="text-center bg-sma-gold/10 border-2 border-sma-gold rounded-xl px-4 py-3 mb-8">
        <p className="text-sma-blue font-bold text-lg">Voting has ended!</p>
      </div>
    );
  }

  const units = [
    { label: "days", value: timeLeft.days },
    { label: "hrs", value: timeLeft.hours },
    { label: "min", value: timeLeft.minutes },
    { label: "sec", value: timeLeft.seconds },
  ];

  return (
    <div className="text-center bg-sma-blue rounded-xl px-4 py-4 mb-8 shadow-md">
      <p className="text-sm text-sma-gold font-semibold mb-2 uppercase tracking-wide">
        Voting ends March 23
      </p>
      <div className="flex justify-center gap-4">
        {units.map((u) => (
          <div key={u.label} className="flex flex-col items-center">
            <span className="text-3xl font-bold text-white tabular-nums">
              {String(u.value).padStart(2, "0")}
            </span>
            <span className="text-xs text-sma-gold/70">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
