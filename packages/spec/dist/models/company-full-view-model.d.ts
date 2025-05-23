import { ApplicationNestedViewModel } from './application-nested-view-model';
export interface CompanyFullViewModel {
    'dateCreated'?: number;
    'dateUpdated'?: number;
    'id': string;
    'name': string;
    'applications': Array<ApplicationNestedViewModel>;
}
