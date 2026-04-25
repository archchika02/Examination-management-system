export const fetchDeadlines = async () => {
    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch('http://localhost:5000/api/deadlines', { headers });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Error fetching deadlines:", error);
        return [];
    }
};

export const getDeadlineForForm = (formName, targetYear, deadlines) => {
    if (!deadlines || deadlines.length === 0) return 'Not Set';

    const matchingDeadlines = deadlines.filter(d => d.form_name === formName);

    if (matchingDeadlines.length === 0) return 'Not Set';

    // 1. Exact match for academic year
    let matched = matchingDeadlines.find(d => d.academic_year === targetYear);

    // 2. Global fallback (null academic year)
    if (!matched) {
        matched = matchingDeadlines.find(d => !d.academic_year);
    }

    // 3. Most recent fallback
    if (!matched) {
        matched = matchingDeadlines.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))[0];
    }

    if (!matched) return 'Not Set';

    // Extract the deadline date securely. The API may return due_date or deadline
    const rawDate = matched.deadline || matched.due_date;
    if (!rawDate) return 'Not Set';

    try {
        // Parse the date to fix the "reduced by one date" issue.
        // Convert to Date object
        const d = new Date(rawDate);
        
        // Subtract one day (24 hours) to fix the timezone offset pushing the date forward
        d.setDate(d.getDate() - 1);

        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();

        return `${day}.${month}.${year}`;
    } catch(e) {
        console.error("Error formatting date", e);
        return 'Not Set';
    }
};
