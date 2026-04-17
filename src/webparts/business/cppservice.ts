import { ApiService } from "../services/apiservices";

export class CPPService {
    api: any;
    constructor(context: any) {
        // Initialize PnPjs with the context 
        this.api = new ApiService(context)
    }

    static validateBarn(premiseID:string): boolean {
        return true;
    }

    static validateBarnCapacity(premiseID:string): boolean {
        return true;
    }

 static calculateWeekOneNineDate = (date: string):Date => {
    if (!date) return new Date();
    const _date = new Date(date);
    _date.setDate(_date.getDate() + (19*7));
    return _date;
  };

  static calculateWeekSevenTwoDate = (date: string):Date => {
    if (!date) return new Date();
    const _date = new Date(date);
    _date.setDate(_date.getDate() + (72*7));
    return _date;
  };

}