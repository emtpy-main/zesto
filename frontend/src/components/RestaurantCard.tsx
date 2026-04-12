import { useNavigate } from "react-router-dom";

type props = {
  id: string;
  image: string;
  name: string;
  distance: string;
  isOpen: boolean;
};
const RestaurantCard = ({ id, image, name, distance, isOpen }: props) => {
  const navigate = useNavigate();

  return (
    <div
      className={`group relative cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:ring-slate-300 ${
        !isOpen ? "opacity-80" : ""
      }`}
      onClick={() => navigate(`/restaurant/${id}`)}
    >
      <div className="relative h-40 w-full overflow-hidden bg-slate-100 sm:h-44">
        <img
          src={image}
          alt={name}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            !isOpen ? "grayscale brightness-75" : ""
          }`}
        />
        {!isOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px]">
            <span className="rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-900 shadow-sm">
              Closed
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="truncate text-base font-bold tracking-tight text-slate-900">
          {name}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isOpen ? "bg-emerald-500" : "bg-slate-300"
            }`}
          ></span>
          {distance} km away
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
