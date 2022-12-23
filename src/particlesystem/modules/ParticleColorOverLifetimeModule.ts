import { MinMaxGradient } from '../../math/gradient/MinMaxGradient';
import { oav } from '../../objectview/ObjectView';
import { serializable } from '../../serialization/serializable';
import { serialize } from '../../serialization/serialize';
import { Particle } from '../Particle';
import { ParticleModule } from './ParticleModule';

/**
 * 粒子系统 颜色随时间变化模块
 */
@serializable()
export class ParticleColorOverLifetimeModule extends ParticleModule
{
    /**
     * The gradient controlling the particle colors.
     * 控制粒子颜色的梯度。
     */
    @serialize
    // @oav({ tooltip: "The gradient controlling the particle colors." })
    @oav({ tooltip: '控制粒子颜色的梯度。' })
    color = new MinMaxGradient();

    /**
     * 初始化粒子状态
     * @param particle 粒子
     */
    initParticleState(particle: Particle)
    {
        particle[ColorOverLifetimeRate] = Math.random();
    }

    /**
     * 更新粒子状态
     * @param particle 粒子
     */
    updateParticleState(particle: Particle)
    {
        if (!this.enabled) return;

        particle.color.multiply(this.color.getValue(particle.rateAtLifeTime, particle[ColorOverLifetimeRate]));
    }
}

const ColorOverLifetimeRate = '_ColorOverLifetime_rate';

