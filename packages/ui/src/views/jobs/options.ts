import { EnumApplicationStatus, EnumLocationTypes } from "@incutonez/life-stats-spec";
import { enumToOptions } from "@/utils/common.ts";

export const ApplicationStatusOptions = enumToOptions(EnumApplicationStatus);

export const LocationTypeOptions = enumToOptions(EnumLocationTypes);
