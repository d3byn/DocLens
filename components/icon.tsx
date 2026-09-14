const paths = {
  lens: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 4 4",
  file: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Zm0 0v5h5",
  upload: "M12 16V4m0 0L7 9m5-5 5 5M5 20h14",
  arrow: "M5 12h14m0 0-6-6m6 6-6 6",
  check: "m5 12 5 5 9-10",
  alert: "M12 8v5m0 3h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
  quote: "M4 6h16M4 12h16M4 18h10",
};

type IconProps = {
  name: keyof typeof paths;
  className?: string;
};

export default function Icon({ name, className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
