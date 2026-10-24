# 从 Fork 到自己的 3D 主页

本仓库从 [dayinji/sen-3d-resume](https://github.com/dayinji/sen-3d-resume) Fork。
第一阶段复现网页与滚动镜头；第二阶段接入自己的数字人；第三阶段再增加项链入口、个人空间和 AI 气泡。

## 当前起点

- 前端沿用 React + TypeScript + Vite + React Three Fiber。
- `main` 保留 Fork 时的基线；`setup/model-readiness` 添加模型检查命令与本指南。
- 当前展示人物及个人资料仍是原作者示例，尚未替换为个人成品。
- 原作者模型、履历、作品和品牌素材不属于 MIT 代码授权；正式发布前按照根目录 `NOTICE` 替换。保留 `LICENSE` 与 `NOTICE`。

## 第 1 课：运行网页

安装 Node.js 24（本轮验证环境为 24.22.1），打开终端：

```bash
git clone https://github.com/mialiao2005-lmy/sen-3d-resume.git
cd sen-3d-resume
git switch setup/model-readiness
cd web
npm ci
npm run dev
```

打开终端显示的本地地址。滚动检查首屏、履历和作品区是否正常切换。
每次改代码后执行 `npm run build` 与 `npm run lint`。

打包输出在 `web/dist/`。预览构建产物用 `npm run preview` 并通过 HTTP 地址打开；不要依赖双击 HTML，浏览器可能阻止模块和资源加载。

## 第 2 课：先确定形象参考图

确认一套主服装，形成全身正面图及同一造型的三分之四视角图。
保留脸型、主要五官与发型；使用简单背景、完整手脚、适度张开的双臂。
鞋子与背面看不清的部分应先补充设计，不能当成照片已经提供的细节。

照片与生成参考图用于造型确认；它们还不是可旋转的 3D 模型。
原始人像不应作为开发依赖提交到这个公开 Fork。

## 第 3 课：制作角色，再制作镜头

1. 用确认后的角色图制作人物 GLB，先验收正面、侧面、背面、四肢和材质。
2. 参照 [intro3d 教程](../tutor/intro3d处理模型教程/intro3d处理模型教程.md) 在编辑器里摆放人物和镜头。
3. 导出包含场景相机、`CameraAction` 和焦点对象的 `me.glb`。
4. 将导出的焦点名单填入 `web/src/data/focusPoints.ts`，让中英文履历条数与名单一致。

普通人物 GLB 常常没有相机动画，不能直接替换并获得原站的滚动运镜。
眼睛需要独立网格、合适的旋转中心及含 `eye` 的对象名；只有脸部贴图里的眼睛无法单独转动。
表情、说话、换装是之后独立开发的功能。

## 第 4 课：检查接入条件

从 `web/` 运行：

```bash
npm run check:model
# 或先检查候选文件，不覆盖原模型：
npm run check:model -- /absolute/path/to/candidate.glb
```

Windows 可传带引号的本机路径，如 `npm run check:model -- "C:\Models\candidate.glb"`。

| 检查项 | 作用 |
| --- | --- |
| 默认场景中的相机 + CameraAction | 滚动镜头 |
| focus-start 或 focus-0 | 首屏焦点 |
| 与 FOCUS_POINTS 同名的对象 | 各履历节点焦点 |
| 中英文履历条数 | 与镜头节点对应 |
| 动画时长 | 末履历节点之后留出作品区镜头 |
| focus-works（可选） | 作品区焦点，缺失时用最后一个履历焦点 |
| eye 网格（可选） | 鼠标眼球交互 |

脚本只检查项目接入结构，不检查相似度、脸部破面、手指、材质、旋转中心或视角。
结构通过后仍需人工旋转模型并在网页滚动验收。

## 后续里程碑

| 阶段 | 完成标准 |
| --- | --- |
| 原版验证 | 构建成功，首屏、滚动运镜、作品弹窗可用 |
| 数字人替换 | 形象获确认；GLB 结构检查及视觉验收通过 |
| 个人内容替换 | 简介、履历、作品、社交链接及素材全部核对 |
| 项链入口 | 点击项链进入个人空间，可返回入口 |
| AI 气泡 | 第一版打开确认的 ChatGPT 链接；站内聊天另做后端，密钥只留在服务端 |

模型与内容确认后再配置正式发布。GitHub 仓库链接与线上网站链接是两种不同成果。

## 2026-10-24 验证记录

- `npm ci`、`npm run build`：通过。
- `npm run lint`：0 错误；上游已有 5 条警告。
- `npm run check:model`：原模型通过，5 个焦点、350 帧时间轴、2 个眼球网格。
- 反例检查：缺少 CameraAction、损坏文件均返回失败；缺少可选眼睛及作品焦点只给出警告。
- 浏览器视觉验收未完成：当前远程预览浏览器无法创建 WebGL 上下文。不能据此宣称人物渲染及滚动运镜已经通过；需在支持 WebGL 的浏览器继续检查。
- 本轮未发布公开网站，未上传原始照片，未制作个人 GLB。
