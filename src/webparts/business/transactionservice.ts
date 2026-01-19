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

  static fetchInitialQuotaofProducer(producers:any, producerid:number): number {
    return producers.filter((x:any) => {return x.Id == producerid})[0].IssuedQuota;
  }

  // oper table kle
  public async fetchCurrentTransactions(producerid:string):Promise<any>{
    const quotaCreditTransactions = 
    await this.api.filterListItems(listNames.FinalQuotaCreditUsageList,
        `Bc_applicationStatus eq 'Pending Approval' and Bc_producerIDId eq '${producerid}'`,"*")
        console.log(quotaCreditTransactions,'quo')
    return quotaCreditTransactions;
  }

  // neecy table kle  // `ID eq 1`,"*")
  public async fetchHistoricalTransactions(transactiontype:string,title:string):Promise<any>{
    const quotaCreditTransactions = 
    await this.api.filterListItemsAsStream(listNames.QuotaCreditTransactions,
         `Modified gt datetime'2024-01-01T00:00:00Z' and field_2 eq '${transactiontype}' and LinkTitle eq '${title}'` ,"*")
    return quotaCreditTransactions;
  }
}
