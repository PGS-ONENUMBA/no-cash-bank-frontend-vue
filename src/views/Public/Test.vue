<template>
    <div>
        
        <p>I am the test </p>
        <p>I am the test </p>
        <p>I am the test </p>
        <p>I am the test </p>
        <p>I am the test </p>
        <p>I am the test </p>
        <button @click="squadPay">Test</button>
        <p>I am the test </p>
        <p>I am the test </p>
        <p>I am the test </p>
        <p>I am the test </p>
        <p>I am the test </p>
        <p>I am the test </p>
        <p>I am the test </p>
        <p>I am the test </p>
    </div>
</template>

<script setup>

import { ref } from 'vue';

const squadPay = () => {
    // console.log(import.meta.env.VITE_SQUAD_PK)
    // return;
    const squadInstance = new squad({
    onClose: () => console.log("Widget closed"),
    onLoad: () => console.log("Widget loaded successfully"),
    onSuccess: () => console.log(`Linked successfully`),
    key: "pk_acf59aa79e6e8fef7866a3c0a4fb1f958170d2ea", // Replace with your actual key
    email: "t@co.com",
    amount: 10000 * 100, // Convert to Kobo
    transaction_ref: "4678388588350909090AH",
    currency_code: "NGN",
    callback_url:"http://squadco.com",
  });
  squadInstance.setup();
  squadInstance.open();
}

</script>

<style lang="scss" scoped>

</style>