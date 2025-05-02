"use client";

import { siteConfig } from "@/config/site";
import Image from "next/image";
import React, { ReactNode, Suspense } from "react";

interface ProviderProps {
  children: ReactNode;
}

const LoadingFallback = () => {
  return (
    <div className="min-h-screen flex items-center justify-center animate-fade-in">
      <div className="flex flex-col items-center gap-4 lg:max-w-3xl">
        <div className="flex gap-4 items-center">
          <Image
            src={"/favicon.ico"}
            width={48}
            height={48}
            alt={siteConfig.name}
          />
          <p className="text-5xl tracking-wide relative">
            {siteConfig.name}
            <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-primary animate-width-grow"></span>
          </p>
        </div>
        <p className="text-xl tracking-wide flex items-center text-center ">
          {siteConfig.description}
        </p>
      </div>
    </div>
  );
};

const Providers = ({ children }: ProviderProps) => {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
};

export default Providers;
