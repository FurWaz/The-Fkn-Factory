export const LEVELS = [
    {
        id: 1,
        name: 'Tutorial',
        build(scene: FScene) {
            scene.addBlocks(
                new FBlockGenerator(new Vec3(0, -2, 0), Orientation.PY),
                new FBlockTruck(new Vec3(-2, 1, 0), Orientation.NX, 10),
            );
        }
    }
];