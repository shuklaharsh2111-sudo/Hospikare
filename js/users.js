window.onload = function () {

    const addressField =
    document.getElementById("regAddress");

    const cityField =
    document.getElementById("regCity");

    const stateField =
    document.getElementById("regState");

    addressField.addEventListener(
        "blur",
        generateLocation
    );

    cityField.addEventListener(
        "blur",
        generateLocation
    );

    stateField.addEventListener(
        "blur",
        generateLocation
    );

};

async function generateLocation(){

    const addressField =
    document.getElementById("regAddress");

    const cityField =
    document.getElementById("regCity");

    const stateField =
    document.getElementById("regState");

    const locationField =
    document.getElementById("usr_add");

    if(
        !addressField.value.trim() ||
        !cityField.value.trim() ||
        !stateField.value.trim()
    ){
        return;
    }

    const address =
    `${addressField.value.trim()}, ${cityField.value.trim()}, ${stateField.value.trim()}, India`;

    try{

        locationField.value =
        "Fetching...";

        const response =
        await fetch(
            `https://api.bigdatacloud.net/data/forward-geocode-client?query=${encodeURIComponent(address)}&localityLanguage=en`
        );

        const data =
        await response.json();

        console.log(data);

        if(data.latitude && data.longitude){

            locationField.value =
            `${data.latitude},${data.longitude}`;

        }
        else{

            locationField.value = "";

            alert("Location not found");

        }

    }
    catch(error){

        console.log(error);

        locationField.value = "";

    }

}

async function generateLocation(){

    const addressField =
    document.getElementById("regAddress");

    const cityField =
    document.getElementById("regCity");

    const stateField =
    document.getElementById("regState");

    const locationField =
    document.getElementById("usr_add");

    if(
        !addressField ||
        !locationField
    ){
        return;
    }

    const address =
    `${addressField.value.trim()}, ${cityField.value.trim()}, ${stateField.value.trim()}, India`;

    if(addressField.value.trim().length < 5){

        locationField.value = "";

        return;

    }

    try{

        locationField.value =
        "Fetching...";

const response = await fetch(`https://api.bigdatacloud.net/data/forward-geocode-client?query=${encodeURIComponent(address)}&localityLanguage=en`);

        const data =
        await response.json();

        console.log(address);
        console.log(data);

        if(data && data.latitude && data.longitude){
            const latitude = data.latitude;
            const longitude = data.longitude;
            locationField.value =
            `${latitude},${longitude}`;

        }
        else{

            locationField.value = "";

            alert(
                "Location not found"
            );

        }

    }
    catch(error){

        console.log(error);

        locationField.value = "";

        alert(
            "Unable to fetch location"
        );

    }

}

const sidebarLinks = document.querySelectorAll(".sidebarLinks a");
let selectedLabId = null;
let selectedLabAmount = 0;
let selectedTestName = "";
let selectedInsuranceId = null;
let selectedInsuranceAmount = 0;
let selectedInsurancePlan = "";
let selectedInsuranceBasePrice = 0;


sidebarLinks.forEach(link => {
    link.addEventListener("click", () => {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    });
});

document.body.classList.add("authLocked");

window.addEventListener("load",() => {
        authOverlay.style.display = 'flex';
    }
);
const savedUser = localStorage.getItem("productUser");

if(!savedUser){
    document.getElementById("authOverlay").style.display = 'flex';
}
else{
    document.body.classList.remove("authLocked");
}
document.body.classList.add("authLocked");
const menuBtn = document.getElementById("menuBtn");
const closeBtn = document.getElementById("closeBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

menuBtn.addEventListener("click", () => {
    sidebar.classList.add("active");
    overlay.classList.add("active");
});

closeBtn.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
});

overlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
});

