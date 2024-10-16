import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import Link from "next/link";
import GetStarted from "./get-started";
import AnimationContainer from "./global/animation-container";
import MaxWidthWrapper from "./global/max-width-wrapper";
import { Icons } from "./ui/Icons";
import { TextGenerateEffect } from "./ui/text-generate-effect";

const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full text-center bg-gradient-to-t from-background mt-5 min-h-screen">
      <MaxWidthWrapper>
        <AnimationContainer className="flex flex-col items-center justify-center w-full text-center">
          <Link
            href={siteConfig.links.twitter}
            target="_blank"
            className="relative inline-flex h-10 overflow-hidden rounded-full p-[1.5px] focus:outline-none select-none"
          >
            <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,hsl(var(--primary))_0%,hsl(var(--primary-foreground))_50%,hsl(var(--primary))_100%)]" />

            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-[hsl(var(--background))] px-4 py-1 text-sm font-medium text-[hsl(var(--foreground))] backdrop-blur-3xl">
              Follow Along on twitter
              <Icons.next className="ml-2 size-6 animate-moveLeftRight" />
            </span>
          </Link>
          <h1 className="text-foreground text-center py-6 text-3xl font-medium tracking-normal text-balance sm:text-6xl md:text-7xl lg:text-8xl !leading-[1.15] w-full font-heading">
            Supercharge Your{" "}
            <span className="text-transparent bg-gradient-to-r from-[#5daaf1] to-primary bg-clip-text inline-bloc">
              Twitter Presence
            </span>
          </h1>
          <TextGenerateEffect
            className="mb-12 text-md tracking-tight text-gray-300 md:text-xl text-balance"
            words="ReachX is the ultimate social media automation tool that streamlines
            your Twitter experience, saves time, and boosts engagement."
          />
          <div className="flex items-center justify-center gap-4">
            <GetStarted />
            <Link
              href={siteConfig.links.github}
              target="_blank"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              GitHub
            </Link>
          </div>
        </AnimationContainer>
      </MaxWidthWrapper>
    </div>
  );
};

export default Hero;
