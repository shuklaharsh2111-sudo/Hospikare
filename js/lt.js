loadDashboard();

setInterval(() => {

    loadDashboard();

},5000);

document.getElementById("reportsSection").style.display="none";
document.getElementById("insuranceBookingSection").style.display = "none";
document.getElementById("labSection").style.display = "none";
document.getElementById("patientsSection").style.display = "none";
document.getElementById("paymentsSection").style.display = "none";
document.getElementById("dashboardSection").style.display = "none";

async function loadUserProfile(){
    try{
        const response = await fetch('/api/user/profile');
        const result = await response.json();
        if(result.success){
            document.getElementById("welcomeText").innerText = `Welcome ${result.user.name}`;
        }
        else{
            window.location.href = "/rg.html";
        }
    }
    catch(error){
        console.log(error);
    }
}

loadUserProfile();

document.getElementById("logoutBtn").addEventListener("click", logout);
async function logout(){
    try{
        const response = await fetch('/api/user/logout',{
                    method:'POST'
                }
            );
        const result =
            await response.json();
        if(result.success){
            window.location.href = "/rg.html";
        }
    }
    catch(error){
        console.log(error);
    }
}

const navItems =
    document.querySelectorAll(".navItem");

navItems.forEach(item => {

    item.addEventListener(
        "click",
        () => {

            navItems.forEach(nav => {
                nav.classList.remove("activeNav");
            });
            item.classList.add("activeNav");
            const text =  item.innerText.trim().toLowerCase();

            document.getElementById("labSection").style.display = "none";
            document.getElementById("insuranceBookingSection").style.display = "none";
            document.getElementById("patientsSection").style.display = "none";
            document.getElementById("reportsSection").style.display = "none";
            document.getElementById("paymentsSection").style.display = "none";
            document.getElementById("dashboardSection").style.display = "none";

            if(text.includes("dashboard")){
                document.getElementById("dashboardSection").style.display="block";
                loadDashboard();
            }
            else if(text.includes("lab tests")){
                document.getElementById("labSection").style.display = "block";
                loadLabs();
            }
            else if(text.includes("bookings")){
                document.getElementById("insuranceBookingSection").style.display = "block";
                loadInsuranceBookings();
            }
            else if(text.includes("patients")){
                document.getElementById("patientsSection").style.display = "block";
                loadPatients();
            }
            else if(text.includes("reports")){
                document.getElementById("reportsSection").style.display = "block";
                loadReports();
            }
            else if(text.includes("payments")){
                document.getElementById("paymentsSection").style.display = "block";
                loadPayments();
            }
        }
    );

});
async function loadLabs(){
    try{
        const response =
            await fetch('/api/labs');
        const result =
            await response.json();
        const tbody =
            document.getElementById(
                "labTableBody"
            );
        tbody.innerHTML = "";
        if(result.success){
            if(
                result.labs.length === 0
            ){
                tbody.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        class="noLabData"
                    >
                        No Labs Found
                    </td>
                </tr>
                `;
                return;
            }
            result.labs.forEach(lab => {
                tbody.innerHTML += `
                <tr>
                    <td>
                        ${lab.id}
                    </td>
                    <td>
                        ${lab.lab_name}
                    </td>
                    <td>
                        ${lab.address}
                    </td>
                    <td>
                        ${lab.home_coll}
                    </td>
                    <td>
                        ${lab.emergency_test}
                    </td>
                    <td>
                        ${lab.lab_hrs}
                    </td>
                    <td>
                        ${
                            new Date(
                                lab.created_at
                            ).toLocaleDateString()
                        }
                    </td>
                </tr>
                `;
            });
        }
    }
    catch(error){
        console.log(error);
    }
}

document.getElementById(
    "addLabBtn"
).addEventListener(
    "click",
    () => {
        document.getElementById(
            "labModal"
        ).style.display = "flex";
    }
);

document.getElementById(
    "closeLabModal"
).addEventListener(
    "click",
    () => {
        document.getElementById(
            "labModal"
        ).style.display = "none";
    }
);

function addPathologist(){
    const container =
        document.getElementById(
            "pathologistContainer"
        );
    container.innerHTML += `
    <div class="pathologistBox">
        <input
            type="text"
            placeholder="Name"
            class="path_name"
        >
        <input
            type="text"
            placeholder="Qualification"
            class="path_qualification"
        >
        <input
            type="text"
            placeholder="Experience"
            class="path_experience"
        >
    </div>
    `;
}

document.getElementById(
    "addPathologistBtn"
).addEventListener(
    "click",
    addPathologist
);

document.getElementById("labForm").addEventListener(
    "submit",
    async(e) => {
        e.preventDefault();
        const formData =
            new FormData();
        formData.append(
            "lab_name",
            document.getElementById(
                "lab_name"
            ).value
        );
        formData.append(
            "address",
            document.getElementById(
                "lab_address"
            ).value
        );
        formData.append(
            "location",
            document.getElementById(
                "lab_location"
            ).value
        );
        formData.append(
            "description",
            document.getElementById(
                "lab_description"
            ).value
        );
        formData.append(
            "test_price",
            document.getElementById(
                "test_price"
            ).value
        );
        const labTypes = [];
        document.querySelectorAll(
            "#labTypeGrid input:checked"
        ).forEach(item => {
            labTypes.push(
                item.value
            );
        });
        formData.append(
            "lab_type",
            JSON.stringify(labTypes)
        );
        const tests = [];
        document.querySelectorAll(
            "#labTestGrid input:checked"
        ).forEach(item => {
            tests.push(
                item.value
            );
        });
        formData.append(
            "test",
            JSON.stringify(tests)
        );
        const pathologists = [];
        document.querySelectorAll(
            ".pathologistBox"
        ).forEach(box => {
            pathologists.push({
                name:
                    box.querySelector(
                        ".path_name"
                    ).value,
                qualification:
                    box.querySelector(
                        ".path_qualification"
                    ).value,
                experience:
                    box.querySelector(
                        ".path_experience"
                    ).value
            });
        });
        formData.append(
            "pathologist",
            JSON.stringify(pathologists)
        );
        formData.append(
            "home_coll",
            document.getElementById(
                "home_coll"
            ).value
        );
        formData.append(
            "extra_chrg",
            document.getElementById(
                "extra_chrg"
            ).value
        );
        formData.append(
            "available_areas",
            document.getElementById(
                "available_areas"
            ).value
        );
        formData.append(
            "adv_equipment",
            document.getElementById(
                "adv_equipment"
            ).value
        );
        formData.append(
            "lab_hrs",
            document.getElementById(
                "lab_hrs"
            ).value
        );
        formData.append(
            "test_time",
            document.getElementById(
                "test_time"
            ).value
        );
        formData.append(
            "emergency_test",
            document.getElementById(
                "emergency_test"
            ).value
        );
        formData.append(
            "lab_reg",
            document.getElementById(
                "lab_reg"
            ).files[0]
        );
        formData.append(
            "nabl",
            document.getElementById(
                "nabl"
            ).files[0]
        );
        formData.append(
            "path_qual_cer",
            document.getElementById(
                "path_qual_cer"
            ).files[0]
        );
        try{
            const response = await fetch('/api/add/lab', {
                        method:'POST',
                        body:formData
                    }
                );
            const result =
                await response.json();
            if(result.success){
                alert(
                    "Lab Added"
                );
                document.getElementById(
                    "labModal"
                ).style.display =
                    "none";
                loadLabs();
            }
        }
        catch(error){
            console.log(error);
        }
    }
);

async function loadInsuranceBookings(){
    try{
        const response =
            await fetch('/api/insurance/bookings');
        const result = await response.json();
        const tbody = document.getElementById("insuranceTableBody");
        tbody.innerHTML = "";
        if(result.success){
            if(
                result.bookings.length === 0
            ){
                tbody.innerHTML = `
                <tr>
                    <td
                        colspan="12"
                        class="noLabData"
                    >
                        No Insurance Purchases Found
                    </td>
                </tr>
                `;
                return;
            }
            result.bookings.forEach(
                booking => {
                tbody.innerHTML += `
                <tr>
                    <td>
                        ${booking.id}
                    </td>
                    <td>
                        ${booking.user_id}
                    </td>
                    <td>
                        ${booking.plan_name}
                    </td>
                    <td>
                        ${booking.policy_number}
                    </td>
                    <td>
                        ₹${booking.coverage_amount}
                    </td>
                    <td>
                        ₹${booking.premium_amount}
                    </td>
                    <td>
                        ${booking.start_date}
                    </td>
                    <td>
                        ${booking.expiry_date}
                    </td>
                    <td>
                        ${booking.insurance_status}
                    </td>
                    <td>
                        ${booking.payment_status}
                    </td>
                    <td>
                        ${
                            new Date(
                                booking.created_at
                            ).toLocaleDateString()
                        }
                    </td>
                </tr>
                `;
            });
        }
    }
    catch(error){

        console.log(error);
    }
}

async function loadPatients(){
    try{
        const response = await fetch('/api/lab/patients');
        const result = await response.json();
        const tbody =
            document.getElementById(
                "patientsTableBody"
            );
        tbody.innerHTML = "";
        if(result.success){
            if(
                result.patients.length === 0
            ){
                tbody.innerHTML = `
                <tr>
                    <td
                        colspan="9"
                        class="noLabData"
                    >
                        No Patients Found
                    </td>
                </tr>
                `;
                return;
            }
            result.patients.forEach(
                patient => {
                tbody.innerHTML += `
                <tr>
                    <td>
                        ${patient.id}
                    </td>
                    <td>
                        ${patient.full_name || 'N/A'}
                    </td>
                                    
                    <td>
                        ${patient.email || 'N/A'}
                    </td>
                                    
                    <td>
                        ${patient.phone || 'N/A'}
                    </td>
                                    
                    <td>
                        ${patient.patient_name}
                    </td>
                    <td>
                        ${patient.test_name}
                    </td>
                    <td>
                        ${patient.sample_collection_type}
                    </td>
                    <td>
                        ${patient.booking_date}
                    </td>
                    <td>
                        ₹${patient.total_amount}
                    </td>
                    <td>
                        ${patient.booking_status}
                    </td>
                    <td>
                        ${patient.payment_status}
                    </td>
                    <td>
                        ${
                            new Date(
                                patient.created_at
                            ).toLocaleDateString()
                        }
                    </td>
                </tr>
                `;
            });
        }
    }
    catch(error){

        console.log(error);
    }
}

async function loadReports(){

    try{

        const response =
            await fetch(
                '/api/lab/reports'
            );

        const result =
            await response.json();

        const tbody =
            document.getElementById(
                "reportsTableBody"
            );

        tbody.innerHTML = "";

        if(result.success){

            if(
                result.reports.length === 0
            ){

                tbody.innerHTML = `
                <tr>
                    <td colspan="10">
                        No Reports Found
                    </td>
                </tr>
                `;

                return;
            }

            result.reports.forEach(
                report => {

                tbody.innerHTML += `
                <tr>

                    <td>
                        ${report.id}
                    </td>

                    <td>
                        ${report.full_name}
                    </td>

                    <td>
                        ${report.email}
                    </td>

                    <td>
                        ${report.phone}
                    </td>

                    <td>
                        ${report.patient_name}
                    </td>

                    <td>
                        ${report.test_name}
                    </td>

                    <td>

                        ${
                            report.report_file
                            ?

                            `
                            <a
                                href="/uploads/${report.report_file}"
                                target="_blank"
                            >
                                View
                            </a>
                            `

                            :

                            'No Report'
                        }

                    </td>

                    <td>

                        <input
                            type="file"
                            onchange="
                                uploadReport(
                                    ${report.id},
                                    this.files[0]
                                )
                            "
                        >

                    </td>

                    <td>

                        <a
                            href="
https://wa.me/91${report.phone}?text=Your Lab Report : ${window.location.origin}/uploads/${report.report_file}
                            "
                            target="_blank"
                        >

                            <i
                                class="fa-brands fa-whatsapp"
                                style="
                                    color:green;
                                    font-size:24px;
                                "
                            ></i>

                        </a>

                    </td>

                    <td>

                        <a
                            href="
mailto:${report.email}?subject=Lab Report&body=Your Report : ${window.location.origin}/uploads/${report.report_file}
                            "
                        >

                            <i
                                class="fa-solid fa-envelope"
                                style="
                                    color:red;
                                    font-size:24px;
                                "
                            ></i>

                        </a>

                    </td>

                </tr>
                `;
            });
        }

    }
    catch(error){

        console.log(error);

    }

}

async function uploadReport(
    bookingId,
    file
){

    try{

        const formData =
            new FormData();

        formData.append(
            "report",
            file
        );

        formData.append(
            "booking_id",
            bookingId
        );

        const response =
            await fetch(
                '/api/upload/report',
                {
                    method:'POST',
                    body:formData
                }
            );

        const result =
            await response.json();

        if(result.success){

            alert(
                "Report Uploaded Successfully"
            );

            loadReports();
        }
        else{

            alert(
                result.message
            );

        }

    }
    catch(error){

        console.log(error);

    }

}

async function loadVendorPayments(){

    try{

        const response =
        await fetch(
            '/api/vendor/payouts'
        );

        const result =
        await response.json();

        const tbody =
        document.getElementById(
            "paymentsTableBody"
        );

        tbody.innerHTML = "";

        if(result.success){

            if(
                result.payments.length === 0
            ){

                tbody.innerHTML = `
                <tr>

                    <td colspan="8">

                        No Vendor Payouts Found

                    </td>

                </tr>
                `;

                return;

            }

            result.payments.forEach(
                payment => {

                tbody.innerHTML += `
                <tr>

                    <td>
                        ${payment.id}
                    </td>

                    <td>
                        #${payment.booking_id}
                    </td>

                    <td>
                        ${payment.full_name}
                    </td>

                    <td>
                        ₹${payment.vendor_amount}
                    </td>

                    <td>
                        ₹${payment.admin_commission}
                    </td>

                    <td>

                        <span
                            style="
                                color:green;
                                font-weight:600;
                            "
                        >
                            Paid
                        </span>

                    </td>

                    <td>
                        ${payment.razorpay_payment_id}
                    </td>

                    <td>
                        ${
                            new Date(
                                payment.created_at
                            ).toLocaleDateString()
                        }
                    </td>

                </tr>
                `;

            });

        }

    }
    catch(error){

        console.log(error);

    }

}

async function loadPayments(){

    try{

        const response =
        await fetch(
            '/api/vendor/payments'
        );

        const result =
        await response.json();

        const tbody =
        document.getElementById(
            "paymentsTableBody"
        );

        tbody.innerHTML = "";

        if(result.success){

            if(
                result.payments.length === 0
            ){

                tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No Payments Found
                    </td>
                </tr>
                `;

                return;

            }

            result.payments.forEach(
                payment => {

                    tbody.innerHTML += `
                    <tr>

                        <td>
                            ${payment.id}
                        </td>

                        <td>
                            ₹${payment.amount}
                        </td>

                        <td>
                            ${payment.razorpay_payment_id || 'N/A'}
                        </td>

                        <td>
                            ${payment.payout_status}
                        </td>

                        <td>
                            ${
                                new Date(
                                    payment.paid_at
                                ).toLocaleString()
                            }
                        </td>

                    </tr>
                    `;

                }
            );

        }

    }
    catch(error){

        console.log(error);

    }

}

