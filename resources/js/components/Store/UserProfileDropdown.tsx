import { useState, useEffect, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import { User, Package, Heart, MapPin, Activity, LogOut, ChevronDown } from 'lucide-react';

interface UserProfileDropdownProps {
    user: {
        name: string;
        email: string;
    };
}

export default function UserProfileDropdown({ user }: UserProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    function handleLogout() {
        router.post('/logout');
    }

    // Get initials from name
    function getInitials(name: string) {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    const menuItems = [
        { icon: User, label: 'Profile', href: '/account/profile' },
        { icon: Package, label: 'Orders', href: '/account/orders' },
        { icon: Heart, label: 'Wishlist', href: '/account/wishlist' },
        { icon: MapPin, label: 'Addresses', href: '/account/addresses' },
        { icon: Activity, label: 'Activity', href: '/account/activity' },
    ];

    return (
        <div ref={dropdownRef} className="relative">
            {/* User Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-full transition hover:opacity-80"
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9C7A3C] text-xs font-semibold text-white">
                    {getInitials(user.name)}
                </div>
                <ChevronDown
                    className={`hidden h-4 w-4 text-[#171310] transition sm:block ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-[#171310]/10 bg-white shadow-2xl">
                    {/* User Info */}
                    <div className="border-b border-[#171310]/10 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#9C7A3C] text-sm font-semibold text-white">
                                {getInitials(user.name)}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="truncate font-serif text-sm font-medium text-[#171310]">
                                    {user.name}
                                </p>
                                <p className="truncate text-xs text-[#252525]/60">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-[#171310] transition hover:bg-[#F8F5EF]"
                                >
                                    <Icon className="h-4 w-4 text-[#9C7A3C]" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-[#171310]/10 p-2">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-[#171310] transition hover:bg-red-50 hover:text-red-600"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
