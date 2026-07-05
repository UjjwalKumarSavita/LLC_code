type BrandMarkProps = {
  size?: number;
};

export function BrandMark({ size = 34 }: BrandMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className="brand-mark"
      height={size}
      viewBox="0 0 48 48"
      width={size}
    >
      <rect height="46" rx="13" width="46" x="1" y="1" />
      <path d="m14 15 9 9-9 9M27 33h8" />
    </svg>
  );
}
