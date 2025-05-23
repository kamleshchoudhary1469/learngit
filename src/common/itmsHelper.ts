
export interface officeNoDataType {
    office_no: string,
}

export interface nicuIdDataType {
    nicu_id: string,
}

// The mentioned function return “1” master data exists and “-1” for master data not exists.
// VALID OFFICE ID (Office ID)
export const getOfficeNoValidation = (officeNoDataType: officeNoDataType) => {
    return new Promise<string | boolean>(async (resolve, reject) => {
        // const ofcNoValidation = await queryexecute(`select pkg_utility_itms.is_valid_office_no('${officeNoDataType.office_no}') from dual`);
        // resolve(ofcNoValidation);
    });
}

// VALID NICUID (Employee ID)
export const getNicuIdValidation = (nicuIdDataType: nicuIdDataType) => {
    return new Promise<string | boolean>(async (resolve, reject) => {
        // const nicuIdValidation = await queryexecute(`select pkg_utility_itms.is_valid_nicuid('${nicuIdDataType.nicu_id}') from dual`);
        // resolve(nicuIdValidation);
    });
}