async function loadFeaturedHospitals(){
    try{
        const response = await fetch('/api/featured-hospitals');
        const data = await response.json();
        const featuredHospitalContainer = document.getElementById("featuredHospitalContainer");
        if(!data.success){
            return;
        }
        featuredHospitalContainer.innerHTML = '';
        data.hospitals.forEach(hospital => {
featuredHospitalContainer.innerHTML += `
    <div class="featuredHospitalCard"
        onclick="openHospital(${hospital.id})">

        <div class="featuredHospitalImage">
            <img src="${hospital.image}" alt="">
        </div>

        <div class="featuredHospitalContent">
            <h3>${hospital.hospital_name}</h3>

            <div class="hospitalLocation">
                <i class="fa-solid fa-location-dot"></i>
                <span>${hospital.location || hospital.address}</span>
            </div>

            <div class="facilityTags">
                ${hospital.facilities.map(facility => `
                    <span>${facility}</span>
                `).join('')}
            </div>

            <div class="hospitalBottom">
                <div class="bedsCount">
                    <i class="fa-solid fa-bed"></i>
                    <span>${hospital.totalBeds} Beds</span>
                </div>

                <button class="rvbtn">
                    <i class="fa-solid fa-eye"></i>
                </button>

                <button class="viewBtn">
                    <i class="fa-solid fa-indian-rupee-sign"></i>
                    <span>${hospital.pricing}</span>
                </button>
            </div>
        </div>
    </div>
`;
        });
    }
    catch(error){
        console.log(error);
    }
}
loadFeaturedHospitals();

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authOverlay = document.getElementById("authOverlay");
loginTab.addEventListener("click", () => {
    loginTab.classList.add("activeTab");
    registerTab.classList.remove("activeTab");
    loginForm.classList.remove("hiddenForm");
    registerForm.classList.add("hiddenForm");
});

registerTab.addEventListener("click", () => {
    registerTab.classList.add("activeTab");
    loginTab.classList.remove("activeTab");
    registerForm.classList.remove("hiddenForm");
    loginForm.classList.add("hiddenForm");
});

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append(
        "full_name",
        document.getElementById("regName").value
    );
    formData.append(
        "email",
        document.getElementById("regEmail").value
    );
    formData.append(
        "phone",
        document.getElementById("regPhone").value
    );
    formData.append(
        "password",
        document.getElementById("regPassword").value
    );
    formData.append(
        "gender",
        document.getElementById("regGender").value
    );
    formData.append(
        "dob",
        document.getElementById("regDob").value
    );
    formData.append(
        "blood_group",
        document.getElementById("regBloodGroup").value
    );
    formData.append(
        "address",
        document.getElementById("regAddress").value
    );
    formData.append("users_address",document.getElementById("usr_add").value);
    formData.append(
        "city",
        document.getElementById("regCity").value
    );
    formData.append(
        "state",
        document.getElementById("regState").value
    );
    formData.append(
        "pincode",
        document.getElementById("regPincode").value
    );
    const photo = document.getElementById(
        "regProfilePhoto"
    );
    if(photo.files[0]){
        formData.append(
            "profile_photo",
            photo.files[0]
        );
    }
    const response = await fetch('/api/product-register',{
            method: 'POST',
            body: formData
        }
    );
    const data = await response.json();
    if(data.success){
        alert("Registration Successful");
        registerForm.reset();
    }
    else{
        alert(data.message);
    }
});

// LOGIN
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const response = await fetch('/api/product-login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: document.getElementById("loginEmail").value,
            password: document.getElementById("loginPassword").value
        })
    });
    const data = await response.json();
    if(data.success){
        localStorage.setItem("productUser", JSON.stringify(data.user));
        authOverlay.style.display = 'none';
        document.body.classList.remove("authLocked");
    }
    else{
        alert(data.message);
    }
});

