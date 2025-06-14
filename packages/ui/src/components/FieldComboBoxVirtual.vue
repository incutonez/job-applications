<script setup lang="ts" generic="T extends object">
import { computed, ref, unref } from "vue";
import { useVirtualizer, type VirtualItem } from "@tanstack/vue-virtual";
import { ComboboxAnchor,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxPortal,
	ComboboxRoot,
	ComboboxTrigger } from "reka-ui";
import FieldLabel from "@/components/FieldLabel.vue";
import { IconExpandAll } from "@/components/Icons.ts";
import type { IFieldComboBoxProps, TComboBoxValue } from "@/types/components.ts";
import { getLabelAlign, isObject } from "@/utils/common.ts";

/**
 * Keyboard navigation is a little busted in the virtual scroller
 */
const model = defineModel<TComboBoxValue>();
const { options, displayField, valueField, labelAlign = "left", comboWidth = "w-full", valueOnly = false, required = false, customValue = false } = defineProps<IFieldComboBoxProps<T>>();
const parentRef = ref();
const search = ref("");
const open = ref(false);
const scrollItem = ref<HTMLElement>();
const filteredOptions = computed(() => {
	const $search = unref(search);
	const value = getOptionDisplayValue(model.value);
	// We don't want to filter the list if we've selected an item
	if ($search && $search !== value) {
		const regex = new RegExp($search, "ig");
		return options.filter(({ [displayField as keyof T]: value }) => regex.test(String(value)));
	}
	return options;
});
/**
 * Reka UI uses TanStack Virtual under the hood but has some issues... they scroll things into view manually through a
 * hook, and then call the virtualizer.scrollToIndex method
 * Source: https://github.com/unovue/reka-ui/blob/902dffe180c796a899b25bc79b5f0f7ee41a9269/packages/core/src/Listbox/ListboxVirtualizer.vue#L114
 */
const virtualizer = useVirtualizer({
	getScrollElement: () => parentRef.value,
	estimateSize: () => 45,
	horizontal: false,
	get count() {
		return filteredOptions.value.length;
	},
});
const items = computed(() => virtualizer.value.getVirtualItems());
const wrapperClasses = computed(() => {
	return {
		[getLabelAlign(labelAlign)]: true,
	};
});

function getComboBoxItemValue(row: VirtualItem) {
	const record = filteredOptions.value[row.index];
	if (valueOnly) {
		return record[valueField as keyof T] as TComboBoxValue;
	}
	return record;
}

function getOptionDisplayValue(record?: TComboBoxValue) {
	let value;
	if (isObject(record)) {
		value = (record as T)[displayField as keyof T] as string;
	}
	else if (record !== undefined && record !== null) {
		value = options.find((option) => option[valueField as keyof T] === record)?.[displayField as keyof T] as string;
	}
	return value ?? "";
}

function getInputDisplay(record: TComboBoxValue) {
	return getOptionDisplayValue(record);
}

function onClickInput() {
	if (open.value) {
		return;
	}
	open.value = true;
}

function onBlurInput() {
	if (open.value) {
		return;
	}
	if (customValue) {
		const $search = unref(search);
		if ($search) {
			if (valueOnly) {
				model.value = $search;
			}
			else {
				model.value = {
					[displayField]: $search,
				};
			}
		}
		else {
			search.value = getOptionDisplayValue(model.value);
		}
	}
	// Enforce a selection
	else if (required) {
		search.value = getOptionDisplayValue(model.value);
	}
}

function onInputKeyDown() {
	scrollItem.value?.scrollIntoView({
		block: "start",
	});
}

/**
 * Because we're virtually rendering all elements, we need to tap into the highlight event that's emitted from the
 * ComboBox... when that changes, we make sure our item is scrolled into view through the onInputKeyDown handler.  The
 * reason we don't just handle it here is because the user can scroll with their mousewheel, which would mess with what
 * is currently being displayed, so we only do it on keydown.
 */
function onHighlight(payload?: { ref: HTMLElement }) {
	scrollItem.value = payload?.ref;
}
</script>

<template>
	<ComboboxRoot
		v-model="model"
		v-model:open="open"
		as="article"
		:class="wrapperClasses"
		:ignore-filter="true"
		:required="required"
		:reset-search-term-on-blur="!customValue"
		orientation="vertical"
		@highlight="onHighlight"
	>
		<FieldLabel :text="label" />
		<ComboboxAnchor
			as="section"
			class="field-combo-box max-w-full"
			:class="comboWidth"
		>
			<ComboboxInput
				v-model="search"
				class="field-text-input w-full min-w-0"
				placeholder="Placeholder..."
				:display-value="getInputDisplay"
				:required="required"
				@click="onClickInput"
				@blur="onBlurInput"
				@keydown.down.up="onInputKeyDown"
			/>
			<ComboboxTrigger class="cursor-pointer">
				<IconExpandAll class="size-4 text-grass11" />
			</ComboboxTrigger>
		</ComboboxAnchor>
		<ComboboxPortal>
			<ComboboxContent
				position="popper"
				class="z-1 bg-white w-(--reka-combobox-trigger-width) shadow-lg border"
			>
				<div
					ref="parentRef"
					class="max-h-56 overflow-auto"
				>
					<div
						class="w-full relative overflow-auto"
						:style="{
							height: `${virtualizer.getTotalSize()}px`,
						}"
					>
						<div
							class="absolute top-0 left-0 w-full"
							:style="{
								transform: `translateY(${items[0]?.start ?? 0}px)`,
							}"
						>
							<ComboboxItem
								v-for="virtualRow in items"
								:key="virtualRow.key as PropertyKey"
								:data-index="virtualRow.index"
								:value="getComboBoxItemValue(virtualRow)"
								class="text-sm w-full flex items-center py-2 cursor-pointer relative select-none data-[disabled]:text-gray-200 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-sky-200 aria-[selected=true]:font-semibold aria-[selected=true]:bg-sky-200"
							>
								<span class="px-2">{{ filteredOptions[virtualRow.index][displayField as keyof T] }}</span>
							</ComboboxItem>
						</div>
					</div>
				</div>
			</ComboboxContent>
		</ComboboxPortal>
	</ComboboxRoot>
</template>
