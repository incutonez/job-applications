<script setup lang="ts">
import { computed, ref, unref, watch } from "vue";
import { type ActivityAttributeViewModel } from "@incutonez/life-stats-spec";
import clone from "just-clone";
import BaseButton from "@/components/BaseButton.vue";
import BaseDialog from "@/components/BaseDialog.vue";
import FieldComboBox from "@/components/FieldComboBox.vue";
import FieldDate from "@/components/FieldDate.vue";
import FieldDisplay from "@/components/FieldDisplay.vue";
import FieldNumber from "@/components/FieldNumber.vue";
import FieldText from "@/components/FieldText.vue";
import { IconAdd, IconDelete, IconEdit, IconSave } from "@/components/Icons.ts";
import TableData from "@/components/TableData.vue";
import { injectUserProfile } from "@/composables/app.ts";
import { useTableActions, useTableData } from "@/composables/table.ts";
import { getUniqueId } from "@/utils/common.ts";
import { numberToDisplay } from "@/utils/formatters.ts";
import { provideActivityRecord, useDeleteActivity } from "@/views/exercises/composables/activities.ts";
import { useExerciseRoutes } from "@/views/exercises/composables/routes.ts";
import { useAttributesColumns } from "@/views/exercises/composables/table.ts";
import { ActivitySourceOptions } from "@/views/exercises/constants.ts";
import FieldActivityTypes from "@/views/exercises/shared/FieldActivityTypes.vue";
import ViewAttribute from "@/views/exercises/ViewAttribute.vue";
import DeleteDialog from "@/views/shared/DeleteDialog.vue";

interface IViewActivityProps {
	activityId: string;
}

const props = defineProps<IViewActivityProps>();
const show = ref(true);
const showDeleteDialog = ref(false);
const showAttributeDialog = ref(false);
const recordId = computed(() => props.activityId);
const { deletingRecord, deleteRecord } = useDeleteActivity();
const { save, savingRecord, viewRecord, isEdit, selectedAttributeRecord, attributeRecords } = provideActivityRecord(recordId);
const { viewActivities } = useExerciseRoutes();
const { userProfile } = injectUserProfile();
const dialogTitle = computed(() => isEdit.value ? "Edit Activity" : "Create Activity");
const attributesTable = useTableData<ActivityAttributeViewModel>({
	data: attributeRecords,
	sortInitial: [{
		desc: false,
		id: "attributeTypeName",
	}],
	columns: [useTableActions([{
		icon: IconEdit,
		handler(record) {
			selectedAttributeRecord.value = clone(record);
			showAttributeDialog.value = true;
		},
	}, {
		icon: IconDelete,
		handler({ id }) {
			viewRecord.value!.attributes = attributeRecords.value.filter((item) => item.id !== id);
		},
	}]), ...useAttributesColumns()],
});

async function onClickSave() {
	await save();
	show.value = false;
}

function onClickDeleteButton() {
	showDeleteDialog.value = true;
}

async function onClickDelete() {
	await deleteRecord(viewRecord.value);
	show.value = false;
}

function onClose() {
	viewActivities();
}

function onClickAddAttribute() {
	selectedAttributeRecord.value = {
		id: getUniqueId(),
		value: "",
		attributeType: {
			id: "",
			name: "",
		},
	};
	showAttributeDialog.value = true;
}

watch(userProfile, ($userProfile) => {
	const $viewRecord = unref(viewRecord);
	if (!isEdit.value && $viewRecord && !$viewRecord.weight) {
		$viewRecord.weight = $userProfile?.settings.exercises.weight;
	}
});
</script>

<template>
	<BaseDialog
		v-if="!!viewRecord"
		v-model="show"
		:title="dialogTitle"
		body-class="flex space-x-form"
		class="size-4/5"
		@close="onClose"
	>
		<template #content>
			<section class="flex flex-col space-y-form">
				<FieldText
					v-model="viewRecord.title"
					label="Title"
					label-align="top"
					autofocus
					required
				/>
				<FieldActivityTypes
					v-model="viewRecord.activityType"
					label="Type"
					label-align="top"
					required
				/>
				<FieldNumber
					v-model="viewRecord.weight"
					label="Weight (lbs)"
					label-align="top"
				/>
				<FieldText
					v-model="viewRecord.description"
					label="Description"
					label-align="top"
				/>
				<FieldDisplay
					v-if="viewRecord.calories"
					:value="numberToDisplay(viewRecord.calories)"
					label="Calories Burned"
					label-align="top"
				/>
			</section>
			<section class="flex flex-col space-y-form">
				<FieldDate
					v-model="viewRecord.dateOccurred"
					label="Date"
					label-align="top"
					class="self-start"
					required
				/>
				<FieldNumber
					v-model="viewRecord.duration"
					label="Duration (hours)"
					label-align="top"
				/>
				<FieldComboBox
					v-model="viewRecord.source"
					value-field="id"
					display-field="display"
					label="Source"
					label-align="top"
					value-only
					:options="ActivitySourceOptions"
				/>
				<FieldText
					v-if="!!viewRecord.source"
					v-model="viewRecord.sourceId"
					label="Source ID"
					label-align="top"
				/>
				<FieldDisplay
					v-if="viewRecord.weightLost"
					:value="numberToDisplay(viewRecord.weightLost, 2, 'lbs')"
					label="Weight Lost"
					label-align="top"
				/>
			</section>
			<section class="flex-1 flex flex-col space-y-2">
				<section class="ml-auto">
					<BaseButton
						:icon="IconAdd"
						text="Attribute"
						theme="info"
						@click="onClickAddAttribute"
					/>
				</section>
				<TableData :table="attributesTable.table" />
			</section>
		</template>
		<template #footer>
			<BaseButton
				v-if="isEdit"
				text="Delete"
				theme="danger"
				:loading="deletingRecord"
				:icon="IconDelete"
				@click="onClickDeleteButton"
			/>
			<BaseButton
				text="Save"
				theme="info"
				:loading="savingRecord"
				:icon="IconSave"
				@click="onClickSave"
			/>
			<DeleteDialog
				v-model="showDeleteDialog"
				entity-name="this activity"
				:loading="deletingRecord"
				@delete="onClickDelete"
			/>
			<ViewAttribute
				v-if="showAttributeDialog"
				v-model="showAttributeDialog"
			/>
		</template>
	</BaseDialog>
</template>
