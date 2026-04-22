import { ApiService } from "../services/apiservices";

export class CPPService {
    api: any;
    constructor(context: any) {
        // Initialize PnPjs with the context 
        this.api = new ApiService(context)
    }

    static validateBarn(barnsTotal: any, BarnTable: any): boolean {
        const barnTableSet = new Set(
            BarnTable.map((b: { Bc_barn: any; }) => String(b.Bc_barn))
        );

        return barnsTotal.every((barn: { BarnNumber: any; }) =>
            barnTableSet.has(String(barn.BarnNumber))
        );
    }

    static validateBarnCapacity(premiseID: string): boolean {
        return true;
    }

    static calculateWeekOneNineDate = (date: string): Date => {
        if (!date) return new Date();
        const _date = new Date(date);
        _date.setDate(_date.getDate() + (19 * 7));
        return _date;
    };

    static calculateWeekSevenTwoDate = (date: string): Date => {
        if (!date) return new Date();
        const _date = new Date(date);
        _date.setDate(_date.getDate() + (72 * 7));
        return _date;
    };

}