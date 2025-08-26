import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export default function CheckIcon({ size = 16, ...props }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
