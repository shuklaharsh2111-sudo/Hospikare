const session = require('express-session');
const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const XLSX = require('xlsx');
const app = express();
const PORT = 5000;
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

const razorpay = new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET
});

app.use(cors());
app.use(cors({
    origin: 'http://localhost:5000',    
    credentials: true,                  
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'rg.html'));
});
app.use(session({
    secret: 'hospikare-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'hospinew',
    waitForConnections: true,
    connectionLimit: 10
});

const safeNumber = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
};

const safeString = (val) => {
    if (!val || val.trim() === "") return null;
    return val.trim();
};

async function getCommissionPercent(userType){

    const [rows] = await pool.query(
        `
        SELECT commission_percent
        FROM commissions
        WHERE LOWER(user_type) = LOWER(?)
        `,
        [userType]
    );

    if(rows.length === 0){
        return 0;
    }

    return Number(rows[0].commission_percent || 0);

}

function calculateCommissionAmount(
    originalAmount,
    commissionPercent
){

    const amount =
    Number(originalAmount || 0);

    const commission =
    (amount * commissionPercent) / 100;

    const finalAmount =
    amount - commission;

    return {

        originalAmount: amount,

        commissionPercent,

        commissionAmount:
        commission,

        finalAmount

    };

}

//1
app.post('/api/register', upload.fields([
    { name: 'identity_proof', maxCount: 1 },
    { name: 'profile_photo', maxCount: 1 },
    { name: 'cheque', maxCount: 1 },
    { name: 'hospital_reg_certificate', maxCount: 1 },
    { name: 'shop_license', maxCount: 1 },
    { name: 'medical_council_registration', maxCount: 1 },
    { name: 'electricity_bill', maxCount: 1 },
    { name: 'lic', maxCount: 1 },
    { name: 'rc', maxCount: 1 },
    { name: 'veh_ins', maxCount: 1 },
    { name: 'lab_reg', maxCount: 1 },
    { name: 'nabl', maxCount: 1 },
    { name: 'path_qual_cer', maxCount: 1 },
    { name: 'incorp_cert', maxCount: 1 },
    { name: 'add_proof', maxCount: 1 },
    { name: 'drug_lic', maxCount: 1 },
    { name: 'address_proof', maxCount: 1 },
    { name: 'gst_cer', maxCount: 1 },
    { name: 'pharm_cer', maxCount: 1 },
    { name: 'qual_cer', maxCount: 1 },
    { name: 'app_comp', maxCount: 1 },
    { name: 'hospital_images', maxCount: 10 }
]), async (req, res) => {
    try {
        const body = req.body;
        const users_type = String(body.user_type || '')
        .toLowerCase()
        .trim();

        if (!users_type) {
            return res.status(400).json({ success: false, message: "User type is required" });
        }

        // ==================== CREATE USER ====================
        const [userResult] = await pool.query(
            `INSERT INTO users 
             (name, emailorcontact, identity_proof, profile_photo, bank_account, ifsc, 
              cheque, users_type, password, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [
                body.name,
                body.email_or_contact,
                req.files['identity_proof']?.[0]?.filename || null,
                req.files['profile_photo']?.[0]?.filename || null,
                body.bank_account || null,
                body.ifsc || null,
                req.files['cheque']?.[0]?.filename || null,
                body.user_type,
                body.password
            ]
        );

        const userId = userResult.insertId;

        // ==================== HOSPITAL ====================
        if (users_type === 'hospital') {
            const hospitalImages = req.files['hospital_images']
                ? req.files['hospital_images'].map(file => file.filename)
                : [];
            await pool.query(`
                INSERT INTO hospitals (
                    users_id,
                    hospital_images,
                    hospital_name,
                    address,
                    location,
                    cordinates,
                    facilities,
                    rooms,
                    doctors,
                    hospital_reg_certificate,
                    shop_license,
                    medical_council_registration,
                    electricity_bill
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                userId,
                JSON.stringify(hospitalImages),
                body.hospital_name,
                body.address,
                body.location || null,
                body.coordinates || null,
                body.facilities,
                body.rooms || null,
                body.doctors || null,
                req.files['hospital_reg_certificate']?.[0]?.filename || null,
                req.files['shop_license']?.[0]?.filename || null,
                req.files['medical_council_registration']?.[0]?.filename || null,
                req.files['electricity_bill']?.[0]?.filename || null
            ]);
        }
        // ==================== AMBULANCE ====================
        else if (users_type === 'ambulance') {
            await pool.query(`
                INSERT INTO ambulances (users_id, ambulance_type, base_chrge, min_chrge, 
                night_chrg, wait_chrg, status, eta, book_time_slot, area, description, 
                lic, rc, driver_exp, veh_ins, map_links, cordinates)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    body.ambulance_type,
                    body.base_chrge,
                    body.min_chrge,
                    body.night_chrg,
                    body.wait_chrg,
                    body.status || 'Available',
                    body.eta,
                    body.book_time_slot,
                    body.area,
                    body.description,
                    req.files['lic']?.[0]?.filename || null,
                    req.files['rc']?.[0]?.filename || null,
                    body.driver_exp,
                    req.files['veh_ins']?.[0]?.filename || null,
                    body.amb_lcn || null,
                    body.amb_crdnt || null,
                ]
            );
        }

        // ==================== LAB (Complete) ====================
        else if (users_type === 'lab test' || users_type === 'lab') {
            await pool.query(`
                INSERT INTO labs 
                (users_id, lab_name, address, location, cordinates, description, lab_type, test, 
                 home_coll, extra_chrg, available_areas, lab_reg, nabl, path_qual_cer, 
                 pathologist, adv_equipment, lab_hrs, test_time, emergency_test, test_price)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    body.lab_name,
                    body.address,
                    body.location || null,
                    body.lab_crdnt || null,
                    body.description,
                    body.lab_type || null,           // JSON
                    body.test || null,               // JSON
                    body.home_coll,
                    body.extra_chrg || 0,
                    body.available_areas,
                    req.files['lab_reg']?.[0]?.filename || null,
                    req.files['nabl']?.[0]?.filename || null,
                    req.files['path_qual_cer']?.[0]?.filename || null,
                    body.pathologist || null,        // JSON
                    body.adv_equipment || 'No',
                    body.lab_hrs,
                    body.test_time,
                    body.emergency_test || 'No',
                    body.test_price
                ]
            );
        }

        // ==================== INSURANCE ====================
        else if (users_type === 'insurance') {
            await pool.query(`
                INSERT INTO insurances (users_id, comp_name, comp_type, description, irdai, 
                comp_pan, gst, incorp_cert, offc_add, location, cordinates, add_proof, claim_type, doc_req, 
                claim_time, cust_sup_num, email_sup, contact_person, website, ins_price, claim_price)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId, body.comp_name, body.comp_type, body.description,body.irdai, body.comp_pan, body.gst,
                    req.files['incorp_cert']?.[0]?.filename || null, body.offc_add, body.ins_lcn || null, body.ins_crdnt || null,
                    req.files['add_proof']?.[0]?.filename || null,
                    body.claim_type, body.doc_req, body.claim_time, body.cust_sup_num, body.email_sup, body.contact_person,
                    body.website, body.ins_price, body.claim_price
                ]
            );
        }

        // ==================== MEDICINES ====================
        else if (users_type === 'medicines') {
            await pool.query(`
                INSERT INTO medicines 
                (users_id, pharm_name, owner_name, shop_type, description, drug_lic, issued_by, 
                 address, address_proof, location, cordinates, phar_counc_reg, prod_avb, home_dev, 
                 dev_area, dev_chrg, shop_hrs, avlblty, gst_cer, pharm_cer)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    body.pharm_name,
                    body.owner_name,
                    body.shop_type,
                    body.description,
                    req.files['drug_lic']?.[0]?.filename || null,
                    body.issued_by,
                    body.address,
                    req.files['address_proof']?.[0]?.filename || null,
                    body.location,
                    body.med_crdnt || null,
                    body.phar_counc_reg,
                    body.prod_avb || null,
                    body.home_dev,
                    body.dev_area,
                    body.dev_chrg || 0,
                    body.shop_hrs,
                    body.avlblty,
                    req.files['gst_cer']?.[0]?.filename || null,
                    req.files['pharm_cer']?.[0]?.filename || null
                ]
            );
        }

        // ==================== MEDICAL EQUIPMENTS ====================
        else if (users_type === 'medical equipments') {
            await pool.query(`
                INSERT INTO med_equipments 
                (users_id, ven_bus_name, owner_name, business_type, description, address, 
                 address_proof, location, cordinates, qual_cer, app_comp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    body.ven_bus_name,
                    body.owner_name,
                    body.business_type,
                    body.description,
                    body.address,
                    req.files['address_proof']?.[0]?.filename || null,
                    body.location || null,
                    body.medeq_crdnt || null,
                    req.files['qual_cer']?.[0]?.filename || null,
                    req.files['app_comp']?.[0]?.filename || null
                ]
            );
        }

        res.json({ 
            success: true, 
            message: "Registration successful! Your account is under admin review.",
            userId 
        });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Registration failed",
            error: error.message 
        });
    }
});

//2
app.post('/api/login', async (req, res) => {
    try {
        const { email_or_contact, password } = req.body;

        const [adminRows] = await pool.query(
            "SELECT * FROM admin WHERE email = ? AND pswd = ?",
            [email_or_contact, password]
        );

        if (adminRows.length > 0) {
            req.session.admin = {
                id: adminRows[0].id,
                name: adminRows[0].name
            };
        
            // Force session save
            req.session.save((err) => {
                if (err) console.error("Session Save Error:", err);
            });
        
            return res.json({
                success: true,
                role: "admin",
                redirect: "/admin.html"
            });
        }

        // ================= USER LOGIN =================
        const [userRows] = await pool.query(
            "SELECT * FROM users WHERE emailorcontact = ? AND password = ?",
            [email_or_contact, password]
        );

        if (userRows.length === 0) {
            return res.json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const user = userRows[0];

        // STATUS CHECK
        if (user.status !== "approved") {
            return res.json({
                success: false,
                message: "Account not approved yet"
            });
        }

        req.session.user = {
            id: user.id,
            name: user.name,
            type: user.users_type
        };

        // ================= ROLE BASED REDIRECT =================
        let redirectPage = "";

        const type = user.users_type.toLowerCase();

        if (type === "ambulance") redirectPage = "/amb.html";
        else if (type === "hospital") redirectPage = "/hsp.html";
        else if (type === "insurance") redirectPage = "/ins.html";
        else if (type === "lab test") redirectPage = "/lt.html";
        else if (type === "medicines") redirectPage = "/mdc.html";
        else if (type === "medical equipments") redirectPage = "/mdeq.html";

        return res.json({
            success: true,
            role: "user",
            users_type: user.users_type,
            redirect: redirectPage
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

//3
app.get('/api/admin/profile', (req, res) => {
    if (!req.session.admin) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
    res.json({
        success: true,
        admin: {
            id: req.session.admin.id,
            name: req.session.admin.name
        }
    });
});

//4
app.post('/api/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err){
            return res.json({
                success: false,
                message: "Logout failed"
            });
        }
        res.clearCookie('connect.sid');
        res.json({
            success: true
        });
    });
});

//5
app.get('/api/vendors', async (req, res) => {

    try {

        const [vendors] = await pool.query(`
            SELECT *
            FROM users
        `);

        for (const vendor of vendors) {

            let revenue = 0;

            // =====================================================
            // MEDICINES
            // =====================================================

            if (
                vendor.users_type &&
                vendor.users_type.toLowerCase().includes("medicine")
            ) {

                const [medicineRevenue] = await pool.query(`
                    SELECT
                        SUM(total_amount) AS total
                    FROM user_medicine_orders
                    WHERE medicine_vendor_id = ?
                    AND payment_status = 'paid'
                `, [vendor.id]);

                revenue += Number(
                    medicineRevenue[0]?.total || 0
                );
            }

            // =====================================================
            // MEDICAL EQUIPMENTS
            // =====================================================

            if (
                vendor.users_type &&
                vendor.users_type.toLowerCase().includes("equipment")
            ) {

                const [equipmentRevenue] = await pool.query(`
                    SELECT
                        SUM(total_amount) AS total
                    FROM user_equipment_orders
                    WHERE equipment_vendor_id = ?
                    AND payment_status = 'paid'
                `, [vendor.id]);

                revenue += Number(
                    equipmentRevenue[0]?.total || 0
                );
            }

            // =====================================================
            // HOSPITAL
            // =====================================================

            if (
                vendor.users_type &&
                vendor.users_type.toLowerCase().includes("hospital")
            ) {

                const [hospitalRevenue] = await pool.query(`
                    SELECT
                        SUM(total_amount) AS total
                    FROM user_hospital_bookings
                    WHERE hospital_id IN (

                        SELECT id
                        FROM hospitals
                        WHERE users_id = ?

                    )
                    AND payment_status = 'paid'
                `, [vendor.id]);

                revenue += Number(
                    hospitalRevenue[0]?.total || 0
                );
            }

            // =====================================================
            // LAB TEST
            // =====================================================

            if (
                vendor.users_type &&
                vendor.users_type.toLowerCase().includes("lab")
            ) {

                const [labRevenue] = await pool.query(`
                    SELECT
                        SUM(total_amount) AS total
                    FROM user_lab_test_bookings
                    WHERE lab_vendor_id IN (

                        SELECT id
                        FROM labs
                        WHERE users_id = ?

                    )
                    AND payment_status = 'paid'
                `, [vendor.id]);

                revenue += Number(
                    labRevenue[0]?.total || 0
                );
            }
            if (
                vendor.users_type &&
                vendor.users_type.toLowerCase().includes("ambulance")
            ) {

            const [ambulanceRevenue] =
            await pool.query(`

                SELECT
                    SUM(
                        user_ambulance_bookings.total_amount
                    ) AS total

                FROM user_ambulance_bookings

                INNER JOIN ambulances
                ON user_ambulance_bookings.ambulance_id =
                ambulances.id

                WHERE ambulances.users_id = ?

                AND user_ambulance_bookings.payment_status = 'paid'

            `,[vendor.id]);

            revenue += Number(
                ambulanceRevenue[0]?.total || 0
            );
            }
            // =====================================================
            // INSURANCE
            // =====================================================

            if (
                vendor.users_type &&
                vendor.users_type.toLowerCase().includes("insurance")
            ) {

                const [insuranceRevenue] = await pool.query(`
                    SELECT
                        SUM(vendor_amount) AS total
                    FROM user_insurance_purchases
                    WHERE insurance_vendor_id IN (

                        SELECT id
                        FROM insurances
                        WHERE users_id = ?

                    )
                    AND payment_status = 'paid'
                `, [vendor.id]);

                revenue += Number(
                    insuranceRevenue[0]?.total || 0
                );
            }

            // =====================================================
            // PAID PAYOUTS
            // =====================================================

            const [paidRows] = await pool.query(`
                SELECT
                    SUM(amount) AS paid
                FROM vendor_payouts
                WHERE vendor_id = ?
            `, [vendor.id]);

            const paidAmount =
                Number(paidRows[0]?.paid || 0);

            // =====================================================
            // COMMISSION
            // =====================================================

            const commissionPercent =
                await getCommissionPercent(
                    vendor.users_type
                );

            const commissionData =
                calculateCommissionAmount(
                    revenue,
                    commissionPercent
                );

            vendor.originalRevenue =
                revenue;

            vendor.commissionPercent =
                commissionPercent;

            vendor.commissionAmount =
                commissionData.commissionAmount;

            vendor.vendorAmount =
                commissionData.finalAmount;

            vendor.paidAmount =
                paidAmount;

            vendor.revenue =
                commissionData.finalAmount
                - paidAmount;
        }

        res.json({
            success: true,
            vendors
        });

    }
    catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: "Server Error"
        });

    }

});

//6
app.put('/api/vendor/status/:id', async (req, res) => {
    try{
        if(!req.session.admin){
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const vendorId = req.params.id;
        const { status } = req.body;
        const normalizedStatus = String(status || '').toLowerCase();
        const sql = `
            UPDATE users
            SET status = ?
            WHERE id = ?
        `;
        await pool.query(sql, [normalizedStatus, vendorId]);
        res.json({
            success: true,
            message: "Status updated"
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});

//7
app.get('/api/users', async (req, res) => {
    try{
        if(!req.session.admin){
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const sql = `
            SELECT
                id,
                name,
                emailorcontact,
                profile_photo,
                users_type,
                status
            FROM users
            WHERE status = 'approved'
        `;
        const [result] = await pool.query(sql);
        res.json({
            success: true,
            users: result
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});

//8
app.get('/api/vendor/details/:id', async(req,res) => {
    try{
        const id = req.params.id;
        const [users] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        if(users.length === 0){
            return res.json({
                success: false,
                message: 'Vendor not found'
            });
        }
        const user = users[0];
        let details = null;
        const userType = String(user.users_type || '').toLowerCase();

        if(userType === 'hospital'){
            const [data] = await pool.query(
                'SELECT * FROM hospitals WHERE users_id = ?',
                [id]
            );
            details = data[0];
        }
        else if(userType === 'ambulance'){
            const [data] = await pool.query(
                'SELECT * FROM ambulances WHERE users_id = ?',
                [id]
            );
            details = data[0];
        }
        else if(userType === 'lab test' || userType === 'lab'){
            const [data] = await pool.query(
                'SELECT * FROM labs WHERE users_id = ?',
                [id]
            );
            details = data[0];
        }
        else if(userType === 'insurance'){
            const [data] = await pool.query(
                'SELECT * FROM insurances WHERE users_id = ?',
                [id]
            );
            details = data[0];
        }
        else if(userType === 'medicines'){
            const [data] = await pool.query(
                'SELECT * FROM medicines WHERE users_id = ?',
                [id]
            );
            details = data[0];
        }
        else if(userType === 'medical equipments' || userType === 'medical equipment'){
            const [data] = await pool.query(
                'SELECT * FROM med_equipments WHERE users_id = ?',
                [id]
            );
            details = data[0];
        }
        res.json({
            success: true,
            user,
            details
        });
    }
    catch(error){
        console.log(error);
        res.json({
            success: false,
            message: 'Server Error'
        });
    }
});

//9
app.get('/api/user/profile', (req, res) => {
    try{
        if(!req.session.user){
            return res.json({
                success: false,
                message: "Unauthorized"
            });
        }
        res.json({
            success: true,
            user: req.session.user
        });
    }
    catch(error){
        console.log(error);
        res.json({
            success: false,
            message: "Server Error"
        });
    }
});

//10
app.post('/api/user/logout', (req,res) => {
    req.session.destroy(() => {
        res.json({
            success:true
        });
    });
});

//11
app.get('/api/hospitals', async(req,res) => {
    try{
        if(!req.session.user){
            return res.json({
                success:false,
                message:"Unauthorized"
            });
        }
        const userId =
            req.session.user.id;
        const [hospitals] =
            await pool.query(
                `
                SELECT *
                FROM hospitals
                WHERE users_id = ?
                ORDER BY id DESC
                `,
                [userId]
            );
        res.json({
            success:true,
            hospitals
        });
    }
    catch(error){
        console.log(error);
        res.json({
            success:false,
            message:"Server Error"
        });
    }
});

//12
app.get('/api/hospital/availability', async(req,res) => {
    try{
        if(!req.session.user){
            return res.json({
                success:false,
                message:"Unauthorized"
            });
        }
        const userId = req.session.user.id;
        const [hospitals] =
            await pool.query(
                `
                SELECT *
                FROM hospitals
                WHERE users_id = ?
                `,
                [userId]
            );
        let availableHospitals = [];
        hospitals.forEach(hospital => {
            if(!hospital.rooms) return;
            let rooms = [];
            try{
                if(typeof hospital.rooms === "string"){
                    rooms = JSON.parse(hospital.rooms);
                }
                else{
                    rooms = hospital.rooms;
                }
            }
            catch(error){
                console.log(error);
                return;
            }
            const hasAvailableRoom =
                rooms.some(room =>
                    room.availability
                    &&
                    room.availability
                    .toLowerCase() === 'available'
                );
            if(hasAvailableRoom){
                availableHospitals.push(hospital);
            }
        });
        res.json({
            success:true,
            hospitals:availableHospitals
        });
    }
    catch(error){
        console.log(error);
        res.json({
            success:false,
            message:"Server Error"
        });
    }
});

//13
app.post('/api/add/hospital',
    upload.fields([
        {
            name:'hospital_images',
            maxCount:3
        },
        {
            name:'hospital_reg_certificate',
            maxCount:1
        },
        {
            name:'shop_license',
            maxCount:1
        },
        {
            name:'medical_council_registration',
            maxCount:1
        },
        {
            name:'electricity_bill',
            maxCount:1
        }
    ]),
    async(req,res) => {
        try{
            const body = req.body;
            if(!req.session.user){
                return res.json({
                    success:false,
                    message:"Unauthorized"
                });
            }
            const userId =
                req.session.user.id;
            const hospitalImages =
                req.files[
                    'hospital_images'
                ]?.map(
                    file => file.filename
                ) || [];
            await pool.query(
                `
                INSERT INTO hospitals
                (
                    users_id,
                    hospital_images,
                    hospital_name,
                    address,
                    facilities,
                    rooms,
                    doctors,
                    hospital_reg_certificate,
                    shop_license,
                    medical_council_registration,
                    electricity_bill
                )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    userId,
                    JSON.stringify(
                        hospitalImages
                    ),
                    body.hospital_name,
                    body.address,
                    body.facilities,
                    body.rooms,
                    body.doctors,
                    req.files[
                        'hospital_reg_certificate'
                    ]?.[0]?.filename || null,
                    req.files[
                        'shop_license'
                    ]?.[0]?.filename || null,
                    req.files[
                        'medical_council_registration'
                    ]?.[0]?.filename || null,
                    req.files[
                        'electricity_bill'
                    ]?.[0]?.filename || null
                ]
            );
            res.json({
                success:true
            });
        }
        catch(error){
            console.log(error);
            res.json({
                success:false
            });
        }
});

