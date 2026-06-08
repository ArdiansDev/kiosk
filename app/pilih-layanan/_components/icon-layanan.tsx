import Image from "next/image";

// Icon numbers available: 0-17
export type IconLayananNumber =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17;

// Map of icon numbers to their file paths
const iconPaths: Record<IconLayananNumber, string> = {
  0: "/icon-layanan/0.svg",
  1: "/icon-layanan/1.svg",
  2: "/icon-layanan/2.svg",
  3: "/icon-layanan/3.svg",
  4: "/icon-layanan/4.svg",
  5: "/icon-layanan/5.svg",
  6: "/icon-layanan/6.svg",
  7: "/icon-layanan/7.svg",
  8: "/icon-layanan/8.svg",
  9: "/icon-layanan/9.svg",
  10: "/icon-layanan/10.svg",
  11: "/icon-layanan/11.svg",
  12: "/icon-layanan/12.svg",
  13: "/icon-layanan/13.svg",
  14: "/icon-layanan/14.svg",
  15: "/icon-layanan/15.svg",
  16: "/icon-layanan/16.svg",
  17: "/icon-layanan/17.svg",
};

interface IconLayananProps {
  number: IconLayananNumber;
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
}

/**
 * IconLayanan component - renders service icons by number
 * @param number - Icon number (0-17)
 * @param width - Width in pixels (default: 40)
 * @param height - Height in pixels (default: 40)
 * @param className - Optional CSS classes
 * @param alt - Optional alt text
 */
export function IconLayanan({
  number,
  width = 40,
  height = 40,
  className,
  alt = `Icon layanan ${number}`,
}: IconLayananProps) {
  const src = iconPaths[number];

  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt={alt}
      className={className}
    />
  );
}

// Helper function to get icon path by number
export function getIconPath(number: IconLayananNumber): string {
  return iconPaths[number];
}

// Export all available icon numbers
export const availableIcons = Object.keys(iconPaths).map(
  Number,
) as IconLayananNumber[];
