import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const StatCard = ({ title, value, icon, change, trend, subValue }) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl relative overflow-hidden group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-zinc-800/50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold tracking-tight",
            trend === 'up' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
          )}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-medium text-zinc-500">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
          {subValue && <span className="text-sm font-medium text-zinc-600">{subValue}</span>}
        </div>
      </div>

      {/* Decorative Glow */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl group-hover:bg-indigo-600/10 transition-colors" />
    </motion.div>
  );
};

export default StatCard;
