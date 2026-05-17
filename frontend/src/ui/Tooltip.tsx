import { type ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  text: string;
  position?: "bottom" | "top";
}

const Tooltip = ({ children, text, position = "bottom" }: TooltipProps) => {
  const positionClasses = {
    bottom: "top-full mt-3",
    top: "bottom-full mb-3",
  };

  const arrowClasses = {
    bottom: "-top-1",
    top: "-bottom-1",
  };

  return (
    <div className="group relative flex items-center">
      {children}
      <div
        className={`invisible absolute right-0 z-50 flex flex-col items-end opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100 scale-95 group-hover:scale-100 ${positionClasses[position]}`}
      > 
        <div className="relative whitespace-nowrap rounded-lg bg-[#e23744] px-4 py-2 text-[12px] font-semibold text-white shadow-2xl">
          {text}
          
          <div
            className={`absolute right-3 h-2 w-2 rotate-45 bg-[#e23744] ${arrowClasses[position]}`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Tooltip;