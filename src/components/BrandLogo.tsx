type Props = {
  title?: string;
  className?: string;
};

export function BrandLogo({ title = "Don Pepe", className = "" }: Props) {
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <span className="font-serif text-5xl font-bold tracking-wide text-white sm:text-6xl">
        {title}
      </span>
    </div>
  );
}
