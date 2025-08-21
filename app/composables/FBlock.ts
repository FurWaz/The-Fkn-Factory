import RAPIER from "@dimforge/rapier3d";
import * as THREE from 'three';
import { FPackage } from "./FPackage";
import { CONSTANTS, Time, Vec3, type Updatable } from "./utils";
import { CSS2DObject } from "three/examples/jsm/Addons.js";

export enum FBlockType {
    STRAIGHT = "STRAIGHT",
    CORNER_LEFT = "CORNER_LEFT",
    CORNER_RIGHT = "CORNER_RIGHT",
    GENERATOR = "GENERATOR",
    TRUCK = "TRUCK",
}

export abstract class FBlock extends Identifiable implements Updatable {
    public static New(type: FBlockType, position: Vec3 = new Vec3(), orientation: Orientation = Orientation.PX): FBlock {
        switch (type) {
            case FBlockType.CORNER_LEFT: return new FBlockCornerLeft(position, orientation);
            case FBlockType.CORNER_RIGHT: return new FBlockCornerRight(position, orientation);
            case FBlockType.STRAIGHT: return new FBlockStraight(position, orientation);
            case FBlockType.GENERATOR: return new FBlockGenerator(position, orientation);
            case FBlockType.TRUCK: return new FBlockTruck(position, orientation);
        }
    }

    private _type: FBlockType;
    private _position: Vec3;
    private _orientation: Orientation;
    private _body: FPhysicsBody;
    private _model: F3DModel;

    protected constructor(type: FBlockType, position: Vec3 = new Vec3(), orientation: Orientation = Orientation.PX) {
        super();
        this._type = type;
        this._position = position;
        this._orientation = orientation;
        this._body = this.createPhysicsBody();
        this._model = this.create3DModel();
        
        const rot = this.quaternion;
        this.model.model.position.set(this.position.x, this.position.y, this.position.z);
        this.model.model.quaternion.set(rot.x, rot.y, rot.z, rot.w);
        
        this.body.rigidBody?.setTranslation(new RAPIER.Vector3(this.position.x, this.position.y, this.position.z), true)
        this.body.rigidBody?.setRotation({x: rot.x, y: rot.y, z: rot.z, w: rot.w}, true);

        this._position.on('update', (x, y, z) => this.body.rigidBody?.setTranslation(new RAPIER.Vector3(x, y, z), true));
        this._position.on('update', (x, y, z) => this.model.model.position.set(x, y, z));
    }

    protected abstract createPhysicsBody(): FPhysicsBody;
    protected abstract create3DModel(): F3DModel;

    abstract action(p: FPackage): void;
    abstract update(): void;
    public abstract onReset(): void;

    public onDelete() {
        this._body.onDelete();
    }

    get body() { return this._body; }
    get model() { return this._model; }

    get type() { return this._type; }
    get position() { return this._position; }
    get orientation() { return this._orientation; }
    get quaternion() { return new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1), this.orientation); }

    set position(val: Vec3) {
        this._position = val;
        this.model.model.position.set(val.x, val.y, val.z);

        if (this.body.rigidBody) this.body.rigidBody.setTranslation(new RAPIER.Vector3(val.x, val.y, val.z), true);
        else console.error('Moving FBlock with null rigidbody');
    }
    set orientation(val: Orientation) {
        this._orientation = val;
        const rot = this.quaternion;
        this.model.model.quaternion.set(rot.x, rot.y, rot.z, rot.w);

        if (this.body.rigidBody) this.body.rigidBody.setRotation({x: rot.x, y: rot.y, z: rot.z, w: rot.w}, true);
        else console.error('Rotating FBlock with null rigidbody');
    }
}

export class FBlockStraight extends FBlock {
    constructor(position: Vec3 = new Vec3(), orientation: Orientation = Orientation.PX) {
        super(FBlockType.STRAIGHT, position, orientation);
    }

