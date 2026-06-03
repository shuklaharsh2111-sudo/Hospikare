async function loadUserProfile(){
    try{
        const response=await fetch('/api/user/profile');
        const result=await response.json();
        if(result.success){
            document.getElementById("welcomeText").innerText=`Welcome ${result.user.name}`;
        }
        else{
            window.location.href="/rg.html";
        }
    }
    catch(error){
        console.log(error);
    }
}
loadUserProfile();
loadDashboard();

document.getElementById("logoutBtn").addEventListener("click",logout);
async function logout(){
    try{
        const response=await fetch('/api/admin/logout',{
            method:'POST'
        });
        const result=await response.json();
        if(result.success){
            window.location.href="/rg.html";
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

navItems.forEach(item=>{

    item.addEventListener(
        "click",
        ()=>{

            navItems.forEach(nav=>{

                nav.classList.remove(
                    "activeNav"
                );

            });

            item.classList.add(
                "activeNav"
            );

            const text =
                item.innerText
                .toLowerCase();

            const medicineSection =
                document.getElementById(
                    "medicineSection"
                );

            if(medicineSection){

                medicineSection.style.display =
                    "none";

            }

            if(
                text.includes(
                    "dashboard"
                )
            ){

                loadDashboard();

            }

            else if(
                text.includes(
                    "medicines"
                )
            ){

                if(medicineSection){

                    medicineSection.style.display =
                        "block";

                }

                loadMedicines();

            }
            else if(text.includes("stock")){
                loadStock();
            }
            else if(
                text.includes(
                    "orders"
                )
            ){

                loadMedicineOrders();

            }

            else if(
                text.includes(
                    "payments"
                )
            ){

                loadVendorPayments();

            }

        }
    );

});




document.getElementById("addMedicineBtn").addEventListener("click",()=>{
    document.getElementById("medicineModal").style.display="flex";
});

document.getElementById("closeMedicineModal").addEventListener("click",()=>{
    document.getElementById("medicineModal").style.display="none";
});

document.getElementById("medicineForm").addEventListener("submit",async(e)=>{
    e.preventDefault();
    const formData=new FormData();
    const medicineName=document.getElementById("medicine_name").value.trim();
    formData.append("medicine_name",medicineName);
    formData.append("generic_name",document.getElementById("generic_name").value);
    formData.append("brand_name",document.getElementById("brand_name").value);
    formData.append("medicine_type",document.getElementById("medicine_type").value);
    formData.append("category",document.getElementById("category").value);
    formData.append("manufacturer",document.getElementById("manufacturer").value);
    formData.append("composition",document.getElementById("composition").value);
    formData.append("mrp",document.getElementById("mrp").value);
    formData.append("selling_price",document.getElementById("selling_price").value);
    formData.append("gst_percentage",document.getElementById("gst_percentage").value);
    formData.append("discount_percentage",document.getElementById("discount_percentage").value);
    formData.append("stock_quantity",document.getElementById("stock_quantity").value);
    formData.append("minimum_stock_alert",document.getElementById("minimum_stock_alert").value);
    formData.append("batch_number",document.getElementById("batch_number").value);
    formData.append("manufacturing_date",document.getElementById("manufacturing_date").value);
    formData.append("expiry_date",document.getElementById("expiry_date").value);
    formData.append("prescription_required",document.getElementById("prescription_required").value);
    formData.append("schedule_type",document.getElementById("schedule_type").value);
    formData.append("uses_info",document.getElementById("uses_info").value);
    formData.append("dosage_instructions",document.getElementById("dosage_instructions").value);
    formData.append("side_effects",document.getElementById("side_effects").value);
    formData.append("warnings",document.getElementById("warnings").value);
    formData.append("storage_instructions",document.getElementById("storage_instructions").value);
    formData.append("delivery_available",document.getElementById("delivery_available").value);
    formData.append("delivery_charge",document.getElementById("delivery_charge").value);
    formData.append("barcode_number",document.getElementById("barcode_number").value);
    formData.append("medicine_status",document.getElementById("medicine_status").value);
    formData.append("featured_medicine",document.getElementById("featured_medicine").value);
    if(medicineName===""){
        alert("Medicine Name Required");
        return;
    }
    if(document.getElementById("medicine_image").files[0]){
        formData.append(
            "medicine_image",
            document.getElementById("medicine_image").files[0]
        );
    }
    if(document.getElementById("medicine_excel_file").files[0]){
        formData.append(
            "medicine_excel_file",
            document.getElementById("medicine_excel_file").files[0]
        );
    }
    try{
        const response=await fetch('/api/add/medicine',{
            method:'POST',
            body:formData
        });
        const result=await response.json();
        if(result.success){
            alert(result.message);
            document.getElementById("medicineForm").reset();
            document.getElementById("medicineModal").style.display="none";
            loadMedicines();
        }
    }
    catch(error){
        console.log(error);
    }
});

async function loadMedicines(){

    try{

        console.log("Medicines Clicked");

        document.getElementById("mainContainer").innerHTML = `
            <div id="medicineSection">

                <div id="medicineTopBar">

                    <button id="addMedicineBtn">
                        <i class="fa-solid fa-plus"></i>
                        Add Medicine
                    </button>

                </div>

                <div id="medicineTableContainer">

                    <table id="medicineTable">

                        <thead>

                            <tr>
                                <th>ID</th>
                                <th>Medicine</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th>MRP</th>
                                <th>Selling</th>
                                <th>Stock</th>
                                <th>Status</th>
                            </tr>

                        </thead>

                        <tbody id="medicineTableBody">

                            <tr>
                                <td colspan="8">
                                    Loading Medicines...
                                </td>
                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>
        `;

        const addBtn =
            document.getElementById(
                "addMedicineBtn"
            );

        if(addBtn){

            addBtn.addEventListener(
                "click",
                ()=>{

                    const modal =
                        document.getElementById(
                            "medicineModal"
                        );

                    if(modal){

                        modal.style.display =
                            "flex";

                    }

                }
            );

        }

        const tbody =
            document.getElementById(
                "medicineTableBody"
            );

        const response =
            await fetch(
                "/api/medicines"
            );

        console.log(
            "Response Status:",
            response.status
        );

        const result =
            await response.json();

        console.log(
            "Medicines API:",
            result
        );

        tbody.innerHTML = "";

        if(
            !result.success
        ){

            tbody.innerHTML = `
                <tr>
                    <td colspan="8">
                        Failed To Load Medicines
                    </td>
                </tr>
            `;

            return;

        }

        if(
            !result.medicines ||
            result.medicines.length === 0
        ){

            tbody.innerHTML = `
                <tr>
                    <td colspan="8">
                        No Medicines Found
                    </td>
                </tr>
            `;

            return;

        }

        result.medicines.forEach(
            medicine=>{

                tbody.innerHTML += `
                    <tr>

                        <td>
                            ${
                                medicine.medicine_id
                                || "-"
                            }
                        </td>

                        <td>
                            ${
                                medicine.medicine_name
                                || "-"
                            }
                        </td>

                        <td>
                            ${
                                medicine.medicine_type
                                || "-"
                            }
                        </td>

                        <td>
                            ${
                                medicine.category
                                || "-"
                            }
                        </td>

                        <td>
                            ₹${
                                medicine.mrp
                                || 0
                            }
                        </td>

                        <td>
                            ₹${
                                medicine.selling_price
                                || 0
                            }
                        </td>

                        <td>
                            ${
                                medicine.stock_quantity
                                || 0
                            }
                        </td>

                        <td>
                            ${
                                medicine.medicine_status
                                || "-"
                            }
                        </td>

                    </tr>
                `;
            }
        );

    }
    catch(error){

        console.error(
            "Load Medicines Error:",
            error
        );

        document.getElementById(
            "mainContainer"
        ).innerHTML = `
            <div style="
                padding:30px;
                text-align:center;
                color:red;
                font-size:18px;
            ">
                Failed To Load Medicines
                <br><br>
                Check Browser Console (F12)
            </div>
        `;

    }

}

async function loadMedicineOrders(){

    try{

        const response =
            await fetch(
                '/api/medicine/orders'
            );

        const result =
            await response.json();

        let html = `
        <div id="ordersSection">

            <div id="ordersTopBar">

                <h2>
                    Medicine Orders
                </h2>

            </div>

            <div id="ordersTableContainer">

                <table id="ordersTable">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>User</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Medicine</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                            <th>Total</th>
                            <th>Order</th>
                            <th>Payment</th>

                        </tr>

                    </thead>

                    <tbody>
        `;

        if(
            result.success &&
            result.orders.length > 0
        ){

            result.orders.forEach(
                order => {

                html += `
                <tr>

                    <td>
                        ${order.id}
                    </td>

                    <td>
                        ${order.full_name}
                    </td>

                    <td>
                        ${order.email}
                    </td>

                    <td>
                        ${order.phone}
                    </td>

                    <td>
                        ${order.medicine_name}
                    </td>

                    <td>
                        ${order.quantity}
                    </td>

                    <td>
                        ₹${order.price}
                    </td>

                    <td>
                        ₹${order.subtotal}
                    </td>

                    <td>
                        ₹${order.total_amount}
                    </td>

                    <td>
                        ${order.order_status}
                    </td>

                    <td>
                        ${order.payment_status}
                    </td>

                </tr>
                `;
            });

        }
        else{

            html += `
            <tr>

                <td colspan="11">

                    No Orders Found

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

async function loadVendorPayments(){

    try{

        const response =
            await fetch(
                '/api/vendor/payments'
            );

        const result =
            await response.json();

        let html = `
        <div id="paymentsSection">

            <div id="paymentsTopBar">

                <h2>
                    Vendor Payments
                </h2>

            </div>

            <div id="paymentsTableContainer">

                <table id="paymentsTable">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Transaction ID</th>
                            <th>Date</th>

                        </tr>

                    </thead>

                    <tbody>
        `;

        if(
            result.success &&
            result.payments.length > 0
        ){

            result.payments.forEach(
                payment => {

                html += `
                <tr>

                    <td>
                        ${payment.id}
                    </td>

                    <td>
                        ₹${payment.amount}
                    </td>

                    <td>
                        ${payment.payment_method || '-'}
                    </td>

                    <td>
                        ${payment.payment_status || '-'}
                    </td>

                    <td>
                        ${payment.transaction_id || '-'}
                    </td>

                    <td>
                        ${
                            payment.paid_at
                            ?
                            new Date(payment.paid_at)
                            .toLocaleString()
                            :
                            '-'
                        }
                    </td>

                </tr>
                `;
            });

        }
        else{

            html += `
            <tr>

                <td colspan="6">

                    No Payments Found

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

async function loadDashboard(){

    try{

        const response =
            await fetch(
                '/api/vendor/dashboard'
            );

        const result =
            await response.json();

        if(!result.success){

            return;

        }

        const data =
            result.dashboard;

        let ordersHtml = '';

        if(data.recentOrders.length > 0){

            data.recentOrders.forEach(order=>{

                ordersHtml += `
                <tr>

                    <td>
                        #ORD${order.id}
                    </td>

                    <td>
                        ₹${order.total_amount}
                    </td>

                    <td>
                        ${order.order_status}
                    </td>

                </tr>
                `;
            });

        }
        else{

            ordersHtml = `
            <tr>

                <td colspan="3">
                    No Orders
                </td>

            </tr>
            `;

        }

        let paymentsHtml = '';

        if(data.recentPayments.length > 0){

            data.recentPayments.forEach(payment=>{

                paymentsHtml += `
                <tr>

                    <td>
                        ₹${payment.amount}
                    </td>

                    <td>
                        ${payment.payment_status}
                    </td>

                    <td>
                        ${
                            new Date(
                                payment.paid_at
                            ).toLocaleDateString()
                        }
                    </td>

                </tr>
                `;
            });

        }
        else{

            paymentsHtml = `
            <tr>

                <td colspan="3">
                    No Payments
                </td>

            </tr>
            `;

        }

        document.getElementById(
            "mainContainer"
        ).innerHTML = `

        <div id="dashboardSection">

            <div id="dashboardCards">

                <div class="dashboardCard">

                    <div class="dashboardIcon blueCard">
                        <i class="fa-solid fa-capsules"></i>
                    </div>

                    <div>

                        <h2>
                            ${data.totalProducts}
                        </h2>

                        <p>
                            Total Products
                        </p>

                        <span>
                            In Stock
                        </span>

                    </div>

                </div>

                <div class="dashboardCard">

                    <div class="dashboardIcon pinkCard">
                        <i class="fa-solid fa-cart-shopping"></i>
                    </div>

                    <div>

                        <h2>
                            ${data.totalOrders}
                        </h2>

                        <p>
                            Total Orders
                        </p>

                        <span>
                            This Month
                        </span>

                    </div>

                </div>

                <div class="dashboardCard">

                    <div class="dashboardIcon purpleCard">
                        <i class="fa-solid fa-indian-rupee-sign"></i>
                    </div>

                    <div>

                        <h2>
                            ₹${Number(data.totalRevenue).toLocaleString()}
                        </h2>

                        <p>
                            Total Sales
                        </p>

                        <span>
                            This Month
                        </span>

                    </div>

                </div>

                <div class="dashboardCard">

                    <div class="dashboardIcon redCard">
                        <i class="fa-solid fa-box"></i>
                    </div>

                    <div>

                        <h2>
                            ${data.totalStock}
                        </h2>

                        <p>
                            Total Stock
                        </p>

                        <span>
                            Available
                        </span>

                    </div>

                </div>

            </div>

            <div id="dashboardTables">

                <div class="dashboardTableBox">

                    <h3>
                        Recent Orders
                    </h3>

                    <table class="dashboardTable">

                        <thead>

                            <tr>

                                <th>
                                    Order ID
                                </th>

                                <th>
                                    Amount
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            ${ordersHtml}

                        </tbody>

                    </table>

                </div>

                <div class="dashboardTableBox">

                    <h3>
                        Recent Payments
                    </h3>

                    <table class="dashboardTable">

                        <thead>

                            <tr>

                                <th>
                                    Amount
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Date
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            ${paymentsHtml}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
        `;

    }
    catch(error){

        console.log(error);

    }

}

async function loadStock(){

    try{

        document.getElementById(
            "mainContainer"
        ).innerHTML = `

        <div id="stockSection">

            <div id="medicineTopBar">

                <button id="addStockBtn">
                    <i class="fa-solid fa-plus"></i>
                    Add Stock
                </button>

            </div>

            <div id="medicineTableContainer">

                <table id="medicineTable">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Medicine</th>
                            <th>Stock Qty</th>
                            <th>Minimum Alert</th>
                            <th>Batch No</th>
                            <th>Expiry Date</th>
                            <th>Status</th>

                        </tr>

                    </thead>

                    <tbody id="stockTableBody">

                        <tr>

                            <td colspan="7">
                                Loading Stock...
                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>
        `;

        const addStockBtn =
            document.getElementById(
                "addStockBtn"
            );

        if(addStockBtn){

            addStockBtn.addEventListener(
                "click",
                ()=>{

                    const modalTitle =
                        document.querySelector(
                            "#medicineModalHeader h2"
                        );

                    if(modalTitle){

                        modalTitle.innerText =
                            "Add Stock";

                    }

                    document.getElementById(
                        "medicineModal"
                    ).style.display =
                        "flex";

                }
            );

        }

        const tbody =
            document.getElementById(
                "stockTableBody"
            );

        const response =
            await fetch(
                "/api/medicines"
            );

        const result =
            await response.json();

        console.log(
            "Stock API:",
            result
        );

        tbody.innerHTML = "";

        if(
            !result.success
        ){

            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        Failed To Load Stock
                    </td>
                </tr>
            `;

            return;

        }

        if(
            !result.medicines ||
            result.medicines.length === 0
        ){

            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        No Stock Found
                    </td>
                </tr>
            `;

            return;

        }

        result.medicines.forEach(
            medicine=>{

                let status =
                    "In Stock";

                if(
                    Number(
                        medicine.stock_quantity
                    ) <=
                    Number(
                        medicine.minimum_stock_alert
                    )
                ){

                    status =
                        "Low Stock";

                }

                if(
                    Number(
                        medicine.stock_quantity
                    ) <= 0
                ){

                    status =
                        "Out Of Stock";

                }

                tbody.innerHTML += `

                <tr>

                    <td>
                        ${
                            medicine.medicine_id
                            || "-"
                        }
                    </td>

                    <td>
                        ${
                            medicine.medicine_name
                            || "-"
                        }
                    </td>

                    <td>
                        ${
                            medicine.stock_quantity
                            || 0
                        }
                    </td>

                    <td>
                        ${
                            medicine.minimum_stock_alert
                            || 0
                        }
                    </td>

                    <td>
                        ${
                            medicine.batch_number
                            || "-"
                        }
                    </td>

                    <td>
                        ${
                            medicine.expiry_date
                            ?
                            new Date(
                                medicine.expiry_date
                            ).toLocaleDateString()
                            :
                            "-"
                        }
                    </td>

                    <td>
                        ${status}
                    </td>

                </tr>

                `;

            }
        );

    }
    catch(error){

        console.error(
            "Load Stock Error:",
            error
        );

        document.getElementById(
            "mainContainer"
        ).innerHTML = `

            <div style="
                padding:30px;
                text-align:center;
                color:red;
                font-size:18px;
            ">

                Failed To Load Stock

            </div>

        `;

    }

}