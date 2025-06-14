import type { Configuration } from '../configuration';
import type { AxiosPromise, AxiosInstance, AxiosRequestConfig } from 'axios';
import { RequestArgs, BaseAPI } from '../base';
import { ActivityCreateViewModel } from '../models';
import { ActivityListViewModel } from '../models';
import { ActivityTypeViewModel } from '../models';
import { ActivityViewModel } from '../models';
import { StravaTokenViewModel } from '../models';
export declare const ActivitiesApiAxiosParamCreator: (configuration?: Configuration) => {
    createActivity: (activityCreateViewModel: ActivityCreateViewModel, options?: AxiosRequestConfig) => Promise<RequestArgs>;
    deleteActivity: (activityId: string, options?: AxiosRequestConfig) => Promise<RequestArgs>;
    getActivity: (activityId: string, options?: AxiosRequestConfig) => Promise<RequestArgs>;
    getActivityTypes: (options?: AxiosRequestConfig) => Promise<RequestArgs>;
    importStravaActivities: (file: File, options?: AxiosRequestConfig) => Promise<RequestArgs>;
    listActivities: (options?: AxiosRequestConfig) => Promise<RequestArgs>;
    syncStravaActivities: (stravaTokenViewModel: StravaTokenViewModel, options?: AxiosRequestConfig) => Promise<RequestArgs>;
    updateActivity: (activityId: string, activityViewModel: ActivityViewModel, options?: AxiosRequestConfig) => Promise<RequestArgs>;
    uploadStravaActivities: (activityCreateViewModel: Array<ActivityCreateViewModel>, options?: AxiosRequestConfig) => Promise<RequestArgs>;
};
export declare const ActivitiesApiFp: (configuration?: Configuration) => {
    createActivity(activityCreateViewModel: ActivityCreateViewModel, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ActivityViewModel>>;
    deleteActivity(activityId: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>>;
    getActivity(activityId: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ActivityViewModel>>;
    getActivityTypes(options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Array<ActivityTypeViewModel>>>;
    importStravaActivities(file: File, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Array<ActivityCreateViewModel>>>;
    listActivities(options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ActivityListViewModel>>;
    syncStravaActivities(stravaTokenViewModel: StravaTokenViewModel, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<StravaTokenViewModel>>;
    updateActivity(activityId: string, activityViewModel: ActivityViewModel, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ActivityViewModel>>;
    uploadStravaActivities(activityCreateViewModel: Array<ActivityCreateViewModel>, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<object>>;
};
export declare const ActivitiesApiFactory: (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) => {
    createActivity(activityCreateViewModel: ActivityCreateViewModel, options?: any): AxiosPromise<ActivityViewModel>;
    deleteActivity(activityId: string, options?: any): AxiosPromise<void>;
    getActivity(activityId: string, options?: any): AxiosPromise<ActivityViewModel>;
    getActivityTypes(options?: any): AxiosPromise<Array<ActivityTypeViewModel>>;
    importStravaActivities(file: File, options?: any): AxiosPromise<Array<ActivityCreateViewModel>>;
    listActivities(options?: any): AxiosPromise<ActivityListViewModel>;
    syncStravaActivities(stravaTokenViewModel: StravaTokenViewModel, options?: any): AxiosPromise<StravaTokenViewModel>;
    updateActivity(activityId: string, activityViewModel: ActivityViewModel, options?: any): AxiosPromise<ActivityViewModel>;
    uploadStravaActivities(activityCreateViewModel: Array<ActivityCreateViewModel>, options?: any): AxiosPromise<object>;
};
export interface ActivitiesApiInterface {
    createActivity(activityCreateViewModel: ActivityCreateViewModel, options?: AxiosRequestConfig): AxiosPromise<ActivityViewModel>;
    deleteActivity(activityId: string, options?: AxiosRequestConfig): AxiosPromise<void>;
    getActivity(activityId: string, options?: AxiosRequestConfig): AxiosPromise<ActivityViewModel>;
    getActivityTypes(options?: AxiosRequestConfig): AxiosPromise<Array<ActivityTypeViewModel>>;
    importStravaActivities(file: File, options?: AxiosRequestConfig): AxiosPromise<Array<ActivityCreateViewModel>>;
    listActivities(options?: AxiosRequestConfig): AxiosPromise<ActivityListViewModel>;
    syncStravaActivities(stravaTokenViewModel: StravaTokenViewModel, options?: AxiosRequestConfig): AxiosPromise<StravaTokenViewModel>;
    updateActivity(activityId: string, activityViewModel: ActivityViewModel, options?: AxiosRequestConfig): AxiosPromise<ActivityViewModel>;
    uploadStravaActivities(activityCreateViewModel: Array<ActivityCreateViewModel>, options?: AxiosRequestConfig): AxiosPromise<object>;
}
export declare class ActivitiesApi extends BaseAPI implements ActivitiesApiInterface {
    createActivity(activityCreateViewModel: ActivityCreateViewModel, options?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<ActivityViewModel, any>>;
    deleteActivity(activityId: string, options?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<void, any>>;
    getActivity(activityId: string, options?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<ActivityViewModel, any>>;
    getActivityTypes(options?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<ActivityTypeViewModel[], any>>;
    importStravaActivities(file: File, options?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<ActivityCreateViewModel[], any>>;
    listActivities(options?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<ActivityListViewModel, any>>;
    syncStravaActivities(stravaTokenViewModel: StravaTokenViewModel, options?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<StravaTokenViewModel, any>>;
    updateActivity(activityId: string, activityViewModel: ActivityViewModel, options?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<ActivityViewModel, any>>;
    uploadStravaActivities(activityCreateViewModel: Array<ActivityCreateViewModel>, options?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<object, any>>;
}
