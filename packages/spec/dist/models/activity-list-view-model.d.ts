import { ActivityViewModel } from './activity-view-model';
export interface ActivityListViewModel {
    'data': Array<ActivityViewModel>;
    'total'?: number;
}