//14
app.get('/api/user/hospitals',
    async(req,res) => {
        try{
            const userId =
                req.session.user.id;
            const [hospitals] =
                await pool.query(
                    `
                    SELECT
                        id,
                        hospital_name
                    FROM hospitals
                    WHERE users_id = ?
                    `,
                    [userId]
                );
            res.json({
                success:true,
                hospitals
            });
        }
        catch(error){
            console.log(error);
            res.json({
                success:false
            });
        }
});

//15
app.post('/api/add/room',
    async(req,res) => {
        try{
            const {
                hospital_id,
                details,
                pricing,
                room_type,
                total_beds,
                availability
            } = req.body;
            const [rows] =
                await pool.query(
                    `
                    SELECT rooms
                    FROM hospitals
                    WHERE id = ?
                    `,
                    [hospital_id]
                );
            let rooms = [];
            if(rows[0].rooms){
                if(
                    typeof rows[0].rooms
                    === "string"
                ){
                    rooms =
                        JSON.parse(
                            rows[0].rooms
                        );
                }
                else{
                    rooms =
                        rows[0].rooms;

                }
            }
            rooms.push({
                details,
                pricing,
                room_type,
                total_beds,
                availability
            });
            await pool.query(
                `
                UPDATE hospitals
                SET rooms = ?
                WHERE id = ?
                `,
                [
                    JSON.stringify(rooms),
                    hospital_id
                ]
            );
            res.json({
                success:true
            });
        }
        catch(error){
            console.log(error);
            res.json({
                success:false
            });
        }
});

//16
app.get('/api/availability',
    async(req,res) => {
        try{
            if(!req.session.user){
                return res.json({
                    success:false,
                    message:"Unauthorized"
                });
            }
            const userId =
                req.session.user.id;
            const [hospitals] =
                await pool.query(
                    `
                    SELECT
                        id,
                        hospital_name,
                        rooms
                    FROM hospitals
                    WHERE users_id = ?
                    `,
                    [userId]
                );
            const availableRooms = [];
            const unavailableRooms = [];
            hospitals.forEach(hospital => {
                if(!hospital.rooms) return;
                let rooms = [];
                if(
                    typeof hospital.rooms
                    === "string"
                ){
                    rooms =
                        JSON.parse(
                            hospital.rooms
                        );
                }
                else{
                    rooms =
                        hospital.rooms;
                }
                rooms.forEach(
                    (room,index) => {
                    const roomData = {
                        hospital_id:
                            hospital.id,
                        room_index:
                            index,
                        hospital_name:
                            hospital.hospital_name,
                        details:
                            room.details,
                        pricing:
                            room.pricing,
                        room_type:
                            room.room_type,
                        total_beds:
                            room.total_beds,
                        availability:
                            room.availability
                    };
                    if(
                        room.availability
                        .toLowerCase()
                        === "available"
                    ){
                        availableRooms
                        .push(roomData);
                    }
                    else{
                        unavailableRooms
                        .push(roomData);
                    }
                });
            });
            res.json({
                success:true,
                availableRooms,
                unavailableRooms
            });
        }
        catch(error){
            console.log(error);
            res.json({
                success:false,
                message:"Server Error"
            });
        }
});

//17
app.put('/api/update/room', async(req,res) => {
    try{
        const {
            hospital_id,
            room_index,
            total_beds,
            availability
        } = req.body;
        const [rows] = await pool.query(
            `
            SELECT rooms
            FROM hospitals
            WHERE id = ?
            `,
            [hospital_id]
        );
        if(rows.length === 0){
            return res.json({
                success:false,
                message:"Hospital Not Found"
            });
        }
        let rooms = rows[0].rooms;
        if(typeof rooms === "string"){
            rooms = JSON.parse(rooms);
        }
        rooms[room_index].total_beds =
            total_beds;
        rooms[room_index].availability =
            availability;
        await pool.query(
            `
            UPDATE hospitals
            SET rooms = ?
            WHERE id = ?
            `,
            [
                JSON.stringify(rooms),
                hospital_id
            ]
        );
        res.json({
            success:true
        });
    }
    catch(error){
        console.log(error);
        res.json({
            success:false,
            message:"Server Error"
        });
    }
});

//18
app.get('/api/ambulances',
    async(req,res) => {
        try{
            if(!req.session.user){
                return res.json({
                    success:false
                });
            }
            const userId =
                req.session.user.id;
            const [ambulances] =
                await pool.query(
                    `
                    SELECT *
                    FROM ambulances
                    WHERE users_id = ?
                    ORDER BY id DESC
                    `,
                    [userId]
                );
            res.json({
                success:true,
                ambulances
            });
        }
        catch(error){
            console.log(error);
            res.json({
                success:false
            });
        }
});

