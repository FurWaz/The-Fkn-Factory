import RAPIER from "@dimforge/rapier3d";

export class FPhysicsBody {
    private _rigidBody: RAPIER.RigidBody;
    private _colliders: RAPIER.Collider[];
    private _deleted: boolean;

    constructor(rb: RAPIER.RigidBody, cls: RAPIER.Collider[]) {
        this._rigidBody = rb;
        this._colliders = cls;
        this._deleted = false;
    }

    onDelete() {
        if (this._deleted) return;
        
        this._colliders.forEach(cl => Physics.Current.world.removeCollider(cl, true));
        Physics.Current.world.removeRigidBody(this._rigidBody);
        this._deleted = true;
    }

    public get rigidBody() { return this._deleted? null: this._rigidBody; }
    public get colliders() { return this._deleted? null: this._colliders; }
}

export class Physics implements Updatable {
    private static Instance = new Physics();
    public static get Current() { return this.Instance; }
    public static Reset() { Physics.Instance = new Physics(); }

    public world: RAPIER.World;

    constructor() {
        this.world = new RAPIER.World(CONSTANTS.GRAVITY);
        this.world.createCollider(RAPIER.ColliderDesc.cuboid(100, 100, 0.01));
    }

    public update(): void {
        this.world.step();
    }
}