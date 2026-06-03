loadDashboard();

setInterval(() => {

    loadDashboard();

},5000);

document.getElementById("availabilitySection").style.display = "none";
document.getElementById("ambulanceSection").style.display = "none";
document.getElementById("bookingsSection").style.display = "none";
document.getElementById("paymentsSection").style.display = "none";
document.getElementById("dashboardSection").style.display = "block";

async function loadUserProfile(){
    try{
        const response = await fetch('/api/user/profile');
        const result = await response.json();
        if(result.success){
            document.getElementById("welcomeText").innerText =
            `Welcome ${result.user.name}`;
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

document.getElementById("logoutBtn").addEventListener("click",logout);
async function logout(){
    try{
        const response =
            await fetch('/api/admin/logout',{
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
            const text = item.innerText.toLowerCase();
            document.getElementById("dashboardSection").style.display="none";
            document.getElementById(
                "ambulanceSection"
            ).style.display =
                "none";
            document.getElementById(
                "availabilitySection"
            ).style.display =
                "none";
            document.getElementById("bookingsSection").style.display = "none";
            document.getElementById("paymentsSection").style.display = "none";
            if(text.includes("dashboard")){
                document.getElementById("dashboardSection").style.display="block";
                loadDashboard();
            }
            else if(
                text.includes(
                    "ambulances"
                )
            ){
                document.getElementById(
                    "ambulanceSection"
                ).style.display =
                    "block";
                loadAmbulances();
            }
            else if(
                text.includes(
                    "availability"
                )
            ){
                document.getElementById(
                    "availabilitySection"
                ).style.display =
                    "block";
                loadAmbulanceAvailability();
            }
            else if(
                text.includes(
                    "bookings"
                )
            ){
            
                document.getElementById(
                    "bookingsSection"
                ).style.display =
                    "block";
            
                loadBookings();
            }
            else if(text.includes("payments")){
                document.getElementById("paymentsSection").style.display="block";
                loadPayments();
            }
        }
    );
});

async function loadBookings(){
    try{
        const response = await fetch('/api/ambulance/bookings');
        const result =
        await response.json();
        const tbody =
        document.getElementById(
            "bookingsTableBody"
        );
        tbody.innerHTML = "";
        if(result.success){
            if(
                result.bookings.length === 0
            ){
                tbody.innerHTML = `
                <tr>
                    <td colspan="11">
                        No Bookings Found
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
                            ${booking.patient_name}
                        </td>
                        <td>
                            ${booking.patient_condition}
                        </td>
                        <td>
                            ${booking.pickup_address}
                        </td>
                        <td>
                            ${booking.destination_address}
                        </td>
                        <td>
                            ${
                                new Date(
                                    booking.booking_date
                                ).toLocaleString()
                            }
                        </td>
                        <td>
                            ₹${booking.total_amount}
                        </td>
                        <td>
                            ${
                                new Date(
                                    booking.created_at
                                ).toLocaleDateString()
                            }
                        </td>
                        <td>
                            <select
                                id="booking_status_${booking.id}"
                                class="bookingSelect"
                            >
                                <option
                                    value="pending"
                                    ${
                                        booking.booking_status
                                        === "pending"
                                        ?
                                        "selected"
                                        :
                                        ""
                                    }
                                >
                                    Pending
                                </option>
                                <option
                                    value="accepted"
                                    ${
                                        booking.booking_status
                                        === "accepted"
                                        ?
                                        "selected"
                                        :
                                        ""
                                    }
                                >
                                    Accepted
                                </option>
                                <option
                                    value="completed"
                                    ${
                                        booking.booking_status
                                        === "completed"
                                        ?
                                        "selected"
                                        :
                                        ""
                                    }
                                >
                                    Completed
                                </option>
                                <option
                                    value="cancelled"
                                    ${
                                        booking.booking_status
                                        === "cancelled"
                                        ?
                                        "selected"
                                        :
                                        ""
                                    }
                                >
                                    Cancelled
                                </option>
                            </select>
                        </td>
                        <td>

                        <td>
                            <button
                                class="bookingUpdateBtn"
                                onclick="
                                    updateBookingStatus(
                                        ${booking.id},
                                        ${booking.ambulance_id}
                                    )
                                "
                            >
                                Update
                            </button>
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

async function updateBookingStatus(
    bookingId,
    ambulanceId
){

    try{

        const booking_status =
        document.getElementById(
            `booking_status_${bookingId}`
        ).value;

const ambulance_status =
document.getElementById(
    `booking_ambulance_status_${bookingId}`
).value;

        const response =
        await fetch(

            '/api/update-booking-status',

            {

                method:'PUT',

                headers:{
                    'Content-Type':
                    'application/json'
                },

                body:JSON.stringify({

                    booking_id:
                    bookingId,

                    ambulance_id:
                    ambulanceId,

                    booking_status,

                    ambulance_status

                })

            }

        );

        const result =
        await response.json();

        if(result.success){

            loadBookings();

            loadAmbulanceAvailability();

            loadAmbulances();

            alert(
                "Status Updated"
            );

        }

    }
    catch(error){

        console.log(error);

    }

}

async function loadAmbulances(){
    try{
        const response =
            await fetch(
                '/api/ambulances'
            );
        const result =
            await response.json();
        const tbody =
            document.getElementById(
                "ambulanceTableBody"
            );
        tbody.innerHTML = "";
        if(
            result.success
        ){
            if(
                result.ambulances.length
                === 0
            ){
                tbody.innerHTML = `
                <tr>
                    <td
                        colspan="9"
                        class="noAmbulanceData"
                    >
                        No Ambulances Found
                    </td>
                </tr>
                `;
                return;
            }
            result.ambulances
            .forEach(ambulance => {
                tbody.innerHTML += `
                <tr>
                    <td>
                        ${ambulance.id}
                    </td>
                    <td>
                        ${ambulance.ambulance_type}
                    </td>
                    <td>
                        ₹${ambulance.base_chrge}
                    </td>
                    <td>
                        ₹${ambulance.min_chrge}
                    </td>
                    <td>
                        ₹${ambulance.night_chrg}
                    </td>
                    <td>
                        ${ambulance.status}
                    </td>
                    <td>
                        ${ambulance.eta}
                    </td>
                    <td>
                        ${ambulance.area}
                    </td>
                    <td>
                        ${
                            new Date(
                                ambulance.created_at
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

async function updateAmbulanceStatus(
    ambulanceId
){

    try{

        const status =
        document.getElementById(
            `ambulance_status_${ambulanceId}`
        ).value;

        const response =
        await fetch(

            '/api/update/ambulance',

            {

                method:'PUT',

                headers:{
                    'Content-Type':
                    'application/json'
                },

                body:JSON.stringify({

                    id:
                    ambulanceId,

                    status,

                    base_chrge:0

                })

            }

        );

        const result =
        await response.json();

        if(result.success){

            loadAmbulances();

            loadAmbulanceAvailability();

            loadBookings();

            alert(
                "Ambulance Status Updated"
            );

        }

    }
    catch(error){

        console.log(error);

    }

}

document.getElementById(
    "addAmbulanceBtn"
).addEventListener(
    "click",
    () => {
        document.getElementById(
            "ambulanceModal"
        ).style.display = "flex";
    }
);

document.getElementById(
    "closeAmbulanceModal"
).addEventListener(
    "click",
    () => {
        document.getElementById(
            "ambulanceModal"
        ).style.display = "none";
    }
);

document.getElementById(
    "ambulanceForm"
).addEventListener(
    "submit",
    async(e) => {
        e.preventDefault();
        const formData =
            new FormData();
        formData.append(
            "ambulance_type",
            document.getElementById(
                "ambulance_type"
            ).value
        );
        formData.append(
            "base_chrge",
            document.getElementById(
                "base_chrge"
            ).value
        );
        formData.append(
            "min_chrge",
            document.getElementById(
                "min_chrge"
            ).value
        );
        formData.append(
            "night_chrg",
            document.getElementById(
                "night_chrg"
            ).value
        );
        formData.append(
            "wait_chrg",
            document.getElementById(
                "wait_chrg"
            ).value
        );
        formData.append(
            "status",
            document.getElementById(
                "status"
            ).value
        );
        formData.append(
            "eta",
            document.getElementById(
                "eta"
            ).value
        );
        formData.append(
            "book_time_slot",
            document.getElementById(
                "book_time_slot"
            ).value
        );
        formData.append(
            "area",
            document.getElementById(
                "area"
            ).value
        );
        formData.append(
            "description",
            document.getElementById(
                "description"
            ).value
        );
        formData.append(
            "driver_exp",
            document.getElementById(
                "driver_exp"
            ).value
        );
        formData.append(
            "lic",
            document.getElementById(
                "lic"
            ).files[0]
        );
        formData.append(
            "rc",
            document.getElementById(
                "rc"
            ).files[0]
        );
        formData.append(
            "veh_ins",
            document.getElementById(
                "veh_ins"
            ).files[0]
        );
        try{
            const response =
                await fetch(
                    '/api/add/ambulance',
                    {
                        method:'POST',
                        body:formData
                    }
                );
            const result =
                await response.json();
            if(result.success){
                alert(
                    "Ambulance Added"
                );
                document.getElementById(
                    "ambulanceModal"
                ).style.display =
                    "none";
                loadAmbulances();
            }
        }
        catch(error){
            console.log(error);
        }
});

async function loadAmbulanceAvailability(){
    try{
        const response =
            await fetch(
                '/api/ambulance/availability'
            );
        const result =
            await response.json();
        const availableBody =
            document.getElementById(
                "availableAmbulanceBody"
            );
        const busyBody =
            document.getElementById(
                "busyAmbulanceBody"
            );
        availableBody.innerHTML = "";
        busyBody.innerHTML = "";
        result.available
        .forEach(ambulance => {
            availableBody.innerHTML += `
            <tr>
                <td>
                    ${ambulance.id}
                </td>
                <td>
                    ${ambulance.ambulance_type}
                </td>
                <td>
                    ${ambulance.area}
                </td>
                <td>
                    ${ambulance.eta}
                </td>
                <td>
                    ₹${ambulance.base_chrge}
                </td>
                <td>
                    <input
                        type="text"
                        value="${ambulance.base_chrge}"
                        id="price_${ambulance.id}"
                        class="updateInput"
                    >
                </td>
                <td>
                    <select
                        id="status_${ambulance.id}"
                        class="updateSelect"
                    >
                        <option
                            ${
                                ambulance.status
                                === "Available"
                                ?
                                "selected"
                                :
                                ""
                            }
                        >
                            Available
                        </option>
                        <option
                            ${
                                ambulance.status
                                === "Busy / On Trip"
                                ?
                                "selected"
                                :
                                ""
                            }
                        >
                            Busy / On Trip
                        </option>
                    </select>
                </td>
                <td>
                    <button
                        class="saveUpdateBtn"
                        onclick="
                            updateAmbulance(
                                ${ambulance.id}
                            )
                        "
                    >
                        Save
                    </button>
                </td>
            </tr>
            `;
        });
        result.busy
        .forEach(ambulance => {
            busyBody.innerHTML += `
            <tr>
                <td>
                    ${ambulance.id}
                </td>
                <td>
                    ${ambulance.ambulance_type}
                </td>
                <td>
                    ${ambulance.area}
                </td>
                <td>
                    ${ambulance.eta}
                </td>
                <td>
                    ₹${ambulance.base_chrge}
                </td>
                <td>
                    <input
                        type="text"
                        value="${ambulance.base_chrge}"
                        id="price_${ambulance.id}"
                        class="updateInput"
                    >
                </td>
                <td>
                    <select
                        id="status_${ambulance.id}"
                        class="updateSelect"
                    >
                        <option
                            ${
                                ambulance.status
                                === "Available"
                                ?
                                "selected"
                                :
                                ""
                            }
                        >
                            Available
                        </option>
                        <option
                            ${
                                ambulance.status
                                === "Busy / On Trip"
                                ?
                                "selected"
                                :
                                ""
                            }
                        >
                            Busy / On Trip
                        </option>
                    </select>
                </td>
                <td>
                    <button
                        class="saveUpdateBtn"
                        onclick="
                            updateAmbulance(
                                ${ambulance.id}
                            )
                        "
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

async function updateAmbulance(id){
    try{
        const price =
            document.getElementById(
                `price_${id}`
            ).value;
        const status =
            document.getElementById(
                `status_${id}`
            ).value;
        const response =
            await fetch(
                '/api/update/ambulance',
                {
                    method:'PUT',
                    headers:{
                        'Content-Type':
                        'application/json'
                    },
                    body:JSON.stringify({
                        id,
                        base_chrge:price,
                        status
                    })
                }
            );
        const result =
            await response.json();
        if(result.success){
            loadAmbulanceAvailability();
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

        const ambulanceResponse =
        await fetch('/api/ambulances');

        const ambulanceResult =
        await ambulanceResponse.json();

        const bookingResponse =
        await fetch('/api/ambulance/bookings');

        const bookingResult =
        await bookingResponse.json();

        const paymentResponse =
        await fetch('/api/payments');

        const paymentResult =
        await paymentResponse.json();

        let totalAmbulances = 0;
        let availableAmbulances = 0;

        let totalBookings = 0;

        let totalEarnings = 0;

        let totalPayout = 0;

        if(ambulanceResult.success){

            totalAmbulances =
            ambulanceResult.ambulances.length;

            availableAmbulances =
            ambulanceResult.ambulances.filter(
                amb =>
                amb.status.toLowerCase().includes("available")
            ).length;

        }

        if(bookingResult.success){

            totalBookings =
            bookingResult.bookings.length;

            bookingResult.bookings.forEach(
                booking => {

                    totalEarnings +=
                    Number(booking.total_amount);

                }
            );

        }

        if(paymentResult.success){

            paymentResult.payments.forEach(
                payment => {

                    totalPayout +=
                    Number(payment.amount);

                }
            );

        }

        document.getElementById(
            "totalAmbulances"
        ).innerText =
        totalAmbulances;

        document.getElementById(
            "availableAmbulances"
        ).innerText =
        `${availableAmbulances} Available`;

        document.getElementById(
            "totalBookings"
        ).innerText =
        totalBookings;

        document.getElementById(
            "totalEarnings"
        ).innerText =
        `₹${totalEarnings}`;

        document.getElementById(
            "vendorPayout"
        ).innerText =
        `₹${totalPayout}`;

        const bookingBody =
        document.getElementById(
            "dashboardBookingBody"
        );

        bookingBody.innerHTML = "";

        bookingResult.bookings
        .slice(0,5)
        .forEach(booking => {

            bookingBody.innerHTML += `
            <tr>

                <td>
                    #${booking.id}
                </td>

                <td>
                    ${booking.patient_name}
                </td>

                <td>
                    ${booking.pickup_address}
                </td>

                <td>
                    ${booking.destination_address}
                </td>

                <td>
                    ₹${booking.total_amount}
                </td>

                <td>
                    <span class="
                    ${booking.booking_status === 'completed'
                    ? 'completedStatus'
                    :
                    booking.booking_status === 'cancelled'
                    ?
                    'cancelledStatus'
                    :
                    'pendingStatus'}
                    ">
                        ${booking.booking_status}
                    </span>
                </td>

            </tr>
            `;

        });

        const paymentBody =
        document.getElementById(
            "dashboardPaymentBody"
        );

        paymentBody.innerHTML = "";

        if(paymentResult.success){

            paymentResult.payments
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
                        <span class="completedStatus">
                            Paid
                        </span>
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