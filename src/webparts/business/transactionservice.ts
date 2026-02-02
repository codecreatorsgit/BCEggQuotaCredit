import { listNames } from "../common/constants/ListNames";
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

  public Formpayload(formData: any, producerkey: any, status: any) {
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
      Bc_checkbox:formData.Bc_checkbox
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
      await this.api.filterListItems(listNames.QuotaCreditTransactions,
        `Bc_Transaction_Type eq 'Earned' and bc_producerId eq '${producerid}'`, "*");
    this._transactionEarnedHistory = quotEarnedTransactions;
    return quotEarnedTransactions;
  }
}
