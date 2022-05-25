/**
 *
 */
interface IX4Document {
    createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K];
    createElementNS(namespace: string | null, qualifiedName: string, options?: string | ElementCreationOptions): Element;
    createTextNode(data: string): Text;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
    querySelector<E extends Element = Element>(selectors: string): E | null;
    get body(): HTMLElement;
    get activeElement(): Element;
    get location(): Location;
    get styleSheets(): StyleSheetList;
    get head(): HTMLHeadElement;
    get documentElement(): HTMLElement;
    set title(title: string);
}
export declare let x4document: IX4Document;
export {};
