import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface FeatureCardProps extends HTMLMotionProps<"div"> {
  title: string;
  description: string;
  icon: LucideIcon;
  highlight?: boolean;
}

export function FeatureCard({ title, description, icon: Icon, highlight = false, ...props }: FeatureCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className={`glass-panel p-7 flex flex-col gap-5 group cursor-pointer relative overflow-hidden ${
        highlight ? 'border-orange/30 shadow-orange' : ''
      }`}
      {...props}
    >
      {highlight && (
        <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest bg-orange-gradient text-background-dark px-2 py-1 rounded-full">
          Popular
        </div>
      )}
      <div className="w-12 h-12 rounded-xl bg-orange/10 border border-orange/20 flex items-center justify-center group-hover:bg-orange/20 transition-colors duration-300">
        <Icon size={22} className="text-orange" strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="text-foreground font-bold text-lg mb-2">{title}</h3>
        <p className="text-foreground-muted text-sm leading-relaxed">{description}</p>
      </div>
      <div className="w-0 h-px bg-orange group-hover:w-full transition-all duration-500 mt-auto" />
    </motion.div>
  );
}

export default FeatureCard;
