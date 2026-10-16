import { useState } from "react";
import "./Avatar.css";

export default function Avatar({ name = "", avatar, className = "" }) {
  const [failedAvatar, setFailedAvatar] = useState(null);
  if (avatar && avatar !== failedAvatar)
    return (
      <img
        className={`avatar ${className}`}
        src={avatar}
        alt={`${name} avatar`}
        onError={() => setFailedAvatar(avatar)}
      />
    );
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      className={`avatar avatar__placeholder ${className}`}
      role="img"
      aria-label={`${name} avatar`}
    >
      {initial}
    </span>
  );
}
