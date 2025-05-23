const baseOrigin = window.location.origin;
const { user, accessToken, refreshToken, user_role_str, iud_type, servicepage, profileImg, userdetails } = window.nightManager() ?? {};

const servicePageObj = {
    "F16": "/download",
    "INC": "/transaction",
    "PRJ": "/salary-details",
    "SSD": "/salary-details",
}

const x = {
    "DDO": "itms/deductors/",
    "TO": "itms/24g/",
}

const genSign = () => { let t, n = window || global, r = (t = (navigator.mimeTypes.length + navigator.userAgent.length).toString(36) + function (e) { let t = []; for (let r in n) t.push(r); return t.length.toString(36) }(), (new Array(5).join ("0") + t).slice(-4)), i = n.screen.width.toString(36), o = n.screen.height.toString(36), g = n.screen.availWidth.toString(36), a = n.screen.availHeight.toString(36), s = n.screen.colorDepth.toString(36), c = n.screen.pixelDepth.toString(36); return btoa(r + i + o + g + a + s + c) };

const BROWSER_SIGN_DELIMETER = "AzFgSsapkVkHmSjJMD";

const postReq = async ({ returnDataKey, url, data = {}, headersReq = true }) => {
    const options = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `${accessToken}${BROWSER_SIGN_DELIMETER}${genSign()}`,
            'Homeorigin': '/itms',
            ...(headersReq ? [{ key: "Clientcode", val: "client_code" }, { key: "Accyear", val: "default_acc_year" }, { key: "Quater", val: "default_quarter_no" }, { key: "Month", val: "default_tran_month" }, { key: "Frommonth", val: "default_from_date" }, { key: "Tomonth", val: "default_to_date" }, { key: "Tdscode", val: "default_tds_type_code" }, { key: "Modulecode", val: "default_module_type_code" }].reduce((acc, { key, val }) => {
                acc[key] = btoa(user?.[val]);
                return acc;
            }, {}) : [])
        },
        body: JSON.stringify(data)
    };
    try {
        const fetchResponse = await fetch(url, options);
        const data = await fetchResponse.json();
        return data?.[returnDataKey];
    } catch (e) {
        return e;
    }
}

const getHeaderMast = async () => {
    const headermst = await postReq({
        url: `${window.location.origin}/api/filter/get-header-master`,
        returnDataKey: "headermaster",
        data: {
            prockey: ['get_gmdt_acc_year_mast', 'get_gmdt_quarter_mast', 'get_gmdt_tds_type_mast', 'get_gmdt_regex_validation', 'get_gmdt_app_parameters'],
            iudType: ""
        },
    });
    localStorage.setItem("header_master_data", JSON.stringify(headermst));
}

const getEmpDetail = async () => {
    const resEmp = await postReq({
        url: `${window.location.origin}/api/itms/get-emp-detail`,
        returnDataKey: "data"
    });
    // const resReq = await postReq({
    //     url: `${window.location.origin}/api/request/dashboard-req-kpi`,
    //     data: { current_records: "0" },
    //     returnDataKey: "get_gtdb_emp_kpi_req_tran"
    // });
    const resRow = await postReq({
        url: `${window.location.origin}/api/itms/projected-sal`,
        data: {
            current_records: "0", ...(resEmp?.detail?.length ? resEmp?.detail[0] : {})
        },
        returnDataKey: "data",
        headersReq: false
    });

    localStorage.setItem("ITMS_DATA", JSON.stringify({ ...resEmp, salaryComputation: { ...(resRow?.salary_tran_load_details ?? {}) } }));
}

let empAcc = document.querySelector("#selfservice");
let workAcc = document.querySelector("#workspace");
let loadrAcc = document.querySelector("#loader");
let intermidiateAcc = document.querySelector("#intermediate");
localStorage.setItem('session_data', JSON.stringify({ accessToken, refreshToken }));
localStorage.setItem('auth_data', JSON.stringify({ ...user, iud_type, basePathDB: !x?.[servicepage] ? "/emp" : "/itms", servicepage, userdetails, is_itms_user: 1 }));
localStorage.setItem('default_auth_data', JSON.stringify({ ...user, iud_type, basePathDB: !x?.[servicepage] ? "/emp" : "/itms", servicepage, userdetails }));
localStorage.setItem('Permission', JSON.parse(JSON.stringify(user_role_str)));
localStorage.setItem('ProfileImage', profileImg);
empAcc.href = baseOrigin + "/emp/";
workAcc.href = baseOrigin + "/itms/";
empAcc.style.display = "flex";
workAcc.style.display = "flex";
intermidiateAcc.style.display = "none";

function navBasePathDBHandle(basePathDB) {
    localStorage.setItem('auth_data', JSON.stringify({ ...user, servicepage, userdetails, ...(basePathDB == "/emp" ? { default_quarter_no: 4, default_tds_type_code: "24Q" } : {}), is_itms_user: 1, basePathDB, }));
    localStorage.setItem('default_auth_data', JSON.stringify({ ...user, servicepage, userdetails, ...(basePathDB == "/emp" ? { default_quarter_no: 4, default_tds_type_code: "24Q" } : {}), basePathDB }));
}

workAcc.addEventListener('click', function () {
    navBasePathDBHandle('/itms')
})

empAcc.addEventListener('click', function () {
    navBasePathDBHandle('/emp')
})

const login = async () => {
    sessionStorage.clear();
    await getHeaderMast();
    await getEmpDetail();
    if (servicepage && x?.[servicepage]) {
        window.location.href = baseOrigin + `/${x?.[servicepage]}`;
        workAcc.style.display = "none";
        return;
    }
    // if (servicepage && servicePageObj?.[servicepage]) {
    window.location.href = baseOrigin + `/emp${servicePageObj?.[servicepage] ?? "/"}`;
    workAcc.style.display = "none";
    return;
    // }
    if (iud_type == "emp_code") {
        window.location.href = baseOrigin + "/emp/";
        workAcc.style.display = "none";
    } else {
        loadrAcc.style.display = "none";
        intermidiateAcc.style.display = "flex";
    }
}

setTimeout(() => {
    login();
}, 2500);

