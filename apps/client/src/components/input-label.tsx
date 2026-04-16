import { type ReactNode } from 'react';

type InputLabelProps = {
  children: ReactNode;
  htmlFor?: string;
};

export default function InputLabel({ children, htmlFor }: InputLabelProps) {
  const Tag = htmlFor ? 'label' : 'span';
  return (
    <Tag
      {...(htmlFor ? { htmlFor } : {})}
      className="font-inter text-xs font-semibold uppercase tracking-[0.6px] text-on-surface-variant"
    >
      {children}
    </Tag>
  );
}
