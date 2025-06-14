<script setup lang="ts">
import { computed, ref } from "vue";
import BaseDialog from "@/components/BaseDialog.vue";
import FieldComboBox from "@/components/FieldComboBox.vue";
import { useApplicationsList } from "@/views/jobs/composables/applications.ts";

export interface IViewApplicationLinksProps {
	filterId?: string;
	initialIds?: string[];
}

const { filterId = undefined, initialIds = [] } = defineProps<IViewApplicationLinksProps>();
const { data } = useApplicationsList();
const selectedIds = ref<string[]>(initialIds);
const records = computed(() => {
	const items = data.value?.data ?? [];
	return filterId ? items.filter((item) => item.id !== filterId) : items;
});
</script>

<template>
	<BaseDialog title="Link Applications">
		<template #content>
			<FieldComboBox
				v-model="selectedIds"
				value-field="id"
				display-field="positionTitle"
				multiple
				value-only
				:options="records"
			/>
		</template>
	</BaseDialog>
</template>
