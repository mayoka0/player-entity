import * as THREE from 'three';

/**
 * Player class representing the user-controlled entity.
 */
export class Player {
    constructor() {
        const geometry = new THREE.ConeGeometry(0.2, 0.5, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 2
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        // Align the cone to point along the Z axis (forward)
        this.mesh.rotation.x = Math.PI / 2;
    }

    /**
     * Updates the player position based on input and constrains it within the tunnel.
     * @param {number} speed - The current game speed (unused here but matches signature)
     * @param {InputHandler} inputHandler - The input system to check key presses
     */
    update(speed, inputHandler) {
        const moveSpeed = 0.15;
        
        // Horizontal movement
        if (inputHandler.isPressed('a') || inputHandler.isPressed('ArrowLeft')) {
            this.mesh.position.x -= moveSpeed;
        }
        if (inputHandler.isPressed('d') || inputHandler.isPressed('ArrowRight')) {
            this.mesh.position.x += moveSpeed;
        }
        
        // Vertical movement
        if (inputHandler.isPressed('w') || inputHandler.isPressed('ArrowUp')) {
            this.mesh.position.y += moveSpeed;
        }
        if (inputHandler.isPressed('s') || inputHandler.isPressed('ArrowDown')) {
            this.mesh.position.y -= moveSpeed;
        }

        // Radial constraint
        const radiusConstraint = 9.5;
        const dist = Math.sqrt(this.mesh.position.x ** 2 + this.mesh.position.y ** 2);
        
        if (dist > radiusConstraint) {
            const angle = Math.atan2(this.mesh.position.y, this.mesh.position.x);
            this.mesh.position.x = Math.cos(angle) * radiusConstraint;
            this.mesh.position.y = Math.sin(angle) * radiusConstraint;
        }
    }
}
