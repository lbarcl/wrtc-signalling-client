export type Listener<T> = (data: T) => void;
export interface Event<T> {
    name: string;
    data: T;
}
export declare class EventEmitter {
    private listeners;
    on<T>(eventName: string, listener: Listener<T>): void;
    off<T>(eventName: string, listener: Listener<T>): void;
    emit<T>(eventName: string, data: T): void;
}
