import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Zap, MoreVertical, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const LeadRow = ({ lead, onSelect }) => {
  const navigate = useNavigate();
  const scoreColor = lead.score > 90 ? 'text-emerald-400' : lead.score > 70 ? 'text-indigo-400' : 'text-amber-400';
  const scoreBg = lead.score > 90 ? 'bg-emerald-400' : lead.score > 70 ? 'bg-indigo-400' : 'bg-amber-400';

  return (
    <motion.tr 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ backgroundColor: 'rgba(39, 39, 42, 0.3)' }}
      className="border-b border-zinc-800/50 group cursor-pointer"
      onClick={() => navigate(`/leads/${lead.id}`)}
    >
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center font-bold text-zinc-400 group-hover:bg-indigo-600/10 group-hover:text-indigo-400 transition-all border border-zinc-700">
            {lead.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-zinc-100 group-hover:text-white transition-colors flex items-center gap-2">
              {lead.name}
              {lead.website && <ExternalLink size={12} className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </div>
            <div className="text-xs text-zinc-500 font-medium">{lead.industry}</div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 w-24 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${lead.score}%` }}
              className={cn("h-full rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]", scoreBg)} 
            />
          </div>
          <span className={cn("text-xs font-mono font-bold", scoreColor)}>{lead.score}%</span>
        </div>
      </td>

      <td className="px-6 py-5">
        <span className={cn(
          "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
          lead.urgency === 'High' ? "bg-red-500/10 text-red-400 border-red-500/20" : 
          lead.urgency === 'Medium' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
          "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
        )}>
          {lead.urgency}
        </span>
      </td>

      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span className="text-xs text-zinc-400 font-medium">Ready for Outreach</span>
        </div>
      </td>

      <td className="px-6 py-5 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-all border border-zinc-700">
            <MessageSquare size={16} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSelect(lead);
            }}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-all shadow-lg shadow-indigo-600/20"
          >
            <Zap size={16} />
          </button>
          <button className="p-2 text-zinc-500 hover:text-zinc-300 transition-all">
            <MoreVertical size={16} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

export default LeadRow;
