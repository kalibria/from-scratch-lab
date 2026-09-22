const MAX_BOX = 5;

type BoxDotsProps = {
  box: number;
};

export function BoxDots({ box }: BoxDotsProps) {
  return (
    <div className="flex gap-1" aria-label={`Progress: ${box} of ${MAX_BOX}`}>
      {Array.from({ length: MAX_BOX }, (_, index) => (
        <span
          key={index}
          className={`h-2 w-2 rounded-full ${index < box ? 'bg-accent' : 'bg-border'}`}
        />
      ))}
    </div>
  );
}
