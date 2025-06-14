import { ActivityAttributeCreateViewModel } from './activity-attribute-create-view-model';
import { ActivityTypeCreateViewModel } from './activity-type-create-view-model';
import { EnumActivitySource } from './enum-activity-source';
export interface ActivityCreateViewModel {
    'userId'?: string;
    'dateCreated'?: number;
    'dateUpdated'?: number;
    'source'?: EnumActivitySource;
    'title': string;
    'weight'?: number;
    'duration'?: number;
    'description'?: string;
    'sourceId'?: string;
    'dateOccurred': number;
    'activityType': ActivityTypeCreateViewModel;
    'attributes': Array<ActivityAttributeCreateViewModel>;
    'calories'?: number;
    'weightLost'?: number;
}
