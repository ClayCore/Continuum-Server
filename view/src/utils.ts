import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

// * Utility functions
export function $(what: string): Element | null {
    return document.querySelector(what);
}

// * Utility functions
export function _(what: string): NodeListOf<Element> | null {
    return document.querySelectorAll(what);
}

export function initFontLibrary() {
    library.add(fas);
}
