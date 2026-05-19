import { useState } from "react";
import { Smartphone } from "lucide-react";

interface PhoneImageProps {
  imageUrl: string;
  name: string;
  brand: string;
  className?: string;
  iconSize?: number;
}

export function PhoneImage({ imageUrl, name, brand, className = "max-w-full max-h-full object-contain", iconSize = 20 }: PhoneImageProps) {
  const [imgErr, setImgErr] = useState(false);

  const brandColors: Record<string, string> = {
    samsung: "from-blue-600 to-indigo-700",
    apple: "from-neutral-700 to-neutral-900",
    oneplus: "from-red-500 to-rose-600",
    xiaomi: "from-orange-500 to-amber-600",
    realme: "from-amber-400 to-yellow-500",
    poco: "from-yellow-500 to-neutral-900",
    vivo: "from-sky-500 to-blue-600",
    oppo: "from-emerald-500 to-teal-650",
    motorola: "from-cyan-600 to-blue-700",
    default: "from-blue-500 to-purple-650"
  };

  const getBrandColor = (b: string) => {
    return brandColors[b.toLowerCase()] || brandColors.default;
  };

  if (!imgErr && imageUrl) {
    return (
      <img 
        src={imageUrl} 
        alt={name} 
        className={className} 
        loading="lazy" 
        onError={() => setImgErr(true)}
      />
    );
  }

  return (
    <div className={`w-full h-full rounded-lg bg-gradient-to-br ${getBrandColor(brand)} flex flex-col items-center justify-center text-white relative overflow-hidden shadow-inner p-1.5 select-none`}>
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px]" />
      <Smartphone size={iconSize} className="relative z-10 text-white/90 drop-shadow-sm" />
      <span className="relative z-10 text-[8px] font-black tracking-widest uppercase mt-0.5 opacity-80">{brand.substring(0, 3)}</span>
    </div>
  );
}
