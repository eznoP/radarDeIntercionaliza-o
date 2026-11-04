import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import type { BrandIconName } from "@/lib/site-config";

type IconProps = {
  className?: string;
};

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

/**
 * Ícones derivados da folha de referência da identidade visual
 * (globos-referencia.webp): traço fino e formas de globo.
 */

/** Globo com meridianos — "Mapas interativos globais". */
export function GlobeGrid({ className }: IconProps) {
  return (
    <svg {...svgProps} className={cn("shrink-0", className)}>
      <circle cx="12" cy="12" r="9.2" />
      <ellipse cx="12" cy="12" rx="4.1" ry="9.2" />
      <path d="M2.8 12h18.4" />
      <path d="M4.4 7.3h15.2" />
      <path d="M4.4 16.7h15.2" />
    </svg>
  );
}

/** Globo com estrela de rumos — "Radar de tendências". */
export function CompassStar({ className }: IconProps) {
  return (
    <svg {...svgProps} className={cn("shrink-0", className)}>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M12 3.1l1.9 7 7 1.9-7 1.9-1.9 7-1.9-7-7-1.9 7-1.9z" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Globo com barras — "Painel de indicadores". */
export function ChartGlobe({ className }: IconProps) {
  return (
    <svg {...svgProps} className={cn("shrink-0", className)}>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M7.4 15.6v-3.2" />
      <path d="M12 15.6V8.3" />
      <path d="M16.6 15.6v-5.4" />
    </svg>
  );
}

/** Globo com avião — "Casos de internacionalização". */
export function GlobePlane({ className }: IconProps) {
  return (
    <svg {...svgProps} className={cn("shrink-0", className)}>
      <circle cx="12" cy="12" r="9.2" />
      <ellipse cx="12" cy="12" rx="4.1" ry="9.2" />
      <path d="M2.8 12h18.4" />
      <path
        d="M4.1 6.2l8.6 2.4-2.2 1.1-1.2 2.9z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

const brandIcons: Record<BrandIconName, ComponentType<IconProps>> = {
  globe: GlobeGrid,
  compass: CompassStar,
  chart: ChartGlobe,
  plane: GlobePlane,
};

/** Renderiza um ícone da marca pelo nome; cai no globo se desconhecido. */
export function BrandIcon({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  const Component =
    name && name in brandIcons
      ? brandIcons[name as BrandIconName]
      : GlobeGrid;
  return <Component className={className} />;
}
