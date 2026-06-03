loadDashboard();

document.getElementById("dashboardSection").style.display = "block";

async function loadUserProfile(){
    try{
        const response =
            await fetch('/api/user/profile');
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

document.getElementById("logoutBtn").addEventListener("click", logout);

async function logout(){
    try{
        const response = await fetch('/api/admin/logout', {
                method:'POST'
            });
        const result = await response.json();
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
    item.addEventListener("click", () => {
        navItems.forEach(nav => {
            nav.classList.remove("activeNav");
        });
        item.classList.add("activeNav");
        const text = item.innerText.toLowerCase();
        document.getElementById("hospitalSection").style.display = "none";
        document.getElementById("availabilitySection").style.display = "none";
        document.getElementById("paymentsSection").style.display = "none";
        document.getElementById("dashboardSection").style.display = "none";
        if(text.includes("hospitals")){
            document.getElementById(
                "hospitalSection"
            ).style.display = "block";
            loadHospitals();
        }
        if(text.includes("availability")){
            document.getElementById(
                "hospitalSection"
            ).style.display = "none";
            document.getElementById(
                "availabilitySection"
            ).style.display = "block";
            loadAvailability();
            document.getElementById("bookingsSection").style.display = "none";
        }
        if(text.includes("bookings")){
            document.getElementById("hospitalSection").style.display = "none";
            document.getElementById("availabilitySection").style.display = "none";
            document.getElementById("bookingsSection").style.display = "block";
            loadBookings();
        }
        if(text.includes("payments")){
            document.getElementById("hospitalSection").style.display = "none";
            document.getElementById("availabilitySection").style.display = "none";
            document.getElementById("bookingsSection").style.display = "none";
            document.getElementById("paymentsSection").style.display = "block";
            loadPayments();
        }
        if(text.includes("dashboard")){
            document.getElementById("dashboardSection").style.display = "block";
            document.getElementById("hospitalSection").style.display = "none";
            document.getElementById("availabilitySection").style.display = "none";
            document.getElementById("bookingsSection").style.display = "none";
            document.getElementById("paymentsSection").style.display = "none";
            loadDashboard();
        }
    });
});

async function loadHospitals(){
    try{
        const response =
            await fetch('/api/hospitals');
        const result =
            await response.json();
        const tbody =
            document.getElementById(
                "hospitalTableBody"
            );
        tbody.innerHTML = "";
        if(result.success){
            if(result.hospitals.length === 0){
                tbody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="noHospitalData"
                    >
                        No Hospitals Found
                    </td>
                </tr>
                `;
                return;
            }
            result.hospitals.forEach(hospital => {
                tbody.innerHTML += `
                <tr>
                    <td>
                        ${hospital.id}
                    </td>
                    <td>
                        ${hospital.hospital_name}
                    </td>
                    <td>
                        ${hospital.address}
                    </td>
                    <td>
                        ${hospital.location || '-'}
                    </td>
                    <td>
                        ${hospital.facilities || '-'}
                    </td>
                    <td>
                        ${new Date(
                            hospital.created_at
                        ).toLocaleDateString()}
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

async function loadAvailability(){
    try{
        const response =
            await fetch('/api/availability');
        const result =
            await response.json();
        const availableContainer =
            document.getElementById(
                "availableRoomsContainer"
            );
        const unavailableContainer =
            document.getElementById(
                "unavailableRoomsContainer"
            );
        availableContainer.innerHTML = "";
        unavailableContainer.innerHTML = "";
        if(
            result.availableRooms.length === 0
        ){
            availableContainer.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="emptyTableRow"
                >
                    No Available Rooms
                </td>
            </tr>
            `;
        }
        else{
            result.availableRooms.forEach(room => {
                availableContainer.innerHTML += `
                <tr>
                    <td>${room.hospital_name}</td>

                    <td>${room.room_type}</td>

                    <td>${room.total_beds}</td>

                    <td>₹${room.pricing}</td>

                    <td>${room.details}</td>

                    <td>
                        <input
                            type="number"
                            value="${room.total_beds}"
                            id="beds_${room.hospital_id}_${room.room_index}"
                            class="updateInput"
                        >
                    </td>

                    <td>
                        <select
                            id="availability_${room.hospital_id}_${room.room_index}"
                            class="updateSelect"
                        >
                            <option value="Available" selected>
                                Available
                            </option>

                            <option value="Unavailable">
                                Unavailable
                            </option>
                        </select>
                    </td>

                    <td>
                        <button
                            class="saveUpdateBtn"
                            onclick="
                                updateRoom(
                                    ${room.hospital_id},
                                    ${room.room_index}
                                )
                            "
                        >
                            Save Update
                        </button>
                    </td>
                </tr>
                `;
            });
        }
        if(
            result.unavailableRooms.length === 0
        ){
            unavailableContainer.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="emptyTableRow"
                >
                    No Unavailable Rooms
                </td>
            </tr>
            `;
        }
        else{
            result.unavailableRooms.forEach(room => {
            unavailableContainer.innerHTML += `
            <tr>
                <td>${room.hospital_name}</td>

    <td>${room.room_type}</td>

    <td>${room.total_beds}</td>

    <td>₹${room.pricing}</td>

    <td>${room.details}</td>

    <td>
        <input
            type="number"
            value="${room.total_beds}"
            id="beds_${room.hospital_id}_${room.room_index}"
            class="updateInput"
        >
    </td>

    <td>
        <select
            id="availability_${room.hospital_id}_${room.room_index}"
            class="updateSelect"
        >
            <option value="Available">
                            Available
                        </option>

                        <option
                            value="Unavailable"
                            selected
                        >
                            Unavailable
                        </option>
                    </select>
                </td>

                <td>
                    <button
                        class="saveUpdateBtn"
                        onclick="
                            updateRoom(
                                ${room.hospital_id},
                                ${room.room_index}
                            )
                        "
                    >
                        Save Update
                    </button>
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

document.getElementById("addHospitalBtn").addEventListener("click", () => {
    document.getElementById("hospitalModal").style.display = "flex";
});

document.getElementById("closeHospitalModal"
).addEventListener("click", () => {
    document.getElementById(
        "hospitalModal"
    ).style.display = "none";
});

function addRoom(){
    const container =
        document.getElementById(
            "roomsContainer"
        );
    container.innerHTML += `
    <div class="roomBox">
        <select class="room_type">
            <option value="General">General</option>
            <option value="ICU">ICU</option>
            <option value="Deluxe">Deluxe</option>
        </select>
        <input
            type="text"
            placeholder="Pricing"
            class="room_pricing"
        >
        <input
            type="text"
            placeholder="Total Beds"
            class="room_total_beds"
        >
        <input
            type="text"
            placeholder="Details"
            class="room_details"
        >
        <select class="room_availability">
            <option>
                Available
            </option>
            <option>
                Unavailable
            </option>
        </select>
    </div>
    `;
}
document.getElementById("addRoomBtn").addEventListener("click", addRoom);

function addDoctor(){
    const container =
        document.getElementById(
            "doctorsContainer"
        );
    container.innerHTML += `
    <div class="doctorBox">
        <input
            type="text"
            placeholder="Doctor Name"
            class="doctor_name"
        >
        <input
            type="text"
            placeholder="Qualification"
            class="doctor_qualification"
        >
        <input
            type="text"
            placeholder="Experience"
            class="doctor_experience"
        >
    </div>
    `;
}

document.getElementById("addDoctorBtn").addEventListener("click", addDoctor);

document.getElementById("hospitalForm")
.addEventListener(
    "submit",
    async function(e){
        e.preventDefault();
        const formData =
            new FormData();
        formData.append(
            "hospital_name",
            document.getElementById(
                "hospital_name"
            ).value
        );
        formData.append(
            "address",
            document.getElementById(
                "hospital_address"
            ).value
        );
        formData.append(
            "facilities",
            document.getElementById(
                "hospital_facilities"
            ).value
        );
        const hospitalImages =
            document.getElementById(
                "hospital_images"
            );
        for(
            let i = 0;
            i < hospitalImages.files.length;
            i++
        ){
            formData.append(
                "hospital_images",
                hospitalImages.files[i]
            );
        }
        const rooms = [];
        document.querySelectorAll(
            ".roomBox"
        ).forEach(room => {
            rooms.push({
                room_type:
                    room.querySelector(
                        ".room_type"
                    ).value,
                pricing:
                    room.querySelector(
                        ".room_pricing"
                    ).value,
                total_beds:
                    room.querySelector(
                        ".room_total_beds"
                    ).value,
                details:
                    room.querySelector(
                        ".room_details"
                    ).value,
                availability:
                    room.querySelector(
                        ".room_availability"
                    ).value
            });
        });
        formData.append(
            "rooms",
            JSON.stringify(rooms)
        );
        const doctors = [];
        document.querySelectorAll(
            ".doctorBox"
        ).forEach(doc => {
            doctors.push({
                doctor_name:
                    doc.querySelector(
                        ".doctor_name"
                    ).value,
                qualification:
                    doc.querySelector(
                        ".doctor_qualification"
                    ).value,
                experience:
                    doc.querySelector(
                        ".doctor_experience"
                    ).value
            });
        });
        formData.append(
            "doctors",
            JSON.stringify(doctors)
        );
        const hospitalReg =
            document.getElementById(
                "hospital_reg_certificate"
            );
        if(hospitalReg.files[0]){
            formData.append(
                "hospital_reg_certificate",
                hospitalReg.files[0]
            );
        }
        const shopLicense =
            document.getElementById(
                "shop_license"
            );
        if(shopLicense.files[0]){
            formData.append(
                "shop_license",
                shopLicense.files[0]
            );
        }
        const medicalCouncil =
            document.getElementById(
                "medical_council_registration"
            );
        if(medicalCouncil.files[0]){
            formData.append(
                "medical_council_registration",
                medicalCouncil.files[0]
            );
        }
        const electricityBill =
            document.getElementById(
                "electricity_bill"
            );
        if(electricityBill.files[0]){
            formData.append(
                "electricity_bill",
                electricityBill.files[0]
            );
        }
        try{
            const response =
                await fetch(
                    '/api/add/hospital',
                    {
                        method:'POST',
                        body:formData
                    }
                );
            const result =
                await response.json();
            console.log(result);
            if(result.success){
                alert(
                    "Hospital Added Successfully"
                );
                document.getElementById(
                    "hospitalModal"
                ).style.display = "none";
                loadHospitals();
            }
            else{
                alert(
                    result.message ||
                    "Failed To Add Hospital"
                );
            }
        }
        catch(error){
            console.log(error);
        }
});

document.getElementById("addAvailabilityBtn").addEventListener("click", async() => {
    document.getElementById("roomModal").style.display = "flex";
    loadHospitalDropdown();
});

document.getElementById("closeRoomModal").addEventListener("click", () => {
    document.getElementById(
        "roomModal"
    ).style.display = "none";
});

async function loadHospitalDropdown(){
    try{
        const response =
            await fetch('/api/user/hospitals');
        const result =
            await response.json();
        const dropdown =
            document.getElementById(
                "room_hospital"
            );
        dropdown.innerHTML = "";
        result.hospitals.forEach(hospital => {
            dropdown.innerHTML += `
            <option
                value="${hospital.id}"
            >
                ${hospital.hospital_name}
            </option>
            `;
        });
    }
    catch(error){
        console.log(error);
    }
}

document.getElementById("roomForm")
.addEventListener(
    "submit",
    async function(e){
        e.preventDefault();
        try{
            const response =
                await fetch('/api/add/room',
                    {
                        method:'POST',
                        headers:{
                            'Content-Type':
                            'application/json'
                        },
                        body:JSON.stringify({
                            hospital_id:
                                document.getElementById(
                                    "room_hospital"
                                ).value,
                            details:
                                document.getElementById(
                                    "room_details"
                                ).value,
                            pricing:
                                document.getElementById(
                                    "room_pricing"
                                ).value,
                            room_type:
                                document.getElementById(
                                    "room_type"
                                ).value,
                            total_beds:
                                document.getElementById(
                                    "room_total_beds"
                                ).value,
                            availability:
                                document.getElementById(
                                    "room_availability"
                                ).value
                        })
                    }
                );
            const result =
                await response.json();
            if(result.success){
                alert(
                    "Room Added Successfully"
                );
                document.getElementById(
                    "roomModal"
                ).style.display = "none";
                loadAvailability();
            }
        }
        catch(error){
            console.log(error);
        }
});

async function updateRoom(hospitalId,roomIndex){
    try{
        const beds = document.getElementById(`beds_${hospitalId}_${roomIndex}` ).value;
        const availability = document.getElementById(`availability_${hospitalId}_${roomIndex}`).value;
        const response = await fetch('/api/update/room',{
                    method:'PUT',
                    headers:{
                        'Content-Type':
                        'application/json'
                    },
                    body:JSON.stringify({
                        hospital_id:hospitalId,
                        room_index:roomIndex,
                        total_beds:beds,
                        availability:availability
                    })
                }
            );
        const result =
            await response.json();
        if(result.success){
            alert(
                "Room Updated Successfully"
            );
            loadAvailability();
        }
        else{
            alert(result.message);
        }
    }
    catch(error){
        console.log(error);
    }
}

async function loadBookings(){

    try{

        const response =
        await fetch(
            '/api/hospital/bookings'
        );

        const result =
        await response.json();

        console.log(result);

        const tbody =
        document.getElementById(
            "bookingsTableBody"
        );

        tbody.innerHTML = "";

        if(
            !result.bookings ||
            result.bookings.length === 0
        ){

            tbody.innerHTML = `
            <tr>

                <td
                    colspan="11"
                    class="emptyTableRow"
                >

                    No Bookings Found

                </td>

            </tr>
            `;

            return;

        }

        result.bookings.forEach(booking => {

            tbody.innerHTML += `
            <tr>

                <td>${booking.id}</td>

                <td>
                    ${booking.patient_name}
                </td>

                <td>
                    ${booking.patient_age}
                </td>

                <td>
                    ${booking.patient_gender}
                </td>

                <td>
                    ${booking.hospital_name}
                </td>

                <td>
                    ${booking.room_type}
                </td>

                <td>
                    ${booking.bed_type}
                </td>

                <td>
                    ${booking.admission_date}
                </td>

                <td>
                    ${booking.discharge_date}
                </td>

                <td>
                    ₹${booking.total_amount}
                </td>

            </tr>
            `;

        });

    }
    catch(error){

        console.log(error);

    }

}
loadBookings();

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

        if(
            !result.payments ||
            result.payments.length === 0
        ){

            tbody.innerHTML = `
            <tr>

                <td
                    colspan="5"
                    class="emptyTableRow"
                >

                    No Payments Found

                </td>

            </tr>
            `;

            return;

        }

        result.payments.forEach(payment => {

            tbody.innerHTML += `
            <tr>

                <td>
                    ${payment.vendor_id}
                </td>

                <td>
                    ₹${payment.amount}
                </td>

                <td>
                    ${
                        payment.razorpay_payment_id
                        || '-'
                    }
                </td>

                <td>
                    ${
                        payment.payment_status
                        || '-'
                    }
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
    catch(error){

        console.log(error);

    }

}

async function loadDashboard(){

    try{

        const bookingResponse =
        await fetch(
            '/api/hospital/bookings'
        );

        const bookingResult =
        await bookingResponse.json();

        const paymentResponse =
        await fetch(
            '/api/vendor/payments'
        );

        const paymentResult =
        await paymentResponse.json();

        const bookings =
        bookingResult.bookings || [];

        const payments =
        paymentResult.payments || [];

        document.getElementById(
            "totalBookings"
        ).innerText =
        bookings.length;

        document.getElementById(
            "roomBookings"
        ).innerText =
        bookings.length;

        document.getElementById(
            "appointmentsCount"
        ).innerText =
        bookings.length;

        let totalRevenue = 0;

        payments.forEach(payment => {

            totalRevenue +=
            Number(payment.amount || 0);

        });

        document.getElementById(
            "totalEarnings"
        ).innerText =
        `₹${totalRevenue.toLocaleString()}`;

        const bookingBody =
        document.getElementById(
            "recentBookingsBody"
        );

        bookingBody.innerHTML = "";

        bookings.slice(0,5).forEach(booking => {

            bookingBody.innerHTML += `
            <tr>

                <td>
                    ${booking.patient_name}
                </td>

                <td>
                    ${booking.hospital_name}
                </td>

                <td>

                    <span class="confirmedStatus">

                        Confirmed

                    </span>

                </td>

            </tr>
            `;

        });

        const paymentBody =
        document.getElementById(
            "recentPaymentsBody"
        );

        paymentBody.innerHTML = "";

        payments.slice(0,5).forEach(payment => {

            paymentBody.innerHTML += `
            <tr>

                <td>
                    ₹${payment.amount}
                </td>

                <td>

                    <span class="paymentSuccess">

                        ${payment.payment_status}

                    </span>

                </td>

                <td>
                    ${
                        payment.paid_at
                        ?
                        new Date(
                            payment.paid_at
                        ).toLocaleDateString()
                        :
                        '-'
                    }
                </td>

            </tr>
            `;

        });

    }
    catch(error){

        console.log(error);

    }

}