import { formatDate, formatDateFromString } from "../common/utils/helperfunctions";
import { ApiService } from "../services/apiservices";
import { listNames, status } from '../common/constants/ListNames';

export class CPPService {
    api: any;
    constructor(context: any) {
        // Initialize PnPjs with the context 
        this.api = new ApiService(context)
    }

    static validateBarn(barnsTotal: any[], BarnTable: { Bc_Barn: any,ID:any }): boolean {
        return barnsTotal.some((barn: { Bc_Barn: any,ID:any,id:any }) =>
            (Number(barn.Bc_Barn) === Number(BarnTable.Bc_Barn)) && (barn.ID ===0? (barn.id !== BarnTable.ID):(barn.ID !== BarnTable.ID))
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

    static ProducerBarnFormpayload(barnTable: any, recordId: any) {
        let payload = {
            bcegg_CppRequestIdId: recordId,
            Bc_Barn: barnTable.Bc_Barn,
            Bc_RequestedHatchDate: barnTable.Bc_RequestedHatchDate,
            Bc_OfChicksOrdered: barnTable.Bc_OfChicksOrdered,
            Bc_checkbox: barnTable.Bc_checkbox,
            Bc_ProductionType: barnTable.Bc_ProductionType,
            Bc_HousingSystem: barnTable.Bc_HousingSystem,
            Bc_EstimateRemovalDate: formatDate(CPPService.calculateWeekSevenTwoDate(barnTable.Bc_RequestedHatchDate)),
            Bc_RequestedRemovalDate: barnTable.Bc_RequestedRemovalDate,
            bcegg_19WeekDate: formatDate(CPPService.calculateWeekOneNineDate(barnTable.Bc_RequestedHatchDate))
        }
        return payload
    }

    static CPPRequestsFormpayload(status: any, data: any) {
        let payload = {
            bcegg_producerIdId: data.producerkey,
            bcegg_hatchery: data.hatcherySelected,
            bcegg_pulletGrower: data.pulletGrowerSelected,
            bcegg_status: status,
            bcegg_premiseId: data.premiseIdSelected,
            bcegg_epuAddress: data.epuAddressSelected,
            bcegg_CPPNumber: ""
        }
        return payload
    }


    static barnProductionMap(barnproductionmapping: any) {
        const seen = new Set<string>();

        return barnproductionmapping.filter((item: any) => {
            const key = `${item.field_3}|${item.field_4}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        }).map((item: any) => ({
            barn: item.field_3,
            productionType: item.field_4
        }));
    }


    public async fetchPendingRequests(producerId: number): Promise<any> {
        let cppFilter = `bcegg_status eq '${status.PendingApproval}'`;
        cppFilter += ` and bcegg_producerId/Id eq ${producerId}`;

        const cppItems: any = await this.api.filterListItemsWithExpand(
            listNames.CPPRequests,
            cppFilter,
            'ID,bcegg_producerId/Id',
            'bcegg_producerId'
        );
        return cppItems;
    }


    static generateCppNumber(requestedHatchDate: any, producerNumber: string | number): string {
        let formatedDate = formatDateFromString(requestedHatchDate);
        return `BC-${formatedDate}-${producerNumber}`;
    }


    public async fetchPendingApprovalBarns(cppIds: any): Promise<any> {
        const barnFilter = cppIds
            .map((id: number) => `bcegg_CppRequestId/Id eq ${id}`)
            .join(" or ");

        let result = await this.api.filterListItemsWithExpand(
            listNames.ProducerBarn,
            barnFilter,
            '*,bcegg_CppRequestId/Id,bcegg_CppRequestId/bcegg_premiseId',
            'bcegg_CppRequestId'
        );
        return result;
    }

}