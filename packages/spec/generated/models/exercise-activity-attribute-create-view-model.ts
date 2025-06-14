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
import { AttributeTypeCreateViewModel } from './attribute-type-create-view-model';
// May contain unused imports in some cases
// @ts-ignore
import { EnumUnitTypes } from './enum-unit-types';
// May contain unused imports in some cases
// @ts-ignore
import { ExerciseActivityCreateViewModel } from './exercise-activity-create-view-model';

/**
 * 
 * @export
 * @interface ExerciseActivityAttributeCreateViewModel
 */
export interface ExerciseActivityAttributeCreateViewModel {
    /**
     * 
     * @type {string}
     * @memberof ExerciseActivityAttributeCreateViewModel
     */
    'userId'?: string;
    /**
     * 
     * @type {number}
     * @memberof ExerciseActivityAttributeCreateViewModel
     */
    'dateCreated'?: number;
    /**
     * 
     * @type {number}
     * @memberof ExerciseActivityAttributeCreateViewModel
     */
    'dateUpdated'?: number;
    /**
     * 
     * @type {EnumUnitTypes}
     * @memberof ExerciseActivityAttributeCreateViewModel
     */
    'unit'?: EnumUnitTypes;
    /**
     * 
     * @type {EnumUnitTypes}
     * @memberof ExerciseActivityAttributeCreateViewModel
     */
    'unitDisplay'?: EnumUnitTypes;
    /**
     * 
     * @type {string}
     * @memberof ExerciseActivityAttributeCreateViewModel
     */
    'value': string;
    /**
     * 
     * @type {string}
     * @memberof ExerciseActivityAttributeCreateViewModel
     */
    'valueDisplay'?: string;
    /**
     * 
     * @type {ExerciseActivityCreateViewModel}
     * @memberof ExerciseActivityAttributeCreateViewModel
     */
    'activity'?: ExerciseActivityCreateViewModel;
    /**
     * 
     * @type {AttributeTypeCreateViewModel}
     * @memberof ExerciseActivityAttributeCreateViewModel
     */
    'attributeType': AttributeTypeCreateViewModel;
}



