import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateAddDropPDF = async (data) => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    // Header Structure - No Logo
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text('UNIVERSITY OF KELANIYA - SRI LANKA', 105, 15, { align: 'center' });
    doc.setFontSize(11);
    doc.text('FACULTY OF SCIENCE', 105, 20, { align: 'center' });

    // Instructional Text & Deadline (Top Left)
    doc.setFontSize(9);
    const closingDate = data.deadlineDate || 'Not Set';
    doc.text(`Application closing date: ${closingDate}`, 15, 12);
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.text('(Use block capitals only)', 15, 16);

    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text('APPLICATION TO ADD/ DROP COURSE UNITS', 105, 28, { align: 'center' });
    // Underline for title
    const titleWidth = doc.getTextWidth('APPLICATION TO ADD/ DROP COURSE UNITS');
    doc.line(105 - (titleWidth / 2), 29, 105 + (titleWidth / 2), 29);

    doc.setFontSize(11);
    doc.text(`SEMESTER II - ACADEMIC YEAR ${data.academic_year || '2023/2024'}`, 105, 35, { align: 'center' });

    doc.setFont('times', 'normal');
    doc.setFontSize(10);

    // Student Number Grid
    doc.text('STUDENT NUMBER:', 15, 44);
    const studentNo = (data.student_number || '').padEnd(12, ' ');
    for (let i = 0; i < 12; i++) {
        const x = 52 + (i * 7);
        doc.rect(x, 39, 7, 7);
        doc.setFont('times', 'bold');
        doc.text(studentNo[i] || '', x + 3.5, 44, { align: 'center' });
    }

    doc.setFont('times', 'normal');
    doc.text('STUDENT NAME (Mr/Ms):', 15, 53);
    doc.line(65, 53, 195, 53);
    doc.setFont('times', 'bold');
    doc.text(data.student_name || '', 67, 52);

    doc.setFont('times', 'normal');
    doc.text('CONTACT NUMBER:', 15, 60);
    doc.line(55, 60, 195, 60);
    doc.setFont('times', 'bold');
    doc.text(data.contact_number || '', 57, 59);

    doc.setFont('times', 'normal');
    doc.text('EMAIL ADDRESS:', 15, 67);
    doc.line(50, 67, 195, 67);
    doc.setFont('times', 'bold');
    doc.text(data.email || '', 52, 66);

    // Combination and Year
    doc.setFont('times', 'normal');
    doc.text('COURSE COMBINATION:', 15, 75);
    doc.rect(65, 71, 30, 6);
    doc.setFont('times', 'bold');
    doc.text(data.combination || '', 80, 75, { align: 'center' });

    doc.setFont('times', 'normal');
    doc.text('YEAR:', 105, 75);
    doc.rect(120, 71, 30, 6);
    doc.setFont('times', 'bold');
    doc.text(String(data.year || ''), 135, 75, { align: 'center' });

    // TO ADD Table
    const addedRows = [...(data.added_courses || [])];
    while (addedRows.length < 4) addedRows.push('');

    autoTable(doc, {
        startY: 82,
        head: [
            [{ content: 'TO ADD A COURSE UNIT', colSpan: 2, styles: { halign: 'left', fontStyle: 'bolditalic', fillColor: [245, 245, 245] } }],
            ['Course Unit', 'Recommendation of the relevant Senior Academic Advisor (Signature)']
        ],
        body: addedRows.map(course => [(course || '').toUpperCase(), '']),
        theme: 'grid',
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            halign: 'center',
            font: 'times',
            fontSize: 9,
            lineWidth: 0.1,
            lineColor: [0, 0, 0]
        },
        styles: { font: 'times', fontSize: 9, minCellHeight: 8, halign: 'center', valign: 'middle', textColor: [0, 0, 0] },
        columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 110 } },
        margin: { left: 15, right: 15 }
    });

    // TO DROP Table
    const droppedRows = [...(data.dropped_courses || [])];
    while (droppedRows.length < 4) droppedRows.push('');

    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 4,
        head: [
            [{ content: 'TO DROP A COURSE UNIT', colSpan: 2, styles: { halign: 'left', fontStyle: 'bolditalic', fillColor: [245, 245, 245] } }],
            ['Course Unit', 'Recommendation of the relevant Senior Academic Advisor (Signature)']
        ],
        body: droppedRows.map(course => [(course || '').toUpperCase(), '']),
        theme: 'grid',
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            halign: 'center',
            font: 'times',
            fontSize: 9,
            lineWidth: 0.1,
            lineColor: [0, 0, 0]
        },
        styles: { font: 'times', fontSize: 9, minCellHeight: 8, halign: 'center', valign: 'middle', textColor: [0, 0, 0] },
        columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 110 } },
        margin: { left: 15, right: 15 }
    });

    // Credits Summary
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont('times', 'normal');

    // Label column starts at 20 to match the wider layout and preserve margin
    const labelX = 20;
    const colonX = 160;
    const equalsX = 166;
    const valueX = 190;

    doc.text('Number of credits registered for Semester I', labelX, finalY);
    doc.text(':', colonX, finalY);
    doc.text('=', equalsX, finalY);
    doc.text(`${data.sem1_credits || '0.0'}`, valueX, finalY, { align: 'right' });

    doc.text('Number of credits registered for Semester II', labelX, finalY + 5);
    doc.text(':', colonX, finalY + 5);
    doc.text('=', equalsX, finalY + 5);
    doc.text(`${data.sem2_credits || '0.0'}`, valueX, finalY + 5, { align: 'right' });

    doc.setFont('times', 'bold');
    const acadYear = data.academic_year || '';
    const totalLabel = `Total number of credits registered for Academic Year ${acadYear}`;
    doc.text(totalLabel, labelX, finalY + 11);
    doc.text(':', colonX, finalY + 11);
    doc.text('=', equalsX, finalY + 11);
    doc.text(`${data.total_credits || '0.0'}`, valueX, finalY + 11, { align: 'right' });

    // Declaration
    doc.setFont('times', 'bold');
    doc.text('Declaration:', 15, finalY + 20);
    doc.setFont('times', 'normal');
    const declarationText = `This is my final selection of course units for Semester II of ${acadYear}, and I shall not change them for any reason after this date.`;
    doc.text(declarationText, 45, finalY + 20, { maxWidth: 145 });

    // Signatures
    const sigY = finalY + 40;
    doc.setFont('times', 'normal');
    doc.line(15, sigY, 70, sigY);
    doc.text('Date', 42.5, sigY + 5, { align: 'center' });
    doc.setFont('times', 'bold');
    doc.text(data.signature_date ? new Date(data.signature_date).toLocaleDateString() : '', 42.5, sigY - 2, { align: 'center' });

    doc.setFont('times', 'normal');
    doc.line(130, sigY, 195, sigY);
    doc.text('Signature of the Student', 162.5, sigY + 5, { align: 'center' });
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text(data.signature || '', 162.5, sigY - 2, { align: 'center' });

    // Dean Signature area
    const deanY = sigY + 20;
    doc.setFontSize(11);
    doc.setFont('times', 'normal');
    doc.line(15, deanY, 70, deanY);
    doc.text('Date', 42.5, deanY + 4, { align: 'center' });

    doc.line(130, deanY, 195, deanY);
    doc.text('Signature of the Dean', 162.5, deanY + 4, { align: 'center' });

    doc.setFontSize(8);
    doc.text('Office of the Dean - Faculty of Science, University of Kelaniya', 105, 292, { align: 'center' });

    return doc;
};

