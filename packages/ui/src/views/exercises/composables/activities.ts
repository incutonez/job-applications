import { computed, inject, type InjectionKey, provide, type Ref, ref, toRaw, unref, watch } from "vue";
import {
	type ActivityAttributeViewModel,
	type ActivityCreateViewModel,
	type ActivityViewModel,
	EnumActivitySource, type StravaTokenViewModel,
} from "@incutonez/life-stats-spec";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import clone from "just-clone";
import { ExercisesAPI } from "@/api.ts";
import {
	getInvalidateQueryPredicate,
	useInvalidateQueries,
} from "@/composables/app.ts";
import { RouteCreate } from "@/constants.ts";
import {
	ActivitiesAPI, QueryGetActivityTypes,
	QueryKeyActivities, QueryKeyActivity,
	QueryKeyExercises,
	QueryListExercisesAudits,
} from "@/views/exercises/constants.ts";

interface IImportMutation {
	file: File;
	source: EnumActivitySource;
}

type TActivityViewRecord = ReturnType<typeof provideActivityRecord>;
const ActivityViewRecordKey: InjectionKey<TActivityViewRecord> = Symbol("activityViewRecordKey");

const urlParams = new URLSearchParams(location.hash);

export const stravaToken = ref<StravaTokenViewModel>();

export function initStravaToken() {
	try {
		stravaToken.value = JSON.parse(localStorage.getItem("stravaToken") ?? "");
	}
	catch (_ex) {
		/**
		 * No token has been set yet, so let's try to use the code if it's in the URL.  The code is a short-lived auth code,
		 * so we don't want to store it in localStorage due to this short-lived nature.
		 */
		const code = urlParams.get("code") ?? "";
		if (code) {
			stravaToken.value = {
				accessToken: code,
			};
		}
	}
}

/**
 * If token is a string, then it's the auth code that we received, and we'll turn it into a proper accessToken when the
 * sync call returns
 */
export function setStravaToken(token: StravaTokenViewModel | string) {
	if (typeof token === "string") {
		token = {
			accessToken: token,
		};
	}
	localStorage.setItem("stravaToken", JSON.stringify(token));
	stravaToken.value = token;
}

export function useListActivities() {
	return useQuery({
		queryKey: [QueryKeyActivities],
		async queryFn() {
			const { data } = await ActivitiesAPI.listActivities();
			return data.data;
		},
	});
}

export function useDeleteActivity() {
	const deletingRecord = ref(false);
	const queryClient = useQueryClient();
	const deleteMutation = useMutation({
		async mutationFn(record: ActivityViewModel) {
			return ActivitiesAPI.deleteActivity(record.id);
		},
		async onSuccess() {
			await queryClient.invalidateQueries(getInvalidateQueryPredicate(QueryKeyExercises));
		},
	});

	async function deleteRecord(record?: ActivityViewModel) {
		if (record) {
			deletingRecord.value = true;
			await deleteMutation.mutateAsync(record);
			deletingRecord.value = false;
		}
	}

	return {
		deletingRecord,
		deleteRecord,
	};
}

export function useImportActivities() {
	const importFile = ref<File>();
	const uploadingFile = ref(false);
	const importMutations = useMutation({
		async mutationFn({ file }: IImportMutation) {
			return ActivitiesAPI.importStravaActivities(file);
		},
	});

	async function uploadFile(source = EnumActivitySource.Strava) {
		const $importFile = unref(importFile);
		if ($importFile) {
			uploadingFile.value = true;
			const { data } = await importMutations.mutateAsync({
				source,
				file: $importFile,
			});
			uploadingFile.value = false;
			return data;
		}
		return [];
	}

	return {
		uploadingFile,
		uploadFile,
		importFile,
	};
}

export function useUploadActivities() {
	const addedRecords = ref<ActivityCreateViewModel[]>([]);
	const addingRecords = ref(false);
	const added = ref(false);
	const updateMutation = useMutation({
		async mutationFn(records: ActivityCreateViewModel[]) {
			addingRecords.value = true;
			await ActivitiesAPI.uploadStravaActivities(records, {
				// Set a 2 minute timeout, just in case it's a very large upload
				timeout: 120000,
			});
			addingRecords.value = false;
		},
	});

	async function createApplications() {
		const records = unref(addedRecords);
		if (records) {
			await updateMutation.mutateAsync(records);
			added.value = true;
		}
	}

	useInvalidateQueries(added, QueryKeyExercises);

	return {
		addedRecords,
		addingRecords,
		createApplications,
	};
}

