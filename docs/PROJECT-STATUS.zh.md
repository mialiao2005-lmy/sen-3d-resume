# 项目状态与恢复说明

> **当前状态：暂停维护（非 GitHub Archived 状态）**  
> **记录日期：2026-10-31**  
> 本文用于保存阶段性成果、说明未完成事项，并为未来恢复提供入口。本次整理不代表项目重新启动，也不代表网站已成功部署。

## 1. 仓库信息

- 仓库：[`mialiao2005-lmy/sen-3d-resume`](https://github.com/mialiao2005-lmy/sen-3d-resume)
- 上游来源：[`dayinji/sen-3d-resume`](https://github.com/dayinji/sen-3d-resume)
- 项目原始方向：将 3D 人物、滚动运镜与个人简历结合，逐步替换为个人数字人和个人内容。
- 当前处理决定：先保留代码和教程作为参考，不继续投入当前 Fork 的功能开发；后续 3D 小世界等新方向独立推进，不默认并入本仓库。

## 2. 分支状态

| 分支 | 本次审计时的状态 | 处置 |
| --- | --- | --- |
| `main` | 基线提交 `c9a9fe3`；作为 Fork 的主线参照 | 保持不变 |
| `setup/model-readiness` | 提交 `341b7df`；相对 `main` 超前 1 个提交、落后 0 个提交 | 保留，作为包含模型检查工具和中文指南的工作分支 |

`setup/model-readiness` 相对 `main` 的额外提交包含：

- `docs/FIRST-STEPS.zh.md`：从 Fork、本地运行到 GLB 模型接入的中文步骤指南。
- `web/scripts/check-model.mjs`：检查 GLB 文件结构及项目接入约定的脚本。
- `web/package.json`：增加 `npm run check:model` 命令。
- `web/vite.config.ts`：本地开发预览配置调整。

**不要为了“清理”而删除该分支、合并到 `main` 或重写历史。** `main` 保留为恢复参照。

## 3. 已完成的工作

- Fork 原项目，保留 React、TypeScript、Vite 与 React Three Fiber 前端结构。
- 增加模型就绪检查脚本，可检查 GLB 2.0 文件头、默认场景、相机、`CameraAction`、焦点对象、动画时间轴、履历条数，以及可选眼球网格等接入条件。
- 增加中文上手指南，说明人物模型、镜头动画和焦点对象之间的关系。
- 增加 `npm run check:model` 命令，支持检查默认模型或指定候选 GLB 文件。

### 历史验证记录（2026-10-24）

以下内容来自当时的开发记录，并非 2026-10-31 重新运行的结果：

- `npm ci`：通过。
- `npm run build`：通过。
- `npm run lint`：0 个错误；记录中有 5 条警告。
- `npm run check:model`：原示例模型通过；记录为 5 个焦点、350 帧时间轴、2 个眼球网格。
- 反例检查：缺少 `CameraAction` 或损坏文件会失败；缺少可选眼睛或 `focus-works` 会给出警告。
- 浏览器视觉验收未完成：当时的远程预览环境无法创建 WebGL 上下文，因此不能据此确认人物渲染和滚动运镜已通过真实浏览器验收。

## 4. 尚未完成的事项

| 事项 | 状态 | 说明 |
| --- | --- | --- |
| 个人数字人 GLB | 未完成 | 尚未制作并验收可替换的个人模型 |
| 个人内容替换 | 未完成 | 简介、履历、作品、社交链接及素材仍需逐项替换 |
| 浏览器视觉验收 | 未完成 | 需要在支持 WebGL 的浏览器中检查首屏、滚动运镜、焦点和作品区 |
| 个人网站独立部署 | 未确认 | 本次未触发部署；不能把 README 的演示链接视为个人网站已部署 |
| 项链入口、个人 3D 空间、AI 气泡 | 未在本仓库实现 | 属于后续独立 3D 小世界方向，不作为本仓库的默认待办 |

## 5. 部署状态与边界

- 本次整理**没有修改** `.github/workflows/deploy.yml`、GitHub Pages 设置、构建发布配置或任何部署密钥。
- 本次整理**没有触发** GitHub Actions 或网站部署。
- 历史提交信息曾记录一次 `deploy-pages` 超时重试；本次审计未取得足以确认当前 Pages 发布成功的运行记录，因此部署状态仍标记为**待核验**。
- README 中的在线演示入口沿用上游项目的展示地址 `https://about.senbuzy.com/`。它不能证明本 Fork 已经有独立的个人网站部署。
- 如果未来需要恢复部署，应先检查仓库的 Pages 发布源、Actions 权限与最新运行记录，再决定是否重新发布；不要仅凭旧教程推断当前设置。

## 6. 未来恢复步骤

如果明确决定重新使用本仓库：

```bash
git clone https://github.com/mialiao2005-lmy/sen-3d-resume.git
cd sen-3d-resume
git switch setup/model-readiness
cd web
npm ci
npm run dev
```

修改代码后，在 `web/` 目录运行：

```bash
npm run build
npm run lint
npm run check:model
```

如需检查候选模型，先保留当前模型不动，并传入候选文件路径：

```bash
npm run check:model -- "C:\Models\candidate.glb"
```

脚本通过只代表基本结构符合项目约定，不代表人物外观、拓扑、材质、骨骼、镜头构图或网页视觉效果合格。必须在支持 WebGL 的浏览器中进行人工验收。

## 7. 发布前必须确认的版权与隐私事项

- 根目录 `LICENSE` 适用于代码；原作者的人物模型、姓名、简历、作品、品牌标识和其他个人素材不因此自动获得 MIT 授权。
- 发布前应按 `NOTICE` 要求替换不属于自己的个人内容，并逐项核对第三方素材许可。
- 不要把私人照片、个人敏感资料、访问令牌、API Key 或其他密钥提交到公开仓库。
- 如果未来开发站内 AI 对话，密钥应由服务端安全管理，不应写入前端代码或公开仓库。

## 8. 本次轻量整理记录

- 仅在 `setup/model-readiness` 分支更新中英文 README 的克隆地址，使其指向本 Fork。
- 在 README 中补充本分支的模型检查命令和项目状态说明链接。
- 新增本文件，记录分支、成果、未完成事项、部署边界与恢复步骤。
- 未修改 `main`、部署工作流、Pages 设置或历史提交；未删除、合并或归档任何分支。
