import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const DocumentViewPage = () => {
    const { id } = useParams();
    const [viewData, setViewData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/add-drop/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setViewData(data);
                } else {
                    const errData = await response.json();
                    setError(errData.message || 'Failed to fetch document');
                }
            } catch (err) {
                setError('Connection error while fetching document');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDocument();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-xl font-black uppercase tracking-widest animate-pulse">Initializing Secure View...</p>
            </div>
        );
    }

    if (error || !viewData) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-10 text-center">
                <div className="text-6xl mb-6">⚠️</div>
                <h2 className="text-3xl font-black mb-4">Authentication or Fetch Error</h2>
                <p className="text-slate-400 max-w-md mx-auto mb-8 font-medium italic">
                    {error || 'The requested document could not be localized or you do not have sufficient permissions.'}
                </p>
            </div>
        );
    }

    // Helper to render student number boxes
    const renderStudentNumber = (num) => {
        const chars = (num || '').split('');
        return (
            <div className="flex gap-1 ml-2">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="w-8 h-8 border border-gray-800 text-center font-bold text-xl flex items-center justify-center uppercase bg-white"
                    >
                        {chars[i] || ''}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 print:p-0 print:bg-white overflow-y-auto">
            <div className="max-w-[210mm] mx-auto bg-white p-12 shadow-2xl border border-gray-200 min-h-[297mm] relative print:shadow-none print:border-none print:w-full">

                {/* Header Section - Matches StudentAddDropForm */}
                <div className="text-center mb-8 space-y-1 flex flex-col items-center">
                    <div className="text-gray-900 font-serif text-xl font-bold uppercase">UNIVERSITY OF KELANIYA - SRI LANKA</div>
                    <div className="text-gray-900 font-serif text-lg font-semibold uppercase">FACULTY OF SCIENCE</div>
                    <div className="text-gray-900 font-serif text-xl font-bold underline decoration-2 underline-offset-4 block uppercase leading-loose">APPLICATION TO ADD/ DROP COURSE UNITS</div>
                    <div className="text-gray-900 font-serif text-lg font-semibold uppercase">SEMESTER II - ACADEMIC YEAR {viewData.academic_year}</div>
                </div>

                {/* Personal Info Section */}
                <div className="space-y-4 mb-6 font-serif">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold uppercase whitespace-nowrap">STUDENT NUMBER:</span>
                        {renderStudentNumber(viewData.student_number)}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold uppercase whitespace-nowrap">STUDENT NAME (Mr/Ms):</span>
                        <div className="flex-1 border-b border-gray-400 border-dashed h-8 px-2 flex items-end font-bold text-gray-800">
                            {viewData.student_name}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold uppercase whitespace-nowrap">CONTACT NUMBER:</span>
                        <div className="flex-1 border-b border-gray-400 border-dashed h-8 px-2 flex items-end font-bold text-gray-800">
                            {viewData.contact_number}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold uppercase whitespace-nowrap">EMAIL ADDRESS:</span>
                        <div className="flex-1 border-b border-gray-400 border-dashed h-8 px-2 flex items-end font-bold text-gray-800">
                            {viewData.email}
                        </div>
                    </div>
                </div>

                {/* Row Group for Combination and Year */}
                <div className="flex flex-wrap gap-8 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100 items-center justify-center font-serif">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold uppercase whitespace-nowrap">COURSE COMBINATION:</span>
                        <div className="w-24 h-8 border border-gray-800 text-center flex items-center justify-center text-sm font-bold bg-white">
                            {viewData.combination}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold uppercase whitespace-nowrap">YEAR:</span>
                        <div className="w-24 h-8 border border-gray-800 text-center flex items-center justify-center text-sm font-bold bg-white">
                            {viewData.year}
                        </div>
                    </div>
                </div>

                {/* TO ADD Table */}
                <div className="mb-8 border border-black font-serif">
                    <div className="border-b border-black text-center font-bold p-2 bg-gray-100 uppercase text-sm">
                        TO ADD A COURSE UNIT
                    </div>
                    <div className="grid bg-white" style={{ gridTemplateColumns: `1fr 1.5fr` }}>
                        <div className="border-r border-black p-2 text-center text-xs font-bold border-b border-black">Course Unit</div>
                        <div className="p-2 text-center text-xs font-bold border-b border-black">Recommendation of the relevant Senior Academic Advisor (Signature)</div>

                        {[...Array(4)].map((_, idx) => (
                            <React.Fragment key={idx}>
                                <div className="border-r border-black border-b border-black last:border-b-0 h-10 flex items-center justify-center p-1 uppercase font-serif text-sm">
                                    {viewData.added_courses && viewData.added_courses[idx] ? viewData.added_courses[idx] : ''}
                                </div>
                                <div className="border-b border-black last:border-b-0 h-10 bg-gray-50 flex items-center justify-center text-gray-400 text-[10px] italic">
                                    {viewData.added_courses && viewData.added_courses[idx] ? '' : '(Not Applicable)'}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* TO DROP Table */}
                <div className="mb-8 border border-black font-serif">
                    <div className="border-b border-black text-center font-bold p-2 bg-gray-100 uppercase text-sm">
                        TO DROP A COURSE UNIT
                    </div>
                    <div className="grid bg-white" style={{ gridTemplateColumns: `1fr 1.5fr` }}>
                        <div className="border-r border-black p-2 text-center text-xs font-bold border-b border-black">Course Unit</div>
                        <div className="p-2 text-center text-xs font-bold border-b border-black">Recommendation of the relevant Senior Academic Advisor (Signature)</div>

                        {[...Array(4)].map((_, idx) => (
                            <React.Fragment key={idx}>
                                <div className="border-r border-black border-b border-black last:border-b-0 h-10 flex items-center justify-center p-1 uppercase font-serif text-sm">
                                    {viewData.dropped_courses && viewData.dropped_courses[idx] ? viewData.dropped_courses[idx] : ''}
                                </div>
                                <div className="border-b border-black last:border-b-0 h-10 bg-gray-50 flex items-center justify-center text-gray-400 text-[10px] italic">
                                    {viewData.dropped_courses && viewData.dropped_courses[idx] ? '' : '(Not Applicable)'}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Credits Summary */}
                <div className="space-y-2 mb-6 font-serif">
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-sm font-semibold uppercase">Number of credits registered for Semester I:</span>
                        <div className="flex items-center gap-2 ml-4">
                            <span className="font-bold">=</span>
                            <div className="border border-gray-400 w-24 h-8 flex items-center justify-end px-2 font-bold">{viewData.sem1_credits}.0</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-sm font-semibold uppercase">Number of credits registered for Semester II:</span>
                        <div className="flex items-center gap-2 ml-4">
                            <span className="font-bold">=</span>
                            <div className="border border-gray-400 w-24 h-8 flex items-center justify-end px-2 font-bold">{viewData.sem2_credits}.0</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-sm font-semibold uppercase">Total number of credits registered for Academic Year {viewData.academic_year}:</span>
                        <div className="flex items-center gap-2 ml-4">
                            <span className="font-bold">=</span>
                            <div className="border border-gray-400 w-24 h-8 flex items-center justify-end px-2 font-bold text-indigo-600">{viewData.total_credits}.0</div>
                        </div>
                    </div>
                </div>

                {/* Declaration */}
                <div className="mb-8 text-sm font-serif leading-relaxed">
                    <span className="font-bold">Declaration: </span>
                    This is my final selection of course units for Semester II of {viewData.academic_year}, and I shall not change them for any reason after this date.
                </div>

                {/* Signatures */}
                <div className="mb-12 flex justify-between items-end gap-10 font-serif">
                    <div className="flex-1 text-center">
                        <div className="h-8 border-b border-dashed border-black w-full flex items-center justify-center font-bold">
                            {viewData.signature_date ? new Date(viewData.signature_date).toLocaleDateString() : '-'}
                        </div>
                        <div className="text-sm font-bold uppercase pt-2">Date</div>
                    </div>
                    <div className="flex-1 text-center">
                        <div className="h-8 border-b border-dashed border-black w-full flex items-center justify-center font-serif italic text-xl">
                            {viewData.signature}
                        </div>
                        <div className="text-sm font-bold uppercase pt-2">Signature</div>
                    </div>
                </div>

                {/* Dean Approval Section */}
                <div className="relative pb-8 pt-8">
                    <div className="flex justify-between items-end gap-10 font-serif">
                        <div className="flex-1 text-center">
                            <div className="h-8 border-b border-dashed border-black w-full bg-gray-50"></div>
                            <div className="text-sm font-bold uppercase pt-2">Date</div>
                        </div>
                        <div className="flex-1 text-center">
                            <div className="h-8 border-b border-dashed border-black w-full bg-gray-50"></div>
                            <div className="text-sm font-bold uppercase pt-2">Signature of the Dean</div>
                        </div>
                        <div className="w-full text-left absolute -bottom-2 left-0 text-[10px] italic font-serif text-gray-400">
                            Office of the Dean – Faculty of Science, University of Kelaniya
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentViewPage;
