window.onload = function () {
    document.getElementById("hospitalFields").classList.add("hidden");
    // HOSPITAL
    const hospitalAddress =
    document.getElementById("address");
    if(hospitalAddress){
        hospitalAddress.addEventListener(
            "input",
            function(){
                generateMapData(
                    "address",
                    "hsp_lcn",
                    "hps_crdnt"
                );
            }
        );
    }
    //ambulance
    const ambulanceAddress=document.getElementById("amb_loc");
    if(ambulanceAddress){
        ambulanceAddress.addEventListener("input", function(){
            generateMapData("amb_loc", "amb_lcn", "amb_crdnt");
        });
    }
    // LAB
    const labAddress = document.getElementById("labAddress");
    if(labAddress){
        labAddress.addEventListener(
            "input",
            function(){
                generateMapData(
                    "labAddress",
                    "location",
                    "lab_crdnt"
                );
            }
        );
    }
    
    const insuranceAddress =
    document.getElementById("ins_address");

    if(insuranceAddress){

        insuranceAddress.addEventListener(
            "input",
            function(){

                generateMapData(
                    "ins_address",
                    "ins_lcn",
                    "ins_crdnt"
                );

            }
        );

    }

const medicalAddress =
document.getElementById("pharm_address");

if(medicalAddress){

    medicalAddress.addEventListener(
        "input",
        function(){

            generateMapData(
                "pharm_address",
                "pharm_lcn",
                "pharm_crdnt"
            );

        }
    );

}

    const meaddress=document.getElementById("me_address");
    if(meaddress){
        meaddress.addEventListener("input", function(){
            generateMapData("me_address", "me_location", "me_crdnt");
        });
    }

};

async function generateMapData(
    addressInputId,
    locationInputId,
    coordinateInputId
){

    const addressField =
    document.getElementById(addressInputId);

    const locationField =
    document.getElementById(locationInputId);

    const coordinateField =
    document.getElementById(coordinateInputId);

    if(
        !addressField ||
        !locationField ||
        !coordinateField
    ){
        return;
    }

    const address =
    addressField.value.trim();

    if(address.length < 5){

        locationField.value = "";
        coordinateField.value = "";
        return;

    }

    try{

        const response =
        await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
        );

        const data =
        await response.json();

        if(data.length > 0){

            const latitude =
            data[0].lat;

            const longitude =
            data[0].lon;

            // Coordinates
            coordinateField.value =
            `${latitude}, ${longitude}`;

            // Google Maps Link
            locationField.value =
            `https://www.google.com/maps?q=${latitude},${longitude}`;

        }

    }
    catch(error){

        console.error(error);

    }

}

function showRegister() {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("registerForm").classList.remove("hidden");
}

function showLogin() {
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
}

function handleusers_type(value) {
    document.getElementById("hospitalFields").classList.add("hidden");
    document.getElementById("ambulanceFields").classList.add("hidden");
    document.getElementById("labFields").classList.add("hidden");
    document.getElementById("insuranceFields").classList.add("hidden");
    document.getElementById("medicineFields").classList.add("hidden");
    document.getElementById("equipmentFields").classList.add("hidden");

    if (value.toLowerCase() === "hospital") {
        document.getElementById("hospitalFields").classList.remove("hidden");
    } else if (value.toLowerCase() === "ambulance") {
        document.getElementById("ambulanceFields").classList.remove("hidden");
    } else if (value.toLowerCase() === "lab test") {
        document.getElementById("labFields").classList.remove("hidden");
    } else if (value.toLowerCase() === "insurance") {
        document.getElementById("insuranceFields").classList.remove("hidden");
    } else if (value.toLowerCase() === "medicines") {
        document.getElementById("medicineFields").classList.remove("hidden");
    } else if (value.toLowerCase() === "medical equipments") {
        document.getElementById("equipmentFields").classList.remove("hidden");
    }
}

function addRoom() {
    const container = document.getElementById("roomsContainer");
    const div = document.createElement("div");
    div.classList.add("dynamic-box");
    div.innerHTML = `
        <div class="input-group">
            <label>Total Beds</label>
            <input type="number" class="room-total-beds">
        </div>
        <div class="input-group">
            <label>Room Type</label>
            <select class="room-type">
                <option>General</option>
                <option>ICU</option>
                <option>Deluxe</option>
            </select>
        </div>
        <div class="input-group">
            <label>Availability</label>
            <select class="room-availability">
                <option>Available</option>
                <option>Full</option>
            </select>
        </div>
        <div class="input-group">
            <label>Pricing</label>
            <input type="text" class="room-pricing">
        </div>
        <div class="input-group">
            <label>Details</label>
            <input type="text" class="room-details">
        </div>
        <button type="button" class="btn small remove-btn" onclick="this.parentElement.remove()">Remove Room</button>
    `;
    container.appendChild(div);
}

