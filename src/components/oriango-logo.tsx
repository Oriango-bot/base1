import type { SVGProps } from 'react';

export function OriangoLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Oriango Logo</title>
      <path
        d="M32 59C46.9117 59 59 46.9117 59 32C59 17.0883 46.9117 5 32 5C17.0883 5 5 17.0883 5 32C5 46.9117 17.0883 59 32 59Z"
        className="fill-primary"
      />
      <path
        d="M32 49C41.3888 49 49 41.3888 49 32C49 22.6112 41.3888 15 32 15C22.6112 15 15 22.6112 15 32C15 41.3888 22.6112 49 32 49Z"
        className="fill-background"
      />
    </svg>
  );
}
