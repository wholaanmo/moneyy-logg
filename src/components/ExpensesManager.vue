<template>
    <div>
      <personal @expenses-updated="handleExpensesUpdate" />
      <view :expenses="sharedExpenses" />
    </div>
  </template>
  
  <script>
  import Personal from "./personal.vue";
  import View from "./view.vue";
  
  export default {
    components: { Personal, View },
    data() {
      return {
        sharedExpenses: [], // Shared state between components
      };
    },
    methods: {
      handleExpensesUpdate(personal) {
        this.sharedExpenses = personal; // Update when expenses change
      },
    },
  };
  </script>