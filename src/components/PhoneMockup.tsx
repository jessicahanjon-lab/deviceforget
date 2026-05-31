import { Camera, Music, MessageCircle, Calendar, Cloud, Settings } from "lucide-react";

type Props = {
  wallpaper: string;
  palette?: string[];
  size?: "sm" | "md" | "lg";
  showWidgets?: boolean;
};

const sizes = {
  sm: "w-[180px] h-[370px] rounded-[36px]",
  md: "w-[240px] h-[490px] rounded-[44px]",
  lg: "w-[280px] h-[572px] rounded-[52px]",
};

export function PhoneMockup({ wallpaper, palette, size = "md", showWidgets = true }: Props) {
  const accent = palette?.[2] ?? "#a855f7";
  return (
    <div className={`relative ${sizes[size]} p-[6px] bg-gradient-to-b from-zinc-700 to-zinc-900 shadow-2xl`}>
      <div className="relative w-full h-full rounded-[inherit] overflow-hidden bg-black">
        <img src={wallpaper} alt="" className="absolute inset-0 w-full h-full object-cover" />
        {/* Dynamic island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[28%] h-[18px] bg-black rounded-full z-20" />
        {/* Status bar */}
        <div className="absolute top-[6px] left-0 right-0 flex justify-between px-5 text-[9px] font-semibold text-white z-10">
          <span>9:41</span>
          <span>􀙇 􀛨 􀛪</span>
        </div>

        {showWidgets && (
          <div className="absolute inset-0 pt-10 px-3 flex flex-col gap-2">
            {/* Time widget */}
            <div className="text-white text-center pt-2">
              <div className="text-[36px] font-light leading-none tracking-tight">9:41</div>
              <div className="text-[10px] opacity-80 mt-1">Sunday · May 31</div>
            </div>

            {/* Glass widget */}
            <div className="mt-3 rounded-2xl p-2.5 backdrop-blur-xl bg-white/10 border border-white/15">
              <div className="flex items-center justify-between text-white text-[10px]">
                <div className="flex items-center gap-1.5">
                  <Music className="w-3 h-3" style={{ color: accent }} />
                  <span className="font-medium">Now Playing</span>
                </div>
                <span className="opacity-70">2:14</span>
              </div>
              <div className="text-white text-[11px] font-medium mt-1 truncate">Midnight Drive</div>
              <div className="mt-1.5 h-[2px] bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-2/5" style={{ background: accent }} />
              </div>
            </div>

            {/* Icon grid */}
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[Camera, MessageCircle, Calendar, Cloud, Music, Settings, Camera, MessageCircle].map((Icon, i) => (
                <div key={i} className="aspect-square rounded-xl backdrop-blur-lg bg-white/10 border border-white/15 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
              ))}
            </div>

            {/* Dock */}
            <div className="mt-auto mb-3 rounded-2xl p-2 backdrop-blur-xl bg-white/15 border border-white/15">
              <div className="grid grid-cols-4 gap-2">
                {[Camera, Music, MessageCircle, Settings].map((Icon, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-white/15 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