async function loadAmbulances(){
    try{
        const response = await fetch('/api/all-ambulances');
        const data = await response.json();
        const ambulanceContainer = document.getElementById(
            "ambulanceContainer"
        );
        if(!data.success){
            return;
        }
        ambulanceContainer.innerHTML = '';
        data.ambulances.forEach(ambulance => {
            ambulanceContainer.innerHTML += `
                <div class="ambulanceCard">
                    <div class="ambulanceContent">
                        <h3>
                            ${ambulance.ambulance_type} Ambulance
                        </h3>
                        <div class="ambulanceLocation">
                            <i class="fa-solid fa-location-dot"></i>
                            <span>
                                ${ambulance.area}
                            </span>
                        </div>
                        <div class="ambulanceFeatures">
                            <span>
                                ${ambulance.status}
                            </span>
                            <span>
                                ETA: ${ambulance.eta}
                            </span>
                            <span>
                                Driver: ${ambulance.driver_exp}
                            </span>
                        </div>
                        <p class="ambulanceDescription">
                            ${ambulance.description}
                        </p>
                        <div class="ambulanceBottom">
                            <div class="driverName">
                                <i class="fa-solid fa-indian-rupee-sign"></i>
                                Base: ₹${ambulance.base_chrge}
                            </div>
                            <button class="bookAmbulanceBtn" onclick='openAmbulanceBooking(${ambulance.id},"${ambulance.base_chrge}")'>
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    catch(error){
        console.log(error);
    }
}
loadAmbulances();

async function loadLabs(){
    try{
        const response = await fetch('/api/all-labs');
        const data = await response.json();
        const labsContainer = document.getElementById(
            "labsContainer"
        );
        if(!data.success){
            return;
        }
        labsContainer.innerHTML = '';
data.labs.forEach(lab => {

    let testName = "Lab Test";

    try{

        if(lab.test){

            const parsedTest =
            typeof lab.test === "string"
            ?
            JSON.parse(lab.test)
            :
            lab.test;

            if(Array.isArray(parsedTest)){

                testName =
                parsedTest[0];

            }
            else{

                testName =
                parsedTest;

            }

        }

    }
    catch(error){

        console.log(
            "Lab test parse error",
            error
        );

    }

    labsContainer.innerHTML += `
        <div class="labCard">

            <div class="labLeft">

                <h3>
                    ${lab.lab_name}
                </h3>

                <div class="labCenter">

                    <i class="fa-regular fa-hospital"></i>

                    <span>
                        ${lab.available_areas || 'Mumbai'}
                    </span>

                </div>

                <div class="labPrice">
                    ₹${lab.test_price || '0'}
                </div>

            </div>

            <button
                class="bookLabBtn"
                onclick='openLabBooking(
                    ${lab.id},
                    ${JSON.stringify(testName)},
                    ${lab.test_price || 0}
                )'
            >
                Book Test Now!
            </button>

        </div>
    `;

});
    }
    catch(error){
        console.log(error);
    }
}
loadLabs();

async function loadInsurances(){
    try{
        const response = await fetch('/api/all-insurances');
        const data = await response.json();
        const insuranceContainer = document.getElementById(
            "insuranceContainer"
        );
        if(!data.success){
            return;
        }
        insuranceContainer.innerHTML = '';
        data.insurances.forEach((insurance,index) => {
    insuranceContainer.innerHTML += `
        <div class="
            insuranceCard
            ${index === 1 ? 'popularPlan' : ''}
        ">
            ${
                index === 1
                ?
                `
                    <div class="popularBadge">
                        Most Popular
                    </div>
                `
                :
                ''
            }
            <h3>
                ${insurance.comp_name}
            </h3>
            <div class="insurancePrice">
                ₹${insurance.claim_price || insurance.ins_price || '0'}
            </div>
            <div class="insurancePlanType">
                ${insurance.comp_type || 'Insurance Plan'}
            </div>
            <p class="insuranceDescription">
                ${insurance.description || 'No Description Available'}
            </p>
            <div class="insuranceFeatures">
                <div>
                    <i class="fa-solid fa-check"></i>
                    Claim Type:
                    ${insurance.claim_type || 'N/A'}
                </div>
                <div>
                    <i class="fa-solid fa-check"></i>
                    Claim Time:
                    ${insurance.claim_time || 'N/A'}
                </div>
                <div>
                    <i class="fa-solid fa-check"></i>
                    IRDAI:
                    ${insurance.irdai || 'N/A'}
                </div>
                <div>
                    <i class="fa-solid fa-check"></i>
                    Support:
                    ${insurance.cust_sup_num || 'N/A'}
                </div>
                <div>
                    <i class="fa-solid fa-check"></i>
                    Email:
                    ${insurance.email_sup || 'N/A'}
                </div>
                <div>
                    <i class="fa-solid fa-check"></i>
                    Website:
                    ${insurance.website || 'N/A'}
                </div>
            </div>
            <button
                class="buyPlanBtn"
                data-id="${insurance.id}"
                data-name="${insurance.comp_name}"
                data-claim="${Number(insurance.claim_price) || 0}"
                data-price="${Number(insurance.ins_price) || 0}"
            >
    Buy Plan
</button>
        </div>
    `;
        });
    }
    catch(error){
        console.log(error);
    }
}
loadInsurances();

async function loadMedicines(){
    try{
        const response = await fetch('/api/all-medicines');
        const data = await response.json();
        const medicineContainer = document.getElementById(
            "medicineContainer"
        );
        if(!data.success){
            return;
        }
        medicineContainer.innerHTML = '';
        data.medicines.forEach(medicine => {
            let image = '/assets/defaultMedicine.png';
            if(medicine.medicine_image){
                image = `/uploads/${medicine.medicine_image}`;
            }
            medicineContainer.innerHTML += `
                <div class="medicineCard">
                    <div class="medicineImage">
                        <img src="${image}" alt="">
                    </div>
                    <div class="medicineCategory">
                        ${medicine.category || 'Medicine'}
                    </div>
                    <h3>
                        ${medicine.medicine_name}
                    </h3>
                    <div class="medicineCompany">
                        ${medicine.brand_name || 'No Brand'}
                    </div>
                    <div class="medicineBottom">
                        <div class="medicinePrice">
                            ₹${medicine.selling_price}
                        </div>
                        <button class="addMedicineBtn">
                            Add
                        </button>
                        <button
                            class="addMedicineBtn medicineBuyBtn"
                            onclick='openProductModal(
                                "medicine",
                                ${medicine.medicine_id},
                                ${JSON.stringify(medicine.medicine_name)},
                                ${JSON.stringify(medicine.brand_name)},
                                ${medicine.selling_price}
                            )'
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            `;
        });
    }
    catch(error){
        console.log(error);
    }
}
loadMedicines();

async function loadEquipments(){
    try{
        const response = await fetch('/api/all-equipments');
        const data = await response.json();
        const equipmentContainer = document.getElementById(
            "equipmentContainer"
        );
        if(!data.success){
            return;
        }
        equipmentContainer.innerHTML = '';
        data.equipments.forEach(equipment => {
            equipmentContainer.innerHTML += `
                <div class="equipmentCard">
                    <div class="equipmentImage">
                        <img src="/uploads/${equipment.thumbnail_image}" alt="">
                    </div>
                    <div class="equipmentContent">
                        <div class="equipmentCategory">
                            ${equipment.category}
                        </div>
                        <h3>
                            ${equipment.product_name}
                        </h3>
                        <div class="equipmentBrand">
                            ${equipment.brand_name}
                        </div>
                        <div class="equipmentTags">
                            <span>
                                ${equipment.stock_status}
                            </span>
                            <span>
                                Rental:
                                ${equipment.rental_available}
                            </span>
                            <span>
                                Warranty:
                                ${equipment.warranty_period}
                            </span>
                        </div>
                        <div class="equipmentBottom">
                            <div class="equipmentPrice">
                                <h4>
                                    ₹${equipment.selling_price}
                                </h4>
                                <span>
                                    ₹${equipment.mrp}
                                </span>
                            </div>
                            <button class="addEquipmentBtn">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                            <button
                                class="addequipmentBtn equipmentBuyBtn"
                                onclick='openProductModal(
                                    "equipment",
                                    ${equipment.product_id},
                                    ${JSON.stringify(equipment.product_name)},
                                    ${JSON.stringify(equipment.brand_name)},
                                    ${equipment.selling_price}
                                )'
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    catch(error){
        console.log(error);
    }
}
loadEquipments();

