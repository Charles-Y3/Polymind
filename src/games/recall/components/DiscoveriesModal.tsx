import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bookmark, Search, Trash2, X, Sparkles, BookOpen } from 'lucide-react';
import { CategoryId, DiscoveryItem, Language } from '../types';
import { CATEGORIES } from '../data/categories';
import { t } from '../utils/i18n';
import { soundManager } from '../utils/audio';

interface DiscoveriesModalProps {
  discoveries: DiscoveryItem[];
  language: Language;
  onRemoveDiscovery: (id: string) => void;
  onClose: () => void;
}

export const DiscoveriesModal: React.FC<DiscoveriesModalProps> = ({
  discoveries,
  language,
  onRemoveDiscovery,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');

  const filtered = discoveries.filter((d) => {
    const matchesCategory = selectedCategory === 'all' || d.category === selectedCategory;
    const matchesQuery =
      searchQuery === '' ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.funFact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-none">
                {t(language, 'discoveries')}
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {discoveries.length} {t(language, 'savedFactsCount')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(language, 'searchDiscoveries')}
              className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {t(language, 'allFilter')} ({discoveries.length})
            </button>
            {CATEGORIES.map((c) => {
              const count = discoveries.filter((d) => d.category === c.id).length;
              if (count === 0) return null;
              const catName =
                language === 'zh-CN'
                  ? c.nameZhSimp
                  : language === 'zh-TW'
                  ? c.nameZhTrad
                  : c.name;

              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                    selectedCategory === c.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <span>{c.emoji}</span>
                  <span>{catName}</span>
                  <span className="font-mono text-[9px]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Discoveries List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {t(language, 'noDiscoveries')}
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 relative group hover:border-slate-600 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-xs font-bold text-amber-300">
                      {item.title}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playTap();
                      onRemoveDiscovery(item.id);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {item.funFact}
                </p>
                <p className="text-[11px] text-slate-400 leading-normal">
                  {item.explanation}
                </p>
                {item.aiDeepDive && (
                  <div className="mt-2 p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-200 space-y-1">
                    <div className="flex items-center gap-1 font-bold text-indigo-300">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Deep Dive</span>
                    </div>
                    <p className="whitespace-pre-line text-slate-300">
                      {item.aiDeepDive}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
          >
            {t(language, 'done')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
