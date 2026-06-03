loadDashboard();

window.addEventListener(
    "DOMContentLoaded",
    () => {

const customerSection =
    document.getElementById(
        "customerSection"
    );

if(customerSection){

    customerSection.style.display =
        "none";

}

    }
);

const paymentsSection =
    document.getElementById(
        "paymentsSection"
    );

if(paymentsSection){

    paymentsSection.style.display =
        "none";

}
async function loadUserProfile(){
    try{
        const response =
            await fetch(
                '/api/user/profile'
            );
        const result =
            await response.json();
        if(result.success){
            document.getElementById(
                "welcomeText"
            ).innerText =
            `Welcome ${result.user.name}`;
        }
        else{

            window.location.href =
                "/rg.html";
        }
    }
    catch(error){
        console.log(error);
    }
}
loadUserProfile();

document.getElementById(
    "logoutBtn"
).addEventListener(
    "click",
    logout
);

async function logout(){
    try{
        const response =
            await fetch(
                '/api/admin/logout',
                {
                    method:'POST'
                }
            );
        const result =
            await response.json();
        if(result.success){
            window.location.href =
                "/rg.html";
        }
    }
    catch(error){
        console.log(error);
    }
}

const navItems =
    document.querySelectorAll(
        ".navItem"
    );

navItems.forEach(item => {

    item.addEventListener(
        "click",
        () => {

            navItems.forEach(nav => {
                nav.classList.remove(
                    "activeNav"
                );
            });

            item.classList.add(
                "activeNav"
            );

            const text =
                item.innerText
                .trim()
                .toLowerCase();

            if(
                text.includes("plans")
            ){

                loadInsurances();

            }

            else if(text.includes("customer")){
                loadCustomers();
            }
            else if(text.includes("payments")){
                loadPayments();
            }
            else if(text.includes("dashboard")){
                loadDashboard();
            }
        }
    );

});

document.getElementById(
    "plansNav"
).addEventListener(
    "click",
    loadInsurances
);

document.getElementById(
    "plansNav"
).addEventListener(
    "click",
    loadInsurances
);

