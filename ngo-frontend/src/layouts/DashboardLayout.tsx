import {
  useState,
  type ReactNode,
} from "react";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";


type DashboardLayoutProps = {
  children: ReactNode;
};


export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);


  return (
    <div className="min-h-screen bg-[#eaf0f5]">

      <Navbar
        onMenuClick={() =>
          setMobileMenuOpen(true)
        }
      />


      <div className="flex">

        <Sidebar
          mobileOpen={mobileMenuOpen}
          onClose={() =>
            setMobileMenuOpen(false)
          }
        />


        <main className="min-w-0 flex-1">

          <div className="page-enter mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">

            {children}

          </div>

        </main>

      </div>

    </div>
  );
}