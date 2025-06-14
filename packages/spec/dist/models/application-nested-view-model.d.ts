import { ApplicationLinkViewModel } from './application-link-view-model';
import { CommentViewModel } from './comment-view-model';
import { EnumApplicationStatus } from './enum-application-status';
import { EnumLocationTypes } from './enum-location-types';
export interface ApplicationNestedViewModel {
    'userId'?: string;
    'dateCreated'?: number;
    'dateUpdated'?: number;
    'status': EnumApplicationStatus;
    'locationType': EnumLocationTypes;
    'positionTitle': string;
    'dateApplied': number;
    'url': string;
    'compensation': string;
    'comments': Array<CommentViewModel>;
    'links'?: Array<ApplicationLinkViewModel>;
    'id': string;
    'site': string;
}