function openHospital(id){
    window.location.href = `/hosp_data.html?id=${id}`;
}

let selectedAmbulanceId = null;

let selectedAmount = 0;

function openAmbulanceBooking(
    ambulanceId,
    amount
){

    selectedAmbulanceId =
    ambulanceId;

    selectedAmount =
    Number(amount) || 0;

    document.getElementById(
        "ambulanceFare"
    ).innerText =
    `₹${selectedAmount}`;

    document.getElementById(
        "ambulanceBookingModal"
    ).style.display = "flex";

}

document.getElementById(
    "closeAmbulanceModal"
).addEventListener(
    "click",
    () => {

    document.getElementById(
        "ambulanceBookingModal"
    ).style.display = "none";

});


document.getElementById(
    "ambulanceBookingForm"
).addEventListener(
    "submit",
    async function(e){
        e.preventDefault();
        const savedUser =
        JSON.parse(
            localStorage.getItem(
                "productUser"
            )
        );
        if(!savedUser){
            alert(
                "Please Login First"
            );
            return;
        }
        try{
            const formData = {
                user_id:
                savedUser.id,
                ambulance_id:
                selectedAmbulanceId,
                patient_name:
                document.getElementById(
                    "patient_name"
                ).value,
                patient_condition:
                document.getElementById(
                    "patient_condition"
                ).value,
                pickup_address:
                document.getElementById(
                    "pickup_address"
                ).value,
                destination_address:
                document.getElementById(
                    "destination_address"
                ).value,
                booking_date:
                document.getElementById(
                    "booking_date"
                ).value,
                total_amount:
                selectedAmount
            };
            const orderResponse =
            await fetch(
                "/api/create-order",
                {
                    method:"POST",
                    headers:{
                        "Content-Type":
                        "application/json"
                    },
                    body:JSON.stringify({
                        amount:
                        selectedAmount
                    })
                }
            );
            const orderData =
            await orderResponse.json();
            if(!orderData.success){
                alert(
                    "Order creation failed"
                );
                return;
            }
            const options = {
                key:
                orderData.key,
                amount:
                orderData.order.amount,
                currency:"INR",
                name:
                "HospiKare Ambulance",
                description:
                "Ambulance Booking Payment",
                order_id:
                orderData.order.id,
                handler:
                async function(response){
                    const paymentData = {
                        ...formData,
                        razorpay_order_id:
                        response
                        .razorpay_order_id,
                        razorpay_payment_id:
                        response
                        .razorpay_payment_id,
                        razorpay_signature:
                        response
                        .razorpay_signature
                    };
                    const bookingResponse =
                    await fetch(
                        "/api/book-ambulance",
                        {
                            method:"POST",
                            headers:{
                                "Content-Type":
                                "application/json"
                            },
                            body:JSON.stringify(
                                paymentData
                            )
                        }
                    );
                    const bookingData =
                    await bookingResponse.json();
                    if(bookingData.success){
                        alert(
                            "Payment Successful & Ambulance Booked"
                        );
                        document.getElementById(
                            "ambulanceBookingModal"
                        ).style.display = "none";
                        document.getElementById(
                            "ambulanceBookingForm"
                        ).reset();
                    }
                    else{
                        alert(
                            bookingData.message
                        );
                    }
                },
                modal:{
                    ondismiss:function(){
                        console.log(
                            "Payment popup closed"
                        );
                    }
                },
                prefill:{
                    name:
                    formData.patient_name
                },
                theme:{
                    color:"#2563eb"
                }
            };
            const razorpay =
            new Razorpay(options);
            razorpay.open();
        }
        catch(error){
            console.log(error);
        }
});