//19
app.post('/api/add/ambulance',
    upload.fields([
        {
            name:'lic',
            maxCount:1
        },
        {
            name:'rc',
            maxCount:1
        },
        {
            name:'veh_ins',
            maxCount:1
        }
    ]),
    async(req,res) => {
        try{
            const body =
                req.body;
            const userId =
                req.session.user.id;
            await pool.query(
                `
                INSERT INTO ambulances
                (
                    users_id,
                    ambulance_type,
                    base_chrge,
                    min_chrge,
                    night_chrg,
                    wait_chrg,
                    status,
                    eta,
                    book_time_slot,
                    area,
                    description,
                    lic,
                    rc,
                    driver_exp,
                    veh_ins
                )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    userId,
                    body.ambulance_type,
                    body.base_chrge,
                    body.min_chrge,
                    body.night_chrg,
                    body.wait_chrg,
                    body.status,
                    body.eta,
                    body.book_time_slot,
                    body.area,
                    body.description,
                    req.files[
                        'lic'
                    ]?.[0]?.filename || null,
                    req.files[
                        'rc'
                    ]?.[0]?.filename || null,
                    body.driver_exp,
                    req.files[
                        'veh_ins'
                    ]?.[0]?.filename || null
                ]
            );
            res.json({
                success:true
            });
        }
        catch(error){
            console.log(error);
            res.json({
                success:false
            });
        }
});

//20
app.get('/api/ambulance/availability',
    async(req,res) => {
        try{
            const userId =
                req.session.user.id;
            const [ambulances] =
                await pool.query(
                    `
                    SELECT *
                    FROM ambulances
                    WHERE users_id = ?
                    `,
                    [userId]
                );
            const available = [];
            const busy = [];
            ambulances.forEach(
                ambulance => {
                if(
                    ambulance.status
                    === "Available"
                ){
                    available.push(
                        ambulance
                    );
                }
                else{
                    busy.push(
                        ambulance
                    );
                }
            });
            res.json({
                success:true,
                available,
                busy
            });
        }
        catch(error){
            console.log(error);
            res.json({
                success:false
            });
        }
});

//21
app.put('/api/update/ambulance', async(req,res) => {
        try{
            const {
                id,
                base_chrge,
                status
            } = req.body;
            if(
                base_chrge &&
                base_chrge !== 0
            ){
                await pool.query(
                    `
                    UPDATE ambulances
                    SET
                    base_chrge = ?,
                    status = ?
                    WHERE id = ?
                    `,
                    [
                        base_chrge,
                        status,
                        id
                    ]
                );
            }
            else{

                await pool.query(
                    `
                    UPDATE ambulances
                    SET
                    status = ?
                    WHERE id = ?
                    `,
                    [
                        status,
                        id
                    ]
                );
            }
            res.json({
                success:true
            });
        }
        catch(error){
            console.log(error);
            res.json({
                success:false
            });
        }
});

//22
app.get("/api/user/insurances",
    async(req,res)=>{
        try{
            const userId =
                req.session.user.id;
            const [insurances] =
                await pool.query(
                    `
                    SELECT *
                    FROM insurances
                    WHERE users_id = ?
                    ORDER BY id DESC
                    `,
                    [userId]
                );
            res.json({
                success:true,
                insurances:insurances
            });
        }
        catch(error){
            console.log(error);
            res.json({
                success:false,
                message:"Server Error"
            });
        }
    }
);

//23
app.post("/api/add/insurance",
    upload.fields([
        {
            name:"reg_doc",
            maxCount:1
        },
        {
            name:"policy_doc",
            maxCount:1
        }
    ]),
    async(req,res)=>{
        try{
            if(!req.session.user){
                return res.json({
                    success:false,
                    message:"Please Login First"
                });
            }
            const userId =
                req.session.user.id;
            const {
                comp_name,
                comp_type,
                ins_description,
                irdai_number,
                comp_pan,
                gst_number,
                ins_address,
                claim_type,
                required_docs,
                claim_approval_time,
                contact_number,
                ins_email
            } = req.body;
            const regDoc =
                req.files.reg_doc
                ?
                req.files.reg_doc[0].filename
                :
                null;
            const addressProof =
                req.files.policy_doc
                ?
                req.files.policy_doc[0].filename
                :
                null;
            await pool.query(
                `INSERT INTO insurances(
                    users_id, comp_name, comp_type, description, irdai, comp_pan, gst, incorp_cert, offc_add,
                    add_proof, claim_type, doc_req, claim_time, cust_sup_num, email_sup)
                VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`,
                [
                    userId,
                    safeString(comp_name),
                    safeString(comp_type),
                    safeString(ins_description),
                    safeString(irdai_number),
                    safeString(comp_pan),
                    safeString(gst_number),
                    regDoc,
                    safeString(ins_address),
                    addressProof,
                    safeString(claim_type),
                    safeString(required_docs),
                    safeString(claim_approval_time),
                    safeString(contact_number),
                    safeString(ins_email)

                ]
            );
            res.json({
                success:true,
                message:"Insurance Added Successfully"
            });
        }
        catch(error){
            console.log(error);
            res.json({
                success:false,
                message:"Server Error"
            });
        }
    }
);

//24
app.get('/api/labs',
    async(req,res) => {
        try{
            if(!req.session.user){
                return res.json({
                    success:false
                });
            }
            const userId =
                req.session.user.id;
            const [labs] =
                await pool.query(
                    `
                    SELECT *
                    FROM labs
                    WHERE users_id = ?
                    ORDER BY id DESC
                    `,
                    [userId]
                );
            res.json({
                success:true,
                labs
            });
        }
        catch(error){
            console.log(error);
            res.json({
                success:false
            });
        }
    }
);

//25
app.post('/api/add/lab', upload.fields([
        {
            name:'lab_reg',
            maxCount:1
        },
        {
            name:'nabl',
            maxCount:1
        },
        {
            name:'path_qual_cer',
            maxCount:1
        }
    ]),
    async(req,res) => {
        try{
            if(!req.session.user){
                return res.json({
                    success:false,
                    message:"Unauthorized"
                });
            }
            const body = req.body;
            const userId =
                req.session.user.id;
            await pool.query(
                `
                INSERT INTO labs
                (
                    users_id,
                    lab_name,
                    address,
                    location,
                    description,
                    lab_type,
                    test,
                    home_coll,
                    extra_chrg,
                    available_areas,
                    lab_reg,
                    nabl,
                    path_qual_cer,
                    pathologist,
                    adv_equipment,
                    lab_hrs,
                    test_time,
                    emergency_test,
                    test_price
                )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
                `,
                [
                    userId,
                    body.lab_name,
                    body.address,
                    body.location,
                    body.description,
                    body.lab_type,
                    body.test,
                    body.home_coll,
                    body.extra_chrg,
                    body.available_areas,
                    req.files[
                        'lab_reg'
                    ]?.[0]?.filename || null,
                    req.files[
                        'nabl'
                    ]?.[0]?.filename || null,
                    req.files[
                        'path_qual_cer'
                    ]?.[0]?.filename || null,
                    body.pathologist,
                    body.adv_equipment,
                    body.lab_hrs,
                    body.test_time,
                    body.emergency_test,
                    body.test_price
                ]
            );
            res.json({
                success:true,
                message:"Lab Added Successfully"
            });
        }
        catch(error){
            console.log(error);
            res.json({
                success:false,
                message:"Server Error"
            });
        }
    }
);

//26
app.post('/api/add/medicine', upload.fields([
        {
            name:'medicine_image',
            maxCount:1
        },
        {
            name:'medicine_excel_file',
            maxCount:1
        }
    ]),
    async(req,res)=>{
        try{
            if(!req.session.user){
                return res.json({
                    success:false,
                    message:"Unauthorized Access"
                });
            }
            const userId=req.session.user.id;
            const body=req.body;
            const medicineImage=req.files?.medicine_image?.[0]?.filename || null;
            const excelFile=req.files?.medicine_excel_file?.[0] || null;
            if(excelFile){
                const workbook=XLSX.readFile(
                    excelFile.path
                );
                const sheetName= workbook.SheetNames[0];
                const sheet=workbook.Sheets[sheetName];
                const data=XLSX.utils.sheet_to_json(sheet);
                for(const med of data){
                    await pool.query(
                        `
                        INSERT INTO med_lists
                        (
                            vendor_id,
                            medicine_name,
                            generic_name,
                            brand_name,
                            medicine_type,
                            category,
                            manufacturer,
                            composition,
                            mrp,
                            selling_price,
                            gst_percentage,
                            discount_percentage,
                            stock_quantity,
                            minimum_stock_alert,
                            batch_number,
                            manufacturing_date,
                            expiry_date,
                            prescription_required,
                            schedule_type,
                            uses_info,
                            dosage_instructions,
                            side_effects,
                            warnings,
                            storage_instructions,
                            delivery_available,
                            delivery_charge,
                            medicine_image,
                            barcode_number,
                            medicine_status,
                            featured_medicine,
                            user_id
                        )
                        VALUES
                        (
                            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                            ?
                        )
                        `,
                        [
                            userId,
                            med.medicine_name || '',
                            med.generic_name || null,
                            med.brand_name || null,
                            med.medicine_type || 'Tablet',
                            med.category || null,
                            med.manufacturer || null,
                            med.composition || null,
                            parseFloat(med.mrp) || 0,
                            parseFloat(med.selling_price) || 0,
                            parseFloat(med.gst_percentage) || 0,
                            parseFloat(med.discount_percentage) || 0,
                            parseInt(med.stock_quantity) || 0,
                            parseInt(med.minimum_stock_alert) || 10,
                            med.batch_number || null,
                            med.manufacturing_date || null,
                            med.expiry_date || null,
                            med.prescription_required || 'No',
                            med.schedule_type || 'OTC',
                            med.uses_info || null,
                            med.dosage_instructions || null,
                            med.side_effects || null,
                            med.warnings || null,
                            med.storage_instructions || null,
                            med.delivery_available || 'Yes',
                            parseFloat(med.delivery_charge) || 0,
                            null,
                            med.barcode_number || null,
                            med.medicine_status || 'Active',
                            med.featured_medicine || 'No',
                            userId
                        ]
                    );
                }
                return res.json({
                    success:true,
                    message:"Excel Medicines Added Successfully"
                });
            }
            if(
                !body.medicine_name ||
                !body.mrp ||
                !body.selling_price
            ){
                return res.json({
                    success:false,
                    message:"Please Fill Required Fields"
                });
            }
            await pool.query(
                `
                INSERT INTO med_lists
                (
                    vendor_id,
                    medicine_name,
                    generic_name,
                    brand_name,
                    medicine_type,
                    category,
                    manufacturer,
                    composition,
                    mrp,
                    selling_price,
                    gst_percentage,
                    discount_percentage,
                    stock_quantity,
                    minimum_stock_alert,
                    batch_number,
                    manufacturing_date,
                    expiry_date,
                    prescription_required,
                    schedule_type,
                    uses_info,
                    dosage_instructions,
                    side_effects,
                    warnings,
                    storage_instructions,
                    delivery_available,
                    delivery_charge,
                    medicine_image,
                    barcode_number,
                    medicine_status,
                    featured_medicine,
                    user_id
                )
                VALUES
                (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                    ?
                )
                `,
                [
                    userId,
                    body.medicine_name,
                    body.generic_name || null,
                    body.brand_name || null,
                    body.medicine_type || 'Tablet',
                    body.category || null,
                    body.manufacturer || null,
                    body.composition || null,
                    parseFloat(body.mrp) || 0,
                    parseFloat(body.selling_price) || 0,
                    parseFloat(body.gst_percentage) || 0,
                    parseFloat(body.discount_percentage) || 0,
                    parseInt(body.stock_quantity) || 0,
                    parseInt(body.minimum_stock_alert) || 10,
                    body.batch_number || null,
                    body.manufacturing_date || null,
                    body.expiry_date || null,
                    body.prescription_required || 'No',
                    body.schedule_type || 'OTC',
                    body.uses_info || null,
                    body.dosage_instructions || null,
                    body.side_effects || null,
                    body.warnings || null,
                    body.storage_instructions || null,
                    body.delivery_available || 'Yes',
                    parseFloat(body.delivery_charge) || 0,
                    medicineImage,
                    body.barcode_number || null,
                    body.medicine_status || 'Active',
                    body.featured_medicine || 'No',
                    userId
                ]
            );
            return res.json({
                success:true,
                message:"Medicine Added Successfully"
            });
        }
        catch(error){
            console.log(
                "Medicine Insert Error:",
                error
            );
            return res.json({
                success:false,
                message:"Server Error"
            });
        }
    }
);

//27
app.get('/api/medicines',async(req,res)=>{
    try{
        if(!req.session.user){
            return res.json({
                success:false,
                message:"Unauthorized"
            });
        }
        const userId=req.session.user.id;
        const [medicines]=await pool.query(
            `
            SELECT *
            FROM med_lists
            WHERE vendor_id=?
            ORDER BY medicine_id DESC
            `,
            [userId]
        );
        return res.json({
            success:true,
            medicines
        });
    }
    catch(error){
        console.log(
            "Load Medicines Error:",
            error
        );
        return res.json({
            success:false,
            message:"Server Error"
        });
    }
});

//28
app.post('/api/add/equipment-product',
    upload.fields([
        {
            name:'thumbnail_image',
            maxCount:1
        },
        {
            name:'product_manual',
            maxCount:1
        },
        {
            name:'product_video',
            maxCount:1
        }
    ]),
    async(req,res) => {
        try{
            if(!req.session.user){
                return res.json({
                    success:false
                });
            }
            const body = req.body;
            const vendorId =
                req.session.user.id;
            await pool.query(
                `
                INSERT INTO med_eq_prd
                (
                    vendor_id,
                    product_name,
                    brand_name,
                    category,
                    sub_category,
                    model_number,
                    manufacturer,
                    country_of_origin,
                    product_description,
                    mrp,
                    selling_price,
                    stock_quantity,
                    stock_status,
                    warranty_period,
                    delivery_available,
                    delivery_charge,
                    thumbnail_image,
                    product_manual,
                    product_video
                )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    vendorId,
                    body.product_name,
                    body.brand_name,
                    body.category,
                    body.sub_category,
                    body.model_number,
                    body.manufacturer,
                    body.country_of_origin,
                    body.product_description,
                    body.mrp,
                    body.selling_price,
                    body.stock_quantity,
                    body.stock_status,
                    body.warranty_period,
                    body.delivery_available,
                    body.delivery_charge,
                    req.files[
                        'thumbnail_image'
                    ]?.[0]?.filename || null,
                    req.files[
                        'product_manual'
                    ]?.[0]?.filename || null,
                    req.files[
                        'product_video'
                    ]?.[0]?.filename || null
                ]
            );
            res.json({
                success:true
            });
        }
        catch(error){
            console.log(error);
            res.json({
                success:false
            });
        }
    }
);

//29
app.get('/api/equipment-products',
    async(req,res) => {
        try{
            const vendorId =
                req.session.user.id;
            const [products] =
                await pool.query(
                    `
                    SELECT *
                    FROM med_eq_prd
                    WHERE vendor_id = ?
                    ORDER BY product_id DESC
                    `,
                    [vendorId]
                );
            res.json({
                success:true,
                products
            });
        }
        catch(error){
            console.log(error);
            res.json({
                success:false
            });
        }
    }
);