export function useStravaSync() {
	const added = ref(false);
	const syncingRecords = ref(false);
	const syncMutation = useMutation({
		async mutationFn(token: StravaTokenViewModel) {
			syncingRecords.value = true;
			const { data } = await ActivitiesAPI.syncStravaActivities(token, {
				// Set a 2 minute timeout, just in case it's a very large upload
				timeout: 120000,
			});
			setStravaToken(data);
			added.value = true;
			syncingRecords.value = false;
		},
	});

	async function syncStravaActivities() {
		const $stravaToken = unref(stravaToken);
		if ($stravaToken) {
			return syncMutation.mutateAsync($stravaToken);
		}
	}

	useInvalidateQueries(added, QueryKeyExercises);

	return {
		syncingRecords,
		syncStravaActivities,
	};
}

export function useListExercisesHistory() {
	return useQuery({
		queryKey: [QueryListExercisesAudits],
		async queryFn() {
			const { data } = await ExercisesAPI.getExercisesHistory();
			return data.data;
		},
	});
}

export function provideActivityRecord(recordId: Ref<string>) {
	const updated = ref(false);
	const savingRecord = ref(false);
	const viewRecord = ref<ActivityViewModel>();
	const selectedAttributeRecord = ref<ActivityAttributeViewModel>();
	const attributeRecords = computed(() => viewRecord.value?.attributes ?? []);
	const isEdit = computed(() => !!viewRecord.value?.id);
	const query = useQuery({
		queryKey: [QueryKeyActivity, recordId],
		async queryFn(): Promise<ActivityViewModel> {
			const $recordId = unref(recordId);
			if ($recordId === RouteCreate) {
				// Default model
				return {
					id: "",
					title: "",
					dateOccurred: Date.now(),
					attributes: [],
					activityType: {
						id: "",
						name: "",
					},
				};
			}
			const { data } = await ActivitiesAPI.getActivity(recordId.value);
			return data;
		},
	});
	const mutation = useMutation({
		async mutationFn() {
			const $viewRecord = unref(viewRecord);
			if ($viewRecord?.id) {
				return ActivitiesAPI.updateActivity($viewRecord.id, $viewRecord);
			}
			else if ($viewRecord) {
				return ActivitiesAPI.createActivity($viewRecord);
			}
		},
	});

	async function save() {
		savingRecord.value = true;
		await mutation.mutateAsync();
		updated.value = true;
		savingRecord.value = false;
	}

	function saveSelectedAttribute(attributeRecord = selectedAttributeRecord.value) {
		const $attributeRecords = viewRecord.value?.attributes;
		if (!$attributeRecords || !attributeRecord) {
			return;
		}
		const id = attributeRecord.id;
		const foundIndex = $attributeRecords.findIndex((attribute) => attribute.id === id) ?? -1;
		if (foundIndex >= 0) {
			$attributeRecords[foundIndex] = attributeRecord;
		}
		else {
			$attributeRecords.push(attributeRecord);
		}
		// Must change the reference, so the grid updates
		viewRecord.value!.attributes = [...$attributeRecords];
	}

	const provider = {
		save,
		query,
		isEdit,
		viewRecord,
		attributeRecords,
		savingRecord,
		selectedAttributeRecord,
		saveSelectedAttribute,
	};

	watch(query.data, ($data) => {
		if ($data) {
			viewRecord.value = clone(toRaw($data));
		}
	}, {
		immediate: true,
	});

	useInvalidateQueries(updated, QueryKeyExercises);

	provide(ActivityViewRecordKey, provider);

	return provider;
}

export function injectActivityRecord() {
	return inject(ActivityViewRecordKey) as TActivityViewRecord;
}

export function useGetActivityTypes() {
	return useQuery({
		queryKey: [QueryGetActivityTypes],
		async queryFn() {
			const { data } = await ActivitiesAPI.getActivityTypes();
			return data;
		},
	});
}
