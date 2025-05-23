export interface JwtAuthData {
    a_session_seqno: string,
    a_process_seqno: string,
    user_code: string,
    entity_code: string,
    bank_branch_code: string,
    client_code: string,
    deductor_panno?: string,
    parent_code: string,
    user_name: string,
    short_name: string,
    user_level: string,
    login_id: string,
    iud_type: string,
    default_acc_year: string,
    default_quarter_no: string,
    default_tds_type_code: string,
    default_tran_month: string,
    default_module_type_code: string,
    add_right: string,
    edit_right: string,
    delete_right: string,
    query_right: string,
    print_right: string,
    approve_right: string,
    valuation_right: string,
    special_right: string,
    approvedby: string,
    approveddate: string,
    client_code_details: string,
    module_type_name: string,
    default_from_date: string,
    default_to_date: string,
    default_client_code?: string,
    client_code_level: any,
    tanno: string,
    entity_name: string,
    first_time_login: number,
    user_role_code: string,
    first_level_client_code: string
    services?: any,
    itmsapi?: any,
    email_id: string,
    mobileno: number,
    sub_module_type_code_str: string,
    data_import_lastupdate: any,
    emp_client_code: string,
    user_emp_role_code: string,
    user_emp_role_name: string,
    default_sub_module_type_code?: string,
    app_kpi_code_str: any,
    is_pen_flag?: any
}

export interface dbValidationError {
    message: string,
    field: string
}

export interface requestValidationError {
    message: string,
    field?: string
}

export interface filterBody {
    filter_col_field: string,
    filter_col_depend_operator: string,
    filter_col_value: string,
}

declare global {
    namespace Express {
        interface Request {
            currentUser?: JwtAuthData,
            DEBUG_DB?: any
        }
    }
}