async function loadInsurances(){
    try{
        const response =
            await fetch(
                "/api/user/insurances"
            );
        const result =
            await response.json();
        if(result.success){
            const insurances =
                result.insurances;
            let html = `
            <div id="insuranceSection">
                <div id="insuranceTopBar">
                    <h2 id="insuranceHeading">
                        My Insurance Plans
                    </h2>
                    <button id="addPlanBtn">
                        <i class="fa-solid fa-plus"></i>
                        Add Plan
                    </button>
                </div>
                <div id="insuranceTableContainer">
                    <table id="insuranceTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Company</th>
                                <th>Type</th>
                                <th>IRDAI</th>
                                <th>GST</th>
                                <th>Claim Type</th>
                                <th>Claim Time</th>
                                <th>Support</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            if(insurances.length === 0){
                html += `
                <tr>
                    <td
                        colspan="9"
                        class="noInsuranceData"
                    >
                        No Insurance Plans Found
                    </td>
                </tr>
                `;
            }
            else{
                insurances.forEach(item=>{
                    html += `
                    <tr>
                        <td>
                            ${item.id}
                        </td>
                        <td>
                            ${item.comp_name}
                        </td>
                        <td>
                            ${item.comp_type}
                        </td>
                        <td>
                            ${item.irdai}
                        </td>
                        <td>
                            ${item.gst}
                        </td>
                        <td>
                            ${item.claim_type}
                        </td>
                        <td>
                            ${item.claim_time}
                        </td>
                        <td>
                            ${item.cust_sup_num}
                        </td>
                        <td>
                            ${item.email_sup}
                        </td>
                    </tr>
                    `;
                });
            }
            html += `
                        </tbody>
                    </table>
                </div>
            </div>
            `;
            document.getElementById(
                "mainContainer"
            ).innerHTML = html;
            document.getElementById(
                "addPlanBtn"
            ).addEventListener(
                "click",
                openInsuranceModal
            );
        }
    }
    catch(error){
        console.log(error);
    }
}

function openInsuranceModal(){
    document.getElementById(
        "insuranceModal"
    ).style.display = "flex";
}

function closeInsuranceModal(){
    document.getElementById(
        "insuranceModal"
    ).style.display = "none";
}

document.addEventListener("submit",
    async function(e){
        if(e.target.id ==="insuranceForm")
        {
            e.preventDefault();
            try{
                const formData =
                    new FormData(
                        e.target
                    );
                const response =
                    await fetch(
                        "/api/add/insurance",
                        {
                            method:"POST",
                            body:formData
                        }
                    );
                const result =
                    await response.json();
                if(result.success){
                    alert(
                        "Insurance Added Successfully"
                    );
                    closeInsuranceModal();
                    loadInsurances();
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
    }
);

async function loadCustomers(){

    try{

        const response =
            await fetch(
                '/api/insurance/customers'
            );

        const result =
            await response.json();

        let html = `
        <div id="customerSection">

            <div id="customerTopBar">

                <h2>
                    Insurance Customers
                </h2>

            </div>

            <div id="customerTableContainer">

                <table id="customerTable">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Plan</th>
                            <th>Policy</th>
                            <th>Coverage</th>
                            <th>Premium</th>
                            <th>Status</th>
                            <th>Payment</th>

                        </tr>

                    </thead>

                    <tbody>
        `;

        if(
            result.success &&
            result.customers.length > 0
        ){

            result.customers.forEach(
                customer => {

                html += `
                <tr>

                    <td>
                        ${customer.id}
                    </td>

                    <td>
                        ${customer.full_name}
                    </td>

                    <td>
                        ${customer.email}
                    </td>

                    <td>
                        ${customer.phone}
                    </td>

                    <td>
                        ${customer.plan_name}
                    </td>

                    <td>
                        ${customer.policy_number}
                    </td>

                    <td>
                        ₹${customer.coverage_amount}
                    </td>

                    <td>
                        ₹${customer.premium_amount}
                    </td>

                    <td>
                        ${customer.insurance_status}
                    </td>

                    <td>
                        ${customer.payment_status}
                    </td>

                </tr>
                `;
            });

        }
        else{

            html += `
            <tr>

                <td colspan="10">

                    No Customers Found

                </td>

            </tr>
            `;
        }

        html += `
                    </tbody>

                </table>

            </div>

        </div>
        `;

        document.getElementById(
            "mainContainer"
        ).innerHTML = html;

    }
    catch(error){

        console.log(error);

    }

}

async function loadPayments(){

    try{

        document.getElementById(
            "mainContainer"
        ).innerHTML = `

        <div id="paymentsSection">

            <div id="paymentsTopBar">

                <h2>
                    Payment History
                </h2>

            </div>

            <div class="paymentsTableContainer">

                <table class="paymentsTable">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Amount</th>
                            <th>Razorpay Payment ID</th>
                            <th>Status</th>
                            <th>Paid At</th>

                        </tr>

                    </thead>

                    <tbody id="paymentsTableBody">

                    </tbody>

                </table>

            </div>

        </div>
        `;

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
                                payment.paid_at
                                ?
                                new Date(
                                    payment.paid_at
                                ).toLocaleString()
                                :
                                'N/A'
                            }
                        </td>

                    </tr>
                    `;

                }
            );

        }
        else{

            tbody.innerHTML = `
            <tr>

                <td colspan="5">

                    No Payments Found

                </td>

            </tr>
            `;

        }

    }
    catch(error){

        console.log(error);

    }

}

