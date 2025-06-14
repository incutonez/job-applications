<script setup lang="ts">
import { ref } from "vue";
import { type ActivityCreateViewModel } from "@incutonez/life-stats-spec";
import MimeTypes from "mime-types";
import BaseButton from "@/components/BaseButton.vue";
import BaseDialog from "@/components/BaseDialog.vue";
import { IconDelete, IconSave } from "@/components/Icons.ts";
import TableData from "@/components/TableData.vue";
import TablePagination from "@/components/TablePagination.vue";
import { useTableActions, useTableData } from "@/composables/table.ts";
import { downloadFile, makeCSV } from "@/utils/common.ts";
import { useImportActivities, useUploadActivities } from "@/views/exercises/composables/activities.ts";
import { useActivitiesColumns } from "@/views/exercises/composables/table.ts";
import DialogEntityImport from "@/views/shared/DialogEntityImport.vue";

const addHeaders = ref(true);
const showingImport = ref(true);
const dialogCmp = ref<InstanceType<typeof BaseDialog>>();
const { importFile, uploadFile, uploadingFile } = useImportActivities();
const { addedRecords, addingRecords, createApplications } = useUploadActivities();
const { table, search } = useTableData<ActivityCreateViewModel>({
	data: addedRecords,
	paginated: true,
	columns: [useTableActions([{
		icon: IconDelete,
		handler(record) {
			addedRecords.value = addedRecords.value.filter((item) => item !== record);
		},
	}]), ...useActivitiesColumns()],
	sortInitial: [{
		desc: true,
		id: "dateOccurred",
	}],
});

async function onClickImportButton() {
	addedRecords.value = await uploadFile();
	showingImport.value = false;
}

async function onClickSaveButton() {
	await createApplications();
	dialogCmp.value?.toggle(false);
}

function onChangeFile(importedFiles?: FileList) {
	importFile.value = importedFiles?.[0];
}

function onClickDownloadTemplate() {
	const csv = makeCSV();
	downloadFile(new Blob([csv], {
		type: MimeTypes.contentType("csv") || "text/csv",
	}), "template");
}

function onCloseDialog() {
	importFile.value = undefined;
	addedRecords.value = [];
	showingImport.value = true;
}
</script>

<template>
	<BaseDialog
		ref="dialogCmp"
		title="Import Activities"
		@close="onCloseDialog"
	>
		<template #content>
			<DialogEntityImport
				v-if="showingImport"
				v-model:add-headers="addHeaders"
				@changed-files="onChangeFile"
				@click-template="onClickDownloadTemplate"
			/>
			<section v-else>
				<TablePagination
					v-model:search="search"
					class="border-t"
					:table="table"
				/>
				<TableData
					class="max-h-[70vh] max-w-[90vw]"
					:table="table"
					table-layout="table-auto"
				/>
			</section>
		</template>
		<template #footer>
			<BaseButton
				v-if="showingImport"
				text="Import"
				theme="info"
				:icon="IconSave"
				:loading="uploadingFile"
				:disabled="!importFile"
				@click="onClickImportButton"
			/>
			<BaseButton
				v-else
				text="Save"
				theme="info"
				:loading="addingRecords"
				:icon="IconSave"
				@click="onClickSaveButton"
			/>
		</template>
	</BaseDialog>
</template>
