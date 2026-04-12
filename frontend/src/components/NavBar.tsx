import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { CgShoppingCart } from "react-icons/cg";
import { BiMapPin, BiSearch } from "react-icons/bi";

const NavBar = () => {
  const { isAuth, city, quantity } = useAppData();
  const currLocation = useLocation();
  const isHomePage = currLocation.pathname === "/";
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        setSearchParams({ search });
      } else {
        setSearchParams({});
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, setSearchParams]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 font-sans backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to={"/"}
          className="text-2xl font-black tracking-tight text-red-600 transition-transform hover:scale-[1.02]"
        >
          Zesto.
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            to={"/cart"}
            className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 transition-all hover:bg-red-50 active:scale-95"
          >
            <CgShoppingCart className="h-5 w-5 text-slate-600 transition-colors group-hover:text-red-600" />
            {quantity > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 text-[10px] font-bold text-white shadow-sm">
                {quantity}
              </span>
            )}
          </Link>

          {isAuth ? (
            <Link
              to="/account"
              className="flex h-10 items-center justify-center rounded-full bg-slate-50 px-5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100 hover:text-red-600 active:scale-95"
            >
              Account
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex h-10 items-center justify-center rounded-full bg-red-600 px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md active:scale-95"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {isHomePage && (
        <div className="border-t border-slate-100 bg-white/50 px-4 py-3 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-3xl items-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm transition-all focus-within:border-red-300 focus-within:ring-4 focus-within:ring-red-500/10 hover:border-slate-300">
            <div className="flex shrink-0 items-center gap-1.5 border-r border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-600">
              <BiMapPin className="h-[18px] w-[18px] text-red-500" />
              <span className="max-w-[100px] truncate text-sm font-semibold tracking-wide sm:max-w-[150px]">
                {city || "Location"}
              </span>
            </div>
            <div className="flex flex-1 items-center gap-2 px-4 py-2.5">
              <BiSearch className="h-[18px] w-[18px] text-slate-400" />
              <input
                type="text"
                placeholder="Search for restaurants, cuisines, or dishes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
