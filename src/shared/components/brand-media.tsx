import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

type BrandMascotProps = Omit<ImageProps, "src" | "alt"> & {
  alt?: string;
  className?: string;
  priority?: boolean;
};

/** Optimized Te Organiza mascot (WebP). Use priority on login/home LCP. */
export function BrandMascot({
  alt = "Mascote do Te Organiza",
  className,
  priority = false,
  ...props
}: BrandMascotProps) {
  return (
    <Image
      src="/brand/nerd-mascot.webp"
      alt={alt}
      width={560}
      height={690}
      priority={priority}
      sizes="(max-width: 768px) 176px, 256px"
      className={cn("h-auto w-auto object-contain", className)}
      {...props}
    />
  );
}

export function BrandLogo({
  className,
  size = 32,
  priority = false,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.svg"
      alt=""
      width={size}
      height={size}
      priority={priority}
      unoptimized
      className={cn("rounded-md", className)}
    />
  );
}
