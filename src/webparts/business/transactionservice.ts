import { listNames } from "../common/constants/ListNames";
import { ApiService } from "../services/apiservices";

// Business Layer
export class TransactionService {
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

  public async fetchCurrentTransactions(producerid:number):Promise<any>{
    const quotaCreditTransactions = 
    await this.api.filterListItems(listNames.FinalQuotaCreditUsageList,
        `ApplicationStatus eq 'Pending Approval' and LinkTitle eq '${producerid}'`,"*")
    return quotaCreditTransactions;
  }

  public async fetchHistoricalTransactions(producerid:number,transactiontype:string):Promise<any>{
    const quotaCreditTransactions = 
    await this.api.filterListItems(listNames.QuotaCreditTransactions,
        `field_2 eq '${transactiontype}' and LinkTitle eq '${producerid}'`,"*")
    return quotaCreditTransactions;
  }
}
