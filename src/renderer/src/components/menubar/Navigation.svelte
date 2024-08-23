<script>
    import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-svelte'
  
    import IconButton from '../ui/IconButton.svelte'
  </script>
  
  <div class="pl-2 flex items-center text-sm">
    <IconButton icon={ArrowLeft} on:click={() => window.api.pageAction('back')} />
    <IconButton icon={ArrowRight} on:click={() => window.api.pageAction('forward')} />
    <IconButton icon={RefreshCw} on:click={() => window.api.pageAction('reload')} />
  </div>
  