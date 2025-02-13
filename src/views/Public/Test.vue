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
    key: "sandbox_pk_7e5784759d4d7c36324a84be185a4f4b1be1e2d207ca", // Replace with your actual key
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