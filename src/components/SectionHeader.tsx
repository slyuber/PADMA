interface Props {
  number: number;
  title: string;
  question: string;
}

export function SectionHeader({ number, title, question }: Props) {
  return (
    <div className="mb-6">
      <p className="text-xs font-medium tracking-widest uppercase text-padma-green mb-1">
        {String(number).padStart(2, "0")}
      </p>
      <h2 className="font-serif text-2xl text-charcoal">{title}</h2>
      <p className="text-sm text-charcoal-muted italic mt-1">"{question}"</p>
    </div>
  );
}