async function loadDashboard(){

    try{

        const [
            insuranceResponse,
            customerResponse,
            paymentResponse
        ] = await Promise.all([

            fetch('/api/user/insurances'),
            fetch('/api/insurance/customers'),
            fetch('/api/vendor/payments')

        ]);

        const insuranceResult =
        await insuranceResponse.json();

        const customerResult =
        await customerResponse.json();

        const paymentResult =
        await paymentResponse.json();

        const totalPolicies =
        insuranceResult.insurances
        ?
        insuranceResult.insurances.length
        :
        0;

        const totalCustomers =
        customerResult.customers
        ?
        customerResult.customers.length
        :
        0;

        const totalPayments =
        paymentResult.payments
        ?
        paymentResult.payments.reduce(
            (sum,p)=>
            sum + Number(p.amount || 0),
            0
        )
        :
        0;

        const activePolicies =
        customerResult.customers
        ?
        customerResult.customers.filter(
            c=>c.insurance_status === 'active'
        ).length
        :
        0;

        document.getElementById(
            "mainContainer"
        ).innerHTML = `

        <div id="dashboardPage">

            <div id="dashboardHeader">

                <div>

                    <h2 id="dashboardTitle">
                        Dashboard
                    </h2>

                    <p id="dashboardSubTitle">
                        Welcome back, SecureLife Insurance
                    </p>

                </div>

            </div>

            <div id="dashboardCards">

                <div class="dashboardCard">

                    <div class="dashboardIcon blueCard">
                        <i class="fa-solid fa-shield-heart"></i>
                    </div>

                    <div>

                        <h3>
                            ${totalPolicies}
                        </h3>

                        <p>
                            Total Policies
                        </p>

                    </div>

                </div>

                <div class="dashboardCard">

                    <div class="dashboardIcon pinkCard">
                        <i class="fa-solid fa-users"></i>
                    </div>

                    <div>

                        <h3>
                            ${totalCustomers}
                        </h3>

                        <p>
                            Total Customers
                        </p>

                    </div>

                </div>

                <div class="dashboardCard">

                    <div class="dashboardIcon blueCard">
                        <i class="fa-solid fa-wallet"></i>
                    </div>

                    <div>

                        <h3>
                            ₹${totalPayments.toLocaleString()}
                        </h3>

                        <p>
                            Total Revenue
                        </p>

                    </div>

                </div>

                <div class="dashboardCard">

                    <div class="dashboardIcon pinkCard">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>

                    <div>

                        <h3>
                            ${activePolicies}
                        </h3>

                        <p>
                            Active Policies
                        </p>

                    </div>

                </div>

            </div>

            <div id="dashboardCharts">

                <div class="chartBox">

                    <div class="chartHeader">
                        Earnings Overview
                    </div>

                    <canvas id="earningsChart"></canvas>

                </div>

                <div class="chartBox">

                    <div class="chartHeader">
                        Policy Status
                    </div>

                    <canvas id="policyChart"></canvas>

                </div>

            </div>

            <div class="dashboardTables">

                <div class="dashboardTableBox">

                    <div class="chartHeader">
                        Recent Customers
                    </div>

                    <table>

                        <thead>

                            <tr>

                                <th>ID</th>
                                <th>Name</th>
                                <th>Plan</th>
                                <th>Status</th>

                            </tr>

                        </thead>

                        <tbody>

                        ${
                            customerResult.customers
                            ?
                            customerResult.customers
                            .slice(0,5)
                            .map(customer=>`

                                <tr>

                                    <td>
                                        ${customer.id}
                                    </td>

                                    <td>
                                        ${customer.full_name}
                                    </td>

                                    <td>
                                        ${customer.plan_name}
                                    </td>

                                    <td>
                                        ${customer.insurance_status}
                                    </td>

                                </tr>

                            `).join('')
                            :
                            ''
                        }

                        </tbody>

                    </table>

                </div>

                <div class="dashboardTableBox">

                    <div class="chartHeader">
                        Recent Payouts
                    </div>

                    <table>

                        <thead>

                            <tr>

                                <th>ID</th>
                                <th>Amount</th>
                                <th>Status</th>

                            </tr>

                        </thead>

                        <tbody>

                        ${
                            paymentResult.payments
                            ?
                            paymentResult.payments
                            .slice(0,5)
                            .map(payment=>`

                                <tr>

                                    <td>
                                        ${payment.id}
                                    </td>

                                    <td>
                                        ₹${payment.amount}
                                    </td>

                                    <td>
                                        ${payment.payout_status}
                                    </td>

                                </tr>

                            `).join('')
                            :
                            ''
                        }

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
        `;

        const earningsChart =
        document.getElementById(
            'earningsChart'
        );

        new Chart(
            earningsChart,
            {
                type:'line',

                data:{
                    labels:[
                        'Jan',
                        'Feb',
                        'Mar',
                        'Apr',
                        'May',
                        'Jun'
                    ],

                    datasets:[{
                        label:'Revenue',

                        data:[
                            12000,
                            19000,
                            15000,
                            25000,
                            30000,
                            totalPayments
                        ],

                        borderColor:'#4f46e5',

                        backgroundColor:
                        'rgba(79,70,229,0.1)',

                        tension:0.4,

                        fill:true
                    }]
                },

                options:{
                    responsive:true,
                    maintainAspectRatio:false
                }
            }
        );

        const policyChart =
        document.getElementById(
            'policyChart'
        );

        new Chart(
            policyChart,
            {
                type:'doughnut',

                data:{
                    labels:[
                        'Active',
                        'Pending',
                        'Expired'
                    ],

                    datasets:[{
                        data:[
                            activePolicies,
                            5,
                            2
                        ],

                        backgroundColor:[
                            '#22c55e',
                            '#3b82f6',
                            '#f97316'
                        ]
                    }]
                },

                options:{
                    responsive:true,
                    maintainAspectRatio:false
                }
            }
        );

    }
    catch(error){

        console.log(error);

    }

}