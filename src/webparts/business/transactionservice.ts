import { listNames } from "../common/constants/ListNames";
import { daysBetween, weeksBetween } from "../common/utils/helperfunctions";
import { ApiService } from "../services/apiservices";

// Business Layer
export class TransactionService {

  private _transactionUsageHistory: any;
  private _transactionEarnedHistory: any;
  api: any;
  constructor(context: any) {
    // Initialize PnPjs with the context 
    this.api = new ApiService(context)

  }
  static validateQuota(quota: number, availableCredit: number,approvalPendingCredit:number): boolean {
    return quota <= (availableCredit-approvalPendingCredit);
  }

  static calculateTotalCredit(transactions: any): number {
    return transactions.reduce((sum: any, t: { amount: any; }) => sum + t.amount, 0);
  }
  static calculateQuantityPerDay(Bc_Quantity_per_Week:number): number {
    return Math.floor(Bc_Quantity_per_Week/7);
  }

   static calculateTotalQuantity(Bc_QuantityPerDay:number,Bc_TotalNoofDays:number): number {
    return Bc_QuantityPerDay*Bc_TotalNoofDays;
  }

  
 public Formpayload(formData: any, producerkey: any, status: any) {
  let totalDays = formData.Bc_Start_Date && formData.Bc_End_Date ? daysBetween(formData.Bc_Start_Date, formData.Bc_End_Date) : 0;
  let quantityperday = TransactionService.calculateQuantityPerDay(Number(formData.Bc_Quantity_per_Week));
  let totalQuantity = TransactionService.calculateTotalQuantity(quantityperday,totalDays);
  let numberofDays = totalDays;
  let noofweeks = formData.Bc_Start_Date && formData.Bc_End_Date ? weeksBetween(formData.Bc_Start_Date, formData.Bc_End_Date) : 0;

  const payload: any = {
    Bc_Quota_Credit_Type: formData.Bc_Quota_Credit_Type,
    Bc_Quantity_per_Week: formData.Bc_Quantity_per_Week,
    Bc_Flock: formData.Bc_Flock,
    Bc_Application_Date: formData.Bc_Application_Date,
    Bc_Start_Date: formData.Bc_Start_Date,
    Bc_End_Date: formData.Bc_End_Date,
    Bc_Description: formData.Bc_Description,
    Bc_producerIDId: Number(producerkey),
    Bc_applicationStatus: status.PendingApproval,
    Bc_checkbox: formData.Bc_checkbox,
    Bc_TotalQuantity: totalQuantity,
    Bc_QuantityPerDay: quantityperday,
    Bc_TotalNoofDays: numberofDays,
    Bc_NoofWeeks: noofweeks
  };

  return payload;
}


  public fetchInitialQuotaofProducer(): number {

    const totalUsageQuantity= this._transactionUsageHistory.reduce((sum: any, item: { bc_quantityPerWeek: any; }) => {
      return sum + (item.bc_quantityPerWeek || 0);
    }, 0);

    const totalEarnedQuantity= this._transactionEarnedHistory.reduce((sum: any, item: { bc_quantityPerWeek: any; }) => {
      return sum + (item.bc_quantityPerWeek || 0);
    }, 0);

    return totalEarnedQuantity-totalUsageQuantity;
  }

  // oper table kle
  public async fetchCurrentTransactions(producerid: number): Promise<any> {
    const quotaCreditTransactions =
      await this.api.filterListItems(listNames.FinalQuotaCreditUsageList,
        `Bc_applicationStatus eq 'Pending Approval' and Bc_producerIDId eq '${producerid}'`, "*")
    return quotaCreditTransactions;
  }

  // neecy table kle  // `ID eq 1`,"*")
  public async fetchHistoricalUsageTransactions(producerid: number): Promise<any> {
    const quotUsageTransactions =
      await this.api.filterListItems(listNames.QuotaCreditTransactions,
        `Bc_Transaction_Type eq 'Usage' and bc_producerId eq '${producerid}'`, "*");
    this._transactionUsageHistory = quotUsageTransactions;
    return quotUsageTransactions;
  }

   public async fetchHistoricalEarnedTransactions(producerid: number): Promise<any> {
    const quotEarnedTransactions =
      await this.api.filterListItems(listNames.QuotaCreditEarnTransactions,
        `Bc_Transaction_Type eq 'Earned' and bc_producerId eq '${producerid}' and bc_isExpired eq 'false' and bc_isCreditUsed eq 'false'`, "*");
    this._transactionEarnedHistory = quotEarnedTransactions;
    return quotEarnedTransactions;
  }
}
