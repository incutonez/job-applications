import { ActivityViewModel } from './activity-view-model';
import { AttributeTypeViewModel } from './attribute-type-view-model';
import { EnumUnitTypes } from './enum-unit-types';
export interface ActivityAttributeViewModel {
    'userId'?: string;
    'dateCreated'?: number;
    'dateUpdated'?: number;
    'unit'?: EnumUnitTypes;
    'unitDisplay'?: EnumUnitTypes;
    'id': string;
    'activity'?: ActivityViewModel;
    'attributeType': AttributeTypeViewModel;
    'value': string;
    'valueDisplay'?: string;
}
