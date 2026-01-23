
import React, { useState } from 'react';
import { Review, Language } from '../types';
import { analyzeReviews, generateReviewResponse } from '../services/geminiService';
import { Star, Sparkles, MessageSquare, MapPin } from 'lucide-react';
import { translations } from '../utils/helpers';

// Sample Data to demonstrate AI capabilities
const mockReviews: Review[] = [
    {
        id: '1',
        source: 'Booking.com',
        author: 'Sarah Jenkins',
        rating: 5,
        date: '2023-10-24',
        content: 'Absolutely stunning property. The garden villa was private and the pool was heated perfectly. Breakfast served in the room was a highlight.',
        sentiment: 'positive'
    },
    {
        id: '2',
        source: 'TripAdvisor',
        author: 'Michael Ross',
        rating: 4,
        date: '2023-10-22',
        content: 'Great location and friendly staff. However, the wifi in the room was spotty and the check-in process took a bit longer than expected.',
        sentiment: 'neutral'
    },
    {
        id: '3',
        source: 'Google',
        author: 'Elena K.',
        rating: 5,
        date: '2023-10-20',
        content: 'Best boutique hotel in Bodrum! The concierge helped us book a wonderful boat tour. Will definitely be back next summer.',
        sentiment: 'positive'
    },
    {
        id: '4',
        source: 'Booking.com',
        author: 'David Miller',
        rating: 3,
        date: '2023-10-15',
        content: 'Beautiful hotel but overpriced for the service. Housekeeping missed our room one day and it was hard to get fresh towels.',
        sentiment: 'negative'
    }
];

interface ReviewsProps {
    language: Language;
}

const Reviews: React.FC<ReviewsProps> = ({ language }) => {
  const [analysis, setAnalysis] = useState<{ summary: string, sentimentBreakdown: string, suggestedAction: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingResponseFor, setGeneratingResponseFor] = useState<string | null>(null);
  const [generatedResponses, setGeneratedResponses] = useState<Record<string, string>>({});
  const t = translations[language];

  const handleAnalyze = async () => {
    if (mockReviews.length === 0) return;
    setLoading(true);
    // Pass language to AI
    const result = await analyzeReviews(mockReviews, language);
    setAnalysis(result);
    setLoading(false);
  };

  const handleGenerateResponse = async (review: Review) => {
    setGeneratingResponseFor(review.id);
    // Pass language to AI
    const response = await generateReviewResponse(review, language);
    setGeneratedResponses(prev => ({...prev, [review.id]: response}));
    setGeneratingResponseFor(null);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">{t.guestReputation}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Aggregated from OTA channels</p>
        </div>
        <button 
            onClick={handleAnalyze}
            disabled={loading || mockReviews.length === 0}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
        >
            <Sparkles size={18} className={loading ? "animate-spin" : "group-hover:scale-110 transition-transform"} />
            {loading ? t.aiAnalyzing : t.aiInsight}
        </button>
      </div>

      {/* Empty State */}
      {mockReviews.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="bg-slate-50 dark:bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <MessageSquare size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Reviews Yet</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Reviews will appear here once guests start leaving feedback.</p>
          </div>
      )}

      {/* AI Analysis Result Card */}
      {analysis && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800 p-6 rounded-2xl animate-slide-up shadow-sm">
            <div className="flex items-start gap-4">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-sm flex-shrink-0">
                    <Sparkles className="text-indigo-600 dark:text-indigo-400" size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200 mb-2 font-serif">{t.executiveSummary}</h3>
                    <p className="text-indigo-800 dark:text-indigo-300 mb-4 text-sm leading-relaxed">{analysis.summary}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-xl border border-indigo-100/50 dark:border-slate-700 shadow-sm">
                            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase mb-1 tracking-wider">{t.sentiment}</div>
                            <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">{analysis.sentimentBreakdown}</div>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-xl border border-indigo-100/50 dark:border-slate-700 shadow-sm">
                            <div className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase mb-1 tracking-wider">{t.suggestedAction}</div>
                            <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">{analysis.suggestedAction}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockReviews.map(review => (
            <div key={review.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-600">
                            {review.author.charAt(0)}
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">{review.author}</div>
                            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                {review.source === 'Google' ? <MapPin size={12}/> : <GlobeIcon size={12} />}
                                {review.source} • {review.date}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg border border-yellow-100 dark:border-yellow-900/50">
                        <Star className="text-yellow-400 fill-yellow-400" size={14} />
                        <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400 ml-1">{review.rating}</span>
                    </div>
                </div>
                
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic mb-6 flex-grow">"{review.content}"</p>

                {generatedResponses[review.id] ? (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mt-auto relative group animate-slide-up">
                        <div className="text-[10px] text-slate-400 font-bold mb-2 uppercase flex justify-between">
                            <span className="flex items-center gap-1"><Sparkles size={10} className="text-primary-500"/> {t.draftResponse}</span>
                            <button className="text-primary-600 hover:text-primary-700 opacity-0 group-hover:opacity-100 transition-opacity">{t.edit}</button>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{generatedResponses[review.id]}</p>
                        <div className="mt-3 flex justify-end gap-2">
                             <button className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Discard</button>
                             <button className="text-xs bg-slate-800 dark:bg-primary-600 text-white px-3 py-1.5 rounded font-medium hover:bg-slate-700 dark:hover:bg-primary-700">{t.publish}</button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-end">
                         <button 
                            onClick={() => handleGenerateResponse(review)}
                            disabled={generatingResponseFor === review.id}
                            className="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                         >
                            {generatingResponseFor === review.id ? (
                                <><Sparkles size={14} className="animate-spin"/> {t.writing}</>
                            ) : (
                                <><MessageSquare size={14} /> {t.draftReply}</>
                            )}
                         </button>
                    </div>
                )}
            </div>
        ))}
      </div>
    </div>
  );
};

// Helper icon
const GlobeIcon = ({size}: {size:number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
)

export default Reviews;
