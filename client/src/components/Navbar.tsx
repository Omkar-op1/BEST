import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser, useLogout } from "@/lib/auth";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: user, isSuccess: isLoggedIn } = useUser();
  const logout = useLogout();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout.mutate();
    closeMobileMenu();
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center" onClick={closeMobileMenu}>
              <span className="font-bold text-2xl text-primary">BEST</span>
            </Link>
          </div>
          
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium ${location === '/' ? 'text-primary' : 'text-neutral-800 hover:text-primary'} transition duration-150`}>
              Home
            </Link>
            
            {isLoggedIn && (
              <>
                <Link href="/test" className={`px-3 py-2 rounded-md text-sm font-medium ${location === '/test' ? 'text-primary' : 'text-neutral-800 hover:text-primary'} transition duration-150`}>
                  Test
                </Link>
                <Link href="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium ${location === '/dashboard' ? 'text-primary' : 'text-neutral-800 hover:text-primary'} transition duration-150`}>
                  Dashboard
                </Link>
              </>
            )}
            
            {!isLoggedIn ? (
              <>
                <Link href="/signin" className="px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:text-blue-700 transition duration-150">
                  Sign In
                </Link>
                <Link href="/signup">
                  <Button variant="default" className="bg-primary hover:bg-orange-600">Sign Up</Button>
                </Link>
              </>
            ) : (
              <Button variant="ghost" onClick={handleLogout} className="text-neutral-800">
                Logout
              </Button>
            )}
          </div>
          
          <div className="flex items-center md:hidden">
            <button 
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-800 hover:text-primary focus:outline-none"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link href="/" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${location === '/' ? 'text-primary' : 'text-neutral-800 hover:text-primary'} transition duration-150`}
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          
          {isLoggedIn && (
            <>
              <Link href="/test" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${location === '/test' ? 'text-primary' : 'text-neutral-800 hover:text-primary'} transition duration-150`}
                onClick={closeMobileMenu}
              >
                Test
              </Link>
              <Link href="/dashboard" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${location === '/dashboard' ? 'text-primary' : 'text-neutral-800 hover:text-primary'} transition duration-150`}
                onClick={closeMobileMenu}
              >
                Dashboard
              </Link>
            </>
          )}
          
          {!isLoggedIn ? (
            <>
              <Link href="/signin" 
                className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:text-blue-700 transition duration-150"
                onClick={closeMobileMenu}
              >
                Sign In
              </Link>
              <Link href="/signup" 
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary hover:bg-orange-600 transition duration-150 text-center"
                onClick={closeMobileMenu}
              >
                Sign Up
              </Link>
            </>
          ) : (
            <button 
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-neutral-800 hover:text-primary transition duration-150"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
