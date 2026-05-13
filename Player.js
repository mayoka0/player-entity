import * as THREE from 'three';

/**
 * Player class representing the user-controlled entity.
 */
export class Player {
    constructor() {
        const geometry = new THREE.ConeGeometry(0.2, 0.5, 8);
        this.material = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 2
        });
        
        this.mesh = new THREE.Mesh(geometry, this.material);
        // Align the cone to point along the Z axis (forward)
        this.mesh.rotation.x = Math.PI / 2;

        // Trail system
        this.trailParticles = [];
        this.trailGroup = new THREE.Group();

        // Animation states
        this.isFlashing = false;
        this.flashTimer = 0;
        this.isJittering = false;
        this.jitterTimer = 0;
        this.originalColor = new THREE.Color(0x00ffff);

        // Dash state
        this.isDashing = false;
        this.dashTimer = 0;
        this.dashCooldown = 0;
        this.dashDirection = new THREE.Vector2();
    }

    /**
     * Triggers a hit animation by flashing the player mesh.
     */
    flash() {
        this.isFlashing = true;
        this.flashTimer = 10; // frames
    }

    /**
     * Triggers a jitter animation to simulate impact.
     */
    jitter() {
        this.isJittering = true;
        this.jitterTimer = 10; // frames
    }

    /**
     * Initiates a dash in the specified direction.
     * @param {THREE.Vector2} direction - The direction to dash in
     */
    dash(direction) {
        if (this.dashCooldown <= 0) {
            this.isDashing = true;
            this.dashTimer = 8; // frames
            this.dashCooldown = 40; // frames
            this.dashDirection.copy(direction).normalize();
        }
    }

    /**
     * Updates the player position based on input and constrains it within the tunnel.
     * @param {number} speed - The current game speed
     * @param {InputHandler} inputHandler - The input system to check key presses
     */
    update(speed, inputHandler) {
        if (this.dashCooldown > 0) this.dashCooldown--;

        let currentMoveSpeed = 0.15;
        
        if (this.isDashing) {
            currentMoveSpeed = 0.8;
            this.mesh.position.x += this.dashDirection.x * currentMoveSpeed;
            this.mesh.position.y += this.dashDirection.y * currentMoveSpeed;
            this.dashTimer--;
            
            if (this.dashTimer <= 0) {
                this.isDashing = false;
                this.material.emissive.copy(this.originalColor);
            }
        } else {
            // Horizontal movement
            if (inputHandler.isPressed('a') || inputHandler.isPressed('ArrowLeft')) {
                this.mesh.position.x -= currentMoveSpeed;
            }
            if (inputHandler.isPressed('d') || inputHandler.isPressed('ArrowRight')) {
                this.mesh.position.x += currentMoveSpeed;
            }
            
            // Vertical movement
            if (inputHandler.isPressed('w') || inputHandler.isPressed('ArrowUp')) {
                this.mesh.position.y += currentMoveSpeed;
            }
            if (inputHandler.isPressed('s') || inputHandler.isPressed('ArrowDown')) {
                this.mesh.position.y -= currentMoveSpeed;
            }
        }

        // Radial constraint
        const radiusConstraint = 9.5;
        const dist = Math.sqrt(this.mesh.position.x ** 2 + this.mesh.position.y ** 2);
        
        if (dist > radiusConstraint) {
            const angle = Math.atan2(this.mesh.position.y, this.mesh.position.x);
            this.mesh.position.x = Math.cos(angle) * radiusConstraint;
            this.mesh.position.y = Math.sin(angle) * radiusConstraint;
        }

        // Engine Glow Pulse
        const glowPulse = 1.5 + Math.sin(Date.now() * 0.01 * speed) * 0.5;
        this.material.emissiveIntensity = glowPulse;

        // Hit Animations (Flash/Jitter/Dash)
        if (this.isDashing) {
            this.material.emissive.setHex(0xffffff);
        } else if (this.isFlashing) {
            if (this.flashTimer > 0) {
                this.material.emissive.setHex(this.flashTimer % 2 === 0 ? 0xffffff : 0x00ffff);
                this.flashTimer--;
            } else {
                this.material.emissive.copy(this.originalColor);
                this.isFlashing = false;
            }
        }

        if (this.isJittering) {
            if (this.jitterTimer > 0) {
                this.mesh.position.x += (Math.random() - 0.5) * 0.2;
                this.mesh.position.y += (Math.random() - 0.5) * 0.2;
                this.jitterTimer--;
            } else {
                this.isJittering = false;
            }
        }

        // Trail Update
        this._updateTrail();
    }

    _updateTrail() {
        // Add new particle
        const particleGeom = new THREE.SphereGeometry(0.05, 4, 4);
        const particleMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8
        });
        const particle = new THREE.Mesh(particleGeom, particleMat);
        particle.position.copy(this.mesh.position);
        particle.position.z -= 0.5; // Offset to back of ship
        
        this.trailParticles.push({
            mesh: particle,
            life: 1.0
        });
        this.trailGroup.add(particle);

        // Update existing particles
        for (let i = this.trailParticles.length - 1; i >= 0; i--) {
            const p = this.trailParticles[i];
            p.life -= 0.05;
            p.mesh.scale.set(p.life, p.life, p.life);
            p.mesh.material.opacity = p.life;
            
            if (p.life <= 0) {
                this.trailGroup.remove(p.mesh);
                this.trailParticles.splice(i, 1);
            }
        }
    }
}
