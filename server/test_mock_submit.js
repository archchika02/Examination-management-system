const mockFormData = {
    st_no_cr_0: '2',
    st_no_cr_1: '0',
    st_no_cr_2: '2',
    st_no_cr_3: '0',
    st_no_cr_4: '0',
    st_no_cr_5: '0',
    st_no_cr_6: '1',
    st_no_cr_7: '',
    st_name_cr_mr: true,
    st_name_cr: 'John Doe',
    level: '1',
    course_combo: 'CS1',
    total_creds_box: '30',
    // Simulate 1 course code in S1 (e.g., C O M P 1 1 0 1 4)
    Grid_Comp_S1_0_0: 'C',
    Grid_Comp_S1_0_1: 'O',
    Grid_Comp_S1_0_2: 'M',
    Grid_Comp_S1_0_3: 'P',
    Grid_Comp_S1_0_4: '1',
    Grid_Comp_S1_0_5: '1',
    Grid_Comp_S1_0_6: '0',
    Grid_Comp_S1_0_7: '1',
    Grid_Comp_S1_0_8: '4',
    // Simulate 1 course code in S2
    Grid_Comp_S2_0_0: 'M',
    Grid_Comp_S2_0_1: 'A',
    Grid_Comp_S2_0_2: 'T',
    Grid_Comp_S2_0_3: 'H',
    Grid_Comp_S2_0_4: '1',
    Grid_Comp_S2_0_5: '2',
    Grid_Comp_S2_0_6: '0',
    Grid_Comp_S2_0_7: '2',
    Grid_Comp_S2_0_8: '4',
    // Simulate 1 Optional course
    Grid_Opt_S1_0_0: 'E',
    Grid_Opt_S1_0_1: 'L',
    Grid_Opt_S1_0_2: 'E',
    Grid_Opt_S1_0_3: 'C',
};

const payload = {
    user_id: 1, // Example user_id
    form_data: mockFormData,
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' // Dummy base64
};

async function testSubmit() {
    try {
        const res = await fetch('http://localhost:5000/api/course-registration/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log('Submit Response:', res.status, data);

        const listRes = await fetch('http://localhost:5000/api/course-registration/list');
        const listData = await listRes.json();
        console.log('List Response Size:', listData.length);
        console.log('First Item in List:', JSON.stringify(listData[0], null, 2));

    } catch (err) {
        console.error('Submit Error:', err.message);
    }
}

testSubmit();
