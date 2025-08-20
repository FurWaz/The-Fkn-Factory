import type { FBlock } from "./FBlock";
import type { FPackage } from "./FPackage";
import type { Id, Updatable } from "./utils";

type FSceneEvents = {
    blocks: [modified: FBlock[], added: FBlock[], removed: Id[]]
    packages: [modified: FPackage[], added: FPackage[], removed: Id[]]
};

export class FScene extends EventEmitter<FSceneEvents> implements Updatable {
    private static _current: FScene|null;

    public static get Current() { return FScene._current; }

    private _blocks: {[key: Id]: FBlock};
    private _packages: {[key: Id]: FPackage};

    constructor() {
        super();
        this._blocks = {};
        this._packages = {};

        FScene._current = this;
    }

    reset() {
        const ids: Id[] = [];
        for (const id in this._packages) {
            ids.push(id);
        }
        this.removePackages(...ids);

        for (const id in this._blocks) {
            this.blocks[id]!.onReset();
        }
    }

    update(): void {
        Physics.Current.update();

        for (const id in this._blocks) {
            const block = this._blocks[id];
            if (!block) continue;
            block.update();
        }
        for (const id in this._packages) {
            const pack = this._packages[id];
            if (!pack) continue;

            const belowBlock = this.findBlockAt(pack.position);
            if (belowBlock !== null) belowBlock.action(pack);
            pack.update();
        }
    }

    public addBlocks(...newBlocks: FBlock[]): void {
        newBlocks.forEach(block => {
            if (this._blocks[block.id] === undefined)
                this._blocks[block.id] = block;
        });
        this.emit('blocks', [], newBlocks, []);
    }

    public editBlocks(...newBlocks: FBlock[]): void {
        newBlocks.forEach(block => {
            this._blocks[block.id] = block;
        });
        this.emit('blocks', newBlocks, [], []);
    }

    public removeBlocks(...ids: Id[]): void {
        const removedIds: Id[] = [];
        ids.forEach(id => {
            if (this._blocks[id] !== undefined) {
                removedIds.push(id);
                this._blocks[id]?.onDelete();
                delete this._blocks[id];
            }
        });
        this.emit('blocks', [], [], removedIds);
    }

    public addPackages(...newPackages: FPackage[]): void {
        newPackages.forEach(pack => {
            if (this._packages[pack.id] === undefined)
                this._packages[pack.id] = pack;
        });
        this.emit('packages', [], newPackages, []);
    }

    public editPackages(...newPackages: FPackage[]): void {
        newPackages.forEach(pack => {
            this._packages[pack.id] = pack;
        });
        this.emit('packages', newPackages, [], []);
    }

    public removePackages(...ids: Id[]): void {
        const removedIds: Id[] = [];
        ids.forEach(id => {
            if (this._packages[id] !== undefined) {
                removedIds.push(id);
                this._packages[id]?.onDelete();
                delete this._packages[id];
            }
        });
        this.emit('packages', [], [], removedIds);
    }

    public findBlockAt(position: Vec3): FBlock|null {
        // note : ignore height (y coord because game is on a plane)

        // first round position (because game is on a grid)
        position = new Vec3(Math.round(position.x), Math.round(position.y), Math.round(position.z))

        // next iterate on every block to see it it's at the right coords
        // FIXME : We should create a "indexing" (coord -> block map) for blocks coordinates to make this method faster
        for (const id in this._blocks) {
            const block = this._blocks[id];
            if (!block) continue;
            if (block.position.x === position.x && block.position.y === position.y) {
                return block;
            }
        }

        return null;
    }

    get blocks() { return this._blocks; }
    set blocks(val: {[key: Id]: FBlock}) {
        const removedIds: Id[] = [];
        for (const oldId in this._blocks) {
            let found = false;
            for (const newId in val) {
                if (newId === oldId) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                removedIds.push(oldId);
                this._blocks[oldId]?.onDelete();
                delete this._blocks[oldId];
            }
        }

        const addedBlocks: FBlock[] = [];
        const editedBlocks: FBlock[] = [];

        for (const newId in val) {
            let found = false;
            for (const oldId in this._blocks) {
                if (oldId === newId) {
                    found = true;
                    break;
                }
            }
            if (!found && val[newId]) {
                addedBlocks.push(val[newId]);
                this._blocks[newId] = val[newId];
            }
            if (found && val[newId]) {
                editedBlocks.push(val[newId]);
                this._blocks[newId] = val[newId];
            }
        }

        this.emit('blocks', editedBlocks, addedBlocks, removedIds);
    }

    get packages() { return this._packages; }
    set packages(val: {[key: Id]: FPackage}) {
        const removedIds: Id[] = [];
        for (const oldId in this._packages) {
            let found = false;
            for (const newId in val) {
                if (newId === oldId) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                removedIds.push(oldId);
                this._packages[oldId]?.onDelete();
                delete this._packages[oldId];
            }
        }

        const addedPackages: FPackage[] = [];
        const editedPackages: FPackage[] = [];

        for (const newId in val) {
            let found = false;
            for (const oldId in this._packages) {
                if (oldId === newId) {
                    found = true;
                    break;
                }
            }
            if (!found && val[newId]) {
                addedPackages.push(val[newId]);
                this._packages[newId] = val[newId];
            }
            if (found && val[newId]) {
                editedPackages.push(val[newId]);
                this._packages[newId] = val[newId];
            }
        }

        this.emit('packages', editedPackages, addedPackages, removedIds);
    }
};
