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

        // Physics Banking & Elastic Inertia state
        this.logicPosition = new THREE.Vector2(0, 0);
        this.velocity = new THREE.Vector2(0, 0);
        this.lastVelocity = new THREE.Vector2(0, 0);
        this.springVelocity = new THREE.Vector2(0, 0);
        this.gForce = 0;
        this.bankAngle = 0;
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
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     */
    update(speed, inputHandler, deltaTime = 1/60) {
        // Normalize deltaTime to 60fps base for existing logic
        const dt = deltaTime * 60;

        if (this.dashCooldown > 0) {
            this.dashCooldown -= dt;
        }

        let currentMoveSpeed = 0.15 * dt;
        const lastLogicPos = this.logicPosition.clone();
        
        if (this.isDashing) {
            const dashMoveSpeed = 0.8 * dt;
            this.logicPosition.x += this.dashDirection.x * dashMoveSpeed;
            this.logicPosition.y += this.dashDirection.y * dashMoveSpeed;
            this.dashTimer -= dt;
            
            if (this.dashTimer <= 0) {
                this.isDashing = false;
                this.material.emissive.copy(this.originalColor);
            }
        } else {
            // Horizontal movement
            if (inputHandler.isPressed('a') || inputHandler.isPressed('ArrowLeft')) {
                this.logicPosition.x -= currentMoveSpeed;
            }
            if (inputHandler.isPressed('d') || inputHandler.isPressed('ArrowRight')) {
                this.logicPosition.x += currentMoveSpeed;
            }
            
            // Vertical movement
            if (inputHandler.isPressed('w') || inputHandler.isPressed('ArrowUp')) {
                this.logicPosition.y += currentMoveSpeed;
            }
            if (inputHandler.isPressed('s') || inputHandler.isPressed('ArrowDown')) {
                this.logicPosition.y -= currentMoveSpeed;
            }
        }

        // Radial constraint
        const radiusConstraint = 9.5;
        const dist = this.logicPosition.length();
        
        if (dist > radiusConstraint) {
            this.logicPosition.setLength(radiusConstraint);
        }

        // Physics: Elastic Inertia (Spring overshoot)
        // Adjust stiffness/damping for dt
        const stiffness = 0.25 * dt;
        const damping = Math.pow(0.75, dt);
        
        const displacement = new THREE.Vector2().subVectors(this.logicPosition, this.mesh.position);
        const force = displacement.multiplyScalar(stiffness);
        this.springVelocity.add(force);
        this.springVelocity.multiplyScalar(damping);
        
        this.mesh.position.x += this.springVelocity.x;
        this.mesh.position.y += this.springVelocity.y;

        // Physics: Banking & G-Force
        this.velocity.subVectors(this.logicPosition, lastLogicPos);
        const acceleration = (this.velocity.length() - this.lastVelocity.length()) / dt;
        this.gForce = Math.abs(acceleration) * 5.0 + (this.isDashing ? 1.5 : 0);
        this.lastVelocity.copy(this.velocity);

        // Banking (Roll) based on horizontal velocity
        const targetBank = - (this.velocity.x / dt) * 4.0;
        this.bankAngle = THREE.MathUtils.lerp(this.bankAngle, targetBank, 1 - Math.pow(1 - 0.15, dt));
        this.mesh.rotation.z = this.bankAngle;

        // Engine Glow Pulse
        const glowPulse = (1.5 + Math.sin(Date.now() * 0.01 * speed) * 0.5) * (1 + this.gForce * 0.5);
        this.material.emissiveIntensity = glowPulse;

        // Hit Animations (Flash/Jitter/Dash)
        if (this.isDashing) {
            this.material.emissive.setHex(0xffffff);
        } else if (this.isFlashing) {
            if (this.flashTimer > 0) {
                this.material.emissive.setHex(Math.floor(this.flashTimer) % 2 === 0 ? 0xffffff : 0x00ffff);
                this.flashTimer -= dt;
            } else {
                this.material.emissive.copy(this.originalColor);
                this.isFlashing = false;
            }
        }

        if (this.isJittering) {
            if (this.jitterTimer > 0) {
                this.mesh.position.x += (Math.random() - 0.5) * 0.2 * dt;
                this.mesh.position.y += (Math.random() - 0.5) * 0.2 * dt;
                this.jitterTimer -= dt;
            } else {
                this.isJittering = false;
            }
        }

        // Trail Update
        this._updateTrail(dt);
    }

    _updateTrail(dt = 1) {
        // Dynamic properties based on G-force (velocity changes)
        const trailScale = 1.0 + this.gForce * 2.0;
        const trailColor = new THREE.Color(0x00ffff);
        if (this.gForce > 0.1) {
            trailColor.lerp(new THREE.Color(0xff00ff), Math.min(this.gForce, 1.0));
        }

        // Add new particle - spawn rate could be decoupled, but we'll scale life/move
        const particleGeom = new THREE.SphereGeometry(0.05, 4, 4);
        const particleMat = new THREE.MeshBasicMaterial({
            color: trailColor,
            transparent: true,
            opacity: 0.8
        });
        const particle = new THREE.Mesh(particleGeom, particleMat);
        particle.position.copy(this.mesh.position);
        particle.position.z -= 0.5; // Offset to back of ship
        
        this.trailParticles.push({
            mesh: particle,
            life: 1.0,
            maxScale: trailScale
        });
        this.trailGroup.add(particle);

        // Update existing particles
        for (let i = this.trailParticles.length - 1; i >= 0; i--) {
            const p = this.trailParticles[i];
            p.life -= 0.05 * dt;
            const currentScale = Math.max(0, p.life * p.maxScale);
            p.mesh.scale.set(currentScale, currentScale, currentScale);
            p.mesh.material.opacity = Math.max(0, p.life * 0.8);
            
            if (p.life <= 0) {
                this.trailGroup.remove(p.mesh);
                this.trailParticles.splice(i, 1);
            }
        }
    }
}
