<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { type ApplicationLinkViewModel, EnumApplicationStatus, EnumLinkType } from "@incutonez/life-stats-spec";
import FieldComboBox from "@/components/FieldComboBox.vue";
import { IconDelete } from "@/components/Icons.ts";
import TableData from "@/components/TableData.vue";
import { useTableActions, useTableData } from "@/composables/table.ts";
import { getEnumDisplay } from "@/utils/common.ts";
import { injectApplicationRecord, useApplicationsList } from "@/views/jobs/composables/applications.ts";

const { data } = useApplicationsList();
const { viewRecord } = injectApplicationRecord();
const linksData = ref<ApplicationLinkViewModel[]>([]);
const linksTable = useTableData<ApplicationLinkViewModel>({
	data: linksData,
	columns: [useTableActions([{
		icon: IconDelete,
		handler(record) {
			const links = viewRecord.value!.links ?? [];
			const { id } = record;
			const found = links.findIndex((item) => item.id === id);
			if (found !== undefined && found >= 0) {
				links.splice(found, 1);
			}
		},
	}]), {
		accessorKey: "positionTitle",
		header: "Position",
	}, {
		accessorKey: "type",
		header: "Link Type",
		cell: (info) => getEnumDisplay(EnumLinkType, info.getValue<number>()),
	}, {
		accessorKey: "status",
		header: "Status",
		cell: (info) => getEnumDisplay(EnumApplicationStatus, info.getValue<number>()),
	}],
});
const applicationRecords = computed(() => {
	const filterId = viewRecord.value!.id;
	const items = data.value?.data ?? [];
	return filterId ? items.filter((item) => item.id !== filterId) : items;
});
const selectedIds = computed({
	get() {
		return viewRecord.value!.links?.map((item) => item.id) ?? [];
	},
	set(value) {
		const { links = [] } = viewRecord.value!;
		viewRecord.value!.links = value.map((id) => {
			const existingLink = links.find((link) => link.id === id);
			if (existingLink) {
				return existingLink;
			}
			const found = applicationRecords.value.find((record) => record.id === id)!;
			return {
				id: found.id,
				positionTitle: found.positionTitle,
				status: found.status,
				// Newly selected records are linked to this model
				type: EnumLinkType.To,
			};
		});
	},
});

watch(() => viewRecord.value?.links, ($links = []) => {
	linksData.value = [...$links];
}, {
	immediate: true,
	deep: true,
});
</script>

<template>
	<FieldComboBox
		v-model="selectedIds"
		value-field="id"
		display-field="positionTitle"
		multiple
		value-only
		:options="applicationRecords"
	/>
	<TableData
		class="flex-1 border-0 border-t"
		:table="linksTable.table"
	/>
</template>
