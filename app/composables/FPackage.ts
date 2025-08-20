import RAPIER from "@dimforge/rapier3d";
import { Quaternion, type Updatable } from "./utils";

export class FPackage extends Identifiable implements Updatable {
    private _position: Vec3;
    private _rotation: Quaternion;
    private _body: FPhysicsBody;

    private createPhysicsBody(): FPhysicsBody {
        const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(this.position.x, this.position.y, this.position.z)
            .setRotation({x: this.rotation.x, y: this.rotation.y, z: this.rotation.z, w: this.rotation.w});
        rigidBodyDesc.mass = 0.5;
        const rigidBody = Physics.Current.world.createRigidBody(rigidBodyDesc);
        const colliderDesc = RAPIER.ColliderDesc.roundCuboid(0.2, 0.2, 0.2, 0.05).setFriction(0.3);
        const collider = Physics.Current.world.createCollider(colliderDesc, rigidBody);
        return new FPhysicsBody(rigidBody, [collider]);
    }
    
    constructor(position: Vec3) {
        super();
        this._position = position;
        this._rotation = new Quaternion();
        this._body = this.createPhysicsBody();
    }

    update(): void {
        if (!this.body.rigidBody) return;

        const pos = this.body.rigidBody.translation();
        this.position.set(pos.x, pos.y, pos.z);

        const rot = this.body.rigidBody.rotation();
        this.rotation.set(rot.x, rot.y, rot.z, rot.w);
    }

    onDelete() {
        this.body.onDelete();
    }

    get body() { return this._body; }

    get position() { return this._position; }
    set position(val: Vec3) { this._position = val; }

    get rotation() { return this._rotation; }
    set rotation(val: Quaternion) { this._rotation = val; }
}