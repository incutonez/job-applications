import { ApplicationLinkViewModel } from './application-link-view-model';
import { CommentViewModel } from './comment-view-model';
import { CompanyViewModel } from './company-view-model';
import { EnumApplicationStatus } from './enum-application-status';
import { EnumLocationTypes } from './enum-location-types';
export interface ApplicationViewModel {
    'userId'?: string;
    'dateCreated'?: number;
    'dateUpdated'?: number;
    'status': EnumApplicationStatus;
    'locationType': EnumLocationTypes;
    'id': string;
    'site': string;
    'positionTitle': string;
    'dateApplied': number;
    'url': string;
    'compensation': string;
    'company': CompanyViewModel;
    'comments': Array<CommentViewModel>;
    'links'?: Array<ApplicationLinkViewModel>;
}
