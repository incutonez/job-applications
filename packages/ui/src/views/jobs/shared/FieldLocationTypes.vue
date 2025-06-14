<script setup lang="ts">
import FieldComboBox from "@/components/FieldComboBox.vue";
import { LocationTypeOptions } from "@/views/jobs/options.ts";
</script>

<template>
	<FieldComboBox
		label="Location"
		label-align="top"
		value-field="id"
		display-field="display"
		:value-only="true"
		:options="LocationTypeOptions"
	/>
</template>
