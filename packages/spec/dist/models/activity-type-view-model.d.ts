import { ActivityViewModel } from './activity-view-model';
export interface ActivityTypeViewModel {
    'userId'?: string;
    'dateCreated'?: number;
    'dateUpdated'?: number;
    'id': string;
    'activities'?: Array<ActivityViewModel>;
    'name': string;
}
