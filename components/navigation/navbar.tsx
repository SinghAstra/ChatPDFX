"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
// import { UserAvatar } from "../user-avatar";
// import MobileNavbar from "./mobile-navbar";
import AnimationContainer from "../global/animation-container";
import MaxWidthWrapper from "../global/max-width-wrapper";
import { Icons } from "../ui/Icons";

const Navbar = () => {
  const [scroll, setScroll] = useState(false);
  //   const session = useSession();
  //   const isAuthenticated = session.status === "authenticated" ? true : false;
  //   const isAuthenticating = session.status === "loading" ? true : false;
  const isAuthenticated = false;
  const isAuthenticating = false;

  const handleScroll = () => {
    if (window.scrollY > 8) {
      setScroll(true);
    } else {
      setScroll(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 inset-x-0 h-14 w-full border-b border-transparent z-[99999] select-none",
        scroll && "border-background/80 bg-background/40 backdrop-blur-md"
      )}
    >
      <AnimationContainer reverse delay={0.1} className="size-full">
        <MaxWidthWrapper className="flex items-center justify-between">
          <Link className="flex items-center space-x-4" href="/">
            <Icons.logo className="w-10 h-10" />
            <span className="text-lg font-semibold  !leading-none">
              {siteConfig.name}
            </span>
          </Link>

          <div className="hidden lg:flex items-center">
            {isAuthenticating ? (
              <Button variant="outline">
                <Icons.spinner className="animate-spin mr-2" />
                Wait...
              </Button>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-1 md:gap-1 lg:gap-4">
                {/* <UserAvatar /> */}
              </div>
            ) : (
              <div className="flex">
                <div className="flex items-center gap-x-4">
                  <Link
                    href="/auth/sign-in"
                    className={buttonVariants({ size: "sm", variant: "ghost" })}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/sign-in"
                    className={buttonVariants({
                      size: "sm",
                      className: "bg-white",
                    })}
                  >
                    Get Started
                    <Icons.zap className="size-4 ml-1.5 text-orange-500 fill-orange-500" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* <MobileNavbar /> */}
        </MaxWidthWrapper>
      </AnimationContainer>
    </header>
  );
};

export default Navbar;
