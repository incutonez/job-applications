import { Transform } from "class-transformer";
import { IsInt, IsOptional, IsString } from "class-validator";

export class StravaTokenViewModel {
	@IsString()
	declare accessToken: string;

	@Transform(({ value = "" }) => value)
	@IsString()
	@IsOptional()
	refreshToken?: string;

	@Transform(({ value = 0 }) => value)
	@IsInt()
	@IsOptional()
	expirationDate?: number;
}
