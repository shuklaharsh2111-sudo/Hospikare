const navItems = document.querySelectorAll(".navItem");

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
                .toLowerCase();

            if(
                text.includes(
                    "orders"
                )
            ){

                loadOrders();

            }

            else if(
                text.includes(
                    "history"
                )
            ){

                loadHistory();

            }

            else if(
                text.includes(
                    "payment"
                )
            ){

                loadPayments();

            }
            else if(text.includes("invoice")){
                loadInvoices();
            }

        }
    );

});
loadOrders();

async function loadOrders(){

    try{

        const response =
            await fetch(
                '/api/user/orders'
            );

        const result =
            await response.json();

        let html = `
        <div class="activityBox">

            <h2>
                My Orders
            </h2>

            <table class="activityTable">

                <thead>

                    <tr>

                        <th>ID</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Payment</th>
                        <th>Status</th>

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
                        #${order.id}
                    </td>

                    <td>
                        ${order.type}
                    </td>

                    <td>
                        ₹${order.total_amount}
                    </td>

                    <td>
                        ${order.payment_status}
                    </td>

                    <td>
                        ${order.order_status}
                    </td>

                </tr>
                `;
            });

        }
        else{

            html += `
            <tr>

                <td colspan="5">

                    No Orders Found

                </td>

            </tr>
            `;
        }

        html += `
                </tbody>

            </table>

        </div>
        `;

        document.getElementById(
            "mainContainer"
        ).innerHTML = html;

    }
    catch(error){

        console.log(
            "Orders Error:",
            error
        );

    }

}

async function loadHistory(){

    try{

        const response =
            await fetch(
                '/api/user/history'
            );

        const result =
            await response.json();

        let html = `
        <div class="activityBox">

            <h2>
                Activity History
            </h2>

            <table class="activityTable">

                <thead>

                    <tr>

                        <th>ID</th>
                        <th>Type</th>
                        <th>Name</th>
                        <th>Amount</th>
                        <th>Status</th>

                    </tr>

                </thead>

                <tbody>
        `;

        if(
            result.success &&
            result.history.length > 0
        ){

            result.history.forEach(
                item => {

                html += `
                <tr>

                    <td>
                        #${item.id}
                    </td>

                    <td>
                        ${item.type}
                    </td>

                    <td>
                        ${item.patient_name}
                    </td>

                    <td>
                        ₹${item.total_amount}
                    </td>

                    <td>
                        ${item.booking_status}
                    </td>

                </tr>
                `;
            });

        }
        else{

            html += `
            <tr>

                <td colspan="5">

                    No History Found

                </td>

            </tr>
            `;
        }

        html += `
                </tbody>

            </table>

        </div>
        `;

        document.getElementById(
            "mainContainer"
        ).innerHTML = html;

    }
    catch(error){

        console.log(
            "History Error:",
            error
        );

    }

}

async function loadPayments(){

    try{

        const response =
            await fetch(
                '/api/user/payments'
            );

        const result =
            await response.json();

        let html = `
        <div class="activityBox">

            <h2>
                Payment History
            </h2>

            <table class="activityTable">

                <thead>

                    <tr>

                        <th>ID</th>
                        <th>Payment For</th>
                        <th>Method</th>
                        <th>Transaction ID</th>
                        <th>Amount</th>
                        <th>Status</th>
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
                        #${payment.id}
                    </td>

                    <td>
                        ${payment.payment_for}
                    </td>

                    <td>
                        ${payment.payment_method}
                    </td>

                    <td>
                        ${payment.transaction_id}
                    </td>

                    <td>
                        ₹${payment.amount}
                    </td>

                    <td>
                        ${payment.payment_status}
                    </td>

                    <td>
                        ${new Date(
                            payment.paid_at
                        ).toLocaleDateString()}
                    </td>

                </tr>
                `;
            });

        }
        else{

            html += `
            <tr>

                <td colspan="7">

                    No Payments Found

                </td>

            </tr>
            `;
        }

        html += `
                </tbody>

            </table>

        </div>
        `;

        document.getElementById(
            "mainContainer"
        ).innerHTML = html;

    }
    catch(error){

        console.log(
            "Payment Load Error:",
            error
        );

    }

}

async function loadInvoices(){

    try{

        const orderResponse =
            await fetch(
                '/api/user/orders'
            );

        const paymentResponse =
            await fetch(
                '/api/user/payments'
            );

        const orderResult =
            await orderResponse.json();

        const paymentResult =
            await paymentResponse.json();

        let invoices = [];

        /* ================= ORDERS ================= */

        if(
            orderResult.success
        ){

            orderResult.orders.forEach(
                order => {

                invoices.push({

                    id:
                        `ORD-${order.id}`,

                    type:
                        order.type,

                    amount:
                        order.total_amount,

                    status:
                        order.payment_status,

                    date:
                        order.created_at,

                    invoiceId:
                        `ORD-${order.id}`

                });

            });

        }

        /* ================= PAYMENTS ================= */

        if(
            paymentResult.success
        ){

            paymentResult.payments.forEach(
                payment => {

                invoices.push({

                    id:
                        `PAY-${payment.id}`,

                    type:
                        payment.payment_for,

                    amount:
                        payment.amount,

                    status:
                        payment.payment_status,

                    date:
                        payment.paid_at,

                    invoiceId:
                        `PAY-${payment.id}`

                });

            });

        }

        /* ================= SORT ================= */

        invoices.sort(
            (a,b) =>
                new Date(b.date)
                -
                new Date(a.date)
        );

        /* ================= HTML ================= */

        let html = `

        <div class="activityBox">

            <h2>
                My Invoices
            </h2>

            <table class="activityTable">

                <thead>

                    <tr>

                        <th>ID</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Invoice</th>

                    </tr>

                </thead>

                <tbody>
        `;

        /* ================= LOOP ================= */

        if(
            invoices.length > 0
        ){

            invoices.forEach(
                invoice => {

                html += `

                <tr>

                    <td>
                        #${invoice.id}
                    </td>

                    <td>
                        ${invoice.type}
                    </td>

                    <td>
                        ₹${invoice.amount}
                    </td>

                    <td>
                        ${invoice.status}
                    </td>

                    <td>
                        ${
                            invoice.date
                            ?
                            new Date(
                                invoice.date
                            ).toLocaleDateString()
                            :
                            '-'
                        }
                    </td>

                    <td>

                        <button
                            class="download_invoice"

                            onclick="
                                downloadInvoice(
                                    '${invoice.invoiceId}'
                                )
                            "
                        >

                            Download Invoice

                        </button>

                    </td>

                </tr>
                `;
            });

        }
        else{

            html += `

            <tr>

                <td colspan="6">

                    No Invoice Data Found

                </td>

            </tr>
            `;
        }

        html += `

                </tbody>

            </table>

        </div>
        `;

        document.getElementById(
            "mainContainer"
        ).innerHTML = html;

    }
    catch(error){

        console.log(
            "Invoice Error:",
            error
        );

    }

}

function downloadInvoice(invoiceId){

    window.open(
        `/api/user/invoice/${invoiceId}`,
        '_blank'
    );

}