function openLabBooking(
    labId,
    testName,
    amount
){

    selectedLabId = labId;

    selectedLabAmount = Number(amount) || 0;

    selectedTestName = testName || "Lab Test";

    document.getElementById(
        "lab_test_name"
    ).value = testName;

    document.getElementById(
        "labTestAmount"
    ).innerText =
    `₹${selectedLabAmount}`;

    document.getElementById(
        "labBookingModal"
    ).style.display = "flex";

}

document.getElementById(
    "closeLabModal"
).addEventListener(
    "click",
    () => {

        document.getElementById(
            "labBookingModal"
        ).style.display = "none";

});

document.getElementById(
    "labBookingForm"
).addEventListener(
    "submit",
    async function(e){

        e.preventDefault();

        const savedUser =
        JSON.parse(
            localStorage.getItem(
                "productUser"
            )
        );

        if(!savedUser){

            alert(
                "Please Login First"
            );

            return;

        }

        try{

            const formData = {

                user_id:
                savedUser.id,

                lab_vendor_id:
                selectedLabId,

                test_name:
                selectedTestName,

                patient_name:
                document.getElementById(
                    "lab_patient_name"
                ).value,

                sample_collection_type:
                document.getElementById(
                    "sample_collection_type"
                ).value,

                booking_date:
                document.getElementById(
                    "lab_booking_date"
                ).value,

                total_amount:
                selectedLabAmount

            };
            const orderResponse =
            await fetch(
                "/api/create-order",
                {
                    method:"POST",

                    headers:{
                        "Content-Type":
                        "application/json"
                    },

                    body:JSON.stringify({
                        amount:
                        selectedLabAmount
                    })
                }
            );

            const orderData =
            await orderResponse.json();

            if(!orderData.success){

                alert(
                    "Order creation failed"
                );

                return;

            }

            const options = {

                key:
                orderData.key,

                amount:
                orderData.order.amount,

                currency:"INR",

                name:
                "HospiKare Labs",

                description:
                "Lab Test Booking Payment",

                order_id:
                orderData.order.id,

                handler:
                async function(response){

                    const paymentData = {

                        ...formData,

                        razorpay_order_id:
                        response
                        .razorpay_order_id,

                        razorpay_payment_id:
                        response
                        .razorpay_payment_id,

                        razorpay_signature:
                        response
                        .razorpay_signature

                    };

                    const bookingResponse =
                    await fetch(
                        "/api/book-lab-test",
                        {
                            method:"POST",

                            headers:{
                                "Content-Type":
                                "application/json"
                            },

                            body:JSON.stringify(
                                paymentData
                            )
                        }
                    );

                    const bookingData =
                    await bookingResponse.json();

                    if(bookingData.success){

                        alert(
                            "Lab Test Booked Successfully"
                        );

                        document.getElementById(
                            "labBookingModal"
                        ).style.display = "none";

                        document.getElementById(
                            "labBookingForm"
                        ).reset();

                    }
                    else{

                        alert(
                            bookingData.message
                        );

                    }

                },

                theme:{
                    color:"#2563eb"
                }

            };

            const razorpay =
            new Razorpay(options);

            razorpay.open();

        }
        catch(error){

            console.log(error);

        }

});

