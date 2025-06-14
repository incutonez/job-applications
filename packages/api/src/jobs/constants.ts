export const EnumLocationTypes = {
	Remote: 1,
	Hybrid: 2,
	OnSite: 3,
} as const;
export type EnumLocationTypes = typeof EnumLocationTypes[keyof typeof EnumLocationTypes];

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
export type EnumApplicationStatus = typeof EnumApplicationStatus[keyof typeof EnumApplicationStatus];

export const EnumLinkType = {
	To: 1,
	From: 2,
} as const;
export type EnumLinkType = typeof EnumLinkType[keyof typeof EnumLinkType];
