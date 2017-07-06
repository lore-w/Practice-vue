<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script>
    export default {
        name: 'app'
    }
</script>

<style>
    * {
        margin: 0;
        padding: 0;
    }

    html, body {
        width: 100%;
        height: 100%;
    }

    a {
        text-decoration: none;
    }

    #app {
        width: 100%;
        max-width: 750px;
        margin: 0 auto;
    }
</style>
