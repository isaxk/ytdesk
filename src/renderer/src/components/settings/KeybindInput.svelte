<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import IconButton from "../ui/IconButton.svelte";
  import { X } from "lucide-svelte";

  let input: HTMLInputElement;

  export let value;

  function isDisallowedKey(key: string) {
    return (
      key === "Meta" ||
      key === "Command" ||
      key === "Control" ||
      key === "Alt" ||
      key === "Shift" ||
      key === "AltGraph" ||
      key === "Pause" ||
      key === "MediaPlayPause" ||
      key === "MediaTrackPrevious" ||
      key === "MediaTrackNext" ||
      key === "MediaStop" ||
      key === "Tab" ||
      key === "AudioVolumeUp" ||
      key === "AudioVolumeDown" ||
      key === "AudioVolumeMute" ||
      key === "ContextMenu" ||
      key === "Cancel"
    );
  }

  function validateKey(event: KeyboardEvent) {
    console.log(event.key);
    if (event.key === " ") return "Space";
    if (event.code === "NumpadEnter") return "Enter";
    if (event.code === "NumpadAdd") return "NumAdd";
    if (event.code === "NumpadSubtract") return "NumSub";
    if (event.code === "NumpadDecimal") return "NumDec";
    if (event.code === "NumpadMultiply") return "NumMult";
    if (event.code === "NumpadDivide") return "NumDiv";
    if (event.code === "Numpad0") return "Num0";
    if (event.key === "CtrlOrCmd") return "Ctrl";
    if (event.key === "CmdOrCtrl") return "Ctrl";
    if (event.code === "Numpad1") return "Num1";
    if (event.code === "Numpad2") return "Num2";
    if (event.code === "Numpad3") return "Num3";
    if (event.code === "Numpad4") return "Num4";
    if (event.code === "Numpad5") return "Num5";
    if (event.code === "Numpad6") return "Num6";
    if (event.code === "Numpad7") return "Num7";
    if (event.code === "Numpad8") return "Num8";
    if (event.code === "Numpad9") return "Num9";
    if (event.code === "ArrowUp") return "Up";
    if (event.code === "ArrowDown") return "Down";
    if (event.code === "ArrowLeft") return "Left";
    if (event.code === "ArrowRight") return "Right";
    if (event.shiftKey && event.code === "Equal") return "Plus";
    if (event.keyCode >= 65 && event.keyCode <= 90)
      return event.key.toUpperCase();

    return event.key;
  }

  $: console.log(value);

  const dispatch = createEventDispatcher();

  function handleKeyDown(event: KeyboardEvent) {
    if (isDisallowedKey(event.key)) {
      return;
    }

    let newKeybind = "";

    if (event.key === "Escape") {
      input.blur();
      dispatch("change", value);
      event.preventDefault();
      return;
    }

    if (event.metaKey) newKeybind += "Meta+";
    if (event.ctrlKey) newKeybind += "Ctrl+";
    if (event.altKey) newKeybind += "Alt+";
    if (event.shiftKey) newKeybind += "Shift+";

    newKeybind += validateKey(event);
    newKeybind = newKeybind.replace("\u00a0", "Space");
    input.blur();
    console.log(newKeybind);
    value = newKeybind;
    dispatch("change", value);
  }
</script>

<input
  type="text"
  bind:this={input}
  on:keydown={handleKeyDown}
  class="w-52 rounded border bg-zinc-50 text-neutral-800 dark:text-zinc-200 px-2 py-1 text-left dark:border-neutral-700 dark:bg-neutral-900"
  {value}
/>
<IconButton
  icon={X}
  on:click={() => {
    value = "Unbound";
    dispatch("change", "Unbound");
  }}
/>
