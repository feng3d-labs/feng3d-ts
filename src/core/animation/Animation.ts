import { oav } from '../../objectview/ObjectView';
import { serialize } from '../../serialization/serialize';
import { watcher } from '../../watcher/watcher';
import { Behaviour } from '../component/Behaviour';
import { getComponentType, RegisterComponent } from '../component/Component';
import { AddComponentMenu } from '../Menu';
import { AnimationClip } from './AnimationClip';
import { PropertyClip, PropertyClipPathItemType } from './PropertyClip';

declare global
{
    export interface MixinsComponentMap { Animation: Animation; }
}

@AddComponentMenu('Animator/Animation')
@RegisterComponent()
export class Animation extends Behaviour
{
    @oav({ component: 'OAVDefault', componentParam: { dragparam: { accepttype: 'animationclip', datatype: 'animationclip' } } })
    @serialize
    animation: AnimationClip;

    @oav({ component: 'OAVArray', componentParam: { dragparam: { accepttype: 'animationclip', datatype: 'animationclip' }, defaultItem: () => new AnimationClip() } })
    @serialize
    animations: AnimationClip[] = [];

    /**
     * 动画事件，单位为ms
     */
    @oav()
    time = 0;

    @oav()
    @serialize
    isplaying = false;

    /**
     * 播放速度
     */
    @oav()
    @serialize
    playspeed = 1;

    /**
     * 动作名称
     */
    get clipName()
    {
        return this.animation ? this.animation.name : null;
    }

    constructor()
    {
        super();
        watcher.watch(this as Animation, 'animation', this._onAnimationChanged, this);
        watcher.watch(this as Animation, 'time', this._onTimeChanged, this);
    }

    update(interval: number)
    {
        if (this.isplaying) this.time += interval * this.playspeed;
    }

    dispose()
    {
        this.animation = null;
        this.animations = null;
        super.dispose();
    }

    private _updateAni()
    {
        if (!this.animation) return;

        const cycle = this.animation.length;
        const cliptime = (this.time % cycle + cycle) % cycle;

        const propertyClips = this.animation.propertyClips;

        for (let i = 0; i < propertyClips.length; i++)
        {
            const propertyClip = propertyClips[i];

            if (propertyClip.times.length === 0) continue;
            const propertyHost = this.getPropertyHost(propertyClip);
            if (!propertyHost) continue;
            propertyHost[propertyClip.propertyName] = propertyClip.getValue(cliptime);
        }
    }

    private getPropertyHost(propertyClip: PropertyClip)
    {
        let propertyHost = this.object3D;
        const path = propertyClip.path;

        for (let i = 0; i < path.length; i++)
        {
            const element = path[i];
            switch (element[0])
            {
                case PropertyClipPathItemType.Object3D:
                    propertyHost = propertyHost.find(element[1]);
                    break;
                case PropertyClipPathItemType.Component:
                    const componentClass = getComponentType(element[1] as any);
                    propertyHost = propertyHost.getComponent(componentClass);
                    break;
                default:
                    console.error(`无法获取 PropertyHost ${element}`);
            }
            if (!propertyHost)
            {
                return null;
            }
        }

        return propertyHost;
    }

    private _onAnimationChanged()
    {
        this.time = 0;
    }

    private _onTimeChanged()
    {
        this._updateAni();
    }
}
