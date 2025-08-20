export const CONSTANTS = {
    PACKAGE_SPEED: 3.2,
    GENERATOR_INTERVAL: 2,
    GRAVITY: {x: 0, y: 0, z: -9.81},
    TRUCK_SPEED: 2,
}

export type Id = string;

export class Identifiable {
    private static idCounter: number = 0;

    public static resetIdCounter(): void {
        Identifiable.idCounter = 0;
    }

    private _id: Id;

    constructor() {
        this._id = `id-${Identifiable.idCounter++}`;
    }

    get id() { return this._id; }
}

export interface Updatable {
    update(): void;
}

export class Time {
    private static _abs_ms = performance.now();
    private static _delta_ms = 0;

    public static Tick() {
        const now = performance.now();
        this._delta_ms = Math.min(now - this._abs_ms, 1000);
        this._abs_ms = now;
    }
    
    public static Reset() {
        this._abs_ms = performance.now();
        this._delta_ms = 0;
    }

    public static get Delta() { return Time._delta_ms / 1000; }
    public static get Absolute() { return Time._abs_ms / 1000; }
}

export class EventEmitter<Events extends Record<string, any[]>> {
    private listeners: {
        [K in keyof Events]?: ((...args: Events[K]) => void)[]
    } = {};

    on<K extends keyof Events>(event: K, callback: (...args: Events[K]) => void) {
        (this.listeners[event] ??= []).push(callback);
    }

    off<K extends keyof Events>(event: K, callback: (...args: Events[K]) => void) {
        this.listeners[event] = (this.listeners[event] ?? []).filter(cb => cb !== callback);
    }

    emit<K extends keyof Events>(event: K, ...args: Events[K]) {
        for (const cb of this.listeners[event] ?? []) {
            cb(...args);
        }
    }
}

type Vec3EventMap = {
    update: [x: number, y: number, z: number];
};

export class Vec3 extends EventEmitter<Vec3EventMap> {
    private _x: number;
    private _y: number;
    private _z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        super();
        this._x = x;
        this._y = y;
        this._z = z;
    }

    public copy(vec: {x:number,y:number,z:number}): Vec3 {
        this.set(vec.x, vec.y, vec.z);
        return this;
    }

    public clone() {
        return new Vec3(this.x, this.y, this.z);
    }

    public set(x: number, y: number, z: number) {
        this._x = x;
        this._y = y;
        this._z = z;
        this.emit('update', this.x, this.y, this.z);
    }

    public distanceTo(other: Vec3) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx*dx + dy * dy);
    }

    get x() { return this._x; }
    get y() { return this._y; }
    get z() { return this._z; }
    
    set x(val: number) { this._x = val; this.emit('update', this.x, this.y, this.z); }
    set y(val: number) { this._y = val; this.emit('update', this.x, this.y, this.z); }
    set z(val: number) { this._z = val; this.emit('update', this.x, this.y, this.z); }
}

type QuaternionEventMap = {
    update: [x: number, y: number, z: number, w: number];
};

export class Quaternion extends EventEmitter<QuaternionEventMap> {
    private _x: number;
    private _y: number;
    private _z: number;
    private _w: number;

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
        super();
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;
    }

    public clone() {
        return new Quaternion(this.x, this.y, this.z, this.w);
    }

    public set(x: number, y: number, z: number, w: number) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;
        this.emit('update', this.x, this.y, this.z, this.w);
    }

    get x() { return this._x; }
    get y() { return this._y; }
    get z() { return this._z; }
    get w() { return this._w; }

    set x(val: number) { this._x = val; this.emit('update', this.x, this.y, this.z, this.w); }
    set y(val: number) { this._y = val; this.emit('update', this.x, this.y, this.z, this.w); }
    set z(val: number) { this._z = val; this.emit('update', this.x, this.y, this.z, this.w); }
    set w(val: number) { this._w = val; this.emit('update', this.x, this.y, this.z, this.w); }
}

export enum Orientation {
    PX = 0,
    NX = Math.PI,
    PY = Math.PI / 2,
    NY = -Math.PI / 2,
}
