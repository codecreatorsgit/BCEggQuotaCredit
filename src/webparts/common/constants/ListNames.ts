export const BASE_URL = "/sites/BCEggAdminPortal"

export const listNames = {
    // Libraries


    // Lists
    ProducerInformation: "Producer Information",
    QuotaCreditType: "Quota Credit Type",
    QuotaCreditTypes: "Quota Credit Types",
    FinalQuotaCreditUsageList: "Quota Credit Requests",
    QuotaCreditTransactions: "Quota Credit Usage Transaction" ,
    QuotaCreditEarnTransactions: "Quota Credit Earn Transactions"
};

export const status = {
    PendingApproval: "Pending Approval",
    Approved: "Approved",
    Declined: "Declined"
};

export enum EmployeeStatus {

};

// alert

export const alerts = {
    noitemselected: "No items selected to save!",
    successfully: "All items added successfully!",
    error: "Error while saving items. Check console for details.",
    RequiredFields: "Please fill the required field:",
    SuccessFullySubmited: "Record added successfully",
    catcherrors: "Error while saving data",
    Deleterecord: "Record Deleted successfully",
    Notransactions:"Please Add Quota Credit Transaction Entry First",
    allcancel :"All temporary transactions cancelled",
    ValidateQuantity:"Quantity must be less than Available in Balance",
    deleteconfirm: "Are you sure you want to delete this transaction?",
    QuantityGreaterthanZero:"Quantity must be less than Available in Balance",


}

export const fieldNamesMap: Record<string, string> = {
    Bc_Quota_Credit_Type: 'Quota Credit Type',
    Bc_Quantity_per_Week: 'Quantity per Week',
    Bc_Flock: 'Flock',
    Bc_Application_Date: 'Application Date',
    Bc_Start_Date: 'Start Date',
    Bc_End_Date: 'End Date',
    Bc_Description: 'Description'
  };