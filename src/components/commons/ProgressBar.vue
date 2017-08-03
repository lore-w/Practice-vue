<template>
    <div id="top-bar">
        <span></span>
    </div>
</template>

<script>

    export default {
        name: 'ProgressBar',
        props: [

        ],
        data (){

            return {

            }
        },
        mounted () {

        },
        methods: {

        }
    }
</script>

<style scoped>
    #top-bar {
        width: 100%;
        height: 2px;
        background: red;
        position: fixed;
        top: 0;
        left: 0;
    }
</style>
