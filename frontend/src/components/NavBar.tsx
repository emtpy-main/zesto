import { useEffect, useState } from 'react';
import { useAppData } from '../context/AppContext';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CgShoppingCart } from 'react-icons/cg';
import { BiMapPin, BiSearch } from 'react-icons/bi';

const NavBar = () => {
    const { isAuth , city } = useAppData();
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
        <div className='w-full bg-white shadow-sm'>
            {/* Top Navigation Row */}
            <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-3'>
                <Link to={'/'} className="text-2xl font-bold text-[#e23744] cursor-pointer">
                    Zesto
                </Link>

                <div className="flex items-center gap-4">
                    <Link to={'/cart'} className='relative'>
                        <CgShoppingCart className='h-6 w-6 text-[#e23744]' />
                        <span className='absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#e23744] text-xs font-semibold text-white'>
                            0
                        </span>
                    </Link>
                    {
                        isAuth ? (
                            <Link to="/account" className='font-medium text-[#e23744] cursor-pointer'>
                                Account
                            </Link>
                        ) : (
                            <Link to="/login" className='font-medium text-[#e23744] cursor-pointer'>
                                Login
                            </Link>
                        )
                    }
                </div>
            </div>

            {/* Search Bar Row (Home Page Only) */}
            {
                isHomePage && (
                    <div className='border-t px-4 py-3'>
                        <div className='mx-auto flex max-w-7xl items-center rounded-lg border shadow-sm'>
                            <div className='flex items-center gap-2 px-3 border-r text-gray-700'>
                                <BiMapPin className='h-4 w-4 text-[#e23744]' />
                                <span className='text-sm truncate max-w-36'>
                                    {city}
                                </span>
                            </div>
                            <div className='flex flex-1 items-center gap-2 px-3'>
                                <BiSearch className='h-4 w-4 text-gray-400' />
                                <input 
                                    type='text' 
                                    placeholder="Search for restaurant..." 
                                    value={search} 
                                    onChange={e => setSearch(e.target.value)}
                                    className='w-full py-2 text-sm outline-none bg-transparent' 
                                />
                            </div>
                        </div>
                    </div> 
                )
            }
        </div>
    );
}

export default NavBar;