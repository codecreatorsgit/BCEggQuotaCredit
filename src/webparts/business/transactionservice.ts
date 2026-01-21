import { listNames } from "../common/constants/ListNames";
import { ApiService } from "../services/apiservices";

// Business Layer
export class TransactionService {

private _transactionHistory:any;
  api:any;
     constructor(context: any) {
        // Initialize PnPjs with the context 
        this.api = new ApiService(context)
    
      }
  static validateQuota(quota: number, availableCredit: number): boolean {
    return quota <= availableCredit;
  }

  static calculateTotalCredit(transactions: any): number {
    return transactions.reduce((sum: any, t: { amount: any; }) => sum + t.amount, 0);
  }

  public Formpayload(formData:any,producerkey:any,status:any){
   const payload: any = {
          Bc_Quota_Credit_Type: formData.QuotaCreditType,
          Bc_Quantity_per_Week: formData.QuantityperWeek,
          Bc_Flock: formData.Flock,
          Bc_Application_Date: formData.ApplicationDate,
          Bc_Start_Date: formData.StartDate,
          Bc_End_Date: formData.EndDate,
          Bc_Description: formData.Description,
          Bc_producerIDId: Number(producerkey),
          Bc_applicationStatus: status.PendingApproval
        };

        return payload;
  }

  public  fetchInitialQuotaofProducer(producers:any, producerid:number): number {
    
const totalQuantityPerWeek = this._transactionHistory.reduce((sum: any, item: { bc_quantityPerWeek: any; }) => {
  return sum + (item.bc_quantityPerWeek || 0);
}, 0);

    return producers.filter((x:any) => {return x.Id == producerid})[0].IssuedQuota-totalQuantityPerWeek;
  }

  // oper table kle
  public async fetchCurrentTransactions(producerid:number):Promise<any>{
    const quotaCreditTransactions = 
    await this.api.filterListItems(listNames.FinalQuotaCreditUsageList,
        `Bc_applicationStatus eq 'Pending Approval' and Bc_producerIDId eq '${producerid}'`,"*")
    return quotaCreditTransactions;
  }

  // neecy table kle  // `ID eq 1`,"*")
  public async fetchHistoricalTransactions(producerid:number):Promise<any>{
    const quotaCreditTransactions = 
    await this.api.filterListItems(listNames.QuotaCreditTransactions,
         `Bc_Transaction_Type eq 'Usage' and bc_producerId eq '${producerid}'` ,"*");
         this._transactionHistory=quotaCreditTransactions;
    return quotaCreditTransactions;
  }
}
