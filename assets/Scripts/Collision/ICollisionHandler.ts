import { Collider2D } from "cc";

// ICollisionHandler.ts
export interface ICollisionHandler {
    handleCollision(self: Collider2D, other: Collider2D, context?: any): void;
}

// 处理器注册表
export const collisionHandlers = new Map<string, ICollisionHandler>();