function openInsuranceModal(
    insuranceId,
    planName,
    claimPrice,
    insPrice
){
    selectedInsuranceId =
    insuranceId;
    selectedInsurancePlan =
    planName;
    selectedInsuranceBasePrice =
    Number(insPrice);
    if(
        isNaN(selectedInsuranceBasePrice)
    ){
        selectedInsuranceBasePrice = 0;
    }
    selectedInsuranceAmount =
    selectedInsuranceBasePrice;
    document.getElementById("insurance_plan_name").value =planName;
    document.getElementById("insurance_claim_price").value =`₹${claimPrice}`;
    document.getElementById("insurance_price").value =`₹${selectedInsuranceBasePrice}`;
    document.getElementById("insurance_duration").value = "1";
    document.getElementById("insuranceTotalAmount").innerText = `₹${selectedInsuranceAmount}`;
    document.getElementById("insuranceModal").style.display ="flex";

}

document.getElementById(
    "insurance_duration"
).addEventListener(
    "change",
    function(){
        const months = Number(this.value);
        let total =  selectedInsuranceBasePrice * months;
        if(months === 3){
            total = total - 200;
        }
        else if(months === 6){
            total =  total - 700;
        }
        else if(months === 12){
            total =  total - 2000;
        }
        if(total < 0){
            total = 0;
        }
        selectedInsuranceAmount =
        total;
        document.getElementById(
            "insuranceTotalAmount"
        ).innerText =
        `₹${selectedInsuranceAmount}`;
    }
);