async function loadDashboard(){

    try{

        const bookingsResponse =
        await fetch(
            '/api/lab/patients'
        );

        const bookingsResult =
        await bookingsResponse.json();

        const paymentsResponse =
        await fetch(
            '/api/payments'
        );

        const paymentsResult =
        await paymentsResponse.json();

        let totalBookings = 0;

        let totalEarnings = 0;

        let totalPayouts = 0;

        if(bookingsResult.success){

            totalBookings =
            bookingsResult.patients.length;

            bookingsResult.patients.forEach(
                patient => {

                    totalEarnings +=
                    Number(
                        patient.total_amount
                    );

                }
            );

        }

        if(paymentsResult.success){

            paymentsResult.payments.forEach(
                payment => {

                    totalPayouts +=
                    Number(payment.amount);

                }
            );

        }

        document.getElementById(
            "totalTests"
        ).innerText =
        totalBookings;

        document.getElementById(
            "totalBookings"
        ).innerText =
        totalBookings;

        document.getElementById(
            "totalEarnings"
        ).innerText =
        `₹${totalEarnings}`;

        document.getElementById(
            "totalPayouts"
        ).innerText =
        `₹${totalPayouts}`;

        const bookingBody =
        document.getElementById(
            "dashboardBookingsBody"
        );

        bookingBody.innerHTML = "";

        if(bookingsResult.success){

            bookingsResult.patients
            .slice(0,5)
            .forEach(patient => {

                bookingBody.innerHTML += `
                <tr>

                    <td>
                        #${patient.id}
                    </td>

                    <td>
                        ${patient.patient_name}
                    </td>

                    <td>
                        ${patient.test_name}
                    </td>

                    <td>
                        ₹${patient.total_amount}
                    </td>

                    <td>

                        <span
                            class="
                            ${
                                patient.booking_status === 'completed'
                                ?
                                'completedStatus'
                                :
                                'pendingStatus'
                            }
                            "
                        >

                            ${patient.booking_status}

                        </span>

                    </td>

                </tr>
                `;

            });

        }

        const paymentBody =
        document.getElementById(
            "dashboardPaymentsBody"
        );

        paymentBody.innerHTML = "";

        if(paymentsResult.success){

            paymentsResult.payments
            .slice(0,5)
            .forEach(payment => {

                paymentBody.innerHTML += `
                <tr>

                    <td>
                        #${payment.id}
                    </td>

                    <td>
                        ₹${payment.amount}
                    </td>

                    <td>
                        ${payment.razorpay_payment_id}
                    </td>

                    <td>

                        <span
                            class="
                            completedStatus
                            "
                        >

                            Paid

                        </span>

                    </td>

                </tr>
                `;

            });

        }

        const now =
        new Date();

        document.getElementById(
            "dashboardDate"
        ).innerText =
        now.toLocaleDateString(
            'en-IN',
            {
                day:'2-digit',
                month:'short',
                year:'numeric'
            }
        );

    }
    catch(error){

        console.log(error);

    }

}