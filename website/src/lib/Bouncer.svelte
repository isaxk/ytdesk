<script>
  import { ChevronDown } from "lucide-svelte";

</script>
<div
  class="absolute bottom-0 left-0 right-0 flex h-10 items-center justify-center"
>
  <div class="bounce text-xl"><ChevronDown class="drop-shadow-xl"/></div>
</div>

<style lang="postcss">
    .bounce {
        animation: bouncy 0.5s infinite alternate ease-in-out;
    }

    @keyframes bouncy {
        from {
            transform: translateY(-14px);
        }
        to {
            transform: translateY(0px);
        }
    }
</style>

