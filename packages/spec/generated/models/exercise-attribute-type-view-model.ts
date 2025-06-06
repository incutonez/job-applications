/* tslint:disable */
/* eslint-disable */
/**
 * API
 * The main API for the UI
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


// May contain unused imports in some cases
// @ts-ignore
import { EnumAttributeType } from './enum-attribute-type';
// May contain unused imports in some cases
// @ts-ignore
import { ExerciseActivityAttributeViewModel } from './exercise-activity-attribute-view-model';

/**
 * 
 * @export
 * @interface ExerciseAttributeTypeViewModel
 */
export interface ExerciseAttributeTypeViewModel {
    /**
     * 
     * @type {string}
     * @memberof ExerciseAttributeTypeViewModel
     */
    'userId'?: string;
    /**
     * 
     * @type {number}
     * @memberof ExerciseAttributeTypeViewModel
     */
    'dateCreated'?: number;
    /**
     * 
     * @type {number}
     * @memberof ExerciseAttributeTypeViewModel
     */
    'dateUpdated'?: number;
    /**
     * 
     * @type {EnumAttributeType}
     * @memberof ExerciseAttributeTypeViewModel
     */
    'type': EnumAttributeType;
    /**
     * 
     * @type {string}
     * @memberof ExerciseAttributeTypeViewModel
     */
    'id': string;
    /**
     * 
     * @type {Array<ExerciseActivityAttributeViewModel>}
     * @memberof ExerciseAttributeTypeViewModel
     */
    'attributes'?: Array<ExerciseActivityAttributeViewModel>;
    /**
     * 
     * @type {string}
     * @memberof ExerciseAttributeTypeViewModel
     */
    'name': string;
}



