document.addEventListener("click", (e) => {

    if(e.target.closest("#addProductBtn")){

        document.getElementById(
            "productModal"
        ).style.display = "flex";

    }

});

async function loadUserProfile(){
    try{
        const response =
            await fetch('/api/user/profile' );
        const result =
            await response.json();
        if(result.success){
            document.getElementById(
                "welcomeText"
            ).innerText =
            `Welcome ${result.user.name}`;
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
loadDashboard();

const defaultNav =
    document.querySelector(".navItem");

if(defaultNav){
    defaultNav.classList.add(
        "activeNav"
    );
}

document.getElementById(
    "logoutBtn"
).addEventListener(
    "click",
    logout
);

async function logout(){
    try{
        const response =
            await fetch('/api/admin/logout', {
                    method:'POST'
                }
            );
        const result =
            await response.json();
        if(result.success){
            window.location.href =  "/rg.html";
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

            if(text.includes("dashboard")){
                loadDashboard();
            }
            else if(
                text.includes(
                    "products"
                )
            ){

                loadProducts();

            }

            else if(
                text.includes(
                    "orders"
                )
            ){

                loadEquipmentOrders();

            }

            else if(
                text.includes(
                    "customer"
                )
            ){

                loadCustomers();

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



document.getElementById(
    "addProductBtn"
).addEventListener(
    "click",
    () => {
        document.getElementById(
            "productModal"
        ).style.display =
            "flex";
    }
);

document.getElementById(
    "closeProductModal"
).addEventListener(
    "click",
    () => {
        document.getElementById(
            "productModal"
        ).style.display =
            "none";
    }
);

document.getElementById(
    "productForm"
)
.addEventListener(
    "submit",
    async(e) => {
        e.preventDefault();
        const formData =
            new FormData();
        formData.append(
            "product_name",
            document.getElementById(
                "product_name"
            ).value
        );
        formData.append(
            "brand_name",
            document.getElementById(
                "brand_name"
            ).value
        );
        formData.append(
            "category",
            document.getElementById(
                "category"
            ).value
        );
        formData.append(
            "sub_category",
            document.getElementById(
                "sub_category"
            ).value
        );
        formData.append(
            "model_number",
            document.getElementById(
                "model_number"
            ).value
        );
        formData.append(
            "manufacturer",
            document.getElementById(
                "manufacturer"
            ).value
        );
        formData.append(
            "country_of_origin",
            document.getElementById(
                "country_of_origin"
            ).value
        );
        formData.append(
            "product_description",
            document.getElementById(
                "product_description"
            ).value
        );
        formData.append(
            "mrp",
            document.getElementById(
                "mrp"
            ).value
        );
        formData.append(
            "selling_price",
            document.getElementById(
                "selling_price"
            ).value
        );
        formData.append(
            "stock_quantity",
            document.getElementById(
                "stock_quantity"
            ).value
        );
        formData.append(
            "stock_status",
            document.getElementById(
                "stock_status"
            ).value
        );
        formData.append(
            "warranty_period",
            document.getElementById(
                "warranty_period"
            ).value
        );
        formData.append(
            "delivery_available",
            document.getElementById(
                "delivery_available"
            ).value
        );
        formData.append(
            "delivery_charge",
            document.getElementById(
                "delivery_charge"
            ).value
        );
        formData.append(
            "thumbnail_image",
            document.getElementById(
                "thumbnail_image"
            ).files[0]
        );
        formData.append(
            "product_manual",
            document.getElementById(
                "product_manual"
            ).files[0]
        );
        formData.append(
            "product_video",
            document.getElementById(
                "product_video"
            ).files[0]
        );
        try{
            const response = await fetch('/api/add/equipment-product',{
                        method:'POST',
                        body:formData
                    }
                );
            const result =
                await response.json();
            if(result.success){
                alert(
                    "Product Added"
                );
                document.getElementById(
                    "productModal"
                ).style.display =
                    "none";
                loadProducts();
            }
        }
        catch(error){
            console.log(error);
        }
    }
);

async function loadProducts(){

    try{

        const response =
            await fetch(
                '/api/equipment-products'
            );

        const result =
            await response.json();

        let html = `
        <div id="productsSection">

            <div id="topBar">

                <button id="addProductBtn">

                    <i class="fa-solid fa-plus"></i>

                    Add Product

                </button>

            </div>

            <div id="tableContainer">

                <table id="productsTable">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Image</th>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Brand</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>

                        </tr>

                    </thead>

                    <tbody>
        `;

        if(
            result.success &&
            result.products.length > 0
        ){

            result.products.forEach(product=>{

                html += `
                <tr>

                    <td>
                        ${product.product_id}
                    </td>

                    <td>

                        <img
                            src="/uploads/${product.thumbnail_image}"
                            class="productImage"
                        >

                    </td>

                    <td>
                        ${product.product_name}
                    </td>

                    <td>
                        ${product.category}
                    </td>

                    <td>
                        ${product.brand_name}
                    </td>

                    <td>
                        ₹${product.selling_price}
                    </td>

                    <td>
                        ${product.stock_quantity}
                    </td>

                    <td>
                        ${product.stock_status}
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

document.getElementById("mainContainer").innerHTML = html;

const addBtn = document.getElementById("addProductBtn");

if(addBtn){
    addBtn.addEventListener("click", () => {
        document.getElementById("productModal").style.display = "flex";
    });
}

    }
    catch(error){

        console.log(error);

    }

}

async function loadEquipmentOrders(){

    try{
        const response = await fetch('/api/equipment/orders');
        const result = await response.json();
        let html = `
        <div id="ordersSection">
            <div id="ordersTopBar">
                <h2>
                    Equipment Orders
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
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                            <th>Total</th>
                            <th>Type</th>
                            <th>Order</th>
                            <th>Payment</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        if(result.success &&result.orders.length > 0){
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
                        ${order.product_name}
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
                        ${order.order_type}
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
                <td colspan="12">
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
        document.getElementById("mainContainer").innerHTML = html;
    }
    catch(error){
        console.log(error);
    }
}

async function loadCustomers(){

    try{

        const response =
            await fetch(
                '/api/equipment/customers'
            );

        const result =
            await response.json();

        let html = `
        <div id="customersSection">

            <div id="customersTopBar">

                <h2>
                    Customers
                </h2>

            </div>

            <div id="customersTableContainer">

                <table id="customersTable">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Photo</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Gender</th>
                            <th>City</th>
                            <th>State</th>
                            <th>Total Orders</th>
                            <th>Total Spent</th>

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

                        <img
                            src="/uploads/${customer.profile_photo}"
                            class="customerImage"
                        >

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
                        ${customer.gender || '-'}
                    </td>

                    <td>
                        ${customer.city || '-'}
                    </td>

                    <td>
                        ${customer.state || '-'}
                    </td>

                    <td>
                        ${customer.total_orders}
                    </td>

                    <td>
                        ₹${customer.total_spent || 0}
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
                            <th>Transaction</th>
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
                            new Date(
                                payment.paid_at
                            ).toLocaleString()
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
                '/api/vendor/mdeqdashboard'
            );

        const result =
            await response.json();

        if(!result.success){

            return;

        }

        const data =
            result.dashboard;

        let recentOrders = '';

        if(
            data.recentOrders.length > 0
        ){

            data.recentOrders.forEach(order=>{

                recentOrders += `
                <tr>

                    <td>
                        #ORD${order.id}
                    </td>

                    <td>
                        ₹${order.total_amount}
                    </td>

                    <td>

                        <span class="statusBadge">

                            ${order.order_status}

                        </span>

                    </td>

                </tr>
                `;
            });

        }
        else{

            recentOrders = `
            <tr>

                <td colspan="3">

                    No Orders

                </td>

            </tr>
            `;
        }

        let recentPayments = '';

        if(
            data.recentPayments.length > 0
        ){

            data.recentPayments.forEach(payment=>{

                recentPayments += `
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

            recentPayments = `
            <tr>

                <td colspan="3">

                    No Payments

                </td>

            </tr>
            `;
        }

        const html = `

        <div id="dashboardSection">

            <div id="dashboardCards">

                <div class="dashboardCard">

                    <div class="cardIcon blueCard">

                        <i class="fa-solid fa-cube"></i>

                    </div>

                    <div>

                        <h2>
                            ${data.totalProducts}
                        </h2>

                        <p>
                            Total Products
                        </p>

                    </div>

                </div>

                <div class="dashboardCard">

                    <div class="cardIcon pinkCard">

                        <i class="fa-solid fa-cart-shopping"></i>

                    </div>

                    <div>

                        <h2>
                            ${data.totalOrders}
                        </h2>

                        <p>
                            Total Orders
                        </p>

                    </div>

                </div>

                <div class="dashboardCard">

                    <div class="cardIcon purpleCard">

                        <i class="fa-solid fa-indian-rupee-sign"></i>

                    </div>

                    <div>

                        <h2>
                            ₹${Number(
                                data.totalRevenue
                            ).toLocaleString()}
                        </h2>

                        <p>
                            Total Sales
                        </p>

                    </div>

                </div>

                <div class="dashboardCard">

                    <div class="cardIcon redCard">

                        <i class="fa-solid fa-box"></i>

                    </div>

                    <div>

                        <h2>
                            ${data.totalStock}
                        </h2>

                        <p>
                            Total Stock
                        </p>

                    </div>

                </div>

            </div>

            <div id="dashboardBottom">

                <div class="dashboardTableBox">

                    <h3>
                        Recent Orders
                    </h3>

                    <table class="dashboardTable">

                        <thead>

                            <tr>

                                <th>Order</th>
                                <th>Amount</th>
                                <th>Status</th>

                            </tr>

                        </thead>

                        <tbody>

                            ${recentOrders}

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

                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>

                            </tr>

                        </thead>

                        <tbody>

                            ${recentPayments}

                        </tbody>

                    </table>

                </div>

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