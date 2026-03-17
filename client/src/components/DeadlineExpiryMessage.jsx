import React from 'react';

const DeadlineExpiryMessage = ({ title }) => {
    return (
        <div className="flex items-center justify-center min-h-[500px] p-6 animate-fade-in">
            <div className="relative max-w-2xl w-full">
                {/* Decorative background gradients */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[3rem] p-12 text-center shadow-2xl shadow-slate-200/50 overflow-hidden group">
                    {/* Inner glass overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>

                    <div className="relative z-10">
                        {/* Icon Container */}
                        <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-slate-900/20 transform group-hover:rotate-6 transition-transform duration-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" x2="12.01" y1="16" y2="16" />
                            </svg>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full border border-red-100 text-[10px] font-black uppercase tracking-widest mb-2">
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></span>
                                Access Restricted
                            </div>
                            
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                                {title || 'Submission Period Closed'}
                            </h2>
                            
                            <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>

                            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-md mx-auto pt-2">
                                This page is no longer available as the deadline has passed. 
                                Please contact the faculty administration office if you believe this is an error or require special assistance.
                            </p>
                        </div>

                        {/* Bottom Info */}
                        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                                Registry Status: Locked
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeadlineExpiryMessage;