    protected override createPhysicsBody(): FPhysicsBody {
        const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed();
        const rigidBody = Physics.Current.world.createRigidBody(rigidBodyDesc);

        const colliders: RAPIER.Collider[] = [];
        colliders.push(Physics.Current.world.createCollider(
            RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.0).setTranslation(0, 0, 0.35),
            rigidBody
        ));
        colliders.push(Physics.Current.world.createCollider(
            RAPIER.ColliderDesc.roundCuboid(0.4, 0.0, 0.0, 0.05).setTranslation(0.0, 0.45, 0.45),
            rigidBody
        ));
        colliders.push(Physics.Current.world.createCollider(
            RAPIER.ColliderDesc.roundCuboid(0.4, 0.0, 0.0, 0.05).setTranslation(0.0, -0.45, 0.45),
            rigidBody
        ));

        return new FPhysicsBody(rigidBody, colliders);
    }

    protected override create3DModel(): F3DModel {
        const model = new F3DModel();
        createModel(this.type).then((loadedModel) => {
            loadedModel.children.forEach(c => model.model.add(c));
        });
        return model;
    }

    public override onReset(): void {
        
    }

    override update(): void {
        
    }

    override action(p: FPackage): void {
        const force = new Vec3();
        force.x += Math.cos(this.orientation) * CONSTANTS.PACKAGE_SPEED * Time.Delta;
        force.y += Math.sin(this.orientation) * CONSTANTS.PACKAGE_SPEED * Time.Delta;
        p.body.rigidBody?.applyImpulse(new RAPIER.Vector3(force.x, force.y, force.z), true);
    }
}

export class FBlockCornerLeft extends FBlock {
    constructor(position: Vec3 = new Vec3(), orientation: Orientation = Orientation.PX) {
        super(FBlockType.CORNER_LEFT, position, orientation);
    }

    protected override createPhysicsBody(): FPhysicsBody {
        const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed();
        const rigidBody = Physics.Current.world.createRigidBody(rigidBodyDesc);

        const colliders: RAPIER.Collider[] = [];
        colliders.push(Physics.Current.world.createCollider(
            RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.0).setTranslation(0, 0, 0.35),
            rigidBody
        ));
        colliders.push(Physics.Current.world.createCollider(
            RAPIER.ColliderDesc.roundCuboid(0.0, 0.4, 0.0, 0.05).setTranslation(0.45, 0, 0.45),
            rigidBody
        ));
        colliders.push(Physics.Current.world.createCollider(
            RAPIER.ColliderDesc.roundCuboid(0.4, 0.0, 0.0, 0.05).setTranslation(0.0, -0.45, 0.45),
            rigidBody
        ));

        return new FPhysicsBody(rigidBody, colliders);
    }

    protected override create3DModel(): F3DModel {
        const model = new F3DModel();
        createModel(this.type).then((loadedModel) => {
            loadedModel.children.forEach(c => model.model.add(c));
        });
        return model;
    }

    public override onReset(): void {
        
    }

    override update(): void {
        
    }

    override action(p: FPackage): void {
        // rotate to local space
        const dx = p.position.x - this.position.x;
        const dy = p.position.y - this.position.y;
        const angle = -this.orientation;
        const local_position = new Vec3(
            dx * Math.cos(angle) - dy * Math.sin(angle),
            dx * Math.sin(angle) + dy * Math.cos(angle),
            p.position.z - this.position.z
        );

        // move the package in local space
        const forceVector = new Vec3();
        if (local_position.x < 0) {
            forceVector.x = CONSTANTS.PACKAGE_SPEED * Time.Delta;
        } else {
            forceVector.y = CONSTANTS.PACKAGE_SPEED * Time.Delta;
        }

        // rotate back to global space
        const global_force = new Vec3(
            forceVector.x * Math.cos(this.orientation) - forceVector.y * Math.sin(this.orientation),
            forceVector.x * Math.sin(this.orientation) + forceVector.y * Math.cos(this.orientation),
            forceVector.z
        );

        p.body.rigidBody?.applyImpulse(new RAPIER.Vector3(global_force.x, global_force.y, global_force.z), true);
    }
}

