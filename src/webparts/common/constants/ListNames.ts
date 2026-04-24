export const BASE_URL = "/sites/BCEggAdminPortal"

export const listNames = {
    // Libraries


    // Lists
    ProducerInformation: "Producer Information",
    QuotaCreditType: "Quota Credit Type",
    QuotaCreditTypes: "Quota Credit Types",
    FinalQuotaCreditUsageList: "Quota Credit Requests",
    QuotaCreditTransactions: "Quota Credit Usage Transaction",
    QuotaCreditEarnTransactions: "Quota Credit Earn Transactions",
    EarnedUsageQuotaCreditMappings: "Earned Usage Quota Credit Mappings",
    //CPP
    FinalPremises: "FinalPremises",
    FinalProducerPremiseBarns: "FinalProducerPremiseBarns",
    PulletGrowers: "Pullet Growers",
    Hatcheries:"Hatcheries",
    CPPRequests:"CPP Requests",
    ProducerBarn:"ProducerBarn",
    BarnProductionTypeMapping:"Barn Production Type Mapping",
    ProductionandHousingType:"Production and Housing Type"
};

export const status = {
    PendingApproval: "Pending Approval",
    Approved: "Approved",
    Declined: "Declined"
};

export const CreditType = {
    QuotaCreditTrade: "20 - Quota Credit Trade",
    Utilized: "22 - Utilized",
};
// alert

export const alerts = {
    noitemselected: "No items selected to save!",
    successfully: "All items added successfully!",
    error: "Error while saving items. Check console for details.",
    RequiredFields: "Please fill the required field:",
    SuccessFullySubmited: "Record added successfully",
    SuccessFullyupdated: "Record Updated successfully",
    catcherrors: "Error while saving data",
    Deleterecord: "Record Deleted successfully",
    Notransactions: "Please Add Quota Credit Transaction Entry First",
    allcancel: "All temporary transactions cancelled",
    ValidateQuantity: "Quantity must be less than Available in Balance",
    deleteconfirm: "Are you sure you want to delete this transaction?",
    QuantityGreaterthanZero: "Quantity must be less than Available in Balance",
    
    Cppdeleteconfirm: "Are you sure you want to delete this Barn Table?",
    CppNotransactions: "Please Add ( Add Barn ) Entry First",
OneBarnAllowed: "This Barn has already been added in a Pending Request.",

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

export const BarnfieldNamesMap: any = {
    Bc_Barn: "Barn #",
    Bc_RequestedHatchDate: "Requested Hatch Date",
    Bc_OfChicksOrdered: "# of Chicks Ordered",
    Bc_ProductionType: "Production Type",
    Bc_HousingSystem: "Housing System",
    Bc_EstimateRemovalDate: "Estimate Removal Date",
    Bc_RequestedRemovalDate: "Requested Removal Date"
};