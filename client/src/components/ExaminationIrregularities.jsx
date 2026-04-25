import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ExaminationIrregularities = () => {
    const [formData, setFormData] = useState({
        candidateName: '',
        examNumber: '',
        questionPaper: '',
        examDate: '',
        natureOfIrregularity: '',
        timeOfDiscovery: '',
        date03: '',
        candidateStatement: '',
        date05: '',
        hallAdminObservations: '',
        date06: '',
        detailA: '',
        detailB: '',
        detailC: '',
        detailD: '',
        otherIrregularities: '',
        specialObservations: '',
        observerName: '',
        hallAdminName: ''
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const formRef = useRef();

    // Helper to format YYYY-MM-DD to DD/MM/YYYY for UI display
    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const [year, month, day] = dateStr.split('-');
            if (year && month && day) return `${day}/${month}/${year}`;
        } catch (e) { }
        return dateStr;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const downloadPDF = async () => {
        if (isGenerating) return;
        setIsGenerating(true);

        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const pages = formRef.current.querySelectorAll('.paper-page-final');

            for (let i = 0; i < pages.length; i++) {
                const canvas = await html2canvas(pages[i], {
                    scale: 3,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    windowWidth: 1200,
                    onclone: (clonedDoc) => {
                        const allNodes = clonedDoc.getElementsByTagName('*');
                        for (let node of allNodes) {
                            node.style.color = '#000000';
                            node.style.fontFamily = "'Times New Roman', Times, serif";
                            if (!node.classList.contains('paper-page-final')) {
                                node.style.backgroundColor = 'transparent';
                            }
                        }

                        const inputs = clonedDoc.querySelectorAll('input, textarea');
                        inputs.forEach(input => {
                            const container = clonedDoc.createElement('div');
                            container.style.fontWeight = 'bold';
                            container.style.fontSize = '14px';
                            container.style.color = '#000000';
                            container.style.fontFamily = "'Times New Roman', Times, serif";
                            container.style.minHeight = input.tagName === 'TEXTAREA' ? '1.5em' : '1.2em';
                            container.style.wordBreak = 'break-word';
                            container.style.whiteSpace = 'pre-wrap';
                            container.style.padding = '0';
                            container.style.border = 'none';
                            container.style.marginTop = '0';
                            container.style.backgroundColor = 'transparent';

                            let displayValue = input.value;
                            if (input.type === 'date' && input.value) {
                                displayValue = formatDisplayDate(input.value);
                            }
                            container.textContent = displayValue;

                            input.parentNode.replaceChild(container, input);
                        });
                    }
                });

                const imgData = canvas.toDataURL('image/png');
                if (i > 0) doc.addPage();
                doc.addImage(imgData, 'PNG', 0, 0, 210, 297);
            }

            doc.save(`Examination_Irregularity_${formData.examNumber || 'Report'}.pdf`);
        } catch (error) {
            console.error('PDF Export Error:', error);
            alert(`PDF Generation Failed. Please try again.`);
        } finally {
            setIsGenerating(false);
        }
    };

    const mainFont = { fontFamily: "'Times New Roman', Times, serif" };
    const labelStyle = "font-bold whitespace-nowrap";
    const inputStyle = "flex-1 border border-gray-400 p-1 outline-none font-bold text-black bg-white align-baseline";

    // Reusable Date Input component for DD/MM/YYYY formatting in UI
    const FormattedDateInput = ({ name, value, className }) => {
        const [isEditing, setIsEditing] = useState(false);
        return (
            <input
                type={isEditing ? "date" : "text"}
                name={name}
                value={isEditing ? value : formatDisplayDate(value)}
                onChange={handleChange}
                onFocus={() => setIsEditing(true)}
                onBlur={() => setIsEditing(false)}
                placeholder="DD/MM/YYYY"
                className={`${className} cursor-pointer text-center`}
            />
        );
    };

    return (
        <div className="flex flex-col items-center py-10 min-h-screen" style={{ backgroundColor: '#f8fafc', ...mainFont }}>
            {/* Download Button */}
            <button
                onClick={downloadPDF}
                disabled={isGenerating}
                className="fixed bottom-10 right-10 z-[200] px-12 py-5 bg-black text-white rounded-full font-black shadow-2xl hover:bg-slate-900 transition-all active:scale-95 flex items-center gap-3 border-none cursor-pointer"
            >
                {isGenerating ? (
                    <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> SAVING...</>
                ) : (
                    'DOWNLOAD PDF'
                )}
            </button>

            <div ref={formRef} className="space-y-16">
                {/* --- PAGE 1 --- */}
                <div className="paper-page-final bg-white w-[210mm] min-h-[297mm] p-[25mm] box-border text-left text-black relative" style={{ border: '1px solid #cbd5e1' }}>
                    <div className="text-center mb-10">
                        <h1 className="text-xl font-black uppercase tracking-tight underline">University of Kelaniya - Sri Lanka</h1>
                        <h2 className="text-lg font-bold underline mt-2">Examination Irregularities</h2>
                    </div>

                    <div className="space-y-6 text-sm">
                        {/* 01 */}
                        <div className="space-y-4">
                            <div className="flex items-baseline">
                                <div className={`${labelStyle} min-w-[210px]`}>01. (a) Name of the candidate :</div>
                                <input name="candidateName" value={formData.candidateName} onChange={handleChange} className={inputStyle} />
                            </div>
                            <div className="flex items-baseline pl-6">
                                <div className={`${labelStyle} min-w-[200px] mr-2`}>(b) Examination Number :</div>
                                <input name="examNumber" value={formData.examNumber} onChange={handleChange} className="w-64 border border-gray-400 p-1 font-bold text-black bg-white outline-none" />
                            </div>
                        </div>

                        {/* 02 */}
                        <div className="pt-6 border-t border-black">
                            <div className="flex gap-4">
                                <div className="font-bold">02.</div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-baseline">
                                        <div className={`${labelStyle} mr-2`}>(a) Name and number of the question paper :</div>
                                        <input name="questionPaper" value={formData.questionPaper} onChange={handleChange} className={inputStyle} />
                                    </div>
                                    <div className="flex items-baseline">
                                        <div className={`${labelStyle} mr-2`}>(b) Date :</div>
                                        <FormattedDateInput name="examDate" value={formData.examDate} className="w-48 border border-gray-400 p-1 font-bold text-black outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 03 (Combined Nature & Time) */}
                        <div className="pt-6 border-t border-black">
                            <div className="flex gap-4">
                                <div className="font-bold">03.</div>
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <div className="font-bold mb-2">Nature of the irregularity :</div>
                                        <textarea name="natureOfIrregularity" value={formData.natureOfIrregularity} onChange={handleChange} rows="3" className="w-full border border-gray-400 p-3 font-bold text-black outline-none resize-none" />
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4"> {/* REDUCED GAP */}
                                            <div className="font-bold flex flex-col leading-tight">
                                                <span>Time of discovery:</span>
                                                <span className="text-[10px] font-normal italic opacity-80">(details on back cover)</span>
                                            </div>
                                            <input name="timeOfDiscovery" value={formData.timeOfDiscovery} onChange={handleChange} className="w-64 border border-gray-400 p-1 font-bold text-black outline-none text-left" />
                                        </div>
                                        <div className="flex justify-between items-end"> {/* ALIGNED AT BOTTOM TO FIX HORIZONTAL LINE */}
                                            <div className="text-center w-48">
                                                <FormattedDateInput name="date03" value={formData.date03} className="w-full border border-gray-400 p-1 outline-none font-bold text-black text-xs h-8" />
                                                <div className="text-[10px] font-bold mt-1 uppercase">date</div>
                                            </div>
                                            <div className="text-center w-48 border-t border-black pt-1">
                                                <div className="text-[10px] font-bold uppercase">Inspector's signature</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 04 (Message Section) */}
                        <div className="pt-8 border-t border-black">
                            <div className="flex gap-4">
                                <div className="font-bold">04.</div>
                                <div className="flex-1">
                                    <div className="font-bold">Exam candidate <span className="underline ml-1">{formData.candidateName || '................'}</span></div>
                                    <div className="mt-4 p-4 border border-black text-xs italic leading-relaxed">
                                        Dear Sir/Madam, the above details have been brought to my attention. Please indicate your statement in box number 05 below.
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <div className="text-center w-64 border-t border-black pt-1 text-[10px] font-bold uppercase">Hall administrator's signature</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 05 */}
                        <div className="pt-8 border-t border-black">
                            <div className="font-bold mb-3">05. Candidate's Statement:</div>
                            <textarea name="candidateStatement" value={formData.candidateStatement} onChange={handleChange} rows="4" className="w-full border border-gray-400 p-3 font-bold text-black outline-none resize-none mt-2" />
                            <div className="flex justify-between items-end mt-8">
                                <div className="text-center w-48">
                                    <FormattedDateInput name="date05" value={formData.date05} className="w-full border border-gray-400 p-1 outline-none font-bold text-black text-xs h-8" />
                                    <div className="text-[10px] font-bold mt-1 uppercase">date</div>
                                </div>
                                <div className="text-center w-48 border-t border-black pt-1">
                                    <div className="text-[10px] font-bold uppercase">Candidate's signature</div>
                                </div>
                            </div>
                        </div>

                        {/* 06 */}
                        <div className="pt-8 border-t border-black">
                            <div className="font-bold mb-3">06. Hall Administrator's Observations</div>
                            <textarea name="hallAdminObservations" value={formData.hallAdminObservations} onChange={handleChange} rows="4" className="w-full border border-gray-400 p-3 font-bold text-black outline-none resize-none mt-2" />
                            <div className="flex justify-between items-end mt-8">
                                <div className="text-center w-48">
                                    <FormattedDateInput name="date06" value={formData.date06} className="w-full border border-gray-400 p-1 outline-none font-bold text-black text-xs h-8" />
                                    <div className="text-[10px] font-bold mt-1 uppercase">date</div>
                                </div>
                                <div className="text-center w-48 border-t border-black pt-1">
                                    <div className="text-[10px] font-bold uppercase">Hall administrator's signature</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- PAGE 2 --- */}
                <div className="paper-page-final bg-white w-[210mm] min-h-[297mm] p-[25mm] box-border text-left text-black relative" style={{ border: '1px solid #cbd5e1' }}>
                    <div className="space-y-8 text-sm">
                        <div className="mb-4">
                            <div className="flex gap-2">
                                <span className="font-bold">07.</span>
                                <span className="font-bold uppercase tracking-tight">Details of irregularities:</span>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div>
                                <div className="font-bold leading-relaxed mb-3">
                                    (a) Bringing prohibited items into the hall/ keeping documents/notes etc. that the candidate is not allowed to have/ where and how were they found (number the documents/notes etc. and attach them here.)
                                </div>
                                <textarea name="detailA" value={formData.detailA} onChange={handleChange} rows="4" className="w-full border border-gray-400 p-3 font-bold text-black outline-none resize-none mt-2" />
                            </div>
                            <div>
                                <div className="font-bold leading-relaxed mb-3">
                                    (b) Copying: From which document and how was it copied?
                                </div>
                                <textarea name="detailB" value={formData.detailB} onChange={handleChange} rows="4" className="w-full border border-gray-400 p-3 font-bold text-black outline-none resize-none mt-2" />
                            </div>
                            <div>
                                <div className="font-bold leading-relaxed mb-3">
                                    (c) Details of inappropriate behavior such as misconduct/disobedience:
                                </div>
                                <textarea name="detailC" value={formData.detailC} onChange={handleChange} rows="4" className="w-full border border-gray-400 p-3 font-bold text-black outline-none resize-none mt-2" />
                            </div>
                            <div>
                                <div className="font-bold leading-relaxed mb-3">
                                    (d) If impersonation has taken place, by whom and for whom?
                                </div>
                                <textarea name="detailD" value={formData.detailD} onChange={handleChange} rows="4" className="w-full border border-gray-400 p-3 font-bold text-black outline-none resize-none mt-2" />
                            </div>
                        </div>

                        <div className="pt-8 border-t border-black mt-10">
                            <div className="font-bold uppercase mb-3">08. Other irregularities (describe)</div>
                            <textarea name="otherIrregularities" value={formData.otherIrregularities} onChange={handleChange} rows="4" className="w-full border border-gray-400 p-4 font-bold text-black outline-none resize-none mt-2" />
                        </div>

                        <div className="pt-10 border-t border-black mt-10">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <div className="font-bold uppercase mb-3">09. Special observations! (If necessary)</div>
                                    <textarea name="specialObservations" value={formData.specialObservations} onChange={handleChange} rows="4" className="w-full border border-gray-400 p-4 font-bold text-black outline-none resize-none mt-2" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 flex justify-between gap-7"> {/* REDUCED TOP PADDING TO MOVE SECTION UP */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-20"> {/* INCREASED MARGIN TO PROVIDE MORE SIGNATURE SPACE */}
                                    <div className="font-bold whitespace-nowrap">Name of Observer :</div>
                                    <input name="observerName" value={formData.observerName} onChange={handleChange} className="flex-1 min-w-0 border border-gray-400 p-1 outline-none font-bold h-10" />
                                </div>
                                <div className="text-center border-t border-black pt-1 text-[10px] font-bold uppercase">signature</div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-20"> {/* INCREASED MARGIN TO PROVIDE MORE SIGNATURE SPACE */}
                                    <div className="font-bold whitespace-nowrap">Hall administrator's name :</div>
                                    <input name="hallAdminName" value={formData.hallAdminName} onChange={handleChange} className="flex-1 min-w-0 border border-gray-400 p-1 outline-none font-bold h-10" />
                                </div>
                                <div className="text-center border-t border-black pt-1 text-[10px] font-bold uppercase">signature</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExaminationIrregularities;