export class FBlockCornerRight extends FBlock {
    constructor(position: Vec3 = new Vec3(), orientation: Orientation = Orientation.PX) {
        super(FBlockType.CORNER_RIGHT, position, orientation);
    }

    protected override createPhysicsBody(): FPhysicsBody {
        const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed();
        const rigidBody = Physics.Current.world.createRigidBody(rigidBodyDesc);

        const colliders: RAPIER.Collider[] = [];
        colliders.push(Physics.Current.world.createCollider(
            RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.0).setTranslation(0, 0, 0.35),
            rigidBody
        ));
        colliders.push(Physics.Current.world.createCollider(
            RAPIER.ColliderDesc.roundCuboid(0.0, 0.4, 0.0, 0.05).setTranslation(0.45, 0, 0.45),
            rigidBody
        ));
        colliders.push(Physics.Current.world.createCollider(
            RAPIER.ColliderDesc.roundCuboid(0.4, 0.0, 0.0, 0.05).setTranslation(0.0, 0.45, 0.45),
            rigidBody
        ));

        return new FPhysicsBody(rigidBody, colliders);
    }

    protected override create3DModel(): F3DModel {
        const model = new F3DModel();
        createModel(this.type).then((loadedModel) => {
            loadedModel.children.forEach(c => model.model.add(c));
        });
        return model;
    }

    public override onReset(): void {
        
    }

    override update(): void {
        
    }

    override action(p: FPackage): void {
        // rotate to local space
        const dx = p.position.x - this.position.x;
        const dy = p.position.y - this.position.y;
        const angle = -this.orientation;
        const local_position = new Vec3(
            dx * Math.cos(angle) - dy * Math.sin(angle),
            dx * Math.sin(angle) + dy * Math.cos(angle),
            p.position.z - this.position.z
        );

        // move the package in local space
        const forceVector = new Vec3();
        if (local_position.x < 0) {
            forceVector.x = CONSTANTS.PACKAGE_SPEED * Time.Delta;
        } else {
            forceVector.y = -CONSTANTS.PACKAGE_SPEED * Time.Delta;
        }

        // rotate back to global space
        const global_force = new Vec3(
            forceVector.x * Math.cos(this.orientation) - forceVector.y * Math.sin(this.orientation),
            forceVector.x * Math.sin(this.orientation) + forceVector.y * Math.cos(this.orientation),
            forceVector.z
        );

        p.body.rigidBody?.applyImpulse(new RAPIER.Vector3(global_force.x, global_force.y, global_force.z), true);
    }
}

export class FBlockGenerator extends FBlock {
    private last_spawn_time: number = 0;

    constructor(position: Vec3 = new Vec3(), orientation: Orientation = Orientation.PX) {
        super(FBlockType.GENERATOR, position, orientation);
    }

    protected override createPhysicsBody(): FPhysicsBody {
        const rot = this.quaternion;
        const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed();
        const rigidBody = Physics.Current.world.createRigidBody(rigidBodyDesc);

        const colliders: RAPIER.Collider[] = [];
        colliders.push(Physics.Current.world.createCollider(
            RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.0).setTranslation(0, 0, 0.35),
            rigidBody
        ));

        return new FPhysicsBody(rigidBody, colliders);
    }

    protected override create3DModel(): F3DModel {
        const model = new F3DModel();
        createModel(this.type).then((loadedModel) => {
            loadedModel.children.forEach(c => model.model.add(c));
        });
        return model;
    }

    public override onReset(): void {
        
    }

    override update(): void {
        if (Time.Absolute - this.last_spawn_time >= CONSTANTS.GENERATOR_INTERVAL) {
            const pack = new FPackage(new Vec3(this.position.x, this.position.y, this.position.z + 0.75));
            FScene.Current?.addPackages(pack);
            this.last_spawn_time = Time.Absolute;
        }
    }

    override action(p: FPackage): void {
        p.body.rigidBody?.applyImpulse(new RAPIER.Vector3(
            CONSTANTS.PACKAGE_SPEED * Time.Delta * Math.cos(this.orientation),
            CONSTANTS.PACKAGE_SPEED * Time.Delta * Math.sin(this.orientation),
            0
        ), true);
    }
}