document.getElementById(
    "closeInsuranceModal"
).addEventListener(
    "click",
    () => {

        document.getElementById(
            "insuranceModal"
        ).style.display = "none";

});

document.getElementById(
    "insurancePurchaseForm"
).addEventListener(
    "submit",
    async function(e){

        e.preventDefault();

        const savedUser =
        JSON.parse(
            localStorage.getItem(
                "productUser"
            )
        );

        if(!savedUser){

            alert(
                "Please Login First"
            );

            return;

        }

        try{

            const formData = {
                user_id:
                savedUser.id,
                insurance_vendor_id:
                selectedInsuranceId,
                plan_name:
                selectedInsurancePlan,
                premium_amount:
                selectedInsuranceAmount,
                plan_duration:
                document.getElementById("insurance_duration").value
            };

            const orderResponse =
            await fetch("/api/create-order",{
                    method:"POST",

                    headers:{
                        "Content-Type":
                        "application/json"
                    },

                    body:JSON.stringify({
                        amount:
                        selectedInsuranceAmount
                    })
                }
            );

            const orderData =
            await orderResponse.json();

            if(!orderData.success){

                alert(
                    "Order Failed"
                );

                return;

            }

            const options = {

                key:
                orderData.key,

                amount:
                orderData.order.amount,

                currency:"INR",

                name:
                "HospiKare Insurance",

                description:
                "Insurance Plan Purchase",

                order_id:
                orderData.order.id,

                handler:
                async function(response){

                    const paymentData = {

                        ...formData,

                        razorpay_order_id:
                        response
                        .razorpay_order_id,

                        razorpay_payment_id:
                        response
                        .razorpay_payment_id,

                        razorpay_signature:
                        response
                        .razorpay_signature

                    };

                    const purchaseResponse =
                    await fetch(
                        "/api/buy-insurance",
                        {
                            method:"POST",

                            headers:{
                                "Content-Type":
                                "application/json"
                            },

                            body:JSON.stringify(
                                paymentData
                            )
                        }
                    );

                    const purchaseData =
                    await purchaseResponse.json();

                    if(purchaseData.success){

                        alert(
                            "Insurance Purchased Successfully"
                        );

                        document.getElementById(
                            "insuranceModal"
                        ).style.display = "none";

                    }
                    else{

                        alert(
                            purchaseData.message
                        );

                    }

                },

                theme:{
                    color:"#2563eb"
                }

            };

            const razorpay =
            new Razorpay(options);

            razorpay.open();

        }
        catch(error){

            console.log(error);

        }

});

document
.querySelectorAll(".buyPlanBtn")
.forEach(button => {
    button.addEventListener(
        "click",
        function(){
            openInsuranceModal(
                this.dataset.id,
                this.dataset.name,
                this.dataset.claim,
                this.dataset.price
            );
        }
    );
});

