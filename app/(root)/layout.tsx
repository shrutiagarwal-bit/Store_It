import React from "react";
import Sidebar from "@/components/Sidebar";
import MobileNavigation from "@/components/MobileNavigation";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/actions/users.action";
import { redirect } from "next/navigation";



const Layout = async ({ children }: { children: React.ReactNode }) => {
  

  return (
    <main className="flex h-screen">
      <Sidebar />

      <section className="flex h-full flex-1 flex-col">
        <MobileNavigation />
        <Header />
        <div className="main-content">{children}</div>
      </section>

    
    </main>
  );
};
export default Layout;