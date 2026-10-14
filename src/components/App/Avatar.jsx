import { useState } from "react";

export default function Avatar({ name = "", avatar, className = "" }) {
  const [failedAvatar, setFailedAvatar] = useState(null);

  if (avatar && avatar !== failedAvatar) {
    return (
      <img
        key={avatar}
        className={className}
        src={avatar}
        alt={`${name} avatar`}
        onError={() => setFailedAvatar(avatar)}
      />
    );
  }

  let initial = name.trim().charAt(0).toUpperCase();

  if (initial === "") {
    initial = "?";
  }

  return (
    <span
      className={`${className} avatar__placeholder`}
      role="img"
      aria-label={`${name} avatar`}
    >
      {initial}
    </span>
  );
}