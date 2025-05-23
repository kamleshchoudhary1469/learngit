import dotenv from 'dotenv';
dotenv.config();

export const { REACT_APP_ENV, REDISHOST, REDISPORT, REDIS_PASSWORD, NODE_ENV, BULK_UPLOAD_PORT, PORT, REACT_APP_IP, FILEPATH_TEXT_IMPORT, FILEPATH_TEXT_IMPORT_WORKING_DIR, ORACLE_DB_IP, ORACLE_DB_IP_SSH_USERNAME, ORACLE_DB_IP_SSH_PASSWORD, ORACLE_DB_IP_SSH_PORT, FORM_SIXTEEN, CONNECTIONARR, NODE_ORACLEDB_CONNECTIONSTRING, ORACLE_CLIENT_EXEC_PATH, REACT_GH_APP_ENV, PROD_ORIGIN, DEV_ORIGIN, BROWSER_SIGN_DELIMETER, REACT_APP_BASEPATH, DB_CONNECTION_TYPE, AWS_BUCKETNAME, CLOUD_INFRA_AT, PUBLIC_BASE_PATH_F16, SEVEN_ZIP_PATH, ISMAINTENANCE }: any = process.env;
export const CLIENT_SESSION_STORAGE_KEY = "session_data";
export const CLIENT_AUTH_STORAGE_KEY = "auth_data";
export const CLIENT_DEFAULT_AUTH_STORAGE_KEY = "default_auth_data";
export const PERMISSION = "Permission";
export const DEBUG_DB = false;
export const CORS_ORIGINS =
    process?.env?.CORS_ORIGINS
        ? JSON.parse(Buffer.from(process?.env?.CORS_ORIGINS, 'base64').toString('utf8'))
        : Array(6).fill('').map((e, idx) => `http://localhost:808${idx}`)
        ?? Array(6).fill('').map((e, idx) => `http://localhost:808${idx}`);


export const FILE_CHUNK = 1024 * 512;

export const paramsProcObj: any = {
    "get_gtdb_tds_tran_load": "TRANSACTION",
    "get_gtdb_tds_challan_tran_load": "CHALLAN",
    "get_gtdb_deductee_details": "DEDUCTEE",
    "get_gtdb_process_log_head": "LOGS",
    "get_gmdb_client_mast": "DEDUCTOR",
    "get_gmdb_deductee_mast_15gh": "15_GH_LIST",
    "get_gmdb_tds_bank_tran_error_mast": "TRAN_ERR",
    "get_gmdb_tds_spl_rate_mast": "DEDUCTION",
    "get_gmdb_stream_mast": "STEAM_MAST",
    "get_gmdb_client_level_mast": "CLIENT",
    "get_gmdb_user_mast": "USERS",
    "get_godb_tds_return_tran": "TDS_RETURN",
    "get_gmdb_pan_mast_unverified": "UNVERIFIED_PAN",
    "get_gtdb_template_body_mapping": "TEMPLATE_MAPPING",
    "get_gtdb_tran_load_error_download_all": "ERR_REPORT",
    "get_gmdb_client_mast_proposal": "CLIENT_PROPOSAL",
    "get_gmdb_entity_mast": "ENTITY_MAST",
    "get_gmdb_acc_year_mast": "ACC_YEAR_MAST",
    "get_gmdb_organisation_sector_mast": "ORG_SEC_MAST",
    "get_gmdb_organisation_type_mast": "ORG_TYPE_MAST",
    "get_gtdb_tran_load_error_download_deductee": "TRAN_ERR_REPORT",
    "get_gtdb_tran_load_error_download_challan": "CHALLAN_ERR_REPORT",
    "get_gtdb_tran_load_error_download_deductor": "DEDUCTOR_ERR_REPORT",
    "get_gtdb_tran_load_error_download_salary": "SALLARY_ERR_REPORT",
    "get_gtdb_tran_load_error_15gh_download_all": "15_GH_ERR_REPORT",
    "get_gtdb_tran_load_error_15gh_download_dm": "15_GH_MASTER_ERR_REPORT",
    "get_gmdb_import_template_process_head": "IMPORT_TEMPLATE_PROCESS",
    "get_gtdb_user_activity_log": "USER_ACTIVITY_LOG",
    "get_gmdb_app_parameters": "SYSTEM_PARAMETERS",
    "get_gmdb_tds_rate_mast": "TDS_RATE",
    "get_gmdb_tds_mast": "TDS_SECTION"
}

export default process.env