//30
app.get('/api/featured-hospitals', async (req, res) => {
    try{
        const [hospitals] = await pool.query(`
        SELECT 
            hospitals.id,
            hospitals.hospital_name,
            hospitals.address,
            hospitals.location,
            hospitals.facilities,
            hospitals.hospital_images,
            hospitals.rooms
        FROM hospitals
        INNER JOIN users 
        ON hospitals.users_id = users.id
        WHERE users.status = 'approved'
        ORDER BY hospitals.id DESC
        `);
        const formattedHospitals = hospitals.map(hospital => {
            let image = '';
            let totalBeds = 0;
            let startingPrice = 0;
            let facilities = [];
            let parsedImages = [];
            let parsedRooms = [];
            if(Array.isArray(hospital.hospital_images)){
                parsedImages = hospital.hospital_images;
            }
            else{
                try{
                    parsedImages = JSON.parse(
                        hospital.hospital_images || '[]'
                    );
                }
                catch(error){
                    parsedImages = [];
                }
            }
            if(Array.isArray(hospital.rooms)){
                parsedRooms = hospital.rooms;
            }
            else{
                try{
                    parsedRooms = JSON.parse(
                        hospital.rooms || '[]'
                    );
                }
                catch(error){
                    parsedRooms = [];
                }
            }
            if(parsedImages.length > 0){
                const firstImage = parsedImages[0];
                if(firstImage){
                    image = `/uploads/${firstImage}`;
                }
            }
            parsedRooms.forEach(room => {
                totalBeds += Number(
                    room.total_beds || 0
                );
            
                const roomPrice = Number(
                    room.pricing || 0
                );
            
                if(startingPrice === 0 || roomPrice < startingPrice){
                    startingPrice = roomPrice;
                }
            });
            if(hospital.facilities){
                facilities = hospital.facilities
                .split(',')
                .map(facility => facility.trim())
                .slice(0, 3);
            }
            return {
                id: hospital.id,
                hospital_name: hospital.hospital_name,
                location: hospital.location || hospital.address,
                image,
                totalBeds,
                facilities,
                pricing: startingPrice
            };
        });
        res.json({
            success: true,
            hospitals: formattedHospitals
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

//31
app.post('/api/product-register',
    upload.fields([
        {
            name: 'profile_photo',
            maxCount: 1
        }
    ]),
    async (req, res) => {
    try{
        const body = req.body;
        const [existing] = await pool.query(
            `SELECT id
             FROM product_users
             WHERE email = ?
             OR phone = ?`,
            [
                body.email,
                body.phone
            ]
        );
        if(existing.length > 0){
            return res.json({
                success: false,
                message: 'Email or Phone already exists'
            });
        }
        await pool.query(`
            INSERT INTO product_users
            (
                full_name,
                email,
                phone,
                password,
                gender,
                dob,
                blood_group,
                profile_photo,
                address,
                location,
                city,
                state,
                pincode
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            body.full_name,
            body.email,
            body.phone,
            body.password,
            body.gender,
            body.dob || null,
            body.blood_group || null,
            req.files['profile_photo']?.[0]?.filename || null,
            body.address || null,
            body.users_address || null,
            body.city || null,
            body.state || null,
            body.pincode || null
        ]);
        res.json({
            success: true
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

//32
app.post('/api/product-login', async(req,res) => {
    try{
        const {email, password
        } = req.body;
        const [users] = await pool.query(
                `
                SELECT *
                FROM product_users
                WHERE email = ?
                AND password = ?
                `,
                [
                    email,
                    password
                ]
            );
        if(users.length === 0){
            return res.json({
                success:false,
                message:"Invalid Credentials"
            });
        }
        const user = users[0];
        req.session.productUser = {
            id:user.id,
            full_name:user.full_name,
            email:user.email,
            phone:user.phone
        };
        req.session.save(
            (err) => {
            if(err){
                console.log(err);
                return res.json({
                    success:false,
                    message:"Session Error"
                });
            }
            res.json({
                success:true,
                user:{
                    id:user.id,
                    full_name:user.full_name,
                    email:user.email,
                    phone:user.phone
                }
            });
        });
    }
    catch(error){
        console.log(error);
        res.json({
            success:false,
            message:"Server Error"
        });
    }
});

//33
app.get('/api/all-featured-hospitals', async (req, res) => {
    try{
        const [hospitals] = await pool.query(`
        SELECT 
            hospitals.id,
            hospitals.hospital_name,
            hospitals.address,
            hospitals.location,
            hospitals.facilities,
            hospitals.hospital_images,
            hospitals.rooms
        FROM hospitals
        INNER JOIN users 
        ON hospitals.users_id = users.id
        WHERE users.status = 'approved'
        ORDER BY hospitals.id DESC
        `);
        const formattedHospitals = hospitals.map(hospital => {
            let image = '';
            let totalBeds = 0;
            let startingPrice = 0;
            let facilities = [];
            let parsedImages = [];
            let parsedRooms = [];
            if(Array.isArray(hospital.hospital_images)){
                parsedImages = hospital.hospital_images;
            }
            else{
                try{
                    parsedImages = JSON.parse(
                        hospital.hospital_images || '[]'
                    );
                }
                catch(error){
                    parsedImages = [];
                }
            }
            if(Array.isArray(hospital.rooms)){
                parsedRooms = hospital.rooms;
            }
            else{
                try{
                    parsedRooms = JSON.parse(
                        hospital.rooms || '[]'
                    );
                }
                catch(error){
                    parsedRooms = [];
                }
            }
            if(parsedImages.length > 0){
                const firstImage = parsedImages[0];
                if(firstImage){
                    image = `/uploads/${firstImage}`;
                }
            }
            parsedRooms.forEach(room => {
                totalBeds += Number(
                    room.total_beds || 0
                );
            
                const roomPrice = Number(
                    room.pricing || 0
                );
            
                if(startingPrice === 0 || roomPrice < startingPrice){
                    startingPrice = roomPrice;
                }
            });
            if(hospital.facilities){
                facilities = hospital.facilities
                .split(',')
                .map(facility => facility.trim())
                .slice(0, 3);
            }
            return {
                id: hospital.id,
                hospital_name: hospital.hospital_name,
                location: hospital.location || hospital.address,
                image,
                totalBeds,
                facilities,
                pricing: startingPrice
            };
        });
        res.json({
            success: true,
            hospitals: formattedHospitals
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

//34
app.get('/api/all-ambulances', async (req,res) => {
    try{
        const [ambulances] = await pool.query(`
            SELECT
                ambulances.*
            FROM ambulances
            INNER JOIN users
            ON ambulances.users_id = users.id
            WHERE users.status = 'approved' and
            ambulances.status = 'Available'
            ORDER BY ambulances.id DESC
        `);
        const formattedAmbulances = ambulances.map(ambulance => {
            return{
                id: ambulance.id,
                ambulance_type: ambulance.ambulance_type,
                area: ambulance.area,
                status: ambulance.status,
                eta: ambulance.eta,
                driver_exp: ambulance.driver_exp,
                base_chrge: ambulance.base_chrge,
                description: ambulance.description
            };
        });
        res.json({
            success: true,
            ambulances: formattedAmbulances
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

//35
app.get('/api/all-labs', async (req,res) => {
    try{
        const [labs] = await pool.query(`
            SELECT
                labs.*
            FROM labs
            INNER JOIN users
            ON labs.users_id = users.id
            WHERE users.status = 'approved'
            ORDER BY labs.id DESC
        `);
        const formattedLabs = labs.map(lab => {
            let labTypes = [];
            let tests = [];
            try{
                labTypes = JSON.parse(
                    lab.lab_type || '[]'
                );
            }
            catch(error){
                labTypes = [];
            }
            try{
                tests = JSON.parse(
                    lab.test || '[]'
                );
            }
            catch(error){
                tests = [];
            }
            return{
                id: lab.id,
                lab_name: lab.lab_name,
                address: lab.address,
                description: lab.description,
                labTypes,
                tests,
                home_coll: lab.home_coll,
                emergency_test: lab.emergency_test,
                test_price: lab.test_price,
                available_areas: lab.available_areas
            };
        });
        res.json({
            success: true,
            labs: formattedLabs
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

//36
app.get('/api/all-insurances', async (req,res) => {
    try{
        const [insurances] = await pool.query(`
            SELECT insurances.*
            FROM insurances
            INNER JOIN users
            ON insurances.users_id = users.id
            WHERE users.status = 'approved'
            ORDER BY insurances.id DESC
        `);
        res.json({
            success: true,
            insurances
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

//37
app.get('/api/all-medicines', async (req,res) => {
    try{
        const [medicines] = await pool.query(`
            SELECT
                med_lists.*
            FROM med_lists
            INNER JOIN users
            ON med_lists.vendor_id = users.id
            WHERE users.status = 'approved'
            ORDER BY med_lists.medicine_id DESC
        `);
        const formattedMedicines = medicines.map(medicine => {
            return{
                medicine_id: medicine.medicine_id,
                medicine_name: medicine.medicine_name,
                generic_name: medicine.generic_name,
                brand_name: medicine.brand_name,
                medicine_type: medicine.medicine_type,
                category: medicine.category,
                manufacturer: medicine.manufacturer,
                mrp: medicine.mrp,
                selling_price: medicine.selling_price,
                stock_quantity: medicine.stock_quantity,
                medicine_image: medicine.medicine_image,
                delivery_charge: medicine.delivery_charge
            };
        });
        res.json({
            success: true,
            medicines: formattedMedicines
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

//38
app.get('/api/all-equipments', async (req,res) => {
    try{
        const [equipments] = await pool.query(`
            SELECT
                med_eq_prd.*
            FROM med_eq_prd
            INNER JOIN users
            ON med_eq_prd.vendor_id = users.id
            WHERE users.status = 'approved'
            ORDER BY product_id DESC
        `);
        res.json({
            success: true,
            equipments
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

//39
app.get('/api/hospital/bookings', async(req,res) => {

    try{

        if(!req.session.user){

            return res.json({
                success:false,
                bookings:[]
            });

        }

        const userId =
        req.session.user.id;

        console.log(
            "Hospital Owner:",
            userId
        );

        const [bookings] =
        await pool.query(
            `
            SELECT

                uhb.*,

                h.hospital_name

            FROM
            user_hospital_bookings uhb

            INNER JOIN hospitals h
            ON uhb.hospital_id = h.id

            WHERE h.users_id = ?

            ORDER BY uhb.id DESC
            `,
            [userId]
        );

        console.log(bookings);

        res.json({
            success:true,
            bookings
        });

    }
    catch(error){

        console.log(error);

        res.json({
            success:false,
            bookings:[]
        });

    }

});

//40
app.get('/api/hospital/:id', async (req,res) => {
    try{
        const hospitalId = req.params.id;
        const [rows] = await pool.execute(`
            SELECT * FROM hospitals
            WHERE id = ?
        `,[hospitalId]);
        if(rows.length === 0){
            return res.json({
                success: false,
                message: 'Hospital not found'
            });
        }
        const hospital = rows[0];
        if(typeof hospital.hospital_images === 'string'){
            hospital.hospital_images =
                JSON.parse(hospital.hospital_images);
        }
        if(typeof hospital.rooms === 'string'){
            hospital.rooms =
                JSON.parse(hospital.rooms);
        }
        if(typeof hospital.doctors === 'string'){
            hospital.doctors =
                JSON.parse(hospital.doctors);
        }
        res.json({
            success: true,
            hospital
        });
    }
    catch(error){
        console.log(error);
        res.json({
            success: false,
            message: 'Server error'
        });
    }
});

//41
app.post('/api/book-hospital', async (req,res) => {
        try{
            const {
                user_id,
                hospital_id,
                patient_name,
                patient_age,
                patient_gender,
                room_type,
                bed_type,
                admission_date,
                discharge_date,
                total_amount,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            } = req.body;
            if(
                !user_id ||
                !hospital_id ||
                !patient_name ||
                !patient_age ||
                !patient_gender ||
                !room_type ||
                !admission_date ||
                !discharge_date ||
                !total_amount
            ){
                return res.json({
                    success:false,
                    message:'All fields are required'
                });
            }
            const generated_signature =
            crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                razorpay_order_id +
                "|" +
                razorpay_payment_id
            )
            .digest("hex");
            if(
                generated_signature !==
                razorpay_signature
            ){
                return res.json({
                    success:false,
                    message:
                    "Payment verification failed"
                });
            }
            const [commissionData] =
            await pool.query(
                `
                SELECT commission_percent
                FROM commissions
                WHERE user_type = ?
                `,
                ['hospital']
            );
            const commissionPercent =
            Number(
                commissionData[0]
                ?.commission_percent || 0
            );
            const originalAmount =
            Number(total_amount);
            const adminCommission =
            (originalAmount * commissionPercent) / 100;
            const vendorAmount =
            originalAmount - adminCommission;
            const [result] =
            await pool.execute(
                `
                INSERT INTO
                user_hospital_bookings
                (
                    user_id,
                    hospital_id,
                    patient_name,
                    patient_age,
                    patient_gender,
                    room_type,
                    bed_type,
                    admission_date,
                    discharge_date,
                    total_amount,
                    razorpay_order_id,
                    razorpay_payment_id,
                    payment_status,
                    vendor_amount,
                    admin_commission
                )
                VALUES
                (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
                `,
                [
                    user_id,
                    hospital_id,
                    patient_name,
                    patient_age,
                    patient_gender,
                    room_type,
                    bed_type,
                    admission_date,
                    discharge_date,
                    total_amount,
                    razorpay_order_id,
                    razorpay_payment_id,
                    'paid',
                    vendorAmount,
                    adminCommission

                ]
            );
            await pool.query(
                `
                INSERT INTO
                user_payments
                (
                    user_id,
                    payment_for,
                    reference_id,
                    payment_method,
                    transaction_id,
                    amount,
                    payment_status
                )
                VALUES
                (
                    ?,
                    'Hospital Booking',
                    ?,
                    'Razorpay',
                    ?,
                    ?,
                    'success'
                )
                `,
                [
                    user_id,
                    result.insertId,
                    razorpay_payment_id,
                    total_amount
                ]
            );
            const [hospitalRows] =
            await pool.query(
                `
                SELECT rooms
                FROM hospitals
                WHERE id = ?
                `,
                [hospital_id]
            );
            if(
                hospitalRows.length > 0
            ){
                let rooms =
                hospitalRows[0].rooms;
                if(
                    typeof rooms === "string"
                ){
                    rooms =
                    JSON.parse(rooms);
                }
                rooms = rooms.map(room => {
                    if(
                        room.room_type
                        .toLowerCase()
                        ===
                        room_type
                        .toLowerCase()
                    ){
                        let currentBeds =
                        Number(
                            room.total_beds || 0
                        );
                        if(currentBeds > 0){
                            room.total_beds =
                            String(
                                currentBeds - 1
                            );
                        }
                        if(
                            Number(room.total_beds)
                            <= 0
                        ){
                            room.availability =
                            "Unavailable";
                        }
                    }
                    return room;
                });
                await pool.query(
                    `
                    UPDATE hospitals
                    SET rooms = ?
                    WHERE id = ?
                    `,
                    [
                        JSON.stringify(rooms),
                        hospital_id
                    ]
                );
            }
            res.json({
                success:true,
                message:
                'Hospital booking successful',
                booking_id:
                result.insertId
            });
        }
        catch(error){
            console.log(error);
            res.status(500).json({
                success:false,
                message:'Server Error'
            });
        }
    }
);

//42
app.post('/api/book-ambulance',async(req,res) => {
    try{
        const {
            user_id,
            ambulance_id,
            patient_name,
            patient_condition,
            pickup_address,
            destination_address,
            booking_date,
            total_amount,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;
        if(
            !user_id ||
            !ambulance_id ||
            !patient_name ||
            !pickup_address ||
            !destination_address ||
            !booking_date
        ){
            return res.json({
                success:false,
                message:
                'All fields are required'
            });
        }
        const generated_signature =
        crypto
        .createHmac(
            "sha256",
            process.env
            .RAZORPAY_KEY_SECRET
        )
        .update(
            razorpay_order_id +
            "|" +
            razorpay_payment_id
        )
        .digest("hex");
        if(
            generated_signature !==
            razorpay_signature
        ){
            return res.json({
                success:false,
                message:
                "Payment verification failed"
            });
        }
        const [result] =
        await pool.execute(
            `INSERT INTO
            user_ambulance_bookings(
                user_id,
                ambulance_id,
                patient_name,
                patient_condition,
                pickup_address,
                destination_address,
                booking_date,
                total_amount,
                razorpay_order_id,
                razorpay_payment_id,
                payment_status
            )
            VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
            [
                user_id,
                ambulance_id,
                patient_name,
                patient_condition,
                pickup_address,
                destination_address,
                booking_date,
                total_amount,
                razorpay_order_id,
                razorpay_payment_id,
                "Paid"
            ]
        );
        await pool.execute(
            `
            UPDATE ambulances
            SET status = ?
            WHERE id = ?
            `,
            [
                "Busy / On trip",
                ambulance_id
            ]
        );
        res.json({
            success:true,
            message:
            'Ambulance booking successful',
            booking_id:
            result.insertId
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success:false,
            message:'Server Error'
        });
    }
});

//43
app.get('/api/ambulance/bookings', async(req,res) => {
        try{
            const [bookings] =
            await pool.query(
                `
                SELECT user_ambulance_bookings.*,
                ambulances.status
                AS ambulance_status
                FROM user_ambulance_bookings
                LEFT JOIN ambulances
                ON user_ambulance_bookings.ambulance_id=ambulances.id
                WHERE user_ambulance_bookings.booking_status
                NOT LIKE '%completed%'
                ORDER BY
                user_ambulance_bookings.id
                DESC
                `
            );
            res.json({
                success:true,
                bookings
            });
        }
        catch(error){
            console.log(error);
            res.json({
                success:false
            });
        }
});

//44
app.post("/api/create-order", async(req,res)=>{
    try{
        const { amount } = req.body;
        const options = {
            amount:amount * 100,
            currency:"INR",
            receipt:`receipt_${Date.now()}`
        };
        const order = await razorpay.orders.create(options);
        res.json({
            success:true,
            order,
            key:process.env.RAZORPAY_KEY_ID
        });
    }
    catch(error){
        console.log(error);
        res.json({
            success:false,
            message:
            "Order creation failed"
        });
    }
});

//45
app.post('/api/book-lab-test', async(req,res) => {
        try{
            const {
                user_id,
                lab_vendor_id,
                test_name,
                patient_name,
                sample_collection_type,
                booking_date,
                total_amount,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            } = req.body;
            const sql = `
                INSERT INTO
                user_lab_test_bookings
                (
                    user_id,
                    lab_vendor_id,
                    test_name,
                    patient_name,
                    sample_collection_type,
                    booking_date,
                    total_amount,
                    payment_status
                )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            pool.query(
                sql,
                [
                    user_id,
                    lab_vendor_id,
                    test_name,
                    patient_name,
                    sample_collection_type,
                    booking_date,
                    total_amount,
                    'paid'

                ],
                (error,result) => {
                    if(error){
                        console.log(error);
                        return res.json({
                            success:false,
                            message:"Database Error"
                        });
                    }
                    res.json({
                        success:true,
                        message:"Lab Test Booked"
                    });
                }
            );
        }
        catch(error){
            console.log(error);
            res.json({
                success:false,
                message:"Server Error"
            });
        }
});

//46
app.post("/api/buy-insurance", async(req,res) => {

        try{

            const {

                user_id,
                insurance_vendor_id,
                plan_name,
                premium_amount,
                plan_duration,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature

            } = req.body;

            // ================= POLICY NUMBER =================

            const policy_number =
            "POL" +
            Math.floor(
                100000 +
                Math.random() * 900000
            );

            // ================= DATES =================

            const startDate =
            new Date();

            const expiryDate =
            new Date();

            expiryDate.setMonth(
                expiryDate.getMonth() +
                Number(plan_duration)
            );

            // ================= COVERAGE =================

            const coverage_amount =
            Number(premium_amount) * 20;

            // ================= COMMISSION =================

            const admin_commission =
            Number(premium_amount) * 0.10;

            // ================= VENDOR AMOUNT =================

            const vendor_amount =
            Number(premium_amount)
            -
            admin_commission;

            // ================= INSERT PURCHASE =================

            await pool.query(

                `
                INSERT INTO
                user_insurance_purchases
                (
                    user_id,
                    insurance_vendor_id,
                    plan_name,
                    policy_number,
                    coverage_amount,
                    premium_amount,
                    start_date,
                    expiry_date,
                    insurance_status,
                    payment_status,
                    vendor_amount,
                    admin_commission,
                    razorpay_payment_id
                )
                VALUES
                (
                    ?, ?, ?, ?, ?, ?,
                    ?, ?,
                    'active',
                    'paid',
                    ?, ?, ?
                )
                `,

                [

                    user_id,
                    insurance_vendor_id,
                    plan_name,
                    policy_number,
                    coverage_amount,
                    premium_amount,
                    startDate,
                    expiryDate,
                    vendor_amount,
                    admin_commission,
                    razorpay_payment_id

                ]

            );

            // ================= SAVE PAYMENT =================

            await pool.query(

                `
                INSERT INTO
                user_payments
                (
                    user_id,
                    payment_for,
                    reference_id,
                    payment_method,
                    transaction_id,
                    amount,
                    payment_status
                )
                VALUES
                (
                    ?,
                    'Insurance Purchase',
                    ?,
                    'Razorpay',
                    ?,
                    ?,
                    'success'
                )
                `,

                [

                    user_id,
                    insurance_vendor_id,
                    razorpay_payment_id,
                    premium_amount

                ]

            );

            res.json({

                success:true,

                message:
                "Insurance Purchased Successfully"

            });

        }
        catch(error){

            console.log(error);

            res.json({

                success:false,

                message:
                "Server Error"

            });

        }

    }
);

//47
app.post("/api/buy-product", async(req,res) => {

    try{

        const {
            user_id,
            product_type,
            product_id,
            quantity,
            total_amount,
            razorpay_order_id,
            razorpay_payment_id
        } = req.body;

        let product;

        // ========================= MEDICINE =========================

        if(product_type === "medicine"){

            // PRODUCT TABLE = med_lists

            const [medicineRows] = await pool.query(
                `
                SELECT *
                FROM med_lists
                WHERE medicine_id = ?
                `,
                [product_id]
            );

            console.log(
                "Medicine Rows:",
                medicineRows
            );

            if(!medicineRows.length){

                return res.json({
                    success:false,
                    message:
                    "Medicine Not Found"
                });

            }

            product =
            medicineRows[0];

            const productPrice =
            Number(
                product.selling_price
            ) || 0;

            // CREATE ORDER

            const [orderResult] =
            await pool.query(
                `
                INSERT INTO
                user_medicine_orders
                (
                    user_id,
                    medicine_vendor_id,
                    total_amount,
                    payment_method,
                    payment_status,
                    order_status
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    'online',
                    'paid',
                    'placed'
                )
                `,
                [
                    user_id,
                    product.vendor_id,
                    total_amount
                ]
            );

            const orderId =
            orderResult.insertId;

            // INSERT ITEM

            await pool.query(
                `
                INSERT INTO
                user_medicine_order_items
                (
                    medicine_order_id,
                    medicine_id,
                    quantity,
                    price,
                    subtotal
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?
                )
                `,
                [
                    orderId,
                    product.medicine_id,
                    quantity,
                    productPrice,
                    total_amount
                ]
            );

            // PAYMENT ENTRY

            await pool.query(
                `
                INSERT INTO
                user_payments
                (
                    user_id,
                    payment_for,
                    reference_id,
                    payment_method,
                    transaction_id,
                    amount,
                    payment_status
                )
                VALUES
                (
                    ?,
                    'medicine_order',
                    ?,
                    'razorpay',
                    ?,
                    ?,
                    'success'
                )
                `,
                [
                    user_id,
                    orderId,
                    razorpay_payment_id,
                    total_amount
                ]
            );

        }

        // ========================= EQUIPMENT =========================

        else if(product_type === "equipment"){

            // PRODUCT TABLE = med_eq_prd

            const [equipmentRows] =
            await pool.query(
                `
                SELECT *
                FROM med_eq_prd
                WHERE product_id = ?
                `,
                [product_id]
            );

            console.log(
                "Equipment Rows:",
                equipmentRows
            );

            if(!equipmentRows.length){

                return res.json({
                    success:false,
                    message:
                    "Equipment Not Found"
                });

            }

            product =
            equipmentRows[0];

            const productPrice =
            Number(
                product.selling_price
            ) || 0;

            // CREATE ORDER

            const [orderResult] =
            await pool.query(
                `
                INSERT INTO
                user_equipment_orders
                (
                    user_id,
                    equipment_vendor_id,
                    order_type,
                    total_amount,
                    payment_status,
                    order_status
                )
                VALUES
                (
                    ?,
                    ?,
                    'buy',
                    ?,
                    'paid',
                    'placed'
                )
                `,
                [
                    user_id,
                    product.vendor_id,
                    total_amount
                ]
            );

            const orderId =
            orderResult.insertId;

            // INSERT ITEM

            await pool.query(
                `
                INSERT INTO
                user_equipment_order_items
                (
                    equipment_order_id,
                    equipment_id,
                    quantity,
                    price,
                    subtotal
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?
                )
                `,
                [
                    orderId,
                    product.product_id,
                    quantity,
                    productPrice,
                    total_amount
                ]
            );

            // PAYMENT ENTRY

            await pool.query(
                `
                INSERT INTO
                user_payments
                (
                    user_id,
                    payment_for,
                    reference_id,
                    payment_method,
                    transaction_id,
                    amount,
                    payment_status
                )
                VALUES
                (
                    ?,
                    'equipment_order',
                    ?,
                    'razorpay',
                    ?,
                    ?,
                    'success'
                )
                `,
                [
                    user_id,
                    orderId,
                    razorpay_payment_id,
                    total_amount
                ]
            );

        }

        else{

            return res.json({
                success:false,
                message:
                "Invalid Product Type"
            });

        }

        // ========================= INVOICE =========================

        const invoiceNumber =
        "INV" + Date.now();

        return res.json({

            success:true,

            message:
            "Purchase Successful",

            invoice_url:
            `/invoice/${invoiceNumber}`

        });

    }

    catch(error){

        console.log(error);

        return res.json({
            success:false,
            message:
            "Server Error"
        });

    }

});

//48
app.get("/invoice/:invoiceNumber",async(req,res) => {
        const invoice =
        req.params.invoiceNumber;
        res.send(`
            <html>
                <head>
                    <title>
                        Invoice
                    </title>
                </head>
                <body style="
                    font-family:Poppins;
                    padding:40px;
                ">
                    <h1>
                        HospiKare Invoice
                    </h1>
                    <hr>
                    <h2>
                        Invoice Number:
                        ${invoice}
                    </h2>
                    <p>
                        Payment Successful
                    </p>
                </body>
            </html>
        `);
});

//49
app.put('/api/update-booking-status', async(req,res) => {

        try{

            const {

                booking_id,
                ambulance_id,
                booking_status,
                ambulance_status

            } = req.body;

            // UPDATE BOOKING STATUS

            await pool.query(

                `
                UPDATE
                user_ambulance_bookings

                SET
                booking_status = ?

                WHERE id = ?
                `,

                [

                    booking_status,
                    booking_id

                ]

            );

            // UPDATE AMBULANCE STATUS

            await pool.query(

                `
                UPDATE
                ambulances

                SET
                status = ?

                WHERE id = ?
                `,

                [

                    ambulance_status,
                    ambulance_id

                ]

            );

            res.json({

                success:true

            });

        }
        catch(error){

            console.log(error);

            res.json({

                success:false,

                message:
                "Server Error"

            });

        }

});

//50
app.get('/api/insurance/bookings', async(req,res) => {

    try{

        const [bookings] =
            await pool.query(`
                SELECT *
                FROM user_insurance_purchases
                ORDER BY id DESC
            `);

        res.json({
            success:true,
            bookings
        });
    }

    catch(error){

        console.log(error);

        res.json({
            success:false
        });
    }
});

//51
app.get('/api/lab/patients', async(req,res) => {

    try{

        if(!req.session.user){

            return res.json({
                success:false,
                message:"Unauthorized"
            });

        }

        const vendorUserId =
            req.session.user.id;

        const [patients] =
            await pool.query(
                `
                SELECT

                    user_lab_test_bookings.*,

                    product_users.full_name,
                    product_users.email,
                    product_users.phone,
                    product_users.gender,
                    product_users.city,
                    product_users.state,
                    product_users.profile_photo,

                    labs.lab_name

                FROM user_lab_test_bookings

                LEFT JOIN product_users

                ON user_lab_test_bookings.user_id =
                product_users.id

                LEFT JOIN labs

                ON user_lab_test_bookings.lab_vendor_id =
                labs.id

                WHERE labs.users_id = ?

                ORDER BY user_lab_test_bookings.id DESC
                `,
                [vendorUserId]
            );

        res.json({
            success:true,
            patients
        });

    }
    catch(error){

        console.log(error);

        res.json({
            success:false,
            message:"Server Error"
        });

    }

});

//52
app.get('/api/lab/reports', async(req,res) => {

    try{

        const vendorUserId =
            req.session.user.id;

        const [reports] =
            await pool.query(
                `
                SELECT

                    user_lab_test_bookings.*,

                    product_users.full_name,
                    product_users.email,
                    product_users.phone,

                    labs.lab_name

                FROM user_lab_test_bookings

                LEFT JOIN product_users

                ON user_lab_test_bookings.user_id =
                product_users.id

                LEFT JOIN labs

                ON user_lab_test_bookings.lab_vendor_id =
                labs.id

                WHERE labs.users_id = ?

                ORDER BY user_lab_test_bookings.id DESC
                `,
                [vendorUserId]
            );

        res.json({
            success:true,
            reports
        });

    }
    catch(error){

        console.log(error);

        res.json({
            success:false
        });

    }

});

//53
app.post('/api/upload/report', upload.single('report'), async(req,res) => {

    try{

        const {
            booking_id
        } = req.body;

        if(!req.file){

            return res.json({
                success:false,
                message:"No File Uploaded"
            });

        }

        const reportFile =
            req.file.filename;

        await pool.query(
            `
            UPDATE
            user_lab_test_bookings

            SET
            report_file = ?

            WHERE id = ?
            `,
            [
                reportFile,
                booking_id
            ]
        );

        res.json({
            success:true,
            file:reportFile
        });

    }
    catch(error){

        console.log(error);

        res.json({
            success:false,
            message:error.message
        });

    }

});

//54
app.get('/api/insurance/customers', async(req,res) => {

    try{

        if(!req.session.user){

            return res.json({
                success:false
            });

        }

        const vendorUserId =
            req.session.user.id;

        const [customers] =
            await pool.query(
                `
                SELECT

                    user_insurance_purchases.*,

                    product_users.full_name,
                    product_users.email,
                    product_users.phone,
                    product_users.gender,
                    product_users.city,
                    product_users.state,
                    product_users.profile_photo,

                    insurances.comp_name

                FROM user_insurance_purchases

                LEFT JOIN product_users

                ON user_insurance_purchases.user_id =
                product_users.id

                LEFT JOIN insurances

                ON user_insurance_purchases.insurance_vendor_id =
                insurances.id

                WHERE insurances.users_id = ?

                ORDER BY
                user_insurance_purchases.id DESC
                `,
                [vendorUserId]
            );

        res.json({
            success:true,
            customers
        });

    }
    catch(error){

        console.log(error);

        res.json({
            success:false
        });

    }

});

//55
app.get('/api/medicine/orders', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.json({
                success: false,
                message: "Unauthorized"
            });
        }
        const vendorId = req.session.user.id;
        const sql = `
            SELECT
                umo.id,
                umo.total_amount,
                umo.payment_status,
                umo.order_status,
                umo.ordered_at,
                p.full_name,
                p.email,
                p.phone,
                umoi.quantity,
                umoi.price,
                umoi.subtotal,
                ml.medicine_name
            FROM user_medicine_orders umo
            LEFT JOIN product_users p
            ON umo.user_id = p.id
            LEFT JOIN user_medicine_order_items umoi
            ON umo.id = umoi.medicine_order_id
            LEFT JOIN med_lists ml
            ON umoi.medicine_id = ml.medicine_id
            WHERE ml.vendor_id = ?
            ORDER BY umo.id DESC
        `;
        const [orders] = await pool.query(
            sql,
            [vendorId]
        );
        res.json({
            success: true,
            orders
        });
    }
    catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Server Error"
        });
    }
});

//56
app.get('/api/equipment/orders', async (req, res) => {

    try {

        if (!req.session.user) {

            return res.json({
                success: false,
                message: "Unauthorized"
            });

        }

        const vendorId = req.session.user.id;

        const sql = `
            SELECT

                ueo.id,
                ueo.order_type,
                ueo.total_amount,
                ueo.payment_status,
                ueo.order_status,
                ueo.created_at,

                pu.full_name,
                pu.email,
                pu.phone,

                ueoi.quantity,
                ueoi.price,
                ueoi.subtotal,

                mep.product_name

            FROM user_equipment_orders ueo

            LEFT JOIN product_users pu
            ON ueo.user_id = pu.id

            LEFT JOIN user_equipment_order_items ueoi
            ON ueo.id = ueoi.equipment_order_id

            LEFT JOIN med_eq_prd mep
            ON ueoi.equipment_id = mep.product_id

            WHERE mep.vendor_id = ?

            ORDER BY ueo.id DESC
        `;

        const [orders] = await pool.query(
            sql,
            [vendorId]
        );

        res.json({
            success: true,
            orders
        });

    }
    catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: "Server Error"
        });

    }

});

//57
app.get('/api/equipment/customers', async (req, res) => {

    try {

        if (!req.session.user) {

            return res.json({
                success: false,
                message: "Unauthorized"
            });

        }

        const vendorId = req.session.user.id;

        const sql = `
            SELECT DISTINCT

                pu.id,
                pu.full_name,
                pu.email,
                pu.phone,
                pu.gender,
                pu.city,
                pu.state,
                pu.profile_photo,

                COUNT(ueo.id) AS total_orders,
                SUM(ueo.total_amount) AS total_spent

            FROM user_equipment_orders ueo

            LEFT JOIN product_users pu
            ON ueo.user_id = pu.id

            WHERE ueo.equipment_vendor_id = ?

            GROUP BY pu.id

            ORDER BY total_orders DESC
        `;

        const [customers] =
            await pool.query(
                sql,
                [vendorId]
            );

        res.json({
            success: true,
            customers
        });

    }
    catch(error){

        console.log(error);

        res.json({
            success: false,
            message: "Server Error"
        });

    }

});

//58
app.get('/api/user/orders', async(req,res) => {

    try{

        if(!req.session.productUser){

            return res.json({
                success:false,
                message:"Unauthorized"
            });

        }

        const userId =
            req.session.productUser.id;

        const [medicineOrders] =
            await pool.query(
                `
                SELECT
                    id,
                    total_amount,
                    payment_status,
                    order_status,
                    ordered_at AS created_at,
                    'Medicine' AS type
                FROM user_medicine_orders
                WHERE user_id = ?
                `,
                [userId]
            );

        const [equipmentOrders] =
            await pool.query(
                `
                SELECT
                    id,
                    total_amount,
                    payment_status,
                    order_status,
                    created_at,
                    'Equipment' AS type
                FROM user_equipment_orders
                WHERE user_id = ?
                `,
                [userId]
            );

        const allOrders = [
            ...medicineOrders,
            ...equipmentOrders
        ];

        allOrders.sort(
            (a,b)=>
            new Date(b.created_at)
            -
            new Date(a.created_at)
        );

        res.json({
            success:true,
            orders:allOrders
        });

    }
    catch(error){

        console.log(error);

        res.json({
            success:false
        });

    }

});

//59
app.get('/api/user/history', async(req,res) => {

    try{

        if(!req.session.productUser){

            return res.json({
                success:false
            });

        }

        const userId =
            req.session.productUser.id;

        const history = [];

        /* ================= AMBULANCE ================= */

        const [ambulances] =
            await pool.query(
                `
                SELECT
                    id,
                    patient_name,
                    total_amount,
                    booking_status,
                    created_at,
                    'Ambulance Booking' AS type
                FROM user_ambulance_bookings
                WHERE user_id = ?
                `,
                [userId]
            );

        history.push(...ambulances);

        /* ================= LAB ================= */

        const [labs] =
            await pool.query(
                `
                SELECT
                    id,
                    test_name AS patient_name,
                    total_amount,
                    booking_status,
                    created_at,
                    'Lab Test' AS type
                FROM user_lab_test_bookings
                WHERE user_id = ?
                `,
                [userId]
            );

        history.push(...labs);

        /* ================= HOSPITAL ================= */

        const [hospitals] =
            await pool.query(
                `
                SELECT
                    id,
                    patient_name,
                    total_amount,
                    booking_status,
                    created_at,
                    'Hospital Booking' AS type
                FROM user_hospital_bookings
                WHERE user_id = ?
                `,
                [userId]
            );

        history.push(...hospitals);

        history.sort(
            (a,b)=>
            new Date(b.created_at)
            -
            new Date(a.created_at)
        );

        res.json({
            success:true,
            history
        });

    }
    catch(error){

        console.log(error);

        res.json({
            success:false
        });

    }

});

//60
app.get('/api/user/payments', async(req,res) => {

    try{

        if(!req.session.productUser){

            return res.json({
                success:false,
                message:"Unauthorized"
            });

        }

        const userId =
            req.session.productUser.id;

        /* ================= FETCH PAYMENTS ================= */

        const [paymentRows] =
            await pool.query(
                `
                SELECT
                    id,
                    payment_for,
                    payment_method,
                    transaction_id,
                    amount,
                    payment_status,
                    paid_at
                FROM user_payments
                WHERE user_id = ?
                ORDER BY paid_at DESC
                `,
                [userId]
            );

        res.json({

            success:true,
            payments:paymentRows

        });

    }
    catch(error){

        console.log(
            "Payments API Error:",
            error
        );

        res.json({

            success:false,
            message:"Server Error"

        });

    }

});

//61
app.get('/api/admin/bookings', async(req,res)=>{

    const bookings = [];

    const [hospital] =
        await pool.query(`
        SELECT
            id,
            patient_name AS user_name,
            total_amount,
            booking_status AS status,
            created_at,
            'Hospital' AS type
        FROM user_hospital_bookings
        `);

    const [lab] =
        await pool.query(`
        SELECT
            id,
            patient_name AS user_name,
            total_amount,
            booking_status AS status,
            created_at,
            'Lab' AS type
        FROM user_lab_test_bookings
        `);

    bookings.push(...hospital);
    bookings.push(...lab);

    res.json({
        success:true,
        bookings
    });

});

//62
app.get('/api/admin/orders', async(req,res)=>{

    try{

        const orders = [];

        /* ================= MEDICINE ================= */

        const [medicineOrders] =
            await pool.query(`
            SELECT
                umo.id,
                pu.full_name AS user_name,
                umo.total_amount,
                umo.payment_status,
                umo.order_status,
                'Medicine' AS type
            FROM user_medicine_orders umo

            LEFT JOIN product_users pu
            ON umo.user_id = pu.id
            `);

        /* ================= EQUIPMENT ================= */

        const [equipmentOrders] =
            await pool.query(`
            SELECT
                ueo.id,
                pu.full_name AS user_name,
                ueo.total_amount,
                ueo.payment_status,
                ueo.order_status,
                'Equipment' AS type
            FROM user_equipment_orders ueo

            LEFT JOIN product_users pu
            ON ueo.user_id = pu.id
            `);

        orders.push(...medicineOrders);
        orders.push(...equipmentOrders);

        res.json({
            success:true,
            orders
        });

    }
    catch(error){

        console.log(error);

        res.json({
            success:false
        });

    }

});

//63
app.get('/api/admin/payments', async(req,res)=>{

    try{

        const [payments] =
            await pool.query(`
            SELECT
                user_payments.*,
                product_users.full_name AS user_name
            FROM user_payments

            LEFT JOIN product_users
            ON user_payments.user_id = product_users.id

            ORDER BY paid_at DESC
            `);

        res.json({
            success:true,
            payments
        });

    }
    catch(error){

        console.log(error);

        res.json({
            success:false
        });

    }

});

//64
app.get('/api/admin/products', async(req,res)=>{

    try{

        const products = [];

        /* ================= MEDICINES ================= */

        const [medicines] =
            await pool.query(`
            SELECT
                medicine_id AS id,
                medicine_name AS product_name,
                medicine_image AS image,
                selling_price AS price,
                stock_quantity AS stock,
                'Medicine' AS type,
                users.name AS vendor_name
            FROM med_lists

            LEFT JOIN users
            ON med_lists.vendor_id = users.id
            `);

        /* ================= EQUIPMENTS ================= */

        const [equipments] =
            await pool.query(`
            SELECT
                product_id AS id,
                product_name,
                thumbnail_image AS image,
                selling_price AS price,
                stock_quantity AS stock,
                'Equipment' AS type,
                users.name AS vendor_name
            FROM med_eq_prd

            LEFT JOIN users
            ON med_eq_prd.vendor_id = users.id
            `);

        products.push(...medicines);
        products.push(...equipments);

        res.json({
            success:true,
            products
        });

    }
    catch(error){

        console.log(error);

        res.json({
            success:false
        });

    }

});

//65
app.post('/api/admin/create-vendor-payment', async(req,res)=>{

    try{

        if(!req.session.admin){

            return res.json({

                success:false,
                message:"Unauthorized"

            });

        }

        const {
            vendorId,
            amount
        } = req.body;

        const finalAmount = parseInt(amount);

        if(!finalAmount || finalAmount <= 0){

            return res.json({

                success:false,
                message:"No Revenue Available"

            });

        }

        const options = {

            amount: finalAmount * 100,
            currency:"INR",

            receipt:`receipt_${Date.now()}`

        };

        const order =
        await razorpay.orders.create(
            options
        );

        res.json({

            success:true,

            key:
            process.env.RAZORPAY_KEY_ID,

            amount:
            options.amount,

            orderId:
            order.id

        });

    }
    catch(error){

        console.log(error);

        res.json({

            success:false,

            message:"Payment Creation Failed"

        });

    }

});

//66
app.post('/api/admin/verify-vendor-payment',async(req,res)=>{

    try{

        const {

            vendorId,
            amount,
            razorpay_payment_id

        } = req.body;

        /* ================= SAVE PAYOUT ================= */

        await pool.query(
            `
            INSERT INTO vendor_payouts
            (
                vendor_id,
                amount,
                razorpay_payment_id,
                payout_status
            )
            VALUES
            (?, ?, ?, ?)
            `,
            [
                vendorId,
                amount,
                razorpay_payment_id,
                'paid'
            ]
        );

        res.json({

            success:true

        });

    }
    catch(error){

        console.log(error);

        res.json({

            success:false

        });

    }

});

//67
app.get('/api/admin/vendor-invoice/:vendorId', async (req, res) => {
    try {
        const vendorId = req.params.vendorId;

        // Fetch Vendor
        const [vendorRows] = await pool.query(
            `SELECT * FROM users WHERE id = ?`,
            [vendorId]
        );

        if (vendorRows.length === 0) {
            return res.json({
                success: false,
                message: "Vendor Not Found"
            });
        }

        const vendor = vendorRows[0];

        // Fetch Payouts
        const [payouts] = await pool.query(
            `SELECT 
                id,
                vendor_id,
                CAST(amount AS DECIMAL(10,2)) AS amount,
                razorpay_payment_id,
                payout_status,
                paid_at
             FROM vendor_payouts 
             WHERE vendor_id = ?
             ORDER BY id DESC`,
            [vendorId]
        );

        // Calculate Total
        const total = payouts.reduce((sum, p) => {
            return sum + Number(p.amount || 0);
        }, 0);

        res.json({
            success: true,
            vendor,
            payouts,
            total
        });

    } catch (error) {
        console.error("Vendor Invoice Error:", error);
        res.json({
            success: false,
            message: "Server Error"
        });
    }
});

//68
app.post('/api/admin/update-commission', async(req,res)=>{
    try{
        if(!req.session.admin){
            return res.json({
                success:false,
                message:"Unauthorized"
            });
        }
        const {
            user_type,
            commission_percent
        } = req.body;
        await pool.query(
            `
            INSERT INTO commissions
            (
                user_type,
                commission_percent
            )
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE
            commission_percent =
            VALUES(commission_percent)
            `,
            [
                user_type,
                commission_percent
            ]
        );
        res.json({
            success:true
        });
    }
    catch(error){
        console.log(error);
        res.json({
            success:false
        });
    }
});

//69
app.put('/api/admin/update-commission/:id', async(req,res)=>{

    try{

        const id =
        req.params.id;

        const {
            percent
        } = req.body;

        await db.query(
            `
            UPDATE commissions

            SET
            commission_percent = ?

            WHERE id = ?
            `,
            [
                percent,
                id
            ]
        );

        res.json({

            success:true

        });

    }
    catch(error){

        console.log(error);

        res.json({

            success:false

        });

    }

});

//70
app.get('/api/commission-preview/:type/:amount', async(req,res)=>{
    try{
        const type =
        req.params.type;
        const amount =
        Number(req.params.amount);
        const commissionPercent =
        await getCommissionPercent(type);
        const calculation =
        calculateCommissionAmount(
            amount,
            commissionPercent
        );
        res.json({
            success:true,
            ...calculation
        });
    }
    catch(error){
        console.log(error);
        res.json({
            success:false
        });
    }
});

//71
app.post('/api/admin/update-commission', async(req,res)=>{

    try{

        if(!req.session.admin){

            return res.json({

                success:false,
                message:"Unauthorized"

            });

        }

        const {
            user_type,
            commission_percent
        } = req.body;

        await pool.query(
            `
            INSERT INTO commissions
            (
                user_type,
                commission_percent
            )
            VALUES (?, ?)

            ON DUPLICATE KEY UPDATE

            commission_percent =
            VALUES(commission_percent)
            `,
            [
                user_type,
                commission_percent
            ]
        );

        res.json({

            success:true

        });

    }
    catch(error){

        console.log(error);

        res.json({

            success:false

        });

    }

});

//72
app.get('/api/admin/commissions', async(req,res)=>{

    try{

        if(!req.session.admin){

            return res.json({

                success:false,
                message:"Unauthorized"

            });

        }

        const [commissions] =
        await pool.query(
            `
            SELECT *
            FROM commissions
            ORDER BY id DESC
            `
        );

        res.json({

            success:true,
            commissions

        });

    }
    catch(error){

        console.log(error);

        res.json({

            success:false,
            message:"Server Error"

        });

    }

});

//73
app.get('/api/admin/revenue', async(req,res)=>{

    try{

        if(!req.session.admin){

            return res.json({

                success:false,
                message:"Unauthorized"

            });

        }

        const [vendors] =
        await pool.query(`
            SELECT *
            FROM users
        `);

        let totalIncoming = 0;
        let totalPaid = 0;
        let totalCommission = 0;

        for(const vendor of vendors){

            let revenue = 0;

            /* ================= MEDICINES ================= */

            if(
                vendor.users_type
                .toLowerCase()
                .includes("medicine")
            ){

                const [rows] =
                await pool.query(`
                    SELECT
                    SUM(total_amount) AS total
                    FROM user_medicine_orders
                    WHERE medicine_vendor_id = ?
                    AND payment_status = 'paid'
                `,[vendor.id]);

                revenue += Number(
                    rows[0].total || 0
                );

            }

            /* ================= EQUIPMENT ================= */

            if(
                vendor.users_type
                .toLowerCase()
                .includes("equipment")
            ){

                const [rows] =
                await pool.query(`
                    SELECT
                    SUM(total_amount) AS total
                    FROM user_equipment_orders
                    WHERE equipment_vendor_id = ?
                    AND payment_status = 'paid'
                `,[vendor.id]);

                revenue += Number(
                    rows[0].total || 0
                );

            }

            /* ================= HOSPITAL ================= */

            if(
                vendor.users_type
                .toLowerCase()
                .includes("hospital")
            ){

                const [rows] =
                await pool.query(`
                    SELECT
                    SUM(total_amount) AS total
                    FROM user_hospital_bookings
                    WHERE hospital_id IN (
                        SELECT id
                        FROM hospitals
                        WHERE users_id = ?
                    )
                    AND payment_status = 'paid'
                `,[vendor.id]);

                revenue += Number(
                    rows[0].total || 0
                );

            }

            /* ================= LAB ================= */

            if(
                vendor.users_type
                .toLowerCase()
                .includes("lab")
            ){

                const [rows] =
                await pool.query(`
                    SELECT
                    SUM(total_amount) AS total
                    FROM user_lab_test_bookings
                    WHERE lab_vendor_id IN (
                        SELECT id
                        FROM labs
                        WHERE users_id = ?
                    )
                    AND payment_status = 'paid'
                `,[vendor.id]);

                revenue += Number(
                    rows[0].total || 0
                );

            }

            /* ================= INSURANCE ================= */

            if(
                vendor.users_type
                .toLowerCase()
                .includes("insurance")
            ){

                const [rows] =
                await pool.query(`
                    SELECT
                    SUM(premium_amount) AS total
                    FROM user_insurance_purchases
                    WHERE insurance_vendor_id = ?
                    AND payment_status = 'paid'
                `,[vendor.id]);

                revenue += Number(
                    rows[0].total || 0
                );

            }

            const commissionPercent =
            await getCommissionPercent(
                vendor.users_type
            );

            const commissionData =
            calculateCommissionAmount(
                revenue,
                commissionPercent
            );

            const vendorAmount =
            commissionData.finalAmount;

            const commissionAmount =
            commissionData.commissionAmount;

            const [paidRows] =
            await pool.query(`
                SELECT
                SUM(amount) AS paid
                FROM vendor_payouts
                WHERE vendor_id = ?
            `,[vendor.id]);

            const paidAmount =
            Number(
                paidRows[0].paid || 0
            );

            const remainingAmount =
            vendorAmount - paidAmount;

            totalIncoming += revenue;

            totalPaid += paidAmount;

            totalCommission +=
            commissionAmount;

            vendor.originalRevenue =
            revenue;

            vendor.commissionPercent =
            commissionPercent;

            vendor.commissionAmount =
            commissionAmount;

            vendor.vendorAmount =
            vendorAmount;

            vendor.paidAmount =
            paidAmount;

            vendor.remainingAmount =
            remainingAmount;

        }

        res.json({

            success:true,

            totalIncoming,

            totalPaid,

            platformRevenue:
            totalCommission,

            vendors

        });

    }
    catch(error){

        console.log(error);

        res.json({

            success:false,
            message:"Server Error"

        });

    }

});

//74
app.get('/api/admin/dashboard', async(req,res)=>{

    try{

        if(!req.session.admin){

            return res.json({

                success:false,
                message:"Unauthorized"

            });

        }

        /* ================= USERS ================= */

        const [usersRows] =
        await pool.query(`
            SELECT COUNT(*) AS totalUsers
            FROM users
        `);

        const totalUsers =
        Number(usersRows[0].totalUsers || 0);

        /* ================= VENDORS ================= */

        const [vendorsRows] =
        await pool.query(`
            SELECT COUNT(*) AS approvedVendors
            FROM users
            WHERE status = 'approved'
        `);

        const approvedVendors =
        Number(vendorsRows[0].approvedVendors || 0);

        /* ================= COUNTS ================= */

        const [[hospitalRow]] =
        await pool.query(`
            SELECT COUNT(*) AS total
            FROM hospitals
        `);

        const [[labRow]] =
        await pool.query(`
            SELECT COUNT(*) AS total
            FROM labs
        `);

        const [[ambulanceRow]] =
        await pool.query(`
            SELECT COUNT(*) AS total
            FROM ambulances
        `);

        const [[insuranceRow]] =
        await pool.query(`
            SELECT COUNT(*) AS total
            FROM insurances
        `);

        const [[medicineRow]] =
        await pool.query(`
            SELECT COUNT(*) AS total
            FROM medicines
        `);

        const [[equipmentRow]] =
        await pool.query(`
            SELECT COUNT(*) AS total
            FROM med_equipments
        `);

        /* ================= BOOKINGS ================= */

        const [[bookingRow]] =
        await pool.query(`
            SELECT COUNT(*) AS total
            FROM user_hospital_bookings
        `);

        /* ================= ORDERS ================= */

        const [[orderRow]] =
        await pool.query(`
            SELECT COUNT(*) AS total
            FROM user_medicine_orders
        `);

        /* ================= TOTAL REVENUE ================= */

        let totalRevenue = 0;
        let totalCommission = 0;

        const [vendors] =
        await pool.query(`
            SELECT *
            FROM users
        `);

        const revenueByType = {
            hospital: 0,
            lab: 0,
            insurance: 0,
            medicines: 0,
            equipments: 0
        };

        for(const vendor of vendors){

            let revenue = 0;

            /* ================= MEDICINES ================= */

            if(
                vendor.users_type
                .toLowerCase()
                .includes("medicine")
            ){

                const [[medicineRevenue]] =
                await pool.query(`
                    SELECT
                    SUM(total_amount) AS total
                    FROM user_medicine_orders
                    WHERE medicine_vendor_id = ?
                    AND payment_status = 'paid'
                `,[vendor.id]);

                const medicineAmount =
                Number(
                    medicineRevenue.total || 0
                );

                revenue += medicineAmount;
                revenueByType.medicines += medicineAmount;

            }

            /* ================= EQUIPMENTS ================= */

            if(
                vendor.users_type
                .toLowerCase()
                .includes("equipment")
            ){

                const [[equipmentRevenue]] =
                await pool.query(`
                    SELECT
                    SUM(total_amount) AS total
                    FROM user_equipment_orders
                    WHERE equipment_vendor_id = ?
                    AND payment_status = 'paid'
                `,[vendor.id]);

                const equipmentAmount =
                Number(
                    equipmentRevenue.total || 0
                );

                revenue += equipmentAmount;
                revenueByType.equipments += equipmentAmount;

            }

            /* ================= HOSPITAL ================= */

            if(
                vendor.users_type
                .toLowerCase()
                .includes("hospital")
            ){

                const [[hospitalRevenue]] =
                await pool.query(`
                    SELECT
                    SUM(total_amount) AS total
                    FROM user_hospital_bookings
                    WHERE hospital_id IN(

                        SELECT id
                        FROM hospitals
                        WHERE users_id = ?

                    )
                    AND payment_status = 'paid'
                `,[vendor.id]);

                const hospitalAmount =
                Number(
                    hospitalRevenue.total || 0
                );

                revenue += hospitalAmount;
                revenueByType.hospital += hospitalAmount;

            }

            /* ================= LAB ================= */

            if(
                vendor.users_type
                .toLowerCase()
                .includes("lab")
            ){

                const [[labRevenue]] =
                await pool.query(`
                    SELECT
                    SUM(total_amount) AS total
                    FROM user_lab_test_bookings
                    WHERE lab_vendor_id IN(

                        SELECT id
                        FROM labs
                        WHERE users_id = ?

                    )
                    AND payment_status = 'paid'
                `,[vendor.id]);

                const labAmount =
                Number(
                    labRevenue.total || 0
                );

                revenue += labAmount;
                revenueByType.lab += labAmount;

            }

            /* ================= INSURANCE ================= */

            if(
                vendor.users_type
                .toLowerCase()
                .includes("insurance")
            ){

                const [[insuranceRevenue]] =
                await pool.query(`
                    SELECT
                    SUM(premium_amount) AS total
                    FROM user_insurance_purchases
                    WHERE insurance_vendor_id = ?
                    AND payment_status = 'paid'
                `,[vendor.id]);

                const insuranceAmount =
                Number(
                    insuranceRevenue.total || 0
                );

                revenue += insuranceAmount;
                revenueByType.insurance += insuranceAmount;

            }

            const commissionPercent =
            await getCommissionPercent(
                vendor.users_type
            );

            const commissionAmount =
            (revenue * commissionPercent) / 100;

            totalRevenue += revenue;

            totalCommission +=
            commissionAmount;

        }

        /* ================= FINAL REVENUE ================= */

        const finalRevenue =
        totalRevenue - totalCommission;

        /* ================= BEDS ================= */

        const [hospitals] =
        await pool.query(`
            SELECT rooms
            FROM hospitals
        `);

        let totalBeds = 0;
        let availableBeds = 0;

        hospitals.forEach(hospital => {

            if(!hospital.rooms){
                return;
            }

            let rooms = [];

            try{

                rooms =
                typeof hospital.rooms === "string"
                ?
                JSON.parse(hospital.rooms)
                :
                hospital.rooms;

            }
            catch(error){

                rooms = [];

            }

            rooms.forEach(room => {

                const beds =
                Number(room.total_beds || 0);

                totalBeds += beds;

                if(
                    room.availability
                    &&
                    room.availability
                    .toLowerCase() === "available"
                ){

                    availableBeds += beds;

                }

            });

        });

        /* ================= RESPONSE ================= */

        res.json({

            success:true,

            stats:{

                totalUsers,

                approvedVendors,

                hospitals:
                hospitalRow.total,

                labs:
                labRow.total,

                ambulances:
                ambulanceRow.total,

                insurances:
                insuranceRow.total,

                medicines:
                medicineRow.total,

                equipments:
                equipmentRow.total,

                totalRevenue:
                finalRevenue,

                platformRevenue:
                finalRevenue,

                totalCommission,

                totalBeds,

                availableBeds,

                orders:
                orderRow.total,

                bookings:
                bookingRow.total,

                hospitalRevenue:
                revenueByType.hospital,

                labRevenue:
                revenueByType.lab,

                insuranceRevenue:
                revenueByType.insurance,

                medicinesRevenue:
                revenueByType.medicines,

                equipmentsRevenue:
                revenueByType.equipments

            }

        });

    }
    catch(error){

        console.log(error);

        res.json({

            success:false,
            message:"Server Error"

        });

    }

});

//75
app.get('/api/user/invoices', async(req,res) => {
        try{
            if(!req.session.user){
                return res.json({
                    success:false,
                    message:"Unauthorized"
                });
            }
            const userId = req.session.user.id;
            const [hospitalInvoices] =
                await pool.query(
                    `
                    SELECT
                        id,
                        'Hospital Booking'
                        AS payment_for,

                        hospital_name
                        AS location,

                        total_amount
                        AS amount,

                        payment_status,

                        created_at
                        AS paid_at

                    FROM user_hospital_bookings

                    WHERE user_id = ?
                    `,
                    [userId]
                );

            /* ================= LAB ================= */

            const [labInvoices] =
                await pool.query(
                    `
                    SELECT
                        id,
                        'Lab Test'
                        AS payment_for,

                        lab_name
                        AS location,

                        total_amount
                        AS amount,

                        payment_status,

                        created_at
                        AS paid_at

                    FROM user_lab_test_bookings

                    WHERE user_id = ?
                    `,
                    [userId]
                );

            /* ================= MEDICINE ================= */

            const [medicineInvoices] =
                await pool.query(
                    `
                    SELECT
                        id,
                        'Medicine Order'
                        AS payment_for,

                        medicine_name
                        AS location,

                        total_amount
                        AS amount,

                        payment_status,

                        created_at
                        AS paid_at

                    FROM user_medicine_orders

                    WHERE user_id = ?
                    `,
                    [userId]
                );

            /* ================= EQUIPMENT ================= */

            const [equipmentInvoices] =
                await pool.query(
                    `
                    SELECT
                        id,
                        'Medical Equipment'
                        AS payment_for,

                        product_name
                        AS location,

                        total_amount
                        AS amount,

                        payment_status,

                        created_at
                        AS paid_at

                    FROM user_equipment_orders

                    WHERE user_id = ?
                    `,
                    [userId]
                );

            /* ================= INSURANCE ================= */

            const [insuranceInvoices] =
                await pool.query(
                    `
                    SELECT
                        id,
                        'Insurance'
                        AS payment_for,

                        insurance_name
                        AS location,

                        premium_amount
                        AS amount,

                        payment_status,

                        created_at
                        AS paid_at

                    FROM user_insurance_purchases

                    WHERE user_id = ?
                    `,
                    [userId]
                );

            /* ================= MERGE ================= */

            const invoices = [

                ...hospitalInvoices,

                ...labInvoices,

                ...medicineInvoices,

                ...equipmentInvoices,

                ...insuranceInvoices

            ];

            /* ================= SORT ================= */

            invoices.sort(
                (a,b) =>
                    new Date(b.paid_at)
                    -
                    new Date(a.paid_at)
            );

            res.json({

                success:true,

                invoices

            });

        }
        catch(error){

            console.log(
                "Invoice Error:",
                error
            );

            res.json({

                success:false

            });

        }

    }
);

//76
app.get('/api/user/invoice/:invoiceId', async(req,res) => {
        try{

            const invoiceId =
                req.params.invoiceId;

            let invoiceData = null;

            let invoiceType = '';

            /* =======================================================
               PAYMENT INVOICE
            ======================================================= */

            if(
                invoiceId.startsWith(
                    'PAY-'
                )
            ){

                const paymentId =
                    invoiceId.replace(
                        'PAY-',
                        ''
                    );

                const [payments] =
                    await pool.query(
                        `
                        SELECT
                            *
                        FROM user_payments
                        WHERE id = ?
                        `,
                        [paymentId]
                    );

                if(
                    payments.length > 0
                ){

                    const payment =
                        payments[0];

                    /* ================= MEDICINE PAYMENT ================= */

                    if(
                        payment.payment_for ===
                        'medicine_order'
                    ){

                        const [medicineOrders] =
                            await pool.query(
                                `
                                SELECT

                                    umo.*,

                                    medicines.pharm_name,

                                    medicines.address
                                    AS pharmacy_address,

                                    users.name
                                    AS vendor_name,

                                    med_lists.medicine_name,

                                    user_medicine_order_items.quantity,

                                    user_medicine_order_items.price,

                                    user_medicine_order_items.subtotal

                                FROM user_medicine_orders umo

                                LEFT JOIN medicines
                                ON medicines.users_id =
                                umo.medicine_vendor_id

                                LEFT JOIN users
                                ON users.id =
                                umo.medicine_vendor_id

                                LEFT JOIN user_medicine_order_items
                                ON user_medicine_order_items.medicine_order_id =
                                umo.id

                                LEFT JOIN med_lists
                                ON med_lists.medicine_id =
                                user_medicine_order_items.medicine_id

                                WHERE umo.id = ?
                                `,
                                [payment.reference_id]
                            );

                        if(
                            medicineOrders.length > 0
                        ){

                            invoiceData =
                                {
                                    ...medicineOrders[0],

                                    transaction_id:
                                        payment.transaction_id,

                                    payment_method:
                                        payment.payment_method,

                                    paid_at:
                                        payment.paid_at
                                };

                            invoiceType =
                                'Medicine Order';

                        }

                    }

                    /* ================= EQUIPMENT PAYMENT ================= */

                    else if(
                        payment.payment_for ===
                        'equipment_order'
                    ){

                        const [equipmentOrders] =
                            await pool.query(
                                `
                                SELECT

                                    ueo.*,

                                    med_eq_prd.product_name,

                                    med_eq_prd.brand_name,

                                    med_eq_prd.category,

                                    med_eq_prd.selling_price,

                                    med_equipments.ven_bus_name,

                                    med_equipments.address,

                                    users.name
                                    AS vendor_name,

                                    user_equipment_order_items.quantity,

                                    user_equipment_order_items.price,

                                    user_equipment_order_items.subtotal

                                FROM user_equipment_orders ueo

                                LEFT JOIN user_equipment_order_items
                                ON user_equipment_order_items.equipment_order_id =
                                ueo.id

                                LEFT JOIN med_eq_prd
                                ON med_eq_prd.product_id =
                                user_equipment_order_items.equipment_id

                                LEFT JOIN med_equipments
                                ON med_equipments.users_id =
                                ueo.equipment_vendor_id

                                LEFT JOIN users
                                ON users.id =
                                ueo.equipment_vendor_id

                                WHERE ueo.id = ?
                                `,
                                [payment.reference_id]
                            );

                        if(
                            equipmentOrders.length > 0
                        ){

                            invoiceData =
                                {
                                    ...equipmentOrders[0],

                                    transaction_id:
                                        payment.transaction_id,

                                    payment_method:
                                        payment.payment_method,

                                    paid_at:
                                        payment.paid_at
                                };

                            invoiceType =
                                'Equipment Order';

                        }

                    }

                }

            }

            /* =======================================================
               ORDER INVOICE
            ======================================================= */

            else if(
                invoiceId.startsWith(
                    'ORD-'
                )
            ){

                const orderId =
                    invoiceId.replace(
                        'ORD-',
                        ''
                    );

                /* ================= MEDICINE ORDER ================= */

                const [medicineOrders] =
                    await pool.query(
                        `
                        SELECT

                            umo.*,

                            medicines.pharm_name,

                            medicines.address
                            AS pharmacy_address,

                            users.name
                            AS vendor_name,

                            med_lists.medicine_name,

                            user_medicine_order_items.quantity,

                            user_medicine_order_items.price,

                            user_medicine_order_items.subtotal

                        FROM user_medicine_orders umo

                        LEFT JOIN medicines
                        ON medicines.users_id =
                        umo.medicine_vendor_id

                        LEFT JOIN users
                        ON users.id =
                        umo.medicine_vendor_id

                        LEFT JOIN user_medicine_order_items
                        ON user_medicine_order_items.medicine_order_id =
                        umo.id

                        LEFT JOIN med_lists
                        ON med_lists.medicine_id =
                        user_medicine_order_items.medicine_id

                        WHERE umo.id = ?
                        `,
                        [orderId]
                    );

                if(
                    medicineOrders.length > 0
                ){

                    invoiceData =
                        medicineOrders[0];

                    invoiceType =
                        'Medicine Order';

                }

                /* ================= EQUIPMENT ORDER ================= */

                if(
                    !invoiceData
                ){

                    const [equipmentOrders] =
                        await pool.query(
                            `
                            SELECT

                                ueo.*,

                                med_eq_prd.product_name,

                                med_eq_prd.brand_name,

                                med_eq_prd.category,

                                med_eq_prd.selling_price,

                                med_equipments.ven_bus_name,

                                med_equipments.address,

                                users.name
                                AS vendor_name,

                                user_equipment_order_items.quantity,

                                user_equipment_order_items.price,

                                user_equipment_order_items.subtotal

                            FROM user_equipment_orders ueo

                            LEFT JOIN user_equipment_order_items
                            ON user_equipment_order_items.equipment_order_id =
                            ueo.id

                            LEFT JOIN med_eq_prd
                            ON med_eq_prd.product_id =
                            user_equipment_order_items.equipment_id

                            LEFT JOIN med_equipments
                            ON med_equipments.users_id =
                            ueo.equipment_vendor_id

                            LEFT JOIN users
                            ON users.id =
                            ueo.equipment_vendor_id

                            WHERE ueo.id = ?
                            `,
                            [orderId]
                        );

                    if(
                        equipmentOrders.length > 0
                    ){

                        invoiceData =
                            equipmentOrders[0];

                        invoiceType =
                            'Equipment Order';

                    }

                }

            }

            /* =======================================================
               NOT FOUND
            ======================================================= */

            if(
                !invoiceData
            ){

                return res.send(`
                    <h1>
                        Invoice Not Found
                    </h1>
                `);

            }

            /* =======================================================
               HTML
            ======================================================= */

            res.send(`

                <html>

                    <head>

                        <title>
                            Invoice
                        </title>

                        <style>

                            body{

                                font-family:Arial;
                                background:#f5f5f5;
                                padding:40px;

                            }

                            .invoiceBox{

                                max-width:900px;
                                margin:auto;
                                background:white;
                                padding:30px;
                                border-radius:12px;
                                box-shadow:
                                    0 0 15px rgba(
                                        0,
                                        0,
                                        0,
                                        0.1
                                    );

                            }

                            h1{

                                color:#ff1493;
                                margin-bottom:20px;

                            }

                            table{

                                width:100%;
                                border-collapse:collapse;

                            }

                            td{

                                border:1px solid #ddd;
                                padding:12px;

                            }

                            .heading{
                                color:#ff1493;
                                font-weight:bold;

                            }

                            .downloadBtn{

                                margin-top:20px;
                                background:#ff1493;
                                color:white;
                                border:none;
                                padding:12px 20px;
                                border-radius:6px;
                                cursor:pointer;

                            }

                        </style>

                    </head>

                    <body>

                        <div class="invoiceBox">
                        <div class="invoiceHeader">

    <div class="leftLogo">

        <img
            src="/assets/logo.png"
            alt="Hospikare Logo"
        >

    </div>

    <div class="centerHeading">


        <p>
            Medical & Healthcare Services
        </p>

    </div>

</div>

                            <h1>
                                ${invoiceType} Invoice
                            </h1>

                            <table>

                                <tr>

                                    <td class="heading">
                                        Invoice ID
                                    </td>

                                    <td>
                                        ${invoiceId}
                                    </td>

                                </tr>

                                <tr>

                                    <td class="heading">
                                        Product / Service
                                    </td>

                                    <td>
                                        ${invoiceData.product_name || invoiceData.medicine_name || '-'}
                                    </td>

                                </tr>

                                <tr>

                                    <td class="heading">
                                        Quantity
                                    </td>

                                    <td>
                                        ${invoiceData.quantity || '-'}
                                    </td>

                                </tr>

                                <tr>

                                    <td class="heading">
                                        Vendor
                                    </td>

                                    <td>
                                        ${invoiceData.vendor_name || '-'}
                                    </td>

                                </tr>

                                <tr>

                                    <td class="heading">
                                        Business
                                    </td>

                                    <td>
                                        ${invoiceData.pharm_name || invoiceData.ven_bus_name || '-'}
                                    </td>

                                </tr>

                                <tr>

                                    <td class="heading">
                                        Address
                                    </td>

                                    <td>
                                        ${invoiceData.pharmacy_address || invoiceData.address || '-'}
                                    </td>

                                </tr>

                                <tr>

                                    <td class="heading">
                                        Amount
                                    </td>

                                    <td>
                                        ₹${invoiceData.total_amount || invoiceData.subtotal || '-'}
                                    </td>

                                </tr>

                                <tr>

                                    <td class="heading">
                                        Payment Status
                                    </td>

                                    <td>
                                        ${invoiceData.payment_status || '-'}
                                    </td>

                                </tr>

                                <tr>

                                    <td class="heading">
                                        Transaction ID
                                    </td>

                                    <td>
                                        ${invoiceData.transaction_id || invoiceData.razorpay_payment_id || '-'}
                                    </td>

                                </tr>

                                <tr>

                                    <td class="heading">
                                        Payment Method
                                    </td>

                                    <td>
                                        ${invoiceData.payment_method || 'Online'}
                                    </td>

                                </tr>

                                <tr>

                                    <td class="heading">
                                        Date
                                    </td>

                                    <td>
                                        ${
                                            new Date(
                                                invoiceData.paid_at
                                                ||
                                                invoiceData.created_at
                                                ||
                                                invoiceData.ordered_at
                                            ).toLocaleString()
                                        }
                                    </td>

                                </tr>

                            </table>

                            <button
                                class="downloadBtn"

                                onclick="
                                    window.print()
                                "
                            >

                                Download Invoice

                            </button>

                        </div>

                    </body>

                </html>

            `);

        }
        catch(error){

            console.log(
                "Invoice Error:",
                error
            );

            res.send(`
                <h1>
                    Invoice Error
                </h1>
            `);

        }

    }
);

//77
app.get('/api/vendor/payments', async(req,res)=>{
        try{
            if(!req.session.user){
                return res.json({
                    success:false,
                    message:'Login Required'
                });
            }
            const vendorId =
            req.session.user.id;
            const [payments] =
            await pool.query(
                `
                SELECT
                    *
                FROM
                    vendor_payouts
                WHERE
                    vendor_id = ?
                ORDER BY
                    paid_at DESC
                `,
                [vendorId]
            );
            res.json({
                success:true,
                payments
            });
        }
        catch(error){
            console.log(error);
            res.json({
                success:false,
                message:'Server Error'
            });
        }
    }
);

//78
app.get('/api/payments', async(req,res)=>{

    try{

        const vendorId =
        req.session.user.id;

        const [payments] =
        await pool.query(

            `
            SELECT

            uab.id,
            uab.id as booking_id,

            pu.full_name,

            uab.total_amount as amount,

            uab.vendor_amount,

            uab.admin_commission,

            uab.razorpay_payment_id,

            uab.payment_status,

            uab.created_at

            FROM user_ambulance_bookings uab

            JOIN ambulances a
            ON a.id = uab.ambulance_id

            JOIN product_users pu
            ON pu.id = uab.user_id

            WHERE

            a.users_id = ?

            AND

            uab.payment_status='paid'

            ORDER BY uab.id DESC
            `,

            [vendorId]

        );

        res.json({

            success:true,

            payments

        });

    }
    catch(error){

        console.log(error);

        res.json({

            success:false

        });

    }

});

//79
app.get('/api/vendor/dashboard', async(req,res)=>{

    try{

        if(!req.session.user){

            return res.json({
                success:false,
                message:'Login Required'
            });

        }

        const vendorId =
            req.session.user.id;

        const [[medicineStats]] =
            await pool.query(
                `
                SELECT
                    COUNT(*) AS totalProducts,
                    SUM(stock_quantity) AS totalStock
                FROM
                    med_lists
                WHERE
                    vendor_id = ?
                `,
                [vendorId]
            );

        const [[orderStats]] =
            await pool.query(
                `
                SELECT
                    COUNT(*) AS totalOrders,
                    IFNULL(SUM(total_amount),0) AS totalRevenue
                FROM
                    user_medicine_orders
                WHERE
                    medicine_vendor_id = ?
                    AND payment_status='paid'
                `,
                [vendorId]
            );

        const [recentOrders] =
            await pool.query(
                `
                SELECT
                    *
                FROM
                    user_medicine_orders
                WHERE
                    medicine_vendor_id = ?
                LIMIT 5
                `,
                [vendorId]
            );

        const [recentPayments] =
            await pool.query(
                `
                SELECT
                    *
                FROM
                    vendor_payouts
                WHERE
                    vendor_id = ?
                ORDER BY
                    paid_at DESC
                LIMIT 5
                `,
                [vendorId]
            );

        res.json({
            success:true,
            dashboard:{
                totalProducts:
                    medicineStats.totalProducts || 0,

                totalStock:
                    medicineStats.totalStock || 0,

                totalOrders:
                    orderStats.totalOrders || 0,

                totalRevenue:
                    orderStats.totalRevenue || 0,

                recentOrders,
                recentPayments
            }
        });

    }
    catch(error){

        console.log(error);

        res.json({
            success:false,
            message:'Server Error'
        });

    }

});

//80
app.get('/api/vendor/mdeqdashboard', async(req,res)=>{

    try{

        if(!req.session.user){

            return res.json({
                success:false
            });

        }

        const vendorId =
            req.session.user.id;

        const [[products]] =
            await pool.query(
                `
                SELECT
                    COUNT(*) AS totalProducts,
                    IFNULL(
                        SUM(stock_quantity),
                        0
                    ) AS totalStock
                FROM
                    med_eq_prd
                WHERE
                    vendor_id = ?
                `,
                [vendorId]
            );

        const [[orders]] =
            await pool.query(
                `
                SELECT
                    COUNT(*) AS totalOrders,
                    IFNULL(
                        SUM(total_amount),
                        0
                    ) AS totalRevenue
                FROM
                    user_equipment_orders
                WHERE
                    equipment_vendor_id = ?
                    AND payment_status='paid'
                `,
                [vendorId]
            );

        const [recentOrders] =
            await pool.query(
                `
                SELECT
                    *
                FROM
                    user_equipment_orders
                WHERE
                    equipment_vendor_id = ?
                ORDER BY
                    created_at DESC
                LIMIT 5
                `,
                [vendorId]
            );

        const [recentPayments] =
            await pool.query(
                `
                SELECT
                    *
                FROM
                    vendor_payouts
                WHERE
                    vendor_id = ?
                ORDER BY
                    paid_at DESC
                LIMIT 5
                `,
                [vendorId]
            );

        res.json({

            success:true,

            dashboard:{

                totalProducts:
                    products.totalProducts,

                totalStock:
                    products.totalStock,

                totalOrders:
                    orders.totalOrders,

                totalRevenue:
                    orders.totalRevenue,

                recentOrders,

                recentPayments

            }

        });

    }
    catch(error){

        console.log(error);

        res.json({
            success:false
        });

    }

});

app.listen(PORT, () => {
    console.log(`Server running on port : ${PORT}`);
});
