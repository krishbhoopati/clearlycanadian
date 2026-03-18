"use client";
import { avatarColor, getInitials } from "@/lib/avatarColor";

interface PersonaAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: string;
  textSize?: string;
  className?: string;
}

export default function PersonaAvatar({
  name, avatarUrl, size = "w-10 h-10", textSize = "text-sm", className = "",
}: PersonaAvatarProps) {
  return (
    <div
      className={`relative ${size} rounded-full flex items-center justify-center ${textSize} font-bold text-white shrink-0 overflow-hidden ${className}`}
      style={{ backgroundColor: avatarColor(name) }}
    >
      {getInitials(name)}
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={e => { e.currentTarget.style.display = "none"; }}
        />
      )}
    </div>
  );
}