export const generateCourseUnitPDF = async (reg) => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const data = reg.form_data || {};
    const academicYear = reg.academic_year || reg.academicYear || data.academicYear || '2023/2024';

    doc.setFontSize(14);
    doc.text('UNIVERSITY OF KELANIYA - SRI LANKA', 105, 22, { align: 'center' });
    doc.setFontSize(12);
    doc.text('FACULTY OF SCIENCE', 105, 28, { align: 'center' });
    doc.text(`${academicYear} ACADEMIC YEAR`, 105, 34, { align: 'center' });

    // Instructional Text & Deadline (Top Left)
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    const closingDate = reg.deadlineDate || data.deadlineDate || 'Not Set';
    doc.text(`Application closing date: ${closingDate}`, 15, 12);

    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.text('(Use block capitals only)', 15, 16);

    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.text('REGISTRATION FORM FOR COURSE UNITS', 105, 42, { align: 'center' });
    const titleWidth = doc.getTextWidth('REGISTRATION FORM FOR COURSE UNITS');
    doc.line(105 - (titleWidth / 2), 43, 105 + (titleWidth / 2), 43);

    doc.setFont('times', 'normal');
    doc.setFontSize(10);

    // Student Number Grid
    doc.setFont('times', 'bold');
    doc.text('STUDENT NUMBER:', 15, 48);
    // Student ID prefix I M / 
    doc.rect(52, 43, 7, 7); doc.text('I', 55.5, 48, { align: 'center' });
    doc.rect(59, 43, 7, 7); doc.text('M', 62.5, 48, { align: 'center' });
    doc.rect(66, 43, 7, 7); doc.text('/', 69.5, 48, { align: 'center' });

    for (let i = 0; i < 8; i++) {
        const x = 73 + (i * 7);
        const val = data[`st_no_cr_${i}`] || '';
        doc.rect(x, 43, 7, 7);
        doc.text(val, x + 3.5, 48, { align: 'center' });
    }

    doc.text('LEVEL:', 150, 48);
    doc.rect(165, 43, 10, 7);
    doc.text(data.level || '', 170, 48, { align: 'center' });

    // Student Info
    doc.setFont('times', 'normal');
    doc.text('STUDENT NAME: Mr/Ms', 15, 58);
    doc.line(55, 58, 195, 58);
    doc.setFont('times', 'bold');
    doc.text(data.st_name_cr || reg.student_name || '', 57, 57);

    doc.setFont('times', 'normal');
    doc.text('ADDRESS:', 15, 66);
    doc.line(35, 66, 195, 66);
    doc.setFont('times', 'bold');
    doc.text(data.address || '', 37, 65);

    doc.setFont('times', 'normal');
    doc.text('MOBILE/ TEL:', 15, 74);
    doc.line(40, 74, 100, 74);
    doc.setFont('times', 'bold');
    doc.text(data.mobile || '', 42, 73);

    doc.setFont('times', 'normal');
    doc.text('E-MAIL:', 105, 74);
    doc.line(125, 74, 195, 74);
    doc.setFont('times', 'bold');
    doc.text(data.email_cr || '', 127, 73);

    doc.setFont('times', 'normal');
    doc.text('COURSE UNIT COMBINATION:', 15, 82);
    doc.rect(70, 78, 20, 7);
    doc.setFont('times', 'bold');
    doc.text((data.course_combo || '').toUpperCase(), 80, 82, { align: 'center' });

    // Course Grids Layout Helper
    const generateGridData = (prefix, rows, cols) => {
        const body = [];
        // Map prefix to type/semester for legacy fallback
        const typeMap = { 'Grid_Comp': 'Compulsory', 'Grid_Opt': 'Optional', 'Grid_Aux': 'Auxiliary' };
        const prefixParts = prefix.split('_');
        const searchType = typeMap[prefixParts[0] + '_' + prefixParts[1]];
        const searchSem = prefixParts[2] === 'S1' ? 1 : 2;

        const legacyCourses = (reg.courseUnits || []).filter(c => c.course_type === searchType && c.semester === searchSem);

        for (let r = 0; r < rows; r++) {
            let rowStr = '';
            // Try form_data first (new submissions)
            for (let c = 0; c < cols; c++) {
                rowStr += (data[`${prefix}_${r}_${c}`] || '');
            }

            // Fallback to structured course list (legacy submissions)
            if (!rowStr.trim() && legacyCourses[r]) {
                rowStr = legacyCourses[r].course_code || '';
            }

            body.push([rowStr.toUpperCase()]);
        }
        return body;
    };

    // Split Page into two columns for grids
    const midX = 105;

    // Left Column: Compulsory
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.text('COMPULSORY COURSE UNITS', 15, 92);
    doc.setFontSize(8);
    doc.text('SEMESTER 1', 15, 96);

    autoTable(doc, {
        startY: 98,
        body: generateGridData('Grid_Comp_S1', 10, 12),
        theme: 'grid',
        styles: { font: 'courier', fontSize: 10, cellPadding: 1, halign: 'center', minCellHeight: 5, lineWidth: 0.1 },
        columnStyles: { 0: { cellWidth: 80 } },
        margin: { left: 15 }
    });

    doc.setFontSize(9);
    doc.text('CREDITS:', 65, doc.lastAutoTable.finalY + 5);
    doc.rect(80, doc.lastAutoTable.finalY + 1, 15, 6);
    doc.text(data.cred_comp_1 || '', 87.5, doc.lastAutoTable.finalY + 5, { align: 'center' });

    doc.setFontSize(8);
    doc.text('SEMESTER 2', 15, doc.lastAutoTable.finalY + 10);
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 12,
        body: generateGridData('Grid_Comp_S2', 10, 12),
        theme: 'grid',
        styles: { font: 'courier', fontSize: 10, cellPadding: 1, halign: 'center', minCellHeight: 5, lineWidth: 0.1 },
        columnStyles: { 0: { cellWidth: 80 } },
        margin: { left: 15 }
    });

    doc.setFontSize(9);
    doc.text('CREDITS:', 65, doc.lastAutoTable.finalY + 5);
    doc.rect(80, doc.lastAutoTable.finalY + 1, 15, 6);
    doc.text(data.cred_comp_2 || '', 87.5, doc.lastAutoTable.finalY + 5, { align: 'center' });

    const leftFinalY = doc.lastAutoTable.finalY + 12;

    // Right Column: Optional & Auxiliary
    doc.setFontSize(9);
    doc.text('OPTIONAL COURSE UNITS', midX + 5, 92);
    doc.setFontSize(8);
    doc.text('SEMESTER 1', midX + 5, 96);
    autoTable(doc, {
        startY: 98,
        body: generateGridData('Grid_Opt_S1', 6, 12),
        theme: 'grid',
        styles: { font: 'courier', fontSize: 10, cellPadding: 1, halign: 'center', minCellHeight: 5, lineWidth: 0.1 },
        columnStyles: { 0: { cellWidth: 80 } },
        margin: { left: midX + 5 }
    });

    doc.setFontSize(9);
    doc.text('CREDITS:', midX + 55, doc.lastAutoTable.finalY + 5);
    doc.rect(midX + 70, doc.lastAutoTable.finalY + 1, 15, 6);
    doc.text(data.cred_opt_1 || '', midX + 77.5, doc.lastAutoTable.finalY + 5, { align: 'center' });

    doc.setFontSize(8);
    doc.text('SEMESTER 2', midX + 5, doc.lastAutoTable.finalY + 10);
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 12,
        body: generateGridData('Grid_Opt_S2', 6, 12),
        theme: 'grid',
        styles: { font: 'courier', fontSize: 10, cellPadding: 1, halign: 'center', minCellHeight: 5, lineWidth: 0.1 },
        columnStyles: { 0: { cellWidth: 80 } },
        margin: { left: midX + 5 }
    });

    doc.setFontSize(9);
    doc.text('CREDITS:', midX + 55, doc.lastAutoTable.finalY + 5);
    doc.rect(midX + 70, doc.lastAutoTable.finalY + 1, 15, 6);
    doc.text(data.cred_opt_2 || '', midX + 77.5, doc.lastAutoTable.finalY + 5, { align: 'center' });

    doc.text('AUXILIARY COURSE UNITS', midX + 5, doc.lastAutoTable.finalY + 12);
    doc.setFontSize(8);
    doc.text('SEMESTER 1', midX + 5, doc.lastAutoTable.finalY + 16);
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 18,
        body: generateGridData('Grid_Aux_S1', 3, 12),
        theme: 'grid',
        styles: { font: 'courier', fontSize: 10, cellPadding: 1, halign: 'center', minCellHeight: 5, lineWidth: 0.1 },
        columnStyles: { 0: { cellWidth: 80 } },
        margin: { left: midX + 5 }
    });

    doc.setFontSize(9);
    doc.text('CREDITS:', midX + 55, doc.lastAutoTable.finalY + 5);
    doc.rect(midX + 70, doc.lastAutoTable.finalY + 1, 15, 6);
    doc.text(data.cred_aux_1 || '', midX + 77.5, doc.lastAutoTable.finalY + 5, { align: 'center' });

    doc.setFontSize(8);
    doc.text('SEMESTER 2', midX + 5, doc.lastAutoTable.finalY + 10);
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 12,
        body: generateGridData('Grid_Aux_S2', 3, 12),
        theme: 'grid',
        styles: { font: 'courier', fontSize: 10, cellPadding: 1, halign: 'center', minCellHeight: 5, lineWidth: 0.1 },
        columnStyles: { 0: { cellWidth: 80 } },
        margin: { left: midX + 5 }
    });

    doc.setFontSize(9);
    doc.text('CREDITS:', midX + 55, doc.lastAutoTable.finalY + 5);
    doc.rect(midX + 70, doc.lastAutoTable.finalY + 1, 15, 6);
    doc.text(data.cred_aux_2 || '', midX + 77.5, doc.lastAutoTable.finalY + 5, { align: 'center' });

    const rightFinalY = doc.lastAutoTable.finalY + 12;
    const finalY = Math.max(leftFinalY, rightFinalY);

    doc.setFont('times', 'bold');
    doc.text('TOTAL NUMBER OF CREDITS:', 15, finalY);
    doc.rect(70, finalY - 5, 25, 8);
    doc.text(data.total_creds_box || '', 82.5, finalY, { align: 'center' });

    // Footer Signatures
    const sigY = finalY + 20;
    doc.line(15, sigY, 70, sigY);
    doc.text('DATE', 42.5, sigY + 5, { align: 'center' });

    // Display signature_date or fallback to dateSubmitted
    const displayDate = reg.signature_date ? new Date(reg.signature_date).toLocaleDateString() : (reg.dateSubmitted || '');
    doc.text(displayDate, 42.5, sigY - 2, { align: 'center' });

    doc.line(130, sigY, 195, sigY);
    doc.text('SIGNATURE OF APPLICANT', 162.5, sigY + 5, { align: 'center' });

    if (reg.signature) {
        if (reg.signature.startsWith('data:image')) {
            // Legacy base64 image signature
            doc.addImage(reg.signature, 'PNG', 140, sigY - 20, 45, 18);
        } else {
            // New text-based signature
            doc.setFont('times', 'bold');
            doc.setFontSize(12);
            doc.text(reg.signature, 162.5, sigY - 2, { align: 'center' });
            doc.setFontSize(10);
            doc.setFont('times', 'normal');
        }
    }

    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.text('ANY CHANGE TO THE REGISTERED COURSES WILL NOT BE DONE AFTER TWO WEEKS OF THE COMMENCEMENT OF THE SEMESTER.', 15, sigY + 15);

    doc.setFont('times', 'normal');
    doc.text('Office of the Dean - Faculty of Science, University of Kelaniya', 105, 292, { align: 'center' });

    return doc;
};

