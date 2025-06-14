import { Model } from "@sequelize/core";
import { AuthResult, JWTPayload } from "express-oauth2-jwt-bearer";
import { ClsStore } from "nestjs-cls";
import { BaseModel } from "@/db/models/BaseModel";
import { UserSettingsViewModel } from "@/viewModels/user.viewmodel";

// Have to make sure we add the auth property to our Request
declare module "@nestjs/common" {
	interface Request {
		auth: AuthResult;
	}
}

export interface IAuthUser extends JWTPayload {
	first_name: string;
	last_name?: string;
	email: string;
	nickname: string;
}

export interface ISessionStorage extends ClsStore {
	user: IAuthUser;
	userSettings: UserSettingsViewModel;
	measurementSystem: "imperial" | "metric";
}

export type ModelInterface<T> = {
	// We need to map over the keys directly to preserve optionality. We filter with "as"
	// Exclude undefined from the check to properly handle optional properties
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	[K in keyof T as T[K] extends Function ? never : K extends keyof Omit<Model, "id"> ? never : K]: Exclude<T[K], undefined> extends Array<infer E> ? Array<ModelInterface<E>> : Exclude<T[K], undefined> extends BaseModel ? ModelInterface<T[K]> : Exclude<T[K], undefined> extends Record<string, never> ? ModelInterface<T[K]> : T[K];
};

export type ClassInterface<T> = {
	// We need to map over the keys directly to preserve optionality. We filter with "as"
	// Exclude undefined from the check to properly handle optional properties
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	[K in keyof T as T[K] extends Function ? never : K extends symbol ? never : K]: Exclude<T[K], undefined> extends Array<infer E> ? Array<ModelInterface<E>> : Exclude<T[K], undefined> extends Record<string, never> ? ModelInterface<T[K]> : T[K];
};

export const EnumApplicationStatus = {
	Applied: -1,
	CurrentWeek: 0,
	Initial: 1,
	Interviewing: 2,
	InterviewedAndRejected: 3,
	Rejected: 4,
	Declined: 5,
	Accepted: 6,
	Ghosted: 7,
} as const;

export type EnumApplicationStatusKeys = keyof typeof EnumApplicationStatus;
export type EnumApplicationStatus = typeof EnumApplicationStatus[EnumApplicationStatusKeys];

export type IUploadViewModelsResponse = ModelInterface<UploadViewModelsResponse>;
export class UploadViewModelsResponse {
	declare successful: number;

	declare errors: string[];
}
