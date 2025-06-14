<script setup lang="ts">
import { computed, ref } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import BaseDialog, { type IBaseDialogProps } from "@/components/BaseDialog.vue";
import FieldTextArea from "@/components/FieldTextArea.vue";
import { IconSave } from "@/components/Icons.ts";

interface IViewCommentDialogProps extends IBaseDialogProps {
	comment: string;
}

const props = defineProps<IViewCommentDialogProps>();
const emit = defineEmits(["click:update"]);
const model = ref(props.comment);
const isEdit = computed(() => !!props.comment);
const title = computed(() => isEdit.value ? "Update" : "Add");

function onClickUpdate() {
	emit("click:update", model.value);
}

function onOpenDialog() {
	model.value = props.comment;
}
</script>

<template>
	<BaseDialog
		closable
		:title="`${title} Comment`"
		class="size-3/4"
		@open="onOpenDialog"
	>
		<template #content>
			<FieldTextArea
				v-model="model"
				required
				autofocus
				wrapper-cls="size-full"
				class="!size-full"
			/>
		</template>
		<template #footer>
			<BaseButton
				:text="title"
				theme="info"
				:icon="IconSave"
				@click="onClickUpdate"
			/>
		</template>
	</BaseDialog>
</template>
