"use client";

import Link from "next/link";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ModeToggle } from "@/components/mode-toggle";

export default function Header() {
  return (
    <header className="border-b w-full">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center h-16">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Link href="/">
            <span className="text-blue-600">EFREI</span> Swim
          </Link>
        </div>
        <nav className="flex items-center gap-6">
          <MainNav />
          <ModeToggle />
          <UserNav />
        </nav>
      </div>
    </header>
  );
}
