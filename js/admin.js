    let revenueChart;
    let vendorChart;
    let userTypeRevenueChart;
    let bookingChart;
    let bedsChart;

    async function loadAdminProfile() {
        try {
            const response = await fetch('/api/admin/profile');
            const result = await response.json();
            if (result.success) {
                document.getElementById("welcomeText").innerText =
                    `Welcome ${result.admin.name}`;
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error(error);

        }
    }
    loadAdminProfile();

    async function logout(){
        try{
            const response = await fetch('/api/admin/logout', {
                method: 'POST'
            });
            const result = await response.json();
            if(result.success){
                window.location.href = "rg.html";
            }
            else{
                alert(result.message);
            }
        }
        catch(error){
            console.error(error);
        }
    }

    const vendorsBtn =
    document.getElementById(
        "vendorsBtn"
    );

    vendorsBtn.addEventListener(
        "click",
        () => {

        hideAllSections();

        document.getElementById(
            "vendorsSection"
        ).style.display = "block";

        loadVendors();

    });

    const usersBtn =
    document.getElementById(
        "usersBtn"
    );

    usersBtn.addEventListener(
        "click",
        () => {

        hideAllSections();

        document.getElementById(
            "usersSection"
        ).style.display = "block";

        loadUsers();

    });

    async function loadVendors() {
        try {
            const response = await fetch('/api/vendors');
            const result = await response.json();
            if (result.success) {
                const tbody =
                    document.getElementById("vendorTableBody");
                tbody.innerHTML = "";
                if (result.vendors.length === 0) {
                    tbody.innerHTML = `
                    <tr>
                        <td data-label="Name"  colspan="8" class="noData">
                            No Vendors Found
                        </td>
                    </tr>
                    `;
                    return;
                }
                result.vendors.forEach(vendor => {
                    const status = String(vendor.status || '').toLowerCase();
                    const revenue = parseFloat(vendor.revenue || 0);
                    tbody.innerHTML += `
                    <tr>
                        <td data-label="Name" >
                            <img 
                                src="/uploads/${vendor.profile_photo}" 
                                class="profileImage"
                                onerror="this.src='default.png'"
                            >
                        </td>
                        <td data-label="Name" >
                            <div class="vendorNameBox">
                                <span class="vendorName">
                                    ${vendor.name}
                                </span>
                            </div>
                        </td>
                        <td data-label="Name" >
                            <span class="vendorEmail">
                                ${vendor.emailorcontact}
                            </span>
                        </td>
                        <td data-label="Name" >
                            <span class="vendorType">
                                ${vendor.users_type}
                            </span>
                        </td>
                        <td data-label="Name" >
                            <span class="vendorRevenue">
                                ₹${vendor.revenue || 0}
                                <br>
                                <small>
                                Original:
                                ₹${vendor.originalRevenue || 0}
                                </small>
                                <br>
                                <small>
                                Commission:
                                ₹${vendor.commissionAmount || 0}
                                (${vendor.commissionPercent || 0}%)
                                </small>
                            </span>
                        </td>
                        <td data-label="Name" >
                            <span class="
                                statusBadge
                                ${status === 'approved'
                                    ? 'activeStatus'
                                    : 'inactiveStatus'}
                            ">
                                ${vendor.status || 'pending'}
                            </span>
                        </td>
                        <td data-label="Name" >
                            <div class="actionButtons">
                                <button
                                    class="viewBtn"
                                    onclick="viewVendorDetails(${vendor.id})"
                                >
                                    <i class="fa-solid fa-eye"></i>
                                    View
                                </button>
                                ${
                                    status === 'approved'
                                    ?
                                    `
                                    <button 
                                        class="deactivateBtn"
                                        onclick="updateVendorStatus(
                                            ${vendor.id},
                                            'pending'
                                        )"
                                    >
                                        <i class="fa-solid fa-ban"></i>
                                        Deactivate
                                    </button>
                                    <button
                                        class="paymentBtn"
                                        onclick="
                                            makeVendorPayment(
                                                ${vendor.id},
                                                ${revenue}
                                            )
                                        "
                                    >
                                        <i class="fa-solid fa-money-bill"></i>
                                        Make Payment
                                    </button>
                                    `
                                    :
                                    `
                                    <button 
                                        class="approveBtn"
                                        onclick="updateVendorStatus(
                                            ${vendor.id},
                                            'approved'
                                        )"
                                    >
                                        <i class="fa-solid fa-check"></i>
                                        Approve
                                    </button>
                                    `
                                }
                            </div>
                        </td>
                        <td data-label="Name"  class="invoiceColumn">
                            <button
                                class="invoiceBtn"
                                onclick="downloadVendorInvoice('${vendor.id}')"
                            >
                                <i class="fa-solid fa-file-invoice"></i>
                                Download
                            </button>
                        </td>
                    </tr>
                    `;
                });
            }
            else {
                alert(result.message);
            }
        }
        catch (error) {
            console.log(error);
            alert("Failed to load vendors");
        }
    }

    document.getElementById("vendorSearch").addEventListener("keyup", function(){
        const value = this.value.toLowerCase();
        const rows = document.querySelectorAll("#vendorTableBody tr");
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(value) ? "" : "none";
        });
    });

    async function updateVendorStatus(id, status){
        try{
            const response = await fetch(`/api/vendor/status/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: status
                })
            });
            const result = await response.json();
            if(result.success){
                loadVendors();
            }
            else{
                alert(result.message);
            }
        }
        catch(error){
            console.log(error);
        }
    }

    async function loadUsers(){
        try{
            const response = await fetch('/api/users');
            const result = await response.json();
            if(result.success){
                const tbody = document.getElementById("usersTableBody");
                tbody.innerHTML = "";
                result.users.forEach(user => {
                    tbody.innerHTML += `
                    <tr>
                        <td data-label="Name" >
                            <img 
                                src="/uploads/${user.profile_photo}" 
                                class="profileImage"
                            >
                        </td>
                        <td data-label="Name" >${user.name}</td>
                        <td data-label="Name" >${user.emailorcontact}</td>
                        <td data-label="Name" >${user.users_type}</td>
                        <td data-label="Name" >
                            <span class="statusBadge activeStatus">
                                ${user.status}
                            </span>
                        </td>
                    </tr>
                    `;
                });
            }
            else{
                alert(result.message);
            }
        }
        catch(error){
            console.log(error);
        }
    }

    document.getElementById("userSearch").addEventListener("keyup", function(){
        const value = this.value.toLowerCase();
        const rows = document.querySelectorAll("#usersTableBody tr");
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(value)
                ? ""
                : "none";
        });
    });

    const menuItems = document.querySelectorAll(".menuItem");
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            menuItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
        });
    });

    async function viewVendorDetails(id) {
        try {
            const response = await fetch(
                `/api/vendor/details/${id}`
            );
            const result = await response.json();
            if (result.success) {
                const user = result.user;
                const details = result.details || {};
                const modal =
                    document.getElementById(
                        "vendorDetailsModal"
                    );
                const content =
                    document.getElementById(
                        "vendorDetailsContent"
                    );
                let html = `
                <div class="vendorDetailGrid">
                    <div class="vendorCard">
                        <h3>Basic Details</h3>
                        <img 
                            src="/uploads/${user.profile_photo}"
                            class="detailProfileImage"
                        >
                        <p>
                            <b>Name:</b>
                            ${user.name}
                        </p>
                        <p>
                            <b>Email:</b>
                            ${user.emailorcontact}
                        </p>
                        <p>
                            <b>User Type:</b>
                            ${user.users_type}
                        </p>
                        <p>
                            <b>Status:</b>
                            ${user.status}
                        </p>
                    </div>
                `;
                for (let key in details) {
                    if (
                        details[key] === null
                        ||
                        details[key] === ""
                    ) {
                        continue;
                    }
                    html += `
                    <div class="vendorCard">
                        <h3>${key}</h3>
                    `;
                    if (
                        typeof details[key] === 'string'
                        &&
                        (
                            details[key].includes('.png')
                            ||
                            details[key].includes('.jpg')
                            ||
                            details[key].includes('.jpeg')
                            ||
                            details[key].includes('.jfif')
                        )
                    ) {
                        html += `
                        <img
                            src="/uploads/${details[key]}"
                            class="detailImage"
                        >
                        `;
                    }
                    else if (
                        typeof details[key] === 'string'
                        &&
                        (
                            details[key].startsWith('[')
                            ||
                            details[key].startsWith('{')
                        )
                    ) {
                        try {
                            const parsed =
                                JSON.parse(details[key]);
                            html += `
                            <pre>
    ${JSON.stringify(parsed, null, 2)}
                            </pre>
                            `;
                        }
                        catch {
                            html += `
                            <p>${details[key]}</p>
                            `;
                        }
                    }
                    else {
                        html += `
                        <p>${details[key]}</p>
                        `;
                    }
                    html += `
                    </div>
                    `;
                }
                html += `
                </div>
                `;
                content.innerHTML = html;
                modal.style.display = "flex";
            }
            else {
                alert(result.message);
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    document.getElementById(
        "closeVendorModal"
    ).addEventListener("click", () => {
        document.getElementById(
            "vendorDetailsModal"
        ).style.display = "none";
    });

    document.getElementById(
        "bookingsBtn"
    ).addEventListener(
        "click",
        () => {

        hideAllSections();

        document.getElementById(
            "bookingsSection"
        ).style.display = "block";

        loadBookings();

    });

    async function loadBookings(){

        try{

            const response =
                await fetch(
                    '/api/admin/bookings'
                );

            const result =
                await response.json();

            const tbody =
                document.getElementById(
                    "bookingsTableBody"
                );

            tbody.innerHTML = "";

            result.bookings.forEach(
                booking => {

                tbody.innerHTML += `
                <tr>

                    <td data-label="Booking ID" >
                        #${booking.id}
                    </td>

                    <td data-label="User" >
                        ${booking.user_name}
                    </td>

                    <td data-label="Type" >
                        ${booking.type}
                    </td>

                    <td data-label="Amount" >
                        ₹${booking.total_amount}
                    </td>

                    <td data-label="Status" >
                        ${booking.status}
                    </td>

                    <td data-label="Date" >
                        ${new Date(
                            booking.created_at
                        ).toLocaleDateString()}
                    </td>

                </tr>
                `;
            });

        }
        catch(error){

            console.log(error);

        }

    }

    document.getElementById(
        "ordersBtn"
    ).addEventListener(
        "click",
        () => {

        hideAllSections();

        document.getElementById(
            "ordersSection"
        ).style.display = "block";

        loadOrders();

    });

    async function loadOrders(){

        try{

            const response =
                await fetch(
                    '/api/admin/orders'
                );

            const result =
                await response.json();

            const tbody =
                document.getElementById(
                    "ordersTableBody"
                );

            tbody.innerHTML = "";

            result.orders.forEach(order => {

                tbody.innerHTML += `
                <tr>

                    <td data-label="Order ID" >
                        #${order.id}
                    </td>

                    <td data-label="User" >
                        ${order.user_name}
                    </td>

                    <td data-label="Type" >
                        ${order.type}
                    </td>

                    <td data-label="Amount" >
                        ₹${order.total_amount}
                    </td>

                    <td data-label="Payment" >
                        ${order.payment_status}
                    </td>

                    <td data-label="Status" >
                        ${order.order_status}
                    </td>

                </tr>
                `;
            });

        }
        catch(error){

            console.log(error);

        }

    }

    document.getElementById(
        "revenueBtn"
    ).addEventListener(
        "click",
        () => {

        hideAllSections();

        document.getElementById(
            "revenueSection"
        ).style.display = "block";

        loadRevenue();

    });

    async function loadRevenue(){

        try{

            const response =
            await fetch(
                '/api/admin/revenue'
            );

            const result =
            await response.json();

            if(!result.success){

                alert(result.message);

                return;

            }

            document.getElementById(
                "incomingAmount"
            ).innerText =
            `₹${result.totalIncoming}`;

            document.getElementById(
                "vendorPaidAmount"
            ).innerText =
            `₹${result.totalPaid}`;

            document.getElementById(
                "platformRevenueAmount"
            ).innerText =
            `₹${result.platformRevenue}`;

            const tbody =
            document.getElementById(
                "revenueTableBody"
            );

            tbody.innerHTML = "";

            result.vendors.forEach(vendor => {

                tbody.innerHTML += `
                <tr>

                    <td data-label="Seller Name" >
                        ${vendor.name}
                    </td>

                    <td data-label="Seller Type" >
                        ${vendor.users_type}
                    </td>

                    <td data-label="Incoming" >
                        ₹${vendor.originalRevenue}
                    </td>

                    <td data-label="commission" >
                        ₹${vendor.commissionAmount}
                        (${vendor.commissionPercent}%)
                    </td>

                    <td data-label="Vendor amount" >
                        ₹${vendor.vendorAmount}
                    </td>

                    <td data-label="Paid" >
                        ₹${vendor.paidAmount}
                    </td>

                    <td data-label="Remaining" >
                        ₹${vendor.remainingAmount}
                    </td>

                </tr>
                `;

            });

        }
        catch(error){

            console.log(error);

        }

    }

    document.getElementById(
        "commissionBtn"
    ).addEventListener(
        "click",
        () => {

        hideAllSections();

        document.getElementById(
            "commissionSection"
        ).style.display = "block";

        loadCommissions();

    });

    async function loadCommissions(){

        try{

            const response =
            await fetch(
                '/api/admin/commissions'
            );

            const result =
            await response.json();

            const tbody =
            document.getElementById(
                "commissionTableBody"
            );

            tbody.innerHTML = "";

            result.commissions.forEach(item => {

                tbody.innerHTML += `
                <tr>

                    <td data-label="Name" >
                        ${item.user_type}
                    </td>

                    <td data-label="Name" >

                        <input
                            type="number"
                            value="${item.commission_percent}"
                            id="commission_${item.id}"
                            class="commissionInput"
                        >

                    </td>

                    <td data-label="Name" >

                        <button
                            class="approveBtn"
                            onclick="
                                updateCommission(
                                    ${item.id}
                                )
                            "
                        >

                            Update

                        </button>

        <button
            onclick="
                updateCommission(
                    '${item.user_type}',
                    ${item.id}
                )
            "
            class="approveBtn"
        >
            Save
        </button>

    </td>

                </tr>
                `;
            });

        }
        catch(error){

            console.log(error);

        }

    }

    async function updateCommission(
        userType,
        id
    ){

        const commission =
        document.getElementById(
            `commission_${id}`
        ).value;

        const response =
        await fetch(
            '/api/admin/update-commission',
            {

                method:'POST',

                headers:{
                    'Content-Type':
                    'application/json'
                },

                body:JSON.stringify({

                    user_type:userType,

                    commission_percent:
                    commission

                })

            }
        );

        const result =
        await response.json();

        if(result.success){

            alert(
                "Commission Updated"
            );

        }
        else{

            alert(
                result.message
            );

        }

    }

    document.getElementById(
        "paymentBtn"
    ).addEventListener(
        "click",
        () => {

        hideAllSections();

        document.getElementById(
            "paymentsSection"
        ).style.display = "block";

        loadPayments();

    });

    async function loadPayments(){

        try{

            const response =
                await fetch(
                    '/api/admin/payments'
                );

            const result =
                await response.json();

            const tbody =
                document.getElementById(
                    "paymentsTableBody"
                );

            tbody.innerHTML = "";

            let totalRevenue = 0;

            result.payments.forEach(payment => {

                totalRevenue +=
                    Number(payment.amount);

                tbody.innerHTML += `
                <tr>

                    <td data-label="Payment ID" >
                        #${payment.id}
                    </td>

                    <td data-label="User Name" >
                        ${payment.user_name}
                    </td>

                    <td data-label="Payment For" >
                        ${payment.payment_for}
                    </td>

                    <td data-label="Method" >
                        ${payment.payment_method}
                    </td>

                    <td data-label="Transaction ID" >
                        ${payment.transaction_id}
                    </td>

                    <td data-label="Amount" >
                        ₹${payment.amount}
                    </td>

                    <td data-label="status" >
                        ${payment.payment_status}
                    </td>

                </tr>
                `;
            });

            document.getElementById(
                "totalRevenue"
            ).innerText =
                `Total Revenue : ₹${totalRevenue}`;

        }
        catch(error){

            console.log(error);

        }

    }

    document.getElementById(
        "productsBtn"
    ).addEventListener(
        "click",
        () => {

        hideAllSections();

        document.getElementById(
            "productsSection"
        ).style.display = "block";

        loadProducts();

    });

    async function loadProducts(){

        try{

            const response =
                await fetch(
                    '/api/admin/products'
                );

            const result =
                await response.json();

            const tbody =
                document.getElementById(
                    "productsTableBody"
                );

            tbody.innerHTML = "";

            if(
                result.products.length === 0
            ){

                tbody.innerHTML = `
                <tr>

                    <td data-label="Name" colspan="6">

                        No Products Found

                    </td>

                </tr>
                `;

                return;

            }

            result.products.forEach(product => {

                tbody.innerHTML += `
                <tr>

                    <td data-label="Prodcut ID" >
                        #${product.id}
                    </td>

                    <td data-label="Image" >

                        <img
                            src="/uploads/${product.image}"
                            class="profileImage"
                        >

                    </td>

                    <td data-label="Product Name" >

                        ${product.product_name}

                        <br>

                        <small>
                            ${product.type}
                        </small>

                    </td>

                    <td data-label="Seller Name" >
                        ${product.vendor_name}
                    </td>

                    <td data-label="Price" >
                        ₹${product.price}
                    </td>

                    <td data-label="Stock" >
                        ${product.stock}
                    </td>

                </tr>
                `;
            });

        }
        catch(error){

            console.log(error);

        }

    }

    function hideAllSections(){

        document.getElementById(
            "vendorsSection"
        ).style.display = "none";

        document.getElementById(
            "usersSection"
        ).style.display = "none";

        document.getElementById(
            "bookingsSection"
        ).style.display = "none";

        document.getElementById(
            "ordersSection"
        ).style.display = "none";

        document.getElementById(
            "paymentsSection"
        ).style.display = "none";

        document.getElementById(
            "productsSection"
        ).style.display = "none";
        
        document.getElementById(
            "commissionSection"
        ).style.display = "none";

        document.getElementById(
            "revenueSection"
        ).style.display = "none";

        document.getElementById(
            "dashboardSection"
        ).style.display = "none";

    }

    async function makeVendorPayment(vendorId, amount){

        try{

            if(!amount || amount <= 0){

                alert("No Revenue Available");

                return;

            }

            const response =
            await fetch(
                '/api/admin/create-vendor-payment',
                {
                    method:'POST',

                    credentials:'include',

                    headers:{
                        'Content-Type':
                        'application/json'
                    },

                    body:JSON.stringify({
                        vendorId,
                        amount
                    })
                }
            );

            const result =
            await response.json();

            if(!result.success){

                alert(
                    result.message
                );

                return;

            }

            const options = {

                key:
                result.key,

                amount:
                result.amount,

                currency:
                "INR",

                name:
                "Hospikare",

                description:
                "Vendor Payment",

                order_id:
                result.orderId,

    handler:
    async function(response){

        const verify =
        await fetch(
            '/api/admin/verify-vendor-payment',
            {

                method:'POST',

                credentials:'include',

                headers:{
                    'Content-Type':
                    'application/json'
                },

                body:JSON.stringify({

                    vendorId,
                    amount,

                    razorpay_payment_id:
                    response
                    .razorpay_payment_id

                })

            }
        );

        const verifyResult =
        await verify.json();

        if(verifyResult.success){

            alert(
                "Payment Successful"
            );

            loadVendors();

        }
        else{

            alert(
                "Payment Save Failed"
            );

        }

    },

                theme:{
                    color:"#3399cc"
                }
            };

            const rzp =
            new Razorpay(options);

            rzp.open();

        }
        catch(error){

            console.log(error);

            alert(
                "Payment Failed"
            );

        }

    }

    async function downloadVendorInvoice(vendorId) {
        try {
            const response = await fetch(`/api/admin/vendor-invoice/${vendorId}`);
            const result = await response.json();

            if (!result.success) {
                alert(result.message);
                return;
            }

            const { vendor, payouts, total } = result;
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            const primaryColor = [255, 77, 166];

            // ================= HEADER =================
            doc.setFillColor(...primaryColor);
            doc.rect(0, 0, 210, 45, "F");

            // ================= LOGO (Base64) =================
            const logoBase64 = "logo.png";

            try {
                doc.addImage(logoBase64, 'PNG', 15, 8, 35, 28);   // Adjust size if needed
            } catch (e) {
                // Agar base64 error aaye to fallback
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(15, 8, 35, 28, 5, 5, "F");
                doc.setTextColor(...primaryColor);
                doc.setFontSize(18);
                doc.text("HK", 22, 24);
            }

            // Company Name
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(26);
            doc.text("HospiKare", 68, 22);

            doc.setFontSize(13);
            doc.text("Vendor Payment Invoice", 68, 33);

            // ================= VENDOR DETAILS =================
            let y = 58;
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);

            doc.text(`Invoice ID : INV-${vendor.id}`, 20, y);
            doc.text(`Date : ${new Date().toLocaleDateString('en-IN')}`, 135, y);
            y += 10;

            doc.text(`Vendor Name : ${vendor.name || 'N/A'}`, 20, y); y += 8;
            doc.text(`Email/Contact : ${vendor.emailorcontact || 'N/A'}`, 20, y); y += 8;
            doc.text(`Vendor Type : ${vendor.users_type || 'N/A'}`, 20, y); y += 8;
            doc.text(`Status : ${vendor.status || 'N/A'}`, 20, y); y += 18;

            // ================= TABLE =================
            const tableData = payouts.length > 0 ? payouts.map(p => [
                p.id.toString(),
                p.razorpay_payment_id || 'N/A',
                `₹${Number(p.amount || 0).toFixed(2)}`,
                p.payout_status || 'Paid',
                p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-IN') : '-'
            ]) : [['-', '-', '₹0.00', 'No Payouts Yet', '-']];

            doc.autoTable({
                startY: y,
                head: [["Payout ID", "Transaction ID", "Amount", "Status", "Date"]],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: primaryColor,
                    textColor: [255, 255, 255],
                    fontSize: 11
                },
                bodyStyles: { fontSize: 10, halign: 'center' },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } },
                margin: { left: 20, right: 20 }
            });

            // ================= TOTAL =================
            const finalY = doc.lastAutoTable.finalY + 18;
            doc.setFontSize(16);
            doc.setTextColor(...primaryColor);
            doc.text(`Total Paid : ₹${Number(total).toFixed(2)}`, 125, finalY);

            // Footer
            doc.setFontSize(10);
            doc.setTextColor(80);
            doc.text("Thank you for being a trusted partner of HospiKare.", 40, 280);
            doc.setFontSize(9);
            doc.text("This is a computer generated document.", 65, 288);

            // Download
            doc.save(`HospiKare_Invoice_${vendor.id}.pdf`);

        } catch (error) {
            console.error(error);
            alert("PDF generate karne mein problem aa rahi hai");
        }
    }

    hideAllSections();

    document.getElementById(
        "dashboardSection"
    ).style.display = "block";

    loadDashboard();

    document.getElementById(
        "dashboardBtn"
    ).addEventListener(
        "click",
        () => {

        hideAllSections();

        document.getElementById(
            "dashboardSection"
        ).style.display = "block";

        loadDashboard();

    });

    async function loadDashboard() {

        try {

            const response =
            await fetch('/api/admin/dashboard');

            const result =
            await response.json();

            if (!result.success){
                return;
            }

            const s = result.stats;

            const set = (id, val) => {

                const el =
                document.getElementById(id);

                if (el){
                    el.innerText = val;
                }

            };

            set("totalUsers", s.totalUsers);

            set("totalVendors", s.approvedVendors);

            set("totalHospitals", s.hospitals);

            set("totalLabs", s.labs);

            set("totalAmbulances", s.ambulances);

            set("totalInsurance", s.insurances);

            set("totalMedicines", s.medicines);

            set("totalEquipments", s.equipments);

            set(
                "dashboardRevenue",
                `₹${Number(
                    s.platformRevenue || 0
                ).toLocaleString('en-IN')}`
            );

            set(
                "dashboardCommission",
                `₹${Number(
                    s.totalCommission || 0
                ).toLocaleString('en-IN')}`
            );

            set("totalBeds", s.totalBeds);

            set("availableBeds", s.availableBeds);

            [revenueChart,
            vendorChart,
            userTypeRevenueChart,
            bookingChart,
            bedsChart].forEach(chart => {

                if(chart){
                    chart.destroy();
                }

            });

            /* ================= REVENUE CHART ================= */

            revenueChart =
            new Chart(
                document.getElementById(
                    "revenueChart"
                ),
                {

                type:'line',

                data:{

                    labels:[
                        'Revenue',
                        'Commission'
                    ],

                    datasets:[{

                        label:'Amount',

                        data:[

                            Number(
                                s.platformRevenue
                            ) || 0,

                            Number(
                                s.totalCommission
                            ) || 0

                        ],

                        borderColor:'#ff4f8b',

                        backgroundColor:
                        'rgba(255,79,139,0.15)',

                        fill:true,

                        tension:0.4,

                        borderWidth:5

                    }]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false

                }

            });

            /* ================= VENDOR CHART ================= */

            vendorChart =
            new Chart(
                document.getElementById(
                    "vendorChart"
                ),
                {

                type:'pie',

                data:{

                    labels:[
                        'Hospitals',
                        'Labs',
                        'Insurance',
                        'Medicines',
                        'Equipments'
                    ],

                    datasets:[{

                        data:[

                            s.hospitals,
                            s.labs,
                            s.insurances,
                            s.medicines,
                            s.equipments

                        ]

                    }]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false

                }

            });

            /* ================= USER TYPE REVENUE CHART ================= */

            userTypeRevenueChart =
            new Chart(
                document.getElementById(
                    "userTypeRevenueChart"
                ),
                {

                type:'pie',

                data:{

                    labels:[
                        'Hospitals',
                        'Labs',
                        'Insurance',
                        'Medicines',
                        'Equipments'
                    ],

                    datasets:[{

                        label:'Revenue',

                        data:[

                            Number(s.hospitalRevenue) || 0,
                            Number(s.labRevenue) || 0,
                            Number(s.insuranceRevenue) || 0,
                            Number(s.medicinesRevenue) || 0,
                            Number(s.equipmentsRevenue) || 0

                        ],

                        backgroundColor:[
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(153, 102, 255, 0.7)'
                        ],

                        borderColor:[
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)'
                        ],

                        borderWidth:1

                    }]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false,

                    plugins:{
                        legend:{
                            position:'bottom'
                        }
                    }

                }

            });

            /* ================= BOOKINGS CHART ================= */

            bookingChart =
            new Chart(
                document.getElementById(
                    "bookingChart"
                ),
                {

                type:'bar',

                data:{

                    labels:[
                        'Orders',
                        'Bookings'
                    ],

                    datasets:[{

                        label:'Count',

                        data:[

                            s.orders,
                            s.bookings

                        ]

                    }]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false

                }

            });

            /* ================= BEDS CHART ================= */

            bedsChart =
            new Chart(
                document.getElementById(
                    "bedsChart"
                ),
                {

                type:'doughnut',

                data:{

                    labels:[
                        'Available',
                        'Occupied'
                    ],

                    datasets:[{

                        data:[

                            s.availableBeds,

                            s.totalBeds
                            -
                            s.availableBeds

                        ]

                    }]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false

                }

            });

        }
        catch(error){

            console.log(error);

        }

    }

