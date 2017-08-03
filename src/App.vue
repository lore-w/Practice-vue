<template>
    <div id="app">
        <transition :name="transName" mode="">
            <router-view class="transition"></router-view>
        </transition>
    </div>
</template>

<script>
    export default {
        name: 'app',
        props: ['transName']
    }
</script>

<style>
    * {
        margin: 0;
        padding: 0;
    }

    a {
        text-decoration: none;
    }

    html, body, #app {
        width: 100%;
        height: 100%;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
    }

    /*#app {
        width: 100%;
        overflow-x: hidden;
        min-height: 100%;
        -webkit-overflow-scrolling: touch;
    }*/

    /* Make clicks pass-through */
    #nprogress {
        pointer-events: none;
    }

    #nprogress .bar {
        background: #ffc001;
        position: fixed;
        z-index: 1031;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
    }

    /* Fancy blur effect */
    #nprogress .peg {
        display: block;
        position: absolute;
        right: 0px;
        width: 100px;
        height: 100%;
        box-shadow: 0 0 10px #29d, 0 0 5px #29d;
        opacity: 1.0;
        transform: rotate(3deg) translate(0px, -4px);
    }

    /* Remove these to get rid of the spinner */
    #nprogress .spinner {
        display: block;
        position: fixed;
        z-index: 1031;
        top: 15px;
        right: 15px;
    }

    #nprogress .spinner-icon {
        width: 18px;
        height: 18px;
        box-sizing: border-box;
        border: solid 2px transparent;
        border-top-color: #ffc001;
        border-left-color: #ffc001;
        border-radius: 50%;
        animation: nprogress-spinner 400ms linear infinite;
    }

    .nprogress-custom-parent {
        overflow: hidden;
        position: relative;
    }

    .nprogress-custom-parent #nprogress .spinner,
    .nprogress-custom-parent #nprogress .bar {
        position: absolute;
    }

    @keyframes nprogress-spinner {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    /* Fancy blur effect end */


    #app {
        width: 100%;
        max-width: 750px;
        margin: 0 auto;
    }

    @keyframes slideInRight {
        from {
            transform: translate3d(100%, 0, 0);
            visibility: visible;
        }

        to {
            transform: translate3d(0, 0, 0);
        }
    }
    @keyframes slideInLeft {
        from {
            transform: translate3d(-100%, 0, 0);
            visibility: visible;
        }

        to {
            transform: translate3d(0, 0, 0);
        }
    }
    @keyframes slideInUp {
        from {
            transform: translate3d(0, 100%, 0);
            visibility: visible;
        }

        to {
            transform: translate3d(0, 0, 0);
        }
    }
    @keyframes slideOutDown {
        from {
            transform: translate3d(0, 0, 0);
        }

        to {
            visibility: hidden;
            transform: translate3d(0, 100%, 0);
        }
    }
    @keyframes fadeIn {
        from {
            opacity: 0;
        }

        to {
            opacity: 1;
        }
    }
    @keyframes fadeOut {
        from {
            opacity: 1;
        }

        to {
            opacity: 0;
        }
    }

    .animated {
        animation-duration: .35s;
        animation-fill-mode: both;
    }
    .fadeIn {
        animation-name: fadeIn;
    }
    .fadeOut {
        animation-name: fadeOut;
    }
    .slideInUp {
        animation-name: slideInUp;
    }
    .slideOutDown {
        animation-name: slideOutDown;
    }

    .slide-enter {
        transform: translate3d(100%, 0, 0);
    }
    .slide-leave-to {
        transform: translate3d(-100%, 0, 0);
    }

    .fade-enter {
        opacity: 0;
    }
    .fade-leave-to {
        opacity: 1;
        transform: translate3d(-100%, 0, 0);
    }

    .slide-enter-active, .slide-leave-active, .fade-enter-active, .fade-leave-active {
        position: absolute;
        width: 100%;

    }

    .fade-enter-active {
        /*transition: opacity 5s;*/
    }
    .fade-leave-active {
        /*transition: transform 8s;*/
    }
    .slide-enter-active, .slide-leave-active {
        /*transition: transform 35s cubic-bezier(.55, 0, .1, 1);*/
    }

    .transition {
        transition: all .5s cubic-bezier(.55, 0, .1, 1);
    }
</style>
