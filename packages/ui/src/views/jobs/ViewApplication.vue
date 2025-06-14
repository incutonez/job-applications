<script setup lang="ts">
import { computed, reactive, ref, unref, watch } from "vue";
import { type CommentViewModel } from "@incutonez/life-stats-spec";
import BaseButton from "@/components/BaseButton.vue";
import BaseDialog from "@/components/BaseDialog.vue";
import BaseTabs, { type IBaseTabProps } from "@/components/BaseTabs.vue";
import FieldDate from "@/components/FieldDate.vue";
import FieldText from "@/components/FieldText.vue";
import { IconAdd, IconDelete, IconEdit, IconSave } from "@/components/Icons.ts";
import TableData from "@/components/TableData.vue";
import { useDateCreatedColumn, useDateUpdatedColumn, useTableActions, useTableData } from "@/composables/table.ts";
import { getUniqueId } from "@/utils/common.ts";
import ApplicationLinksTab from "@/views/jobs/applications/ApplicationLinksTab.vue";
import ViewCommentDialog from "@/views/jobs/applications/ViewCommentDialog.vue";
import { provideApplicationRecord, useDeleteApplication } from "@/views/jobs/composables/applications.ts";
import { useJobRoutes } from "@/views/jobs/composables/routes.ts";
import FieldApplicationStatus from "@/views/jobs/shared/FieldApplicationStatus.vue";
import FieldCompanies from "@/views/jobs/shared/FieldCompanies.vue";
import FieldLocationTypes from "@/views/jobs/shared/FieldLocationTypes.vue";
import ViewApplicationLinks from "@/views/jobs/ViewApplicationLinks.vue";
import DeleteDialog from "@/views/shared/DeleteDialog.vue";

export interface IViewApplicationProps {
	applicationId: string;
}

const props = defineProps<IViewApplicationProps>();
const open = ref(true);
const showCommentDialog = ref(false);
const showApplicationLinksDialog = ref(false);
const selectedComment = ref<CommentViewModel>();
const comment = computed(() => selectedComment.value?.comment ?? "");
const applicationId = computed(() => props.applicationId);
const { viewRecord, save, pastedRecord, isEdit, savingApplication } = provideApplicationRecord(applicationId);
const showDelete = ref(false);
const { deleteApplication, deletingApplication } = useDeleteApplication();
const commentData = ref<CommentViewModel[]>([]);
const title = computed(() => isEdit.value ? "Edit Application" : "Add Application");
const { viewApplicationParent } = useJobRoutes();
const tabs = reactive<IBaseTabProps[]>([{
	title: "Comments",
	contentClasses: "flex flex-col gap-2 pt-2",
}, {
	title: "Links",
	contentClasses: "flex flex-col gap-2 pt-2",
}]);
const commentsTable = useTableData<CommentViewModel>({
	data: commentData,
	columns: [useTableActions([{
		icon: IconEdit,
		handler(record) {
			selectedComment.value = record;
			showCommentDialog.value = true;
		},
	}, {
		icon: IconDelete,
		handler(record) {
			const { id } = record;
			const found = viewRecord.value!.comments.findIndex((item) => item.id === id);
			if (found >= 0) {
				viewRecord.value!.comments.splice(found, 1);
			}
		},
	}]), {
		accessorKey: "comment",
		header: "Name",
	}, useDateCreatedColumn(), useDateUpdatedColumn()],
});

function onCloseView() {
	pastedRecord.value = undefined;
	viewApplicationParent();
}

function onClickAddComment() {
	selectedComment.value = undefined;
	showCommentDialog.value = true;
}

function onClickUpdateComment(value: string) {
	const $viewRecord = unref(viewRecord);
	const $selectedComment = unref(selectedComment);
	if (!$viewRecord) {
		return;
	}
	if ($selectedComment) {
		const found = $viewRecord.comments.find(({ id }) => id === $selectedComment.id);
		if (found) {
			found.comment = value;
		}
	}
	else {
		$viewRecord.comments.push({
			comment: value,
			id: getUniqueId(),
			userId: "",
			applicationId: "",
		});
	}
	showCommentDialog.value = false;
}

async function onClickSave() {
	await save();
	open.value = false;
}

function onClickDeleteButton() {
	showDelete.value = true;
}

async function onClickDelete() {
	await deleteApplication(viewRecord.value);
	open.value = false;
}

/**
 * TanStack Table uses a shallow ref for the data, so we have to create a new reference in order for it to update
 * Source: https://tanstack.com/table/latest/docs/framework/vue/guide/table-state#using-reactive-data
 */
watch(() => viewRecord.value?.comments, ($comments = []) => {
	commentData.value = [...$comments];
}, {
	immediate: true,
	deep: true,
});
</script>

<template>
	<BaseDialog
		v-if="viewRecord"
		v-model="open"
		:title="title"
		class="size-9/10"
		body-class="flex space-x-4"
		@close="onCloseView"
	>
		<template #content>
			<section class="flex flex-col gap-form">
				<section class="flex gap-form">
					<FieldCompanies
						v-model="viewRecord.company"
						label-align="top"
						:custom-value="true"
						required
						class="flex-1"
					/>
					<FieldText
						v-model="viewRecord.positionTitle"
						label="Position"
						label-align="top"
						wrapper-cls="flex-1"
						required
					/>
				</section>
				<section class="flex gap-form">
					<FieldApplicationStatus
						v-model="viewRecord.status"
						class="flex-1"
						required
					/>
					<div class="flex flex-1">
						<FieldDate
							v-model="viewRecord.dateApplied"
							label="Applied On"
							label-align="top"
							required
						/>
					</div>
				</section>
				<section class="flex gap-form">
					<FieldText
						v-model="viewRecord.compensation"
						label="Compensation"
						label-align="top"
						wrapper-cls="flex-1"
					/>
					<FieldLocationTypes
						v-model="viewRecord.locationType"
						class="flex-1"
						required
					/>
				</section>
				<FieldText
					v-model="viewRecord.url"
					label="URL"
					wrapper-cls="flex-1"
					label-align="top"
					required
				/>
			</section>
			<section class="flex flex-col space-y-2 flex-1">
				<BaseTabs :tabs="tabs">
					<template #Comments>
						<BaseButton
							text="Comment"
							class="self-start ml-2"
							theme="info"
							:icon="IconAdd"
							@click="onClickAddComment"
						/>
						<TableData
							class="flex-1 border-0 border-t"
							:table="commentsTable.table"
						/>
					</template>
					<template #Links>
						<ApplicationLinksTab />
					</template>
				</BaseTabs>
			</section>
			<ViewCommentDialog
				v-model="showCommentDialog"
				:comment="comment"
				@click:update="onClickUpdateComment"
			/>
			<DeleteDialog
				v-model="showDelete"
				entity-name="this application"
				:loading="deletingApplication"
				@delete="onClickDelete"
			/>
			<ViewApplicationLinks
				v-model="showApplicationLinksDialog"
				:filter-id="viewRecord.id"
				:initial-ids="viewRecord.links?.map(({id}) => id)"
			/>
		</template>
		<template #footer>
			<BaseButton
				v-if="isEdit"
				text="Delete"
				:icon="IconDelete"
				theme="danger"
				:loading="deletingApplication"
				@click="onClickDeleteButton"
			/>
			<BaseButton
				text="Save"
				:icon="IconSave"
				theme="info"
				:loading="savingApplication"
				@click="onClickSave"
			/>
		</template>
	</BaseDialog>
</template>
