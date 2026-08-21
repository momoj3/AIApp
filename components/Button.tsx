'use client';

type Variant = 'primary' | 'secondary' | 'danger';

const BASE =
  'w-full min-h-[68px] rounded-2xl px-6 text-[1.15rem] font-bold transition-colors ' +
  'disabled:cursor-not-allowed flex items-center justify-center gap-3';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 disabled:bg-primary-200',
  secondary:
    'bg-white text-primary-500 border-2 border-primary-500 hover:bg-primary-50 ' +
    'active:bg-primary-100 disabled:border-primary-200 disabled:text-primary-200',
  danger:
    'bg-white text-[#B91C1C] border-2 border-[#E7A9A9] hover:bg-[#FDECEC] active:bg-[#FBDADA]',
};

export default function Button({
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button type="button" className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props} />
  );
}