function addDoctor() {
    const container = document.getElementById("doctorsContainer");
    const div = document.createElement("div");
    div.classList.add("dynamic-box");
    div.innerHTML = `
        <div class="input-group">
            <label>Doctor Name</label>
            <input type="text" class="doctor-name">
        </div>
        <div class="input-group">
            <label>Doctor Image</label>
            <input type="file" class="doctor-image">
        </div>
        <div class="input-group">
            <label>Qualification</label>
            <input type="text" class="doctor-qualification">
        </div>
        <div class="input-group">
            <label>Experience</label>
            <input type="text" class="doctor-experience">
        </div>
        <button type="button" class="btn small remove-btn" onclick="this.parentElement.remove()">Remove Doctor</button>
    `;
    container.appendChild(div);
}

function addPathologist() {
    const container = document.getElementById("pathologistContainer");
    const div = document.createElement("div");
    div.classList.add("dynamic-box");
    div.innerHTML = `
        <div class="input-group">
            <label>Name</label>
            <input type="text" class="pathologist-name">
        </div>
        <div class="input-group">
            <label>Qualification</label>
            <input type="text" class="pathologist-qualification">
        </div>
        <div class="input-group">
            <label>Experience</label>
            <input type="text" class="pathologist-experience">
        </div>
        <div class="input-group">
            <label>Medical Registration Proof</label>
            <input type="file" class="pathologist-proof">
        </div>
        <button type="button" class="btn small remove-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
    container.appendChild(div);
}

document.querySelector("#registerForm form").addEventListener("submit", async function(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", document.querySelector("#registerForm input[placeholder='Enter name']").value.trim());
    formData.append(
        "email_or_contact",
        document.querySelector("#registerForm input[placeholder='Enter email or phone']").value.trim()
    );
    const users_type = document.getElementById("userType")
        .value
        .toLowerCase()
        .trim();
    formData.append("user_type", users_type);
    const passwords = document.querySelectorAll("#registerForm input[type='password']");
    const setPassword = passwords[0]?.value.trim() || "";
    const confirmPassword = passwords[1]?.value.trim() || "";
    if (setPassword.length < 4) {
        alert("Password should be at least 4 characters long!");
        return;
    }
    if (setPassword !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }
    formData.append("password", setPassword);

    const bankInput = document.querySelector("input[placeholder='Account Number']");
    const ifscInput = document.querySelector("input[placeholder='IFSC Code']");
    if (bankInput) formData.append("bank_account", bankInput.value.trim());
    if (ifscInput) formData.append("ifsc", ifscInput.value.trim());

    const allFiles = document.querySelectorAll("#registerForm input[type='file']");
    if (allFiles[0]?.files[0]) formData.append("identity_proof", allFiles[0].files[0]);
    if (allFiles[1]?.files[0]) formData.append("profile_photo", allFiles[1].files[0]);
    if (allFiles[2]?.files[0]) formData.append("cheque", allFiles[2].files[0]);


    if (users_type === "hospital") {
        formData.append("hospital_name", document.querySelector("#hospitalFields input[name='hospital_name']").value);
        formData.append("address", document.getElementById("address").value);
        formData.append("facilities", document.querySelector("#hospitalFields input[placeholder='Oxygen, ICU, Ventilator']").value);
        formData.append("location", document.getElementById("hsp_lcn").value);
        formData.append("coordinates", document.getElementById("hsp_crdnt").value);

        const rooms = [];
        document.querySelectorAll("#roomsContainer .dynamic-box").forEach(box => {
            rooms.push({
                total_beds: box.querySelector(".room-total-beds")?.value || "",
                room_type: box.querySelector(".room-type")?.value || "",
                availability: box.querySelector(".room-availability")?.value || "",
                pricing: box.querySelector(".room-pricing")?.value || "",
                details: box.querySelector(".room-details")?.value || ""
            });
        });
        formData.append("rooms", JSON.stringify(rooms));

        const doctors = [];
        document.querySelectorAll("#doctorsContainer .dynamic-box").forEach(box => {
            doctors.push({
                doctor_name: box.querySelector(".doctor-name")?.value || "",
                qualification: box.querySelector(".doctor-qualification")?.value || "",
                experience: box.querySelector(".doctor-experience")?.value || ""
            });
        });
        formData.append("doctors", JSON.stringify(doctors));

        const hospImages = document.querySelector("#hospitalFields input[multiple]");
        if (hospImages?.files?.length > 0) {
            for (let file of hospImages.files) {
                formData.append("hospital_images", file);
            }
        }
    }

    else if (users_type === "ambulance") {
        const ambInputs = document.querySelectorAll("#ambulanceFields input");
        const ambSelects = document.querySelectorAll("#ambulanceFields select");

        formData.append("ambulance_type", ambSelects[0]?.value || "");
        formData.append("base_chrge", ambInputs[0]?.value || "");
        formData.append("min_chrge", ambInputs[1]?.value || "");
        formData.append("night_chrg", ambInputs[2]?.value || "");
        formData.append("wait_chrg", ambInputs[3]?.value || "");
        formData.append("status", ambSelects[1]?.value || "");
        formData.append("eta", ambInputs[4]?.value || "");
        formData.append("book_time_slot", ambInputs[5]?.value || "");
        formData.append("area", ambInputs[6]?.value || "");
        formData.append("amb_lcn", document.getElementById("amb_lcn").value);
        formData.append("amb_crdnt", document.getElementById("amb_crdnt").value);
        formData.append("description", ambInputs[7]?.value || "");
        formData.append("driver_exp", ambInputs[8]?.value || "");

        const ambFiles = document.querySelectorAll("#ambulanceFields input[type='file']");
        if (ambFiles[0]?.files[0]) formData.append("lic", ambFiles[0].files[0]);
        if (ambFiles[1]?.files[0]) formData.append("rc", ambFiles[1].files[0]);
        if (ambFiles[2]?.files[0]) formData.append("veh_ins", ambFiles[2].files[0]);
    }

    else if (users_type === "lab test") {
        formData.append("lab_name", document.getElementById("lab_name").value);
        formData.append("address", document.getElementById("labAddress").value);
        formData.append("description", document.getElementById("description").value);
        formData.append("location", document.getElementById("location").value || "");
        formData.append("lab_crdnt", document.getElementById("lab_crdnt").value);

        const labTypes = [], tests = [];
        document.querySelectorAll("#labFields input[type='checkbox']:checked").forEach(cb => {
            const label = cb.parentElement.textContent.trim();
            if (["Pathology","Radiology","Diagnostic"].includes(label)) labTypes.push(label);
            else tests.push(label);
        });
        formData.append("lab_type", JSON.stringify(labTypes));
        formData.append("test", JSON.stringify(tests));

        const labSelects = document.querySelectorAll("#labFields select");
        formData.append("home_coll", labSelects[0]?.value || "");
        formData.append("extra_chrg", document.getElementById("ext_chrg").value || 0);
        formData.append("available_areas", document.getElementById("alb_area").value);
        formData.append("lab_hrs", document.getElementById("lab_open").value);
        formData.append("test_time", document.getElementById("test_time").value || "");
        formData.append("test_price", document.getElementById("test_price").value || 0);
        formData.append("emergency_test", labSelects[1]?.value || "No");
        formData.append("adv_equipment", labSelects[2]?.value || "No");

        const pathologists = [];
        document.querySelectorAll("#pathologistContainer .dynamic-box").forEach(box => {
            pathologists.push({
                name: box.querySelector(".pathologist-name")?.value || "",
                qualification: box.querySelector(".pathologist-qualification")?.value || "",
                experience: box.querySelector(".pathologist-experience")?.value || ""
            });
        });
        formData.append("pathologist", JSON.stringify(pathologists));

        const labFiles = document.querySelectorAll("#labFields input[type='file']");
        if (labFiles[0]?.files[0]) formData.append("lab_reg", labFiles[0].files[0]);
        if (labFiles[1]?.files[0]) formData.append("nabl", labFiles[1].files[0]);
        if (labFiles[2]?.files[0]) formData.append("path_qual_cer", labFiles[2].files[0]);
    }

    else if (users_type === "insurance") {
        formData.append("comp_name", document.getElementById("company_name").value);
        formData.append("comp_type", document.getElementById("company_type").value);
        formData.append("description", document.getElementById("ins_description").value);
        formData.append("irdai", document.getElementById("irdai_number").value);
        formData.append("comp_pan", document.getElementById("company_pan").value);
        formData.append("gst", document.getElementById("gst_number").value);
        formData.append("offc_add", document.getElementById("ins_address").value);
        formData.append("ins_lcn", document.getElementById("ins_lcn").value);
        formData.append("ins_crdnt", document.getElementById("ins_crdnt").value);
        const claimType = document.getElementById("claim_type");
        const claimTime = document.getElementById("claim_approval_time");
        formData.append("claim_type", claimType ? claimType.value : "");
        formData.append("claim_time", claimTime ? claimTime.value : "");
        formData.append("doc_req", document.getElementById("required_docs").value);
        formData.append("cust_sup_num", document.getElementById("contact_number").value);
        formData.append("email_sup", document.getElementById("ins_email").value);
        formData.append("contact_person", document.getElementById("contact_person").value);
        formData.append("website", document.getElementById("website").value);
        formData.append("ins_price", document.getElementById("ins_price").value);
        formData.append("claim_price", document.getElementById("claim_price").value);
        const regDoc = document.getElementById("reg_doc");
        const policyDoc = document.getElementById("policy_doc");
        if (regDoc.files[0]) {
            formData.append("incorp_cert", regDoc.files[0]);
        }
        if (policyDoc.files[0]) {
            formData.append("add_proof", policyDoc.files[0]);
        }
    }

    else if (users_type === "medicines") {
        formData.append("pharm_name", document.getElementById("pharm_shop_name").value);
        formData.append("owner_name", document.getElementById("own_name").value);
        formData.append("shop_type", document.getElementById("shop_type").value);
        formData.append("description", document.getElementById("pharm_desc").value);
        formData.append("issued_by", document.getElementById("issued_by").value);
        formData.append("address", document.getElementById("pharm_address").value);
        formData.append("location", document.getElementById("pharm_lcn").value);
        formData.append("med_crdnt", document.getElementById("pharm_crdnt").value);
        formData.append("pharmacist_name", document.getElementById("pharmacist_name").value);
        formData.append("phar_counc_reg", document.getElementById("state_pharmacy_registration").value);
        const availableProducts = [];
        document.querySelectorAll(
            "#medicineFields .checkbox-grid input[type='checkbox']"
        ).forEach((checkbox) => {
            if (checkbox.checked) {
                availableProducts.push(
                    checkbox.parentElement.textContent.trim()
                );
            }
        });
        formData.append("prod_avb",
            JSON.stringify(availableProducts)
        );
        formData.append("home_dev",
            document.getElementById("pharm_home_delivery").value
        );
        formData.append("dev_area",
            document.getElementById("pharm_dev_area").value
        );
        formData.append("dev_chrg",
            document.getElementById("pharm_dev_charges").value
        );
        formData.append("shop_hrs",
            document.getElementById("pharm_opening_hours").value
        );
        formData.append("avlblty",
            document.getElementById("pharm_availability").value
        );
        const medicineFiles = document.querySelectorAll(
            "#medicineFields input[type='file']"
        );
        if (medicineFiles[0]?.files[0]) {
            formData.append("drug_lic", medicineFiles[0].files[0]);
        }
        if (medicineFiles[1]?.files[0]) {
            formData.append("address_proof", medicineFiles[1].files[0]);
        }
        if (medicineFiles[2]?.files[0]) {
            formData.append("gst_cer", medicineFiles[2].files[0]);
        }
        if (medicineFiles[3]?.files[0]) {
            formData.append("pharm_cer", medicineFiles[3].files[0]);
        }
    }

    else if (users_type === "medical equipments") {
        formData.append("ven_bus_name",document.getElementById("me_vn").value);
        formData.append("owner_name", document.getElementById("me_on").value);
        formData.append("business_type",document.getElementById("me_bt").value);
        formData.append("description",document.getElementById("me_desc").value);
        formData.append("address",document.getElementById("me_address").value);
        formData.append("location",document.getElementById("me_location").value);
        formData.append("medeq_crdnt", document.getElementById("me_crdnt").value);
        const addressProof = document.getElementById("me_address_proof");
        const qualityCertificates = document.getElementById("me_quality_certificates");
        const approvalCompliance = document.getElementById("me_approval_compliance");
        if (addressProof.files[0]) {
            formData.append("address_proof", addressProof.files[0]);
        }
        if (qualityCertificates.files[0]) {
            formData.append("qual_cer", qualityCertificates.files[0]);
        }
        if (approvalCompliance.files[0]) {
            formData.append("app_comp", approvalCompliance.files[0]);
        }
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            alert("Registration successful! Your account is pending admin approval.");
            showLogin();
        } else {
            alert("Registration Failed: " + (result.message || "Please try again"));
        }
    } catch (error) {
        console.error(error);
        alert("Server connection error. Please try again.");
    }
});

document.querySelector("#loginForm form").addEventListener("submit", async function(e) {
    e.preventDefault();

    const email = document.querySelector("#loginForm input[type='text']").value;
    const password = document.querySelector("#loginForm input[type='password']").value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email_or_contact: email,
                password: password
            })
        });

        const result = await response.json();

        if (result.success) {
            // 🔥 REDIRECT
            window.location.href = result.redirect;
        } else {
            alert(result.message);
        }

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
});