document.addEventListener(
    "click",
    function(e){

        if(
            e.target.classList.contains(
                "buyPlanBtn"
            )
        ){

            const button = e.target;

            openInsuranceModal(

                button.dataset.id,

                button.dataset.name,

                button.dataset.claim,

                button.dataset.price

            );

        }

    }
);

document.addEventListener("click",function(e){
        const button =  e.target.closest(".buyPlanBtn");
        if(!button){
            return;
        }
        openInsuranceModal(
            button.dataset.id,
            button.dataset.name,
            button.dataset.claim,
            button.dataset.price
        );
    }
);

let selectedProductType = "";
let selectedProductId = null;
let selectedProductPrice = 0;

function openProductModal(
    type,
    id,
    name,
    brand,
    price
){

    selectedProductType = type;

    selectedProductId = id;

    selectedProductPrice =
    Number(price) || 0;

    document.getElementById(
        "buy_product_name"
    ).value = name;

    document.getElementById(
        "buy_product_brand"
    ).value = brand;

    document.getElementById(
        "buy_quantity"
    ).value = 1;

    document.getElementById(
        "productTotalAmount"
    ).innerText =
    `₹${selectedProductPrice}`;

    document.getElementById(
        "productBuyModal"
    ).style.display =
    "flex";

}

document.getElementById(
    "closeProductModal"
).addEventListener(
    "click",
    () => {

        document.getElementById(
            "productBuyModal"
        ).style.display =
        "none";

});

document.getElementById(
    "buy_quantity"
).addEventListener(
    "input",
    function(){

        const qty =
        Number(this.value) || 1;

        const total =
        qty *
        selectedProductPrice;

        document.getElementById(
            "productTotalAmount"
        ).innerText =
        `₹${total}`;

});

document.getElementById(
    "productPurchaseForm"
).addEventListener(
    "submit",
    async function(e){

        e.preventDefault();

        const savedUser =
        JSON.parse(
            localStorage.getItem(
                "productUser"
            )
        );

        if(!savedUser){

            alert(
                "Please Login First"
            );

            return;

        }

        const quantity =
        Number(
            document.getElementById(
                "buy_quantity"
            ).value
        );

        const totalAmount =
        quantity *
        selectedProductPrice;

        // CREATE ORDER

        const orderResponse =
        await fetch(
            "/api/create-order",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({
                    amount:
                    totalAmount
                })
            }
        );

        const orderData =
        await orderResponse.json();

        if(!orderData.success){

            alert(
                "Order Creation Failed"
            );

            return;

        }

        const options = {

            key:
            orderData.key,

            amount:
            orderData.order.amount,

            currency:"INR",

            name:
            "HospiKare",

            description:
            "Product Purchase",

            order_id:
            orderData.order.id,

            handler:
            async function(response){

                const purchaseResponse =
                await fetch(
                    "/api/buy-product",
                    {
                        method:"POST",

                        headers:{
                            "Content-Type":
                            "application/json"
                        },

                        body:JSON.stringify({

                            user_id:
                            savedUser.id,

                            product_type:
                            selectedProductType,

                            product_id:
                            selectedProductId,

                            quantity,

                            total_amount:
                            totalAmount,

                            razorpay_order_id:
                            response
                            .razorpay_order_id,

                            razorpay_payment_id:
                            response
                            .razorpay_payment_id

                        })
                    }
                );

                const purchaseData =
                await purchaseResponse.json();

                if(purchaseData.success){

                    alert(
                        "Purchase Successful"
                    );

                    window.open(
                        purchaseData.invoice_url,
                        "_blank"
                    );

                    document.getElementById(
                        "productBuyModal"
                    ).style.display =
                    "none";

                }
                else{

                    alert(
                        purchaseData.message
                    );

                }

            },

            theme:{
                color:"#2563eb"
            }

        };

        const razorpay =
        new Razorpay(options);

        razorpay.open();

});