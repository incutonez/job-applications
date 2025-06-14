<script setup lang="ts">
import FieldComboBox from "@/components/FieldComboBox.vue";
import { ApplicationStatusOptions } from "@/views/jobs/options.ts";
</script>

<template>
	<FieldComboBox
		label="Status"
		label-align="top"
		value-field="id"
		display-field="display"
		:value-only="true"
		:options="ApplicationStatusOptions"
	/>
</template>