export class FBlockTruck extends FBlock {
    private _packages_max: number;
    private _packages_nb: number;
    private _counter_div: HTMLDivElement;
    private _should_drive: boolean;
    private _starting_position: Vec3;
    private _text_obj: CSS2DObject;


    constructor(position: Vec3 = new Vec3(), orientation: Orientation = Orientation.PX, packages_max: number = 100) {
        super(FBlockType.TRUCK, position, orientation);
        this._packages_max = packages_max;
        this._packages_nb = 0;
        this._should_drive = false;
        this._starting_position = position.clone();
        
        this._counter_div = document.createElement('div');
        this._counter_div.className = 'label';
        this._counter_div.textContent = `${this._packages_nb} / ${this._packages_max}`;
        this._counter_div.style.color = 'white';
        this._counter_div.style.fontSize = '20px';
        this._text_obj = new CSS2DObject(this._counter_div);
        this._text_obj.position.set(0, 0, 1.1);
        this.model.model.add(this._text_obj);
    }

    protected override createPhysicsBody(): FPhysicsBody {
        const rot = this.quaternion;
        const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed();
        const rigidBody = Physics.Current.world.createRigidBody(rigidBodyDesc);

        const colliders: RAPIER.Collider[] = [];
        colliders.push(Physics.Current.world.createCollider(
            RAPIER.ColliderDesc.roundCuboid(0.0, 0.4, 0.0, 0.05).setTranslation(0.45, 0, 0.45),
            rigidBody
        ));
        colliders.push(Physics.Current.world.createCollider(
            RAPIER.ColliderDesc.roundCuboid(0.4, 0.0, 0.0, 0.05).setTranslation(0.0, 0.45, 0.45),
            rigidBody
        ));
        colliders.push(Physics.Current.world.createCollider(
            RAPIER.ColliderDesc.roundCuboid(0.4, 0.0, 0.0, 0.05).setTranslation(0.0, -0.45, 0.45),
            rigidBody
        ));

        return new FPhysicsBody(rigidBody, colliders);
    }

    protected override create3DModel(): F3DModel {
        const model = new F3DModel();
        createModel(this.type).then((loadedModel) => {
            loadedModel.children.forEach(c => model.model.add(c));
        });
        return model;
    }

    public override onReset(): void {
        this._packages_nb = 0;
        this._counter_div.textContent = `${this._packages_nb} / ${this._packages_max}`;
    }

    override update(): void {
        this.model.model.scale.z = 1 + Math.cos(Time.Absolute * 20) * 0.01;
        
        if (ThreeScene.Current) {
            const scale = 1 / this.model.model.position.distanceTo(ThreeScene.Current!.camera.position);
            this._counter_div.style.fontSize = `${scale*100}px`;
        }

        if (this._should_drive) {
            this.position.set(
                this.position.x + Math.cos(this.orientation) * CONSTANTS.TRUCK_SPEED * Time.Delta,
                this.position.y + Math.sin(this.orientation) * CONSTANTS.TRUCK_SPEED * Time.Delta,
                this.position.z
            );

            if (this.position.distanceTo(this._starting_position) > 5)
            {
                FScene.Current?.removeBlocks(this.id);
                this.model.model.remove(this._text_obj);
            }
        }
    }

    override action(p: FPackage): void {
        if (this._should_drive) return;

        FScene.Current?.removePackages(p.id);
        this._packages_nb++;
        this._counter_div.textContent = `${this._packages_nb} / ${this._packages_max}`;

        if (this._packages_nb >= this._packages_max)
        {
            this._should_drive = true;
            this.body.onDelete();
        }
    }
}
