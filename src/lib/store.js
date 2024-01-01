import { writable } from 'svelte/store';

export let dotSize = writable(4);
export let dotOpacity = writable(0.6);
export let bandwidth = writable(20);
export let threshold = writable(20);

export let mapOption = writable('dots');
export let chartOption = writable('area');

export let brushLowerBound = writable(1851);
export let brushUpperBound = writable(2015);