export const generateMedicalRepeatPDF = async (details) => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    // Header
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text('UNIVERSITY OF KELANIYA', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('APPLICATION FOR REPEAT/MEDICAL EXAMINATIONS', 105, 21, { align: 'center' });
    doc.text('FOR IT/MIT STUDENTS', 105, 27, { align: 'center' });
    doc.text(`ACADEMIC YEAR ${details.academic_year || '2023/2024'} - SEMESTER I`, 105, 33, { align: 'center' });

    doc.setFontSize(10);
    const medClosingDate = details.deadlineDate || details.deadline || 'Not Set';
    doc.text(`Closing date of Application: ${medClosingDate}`, 15, 42);

    // Form Details Section
    doc.setFont('times', 'normal');
    doc.text('01. Full Name:', 15, 52);
    doc.line(40, 52, 195, 52);
    doc.setFont('times', 'bold');
    doc.text(details.student_name || '', 42, 51);

    doc.setFont('times', 'normal');
    doc.text('02. Student Number:', 15, 60);
    doc.line(50, 60, 100, 60);
    doc.setFont('times', 'bold');
    doc.text(details.student_number || '', 52, 59);

    doc.setFont('times', 'normal');
    doc.text('03. Telephone No:', 15, 68);
    doc.line(45, 68, 100, 68);
    doc.setFont('times', 'bold');
    doc.text(details.contact_number || '', 47, 67);

    doc.setFont('times', 'normal');
    doc.text('04. Email:', 105, 68);
    doc.line(125, 68, 195, 68);
    doc.setFont('times', 'bold');
    doc.text(details.email || '', 127, 67);

    // Courses Table
    doc.setFont('times', 'bold');
    doc.text('05. Course unit applying for:', 15, 78);

    autoTable(doc, {
        startY: 82,
        head: [['#', 'Course Code', 'Course Title', 'Results obtained', 'Academic Year']],
        body: (details.courses || []).map((c, i) => [i + 1, (c.course_code || '').toUpperCase(), c.course_title, c.results_obtained, c.academic_year]),
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
        styles: { font: 'times', fontSize: 9, halign: 'center' },
        columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 30 }, 2: { cellWidth: 70 }, 3: { cellWidth: 35 }, 4: { cellWidth: 35 } },
        margin: { left: 15, right: 15 }
    });

    // Evidence Links (Crucial for the Faculty Staff review)
    let finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(11);
    doc.setFont('times', 'bold');
    doc.text('06. EVIDENCE & ATTACHMENTS', 15, finalY);
    doc.line(15, finalY + 1, 75, finalY + 1);

    doc.setFontSize(10);
    doc.setFont('times', 'normal');

    finalY += 10;
    if (details.medical_certificate_url) {
        doc.text('Medical Certificate Attached: YES', 15, finalY);
        doc.setTextColor(0, 0, 255);
        doc.text(`[Click to view medical certificate]`, 80, finalY);
        doc.link(80, finalY - 4, 60, 6, { url: `http://localhost:5000${details.medical_certificate_url}` });
        doc.setTextColor(0, 0, 0);
    } else {
        doc.text('Medical Certificate Attached: NO (Repeat Application)', 15, finalY);
    }

    finalY += 8;
    if (details.payment_receipt_url) {
        doc.text('Payment Receipt Attached: YES', 15, finalY);
        doc.setTextColor(0, 0, 255);
        doc.text(`[Click to view payment receipt]`, 80, finalY);
        doc.link(80, finalY - 4, 60, 6, { url: `http://localhost:5000${details.payment_receipt_url}` });
        doc.setTextColor(0, 0, 0);
    } else {
        doc.text('Payment Receipt Attached: NO', 15, finalY);
    }

    // Signatures
    finalY += 30;
    doc.line(15, finalY, 80, finalY);
    doc.text('Student Signature', 47.5, finalY + 5, { align: 'center' });
    doc.setFont('times', 'bold');
    doc.text(details.signature || '', 47.5, finalY - 2, { align: 'center' });

    doc.setFont('times', 'normal');
    doc.line(130, finalY, 195, finalY);
    doc.text('Date', 162.5, finalY + 5, { align: 'center' });
    doc.setFont('times', 'bold');
    doc.text(details.signature_date ? new Date(details.signature_date).toLocaleDateString() : '', 162.5, finalY - 2, { align: 'center' });

    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.text('Office of the Dean - Faculty of Science, University of Kelaniya', 105, 292, { align: 'center' });

    return doc;
};
