import { cn } from "@/lib/utils";
import React from "react";

interface MaxWidthWrapperProps {
  className?: string;
  children: React.ReactNode;
}

const MaxWidthWrapper = ({ className, children }: MaxWidthWrapperProps) => {
  return (
    <section
      className={cn(
        "h-full mx-auto w-full max-w-full md:max-w-screen-xl px-4 md:px-12 lg:px-20",
        className
      )}
    >
      {children}
    </section>
  );
};

export default MaxWidthWrapper;
