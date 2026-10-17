import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: LucideIcon;
  asChild?: boolean;
  href?: string;
}

export function Button({
  className = '',
  variant = 'primary',
  size = 'md',
  children,
  icon: Icon,
  asChild,
  href,
  onClick,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold transition-all duration-300 relative group cursor-pointer text-center';
  
  const variants = {
    primary: 'btn-orange',
    outline: 'rounded-full border border-foreground/20 text-foreground-muted hover:text-foreground hover:border-foreground/40',
  };

  const sizes = {
    sm: 'px-6 py-2.5 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-10 py-5 text-lg',
  };

  const combinedClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  const content = (
    <>
      {Icon && variant === 'outline' ? (
        <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-orange/50 transition-colors">
          <Icon size={12} fill="currentColor" />
        </span>
      ) : Icon && variant === 'primary' ? (
        <Icon size={18} className="transition-transform group-hover:translate-x-1" />
      ) : null}
      {children}
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        whileHover={{ scale: variant === 'primary' ? 1.05 : 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={combinedClasses}
        onClick={onClick as any}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: variant === 'primary' ? 1.05 : 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={combinedClasses}
      onClick={onClick}
      {...(props as HTMLMotionProps<"button">)}
    >
      {content}
    </motion.button>
  );
}

export default Button;
