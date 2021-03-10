# feng3d

> feng3d是使用TypeScript进行编写基于WebGL的3D游戏引擎，致力于打造一个优秀的3d游戏引擎以及易用且可以快速开发项目的配套编辑器。

## 特性

1. 提供优质的typescript编辑器
1. 支持脚本，你能够在这里实现所有你想做的事情。
1. 支持自定义材质，只需要你提供shader代码以及所有到的数据结构就可以实现你想要的渲染效果。

引擎提供基础技术库支持，编辑器提供以及其插件系统提供多样化的开放设计平台，网站提供设计师学习沟通分享与资源交易平台。

## 系统

### 引擎
    目的：为制作（游戏）项目提供常用的基础框架，缩短项目开发周期。
    内容：2D、3D、常用工具、数学库、渲染库、物理库、文件管理、声音、网络通讯、动画、粒子、特效、地形、UI、插件等基本模块。
    特点：易用、灵活、易扩展、开源、入门程序员可直接上手。
### 编辑器
    目的：为引擎开一扇窗户，让每个人都可成为设计师；解放策划与程序员的无尽纠葛，策划可以尽情设计场景，程序可以尽情实现功能逻辑。最终目标是让设计师无需编程即可完成理想中的项目。
    内容：属性编辑器、层级树、场景编辑器、资源管理器、（图像化）脚本编辑器、粒子编辑器、动画编辑器、地形编辑器、UI编辑器、账号系统、云存储、项目管理、（多平台多用户）协同设计、商场系统、插件管理器、等。
    特点：易用、灵活、易扩展、小学门槛。
### 网站
    目的：为程序员设计师轻易上手feng3d，交流展示作品。
    内容：在线编辑器、示例、文档、资源商场、论坛、设计师空间等。
    特点：学习、交流、分享。

## 功能清单

- [x] 引擎
    - [x] 数学库
    - [x] 渲染库
    - [x] 物理库
    - [x] 文件资源系统
    - [x] 声音
    - [ ] 网络库
    - [ ] 寻路导航
    - [ ] 等等
- [x] 编辑器
    - [x] 属性编辑
    - [x] 场景编辑
    - [x] 资源管理
    - [x] 资源商城
    - [ ] 账号系统
    - [ ] 云存储
    - [ ] 协同设计
    - [x] 粒子编辑器
    - [x] 脚本编辑器
    - [ ] 动画编辑器
    - [ ] 地形编辑器
    - [ ] 导航网格生成
    - [ ] 各类插件
        - [ ] 设计图
        - [ ] UI编辑
        - [ ] 游戏制作套件
            - [ ] RPG游戏模板
        - [ ] 建模
        - [ ] 思维导图
- [x] 网站
    - [x] 在线编辑器
    - [x] 文档
    - [x] 示例
    - [ ] 资源商城
    - [ ] 论坛
    - [ ] 设计师空间
- [x] 跨平台
    - [x] 网页端
    - [x] 客户端

## 功能清单

- [x] 引擎
    - [x] 序列化系统
    - [x] 事件系统
    - [x] 监听器
    - [x] 数学库
    - [x] 数据结构库
    - [x] 文件系统
    - [x] 对象视图框架
    - [x] 快捷键系统
    - [x] 渲染库
    - [x] 实体组件系统
    - [x] 动画
        - [x] 通用属性动画
        - [x] 骨骼动画
        - [x] 粒子系统
    - [x] 音频
    - [x] 资源系统
    - [x] 摄像机
    - [x] 控制器
    - [x] 纹理
    - [x] 材质
    - [x] 几何体
    - [x] 灯光
    - [x] 天空盒
    - [x] 地形
    - [x] 水
    - [x] 场景
    - [x] 射线拾取
    - [x] 游戏对象支持鼠标事件
    - [x] 布局组件

- [x] 2d模块
    - [x] 画布
    - [x]
- [x] 编辑器

## 贡献

首先感谢天底下所有愿意奉献的人！
1. 如果你有什么想法或者需求欢迎在 [issues](https://gitee.com/feng3d/feng3d/issues) 发布

## 项目托管
1. gitee 提供了不亚于github的功能。除了知名度，国内访问速度非常快，开发效率，作为主要仓库。
    * https://gitee.com/feng3d

1. github 国内访问较慢，有时甚至无法访问，放弃作为主仓库，将会不定期从gitee上同步。
    * https://github.com/feng3d-labs

## 作者
    2007 江西普通高校、计算机专业；自学flash开发小游戏、自学Java框架（马士兵视频，Hibernate、Spring）、制作游戏平台。
    2011 进入4399开发flash网页游戏，与Unity3D擦肩而过。贵人提点，3D入门。
    2012 制作ARPG游戏前端、服务器Demo，实现地图、角色、怪物、技能、登录、寻路、小地图等一系列核心功能。
    2012 研究Away3D引擎，看示例、看文档、看源码、调试分析。
    2013 进入九城，打酱油。研发FUI库，Fagal。
    2014 接触pan3D，决心从零开始搭建3D引擎，以webgl示例为起点，划分模块，移植Away3D，搭建feng3d。解析魔兽，实现地图与模型角色渲染。
    2015 进入岂凡，3D游戏引擎开发，研究Unity3D，编辑器设计与研发。偶遇牛人。
    2016 typescript流行。放弃继承，改用组合；抛弃flash，拥抱typescript。重构feng3d，搭建编辑器。
    2018 岂凡裁员，企图创业，闭门造车，feng3d再度升级，编辑器越发强大。
    2019 入伙创业，心念feng3d，另寻出路。
    2020 无心入坑，拖欠薪资，劳动仲裁，效率底下，拖延一年。进入正规，蓄势待发。现居上海，欢迎交流！

## 关于

网站：http://feng3d.com/

getee：https://gitee.com/feng3d

github：https://github.com/feng3d-labs

feng3d交流QQ群:519732759