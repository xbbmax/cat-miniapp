---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 262153780077604_0/project_7659446605044547882-files/CONTEXT.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 262153780077604#1786540702902
    ReservedCode2: ""
---
# 宠爱有期项目开发指南（AI 上下文）

> **用途：** 本文档用于向 AI 编程助手（Codex/Cursor 等）提供项目上下文，确保代码复用和风格一致  
> **最后更新：** 2026-08-12  
> **项目状态：** Web 端核心功能已完成，小程序端开发中

---

## 1. 项目概述

| 字段 | 内容 |
|------|------|
| **项目名称** | 宠爱有期（Pawday） |
| **产品定位** | 宠物健康效期管理平台 |
| **目标用户** | C 端个人宠物主（猫/狗主人） |
| **域名** | pawday.cn |
| **当前阶段** | Web 端已完成，小程序端开发中 |

**核心理念：** 覆盖宠物全生命周期的数字健康管家，让养宠人从「被动应对」走向「主动管理」。

---

## 2. 技术栈

### 前端

| 技术 | 版本 | 说明 |
|------|------|------|
| **框架** | Next.js 16 | 必须使用 App Router（app/ 目录），禁止 Pages Router |
| **UI库** | React 19 | 配合 Next.js 16 |
| **语言** | TypeScript 5.x | 严格模式，禁止 any |
| **样式** | Tailwind CSS 4.x | 原子化 CSS |
| **组件库** | shadcn/ui | 基于 Radix UI + Tailwind，所有基础组件（Button、Input、Select 等）必须用 shadcn/ui |
| **表单** | React Hook Form + Zod | 表单校验 |
| **状态管理** | React Context + SWR | 轻量方案，暂不引入 Redux/Zustand |

### 后端

| 技术 | 说明 |
|------|------|
| **API** | Next.js Route Handlers（app/api/） |
| **数据库** | Supabase PostgreSQL |
| **ORM** | Drizzle ORM（schema 定义在 src/lib/supabase/schema.ts） |
| **认证** | 自定义 JWT（bcrypt 哈希 + jose 签发） |

### 部署

- 服务器：腾讯云 2核4G
- 进程管理：PM2
- 部署地址：http://43.143.207.131:3000

---

## 3. 项目结构

```
src/
├── app/                        # Next.js App Router 页面
│   ├── (auth)/                 # 认证相关布局（无顶部/底部导航）
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (main)/                 # 主应用布局（有顶部导航 + 底部导航）
│   │   ├── layout.tsx          # 含顶部导航 + 底部导航
│   │   ├── page.tsx            # 首页
│   │   ├── vaccines/           # 疫苗管理
│   │   │   ├── page.tsx        # 疫苗列表
│   │   │   └── [id]/page.tsx   # 疫苗详情
│   │   ├── medications/        # 用药管理（含驱虫）
│   │   │   ├── page.tsx        # 用药列表
│   │   │   └── [id]/page.tsx   # 用药详情
│   │   ├── products/           # 商品效期管理
│   │   │   ├── page.tsx        # 商品列表
│   │   │   ├── add/page.tsx    # 新增商品
│   │   │   └── [id]/page.tsx   # 商品详情
│   │   ├── pets/               # 宠物管理
│   │   │   ├── add/page.tsx    # 添加宠物
│   │   │   └── [id]/page.tsx   # 宠物详情
│   │   ├── plans/              # 健康计划
│   │   │   ├── page.tsx        # 计划列表
│   │   │   └── [id]/page.tsx   # 计划详情
│   │   ├── records/            # 健康记录
│   │   │   ├── page.tsx        # 记录列表
│   │   │   └── [id]/page.tsx   # 记录详情
│   │   ├── profile/            # 个人中心
│   │   │   ├── page.tsx        # 个人中心
│   │   │   └── dashboard/page.tsx  # 数据总览（7模块聚合看板）
│   │   ├── notifications/      # 站内信
│   │   │   └── page.tsx        # 通知列表
│   │   ├── settings/           # 设置
│   │   │   ├── page.tsx        # 设置页
│   │   │   └── feedback/page.tsx  # 意见反馈
│   │   └── admin/              # 管理后台（super_admin 专属）
│   │       ├── layout.tsx      # 后台布局（侧边导航）
│   │       ├── page.tsx        # 后台首页（数据概览）
│   │       ├── settings/page.tsx  # 系统管理
│   │       └── feedbacks/page.tsx # 反馈管理
│   └── api/                    # API Routes
│       └── v1/
│           ├── auth/           # 认证（7个端点）
│           ├── pets/           # 宠物（5个端点）
│           ├── products/       # 商品（6个端点）
│           ├── vaccines/       # 疫苗（5个端点）
│           ├── medications/    # 用药（5个端点）
│           ├── plans/          # 计划（7个端点）
│           ├── records/        # 记录（5个端点）
│           ├── reminders/      # 提醒（6个端点）
│           ├── notifications/  # 通知（4个端点）
│           ├── users/          # 用户（3个端点）
│           ├── feedbacks/      # 反馈（1个端点）
│           ├── admin/          # 后台管理（5个端点）
│           └── statistics/     # 统计（4个端点）
├── components/                 # 可复用组件
│   ├── ui/                     # shadcn/ui 基础组件（Button、Input、Select 等）
│   ├── pets/                   # 宠物相关组件
│   │   ├── PetForm.tsx         # 宠物表单
│   │   ├── PetList.tsx         # 宠物列表
│   │   └── PetDetail.tsx       # 宠物详情
│   ├── products/               # 商品相关组件
│   │   ├── ProductForm.tsx     # 商品表单
│   │   ├── ProductList.tsx     # 商品列表
│   │   └── ProductDetail.tsx   # 商品详情
│   ├── vaccines/               # 疫苗相关组件
│   ├── medications/            # 用药相关组件
│   ├── plans/                  # 健康计划组件
│   ├── records/                # 健康记录组件
│   └── common/                 # 通用组件（Loading、Empty、Error 等）
├── lib/                        # 工具函数和配置
│   ├── supabase/               # Supabase 相关
│   │   ├── client.ts           # Supabase 客户端实例
│   │   ├── schema.ts           # Drizzle ORM schema（17张表定义）
│   │   └── utils.ts            # Supabase 工具函数
│   ├── auth/                   # 认证相关
│   │   ├── jwt.ts              # JWT 工具（签发、验证）
│   │   ├── password.ts         # 密码工具（bcrypt 哈希、校验）
│   │   └── middleware.ts       # 认证中间件
│   ├── utils/                  # 通用工具
│   │   ├── date.ts             # 日期处理
│   │   ├── validation.ts       # Zod 校验规则
│   │   └── constants.ts        # 常量定义
│   └── constants/              # 常量
│       ├── pet-types.ts        # 宠物类型枚举
│       ├── vaccine-presets.ts  # 疫苗预设选项
│       └── categories.ts       # 商品品类及开封后保质期
├── types/                      # TypeScript 类型定义
│   ├── pet.ts                  # 宠物类型
│   ├── product.ts              # 商品类型
│   ├── vaccine.ts              # 疫苗类型
│   ├── medication.ts           # 用药类型
│   ├── plan.ts                 # 健康计划类型
│   ├── record.ts               # 健康记录类型
│   ├── user.ts                 # 用户类型
│   └── api.ts                  # API 响应类型
└── styles/                     # 全局样式
    └── globals.css             # Tailwind CSS 入口
```

---

## 4. 核心功能模块（已完成）

### 4.1 宠物档案管理

**位置：** `src/components/pets/`、`src/app/(main)/pets/`

**功能：**
- 多宠物建档（11种宠物类型：猫/狗/兔子/仓鼠/豚鼠/龙猫/鸟/乌龟/蜥蜴/鱼/其他）
- 12维度健康画像（品种、年龄、体重、性别、绝育状态、过敏史、慢性病、病史、饮食禁忌、长期用药、特殊护理）
- 数据联动（与疫苗、用药、商品、健康计划全部打通）
- 宠物详情页（单只宠物的所有健康信息一屏聚合）

**关键文件：**
- `src/types/pet.ts` - 宠物类型定义
- `src/lib/supabase/schema.ts` - pets 表定义
- `src/components/pets/PetForm.tsx` - 宠物表单
- `src/app/api/v1/pets/` - 宠物 API（5个端点）

### 4.2 商品效期管理

**位置：** `src/components/products/`、`src/app/(main)/products/`

**功能：**
- 智能效期追踪（记录生产日期和保质期，自动计算剩余天数）
- **开封后保质期**（核心差异化功能）：不同品类有不同开封后保质期（膨化主粮45天、冻干30天、湿粮仅3天）
- FEFO 智能排序（先到期先出，即将过期的商品自动置顶提醒）
- 宠物关联（一件商品可关联多只宠物）
- 用完标记（商品用完后一键标记，不产生干扰提醒）

**关键文件：**
- `src/types/product.ts` - 商品类型定义
- `src/lib/supabase/schema.ts` - products 表、pet_products 关联表、product_categories 表
- `src/lib/constants/categories.ts` - 品类及开封后保质期数据
- `src/components/products/ProductForm.tsx` - 商品表单
- `src/app/api/v1/products/` - 商品 API（6个端点）

**剩余天数计算逻辑：**
```typescript
// 未开封
if (!product.is_opened) {
  remaining_days = end_date - TODAY;
}
// 已开封
else if (product.is_opened && product.opened_at) {
  if (category.opened_shelf_life_days) {
    opened_end_date = product.opened_at + category.opened_shelf_life_days;
    remaining_days = opened_end_date - TODAY;
  } else {
    remaining_days = end_date - TODAY; // 回退到原有效期
  }
}
// 已用完
if (product.is_used_up) {
  remaining_days = 0;
}
```

### 4.3 疫苗管理

**位置：** `src/components/vaccines/`、`src/app/(main)/vaccines/`

**功能：**
- 预设疫苗库（猫用、犬用、小宠/异宠常见疫苗，支持自定义输入）
- 多针次追踪（幼宠首次系列接种 + 成年宠物年度加强）
- 接种信息完整记录（疫苗名称、品牌、接种日期、下次接种日期、接种医院、接种医生）
- 状态自动计算（已完成 / 待接种 / 即将到期（14天内）/ 已过期）
- 时间轴展示（按时间倒序展示全部接种记录）

**关键文件：**
- `src/types/vaccine.ts` - 疫苗类型定义
- `src/lib/constants/vaccine-presets.ts` - 疫苗预设选项
- `src/app/api/v1/vaccines/` - 疫苗 API（5个端点）

### 4.4 用药管理

**位置：** `src/components/medications/`、`src/app/(main)/medications/`

**功能：**
- 5种用药类型（驱虫、日常用药、治疗用药、保健品、其他）
- 驱虫专项（体内/体外/内外同驱三种方式）
- 长短期用药区分（短期记录下次用药日期，长期记录喂药频次）
- 四色类型标签（驱虫-蓝 / 日常用药-绿 / 治疗用药-橙 / 保健品-紫）
- 到期提醒（短期用药和驱虫基于下次用药日期自动提醒）

**关键文件：**
- `src/types/medication.ts` - 用药类型定义
- `src/app/api/v1/medications/` - 用药 API（5个端点）

### 4.5 健康计划系统

**位置：** `src/components/plans/`、`src/app/(main)/plans/`

**功能：**
- 7种计划类型（疫苗、驱虫、用药、体检、复诊、护理、自定义）
- 双视图模式（列表视图 + 日历视图）
- 自动联动健康记录（计划完成后自动生成对应健康记录）
- 到期提醒（可设置提前N天提醒）

**关键文件：**
- `src/types/plan.ts` - 健康计划类型定义
- `src/app/api/v1/plans/` - 计划 API（7个端点）

### 4.6 智能提醒系统

**位置：** `src/lib/reminders/`、`src/app/api/v1/reminders/`

**功能：**
- 多维度提醒（疫苗到期、用药到期、商品到期、健康计划到期四大场景）
- 灵活配置（每条记录可独立开启/关闭提醒，自定义提前提醒天数）
- 站内信通知（每日08:00自动扫描当日到期事项，生成站内信推送）
- 零遗漏保障（已过期但未提醒的事项自动补发，同一记录同一天不重复通知）

**关键文件：**
- `src/lib/supabase/schema.ts` - reminders 表、notifications 表
- `src/app/api/v1/reminders/` - 提醒 API（6个端点）
- `src/app/api/v1/notifications/` - 通知 API（4个端点）

**提醒生成逻辑：**
```typescript
// 创建/更新记录时
if (record.reminder_enabled && record.next_date && record.reminder_days) {
  const reminderDate = subtractDays(record.next_date, record.reminder_days);
  
  if (reminderDate <= today()) {
    // 到期日已过或今天到期 → 立即生成通知
    await db.insert(notifications).values({...});
  }
  
  // 写入 reminders（UPSERT）
  await db.insert(reminders).values({
    related_id: record.id,
    related_type: '疫苗到期', // 或 '用药到期' / '商品到期' / '计划到期'
    reminder_date: reminderDate,
    ...
  }).onConflictDoUpdate({...});
}

// 删除记录时
await db.delete(reminders).where(
  and(eq(reminders.related_id, id), eq(reminders.related_type, '疫苗到期'))
);
```

### 4.7 数据总览看板

**位置：** `src/app/(main)/profile/dashboard/`

**功能：**
- 7大模块聚合展示（宠物切换区、状态卡片、下一项重要事项、今日待办、未来30天事项、到期商品提醒、最近健康记录）

### 4.8 个人中心

**位置：** `src/app/(main)/profile/`

**功能：**
- 用户信息卡片（头像、昵称、会员等级、注册陪伴天数）
- 我的宠物（宠物列表卡片）
- 养宠数据（已完成疫苗数、健康记录数、健康计划数）
- 屯粮情况（按品类展示库存余量）

### 4.9 管理后台

**位置：** `src/app/(main)/admin/`

**功能：**
- 数据概览（用户数、宠物数、记录数等核心运营指标）
- 用户管理
- 反馈管理
- 品类管理
- 系统配置（验证码开关、密码复杂度配置等）

**权限控制：**
```typescript
// middleware.ts 或 lib/admin-guard.ts
export function requireAdmin(userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user || user.role !== 'super_admin') {
    throw new Error('403: 无权访问管理后台');
  }
}
```

---

## 5. 数据库表结构（17张表）

**位置：** `src/lib/supabase/schema.ts`

### 核心表

1. **users** - 用户表
2. **pets** - 宠物表
3. **products** - 商品表
4. **pet_products** - 宠物-商品关联表（多对多）
5. **product_categories** - 商品品类表（含开封后保质期数据）
6. **vaccine_records** - 疫苗记录表
7. **medication_records** - 用药记录表
8. **health_plans** - 健康计划表
9. **health_records** - 健康记录表
10. **reminders** - 提醒表
11. **notifications** - 通知表

### 辅助表

12. **login_attempts** - 登录失败记录表
13. **token_blacklist** - JWT 黑名单表
14. **system_settings** - 系统设置表
15. **captcha_sessions** - 图形验证码会话表
16. **feedbacks** - 用户反馈表
17. **breeds** - 品种表（预留）

### 表关系

```
users ──1:N──> pets
users ──1:N──> products
users ──1:N──> health_plans
users ──1:N──> health_records
users ──1:N──> reminders
users ──1:N──> vaccine_records
users ──1:N──> medication_records
users ──1:N──> feedbacks
users ──1:N──> notifications

pets ──1:N──> notifications
pets ──1:N──> vaccine_records
pets ──1:N──> medication_records
pets ──1:N──> health_plans
pets ──1:N──> health_records
pets ──1:N──> reminders
pets ──M:N──> products (via pet_products)

products ──M:N──> pets (via pet_products)
products ──N:1──> product_categories

health_plans ──1:1──> health_records (related_record_id)
```

---

## 6. API 路由规范

### 6.1 路由结构

所有 API 路由放在 `src/app/api/v1/` 目录下，共 67 个端点。

### 6.2 请求格式

```typescript
// 请求头
Content-Type: application/json
Authorization: Bearer <jwt_token>

// 成功响应
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}

// 列表响应（带分页）
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}

// 错误响应
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "参数校验失败",
    "details": [
      { "field": "email", "message": "邮箱格式不正确" }
    ]
  }
}
```

### 6.3 HTTP 状态码

| 状态码 | 含义 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证/Token 无效 |
| 403 | 无权限（数据不属于当前用户） |
| 404 | 资源不存在 |
| 409 | 冲突（如邮箱已注册） |
| 423 | 账号已锁定 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

---

## 7. 开发规范与约束

### 7.1 组件开发规范

**必须遵守：**
- ✅ 使用函数组件 + TypeScript
- ✅ Props 必须定义 interface
- ✅ 使用 shadcn/ui 组件库，不要自己写 Button、Input、Select 等基础组件
- ✅ 样式用 Tailwind CSS，不要写 CSS 文件
- ✅ Server Components 优先，客户端交互用 Client Components

**禁止行为：**
- ❌ 不要创建自定义的 Button、Input、Select 等基础 UI 组件
- ❌ 不要引入新的依赖库（先问我）
- ❌ 不要使用 class 组件
- ❌ 不要使用 any 类型

**示例：**
```tsx
// ✅ 正确
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PetFormProps {
  onSubmit: (data: PetFormData) => void;
  loading?: boolean;
}

export function PetForm({ onSubmit, loading }: PetFormProps) {
  return (
    <form onSubmit={...}>
      <Input placeholder="宠物名字" />
      <Button type="submit" disabled={loading}>提交</Button>
    </form>
  );
}

// ❌ 错误
export function CustomButton({ children }) {
  return <button className="...">{children}</button>;
}
```

### 7.2 数据获取规范

**必须遵守：**
- ✅ 统一使用 `src/lib/supabase/client.ts` 的 supabase 实例
- ✅ 数据获取用 Server Components
- ✅ 数据修改用 Server Actions 或 API Routes
- ✅ 所有数据库操作通过 Drizzle ORM

**示例：**
```typescript
// ✅ 正确 - Server Component
import { db } from '@/lib/supabase/client';
import { pets } from '@/lib/supabase/schema';

export default async function PetsPage() {
  const petsList = await db.query.pets.findMany({
    where: eq(pets.user_id, userId),
  });
  
  return <PetList data={petsList} />;
}

// ✅ 正确 - Server Action
'use server';

import { db } from '@/lib/supabase/client';
import { pets } from '@/lib/supabase/schema';

export async function createPet(formData: FormData) {
  const name = formData.get('name') as string;
  
  await db.insert(pets).values({
    name,
    user_id: userId,
    // ...
  });
}
```

### 7.3 类型定义规范

**必须遵守：**
- ✅ 所有类型放在 `src/types/` 目录
- ✅ 数据库类型从 Drizzle schema 自动生成
- ✅ 不要重复定义类型

**示例：**
```typescript
// ✅ 正确 - 在 src/types/pet.ts 中定义
export interface Pet {
  id: string;
  user_id: string;
  name: string;
  type: PetType;
  breed: string;
  gender: '公' | '母' | '其他';
  birthday?: string;
  weight?: number;
  sterilized?: boolean;
  // ...
}

// ✅ 正确 - 在组件中导入
import { Pet } from '@/types/pet';

interface PetListProps {
  data: Pet[];
}
```

### 7.4 API 开发规范

**必须遵守：**
- ✅ API 路由放在 `src/app/api/v1/` 目录
- ✅ 使用 Route Handlers（GET、POST、PUT、DELETE 函数）
- ✅ 所有 API 必须做认证校验（除了公开接口）
- ✅ 所有数据查询必须加 user_id 过滤（数据隔离）
- ✅ 返回统一格式的响应

**示例：**
```typescript
// src/app/api/v1/pets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase/client';
import { pets } from '@/lib/supabase/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/jwt';

// GET /api/v1/pets - 获取宠物列表
export async function GET(request: NextRequest) {
  try {
    // 1. 认证校验
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const userId = verifyToken(token);
    
    // 2. 查询数据（加 user_id 过滤）
    const petsList = await db.query.pets.findMany({
      where: eq(pets.user_id, userId),
    });
    
    // 3. 返回统一格式
    return NextResponse.json({
      success: true,
      data: petsList,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: '未认证' } },
      { status: 401 }
    );
  }
}
```

### 7.5 样式规范

**必须遵守：**
- ✅ 使用 Tailwind CSS 原子化类
- ✅ 使用 shadcn/ui 的主题变量（--primary、--secondary 等）
- ✅ 响应式设计（mobile first）

**禁止行为：**
- ❌ 不要写 CSS 文件
- ❌ 不要使用内联样式（style={{}}）
- ❌ 不要使用 CSS-in-JS 库

**示例：**
```tsx
// ✅ 正确
<div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg">
  <h2 className="text-lg font-semibold text-primary">标题</h2>
</div>

// ❌ 错误
<div style={{ display: 'flex', padding: '16px' }}>
  <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>标题</h2>
</div>
```

---

## 8. 代码复用指南

### 8.1 复用优先级

**开发新功能时，按以下顺序查找可复用的代码：**

1. **shadcn/ui 组件**（`src/components/ui/`）
   - Button、Input、Select、Dialog、Card 等基础组件
   - **禁止重复实现这些基础组件**

2. **业务组件**（`src/components/[模块]/`）
   - PetForm、PetList、ProductForm、ProductList 等
   - 先查看是否已有类似组件，再决定是复用还是新建

3. **工具函数**（`src/lib/utils/`）
   - 日期处理、数据校验、格式化等
   - 先查看 `src/lib/utils/date.ts`、`src/lib/utils/validation.ts`

4. **类型定义**（`src/types/`）
   - 所有类型已定义，直接导入使用
   - **禁止重复定义类型**

5. **常量定义**（`src/lib/constants/`）
   - 宠物类型、疫苗预设、商品品类等
   - 直接导入使用，不要硬编码

### 8.2 复用检查清单

**开发新功能前，先问自己：**

- [ ] 这个 UI 组件是否在 `src/components/ui/` 中已有？
- [ ] 这个业务组件是否在 `src/components/[模块]/` 中已有？
- [ ] 这个工具函数是否在 `src/lib/utils/` 中已有？
- [ ] 这个类型是否在 `src/types/` 中已有？
- [ ] 这个常量是否在 `src/lib/constants/` 中已有？

### 8.3 复用示例

**场景：开发一个宠物编辑表单**

```typescript
// ✅ 正确 - 复用现有代码
import { PetForm } from '@/components/pets/PetForm';
import { Pet } from '@/types/pet';
import { PET_TYPES } from '@/lib/constants/pet-types';
import { updatePet } from '@/lib/supabase/pets';

export default function PetEditPage({ params }: { params: { id: string } }) {
  const [pet, setPet] = useState<Pet | null>(null);
  
  // 复用 PetForm 组件
  return <PetForm initialData={pet} onSubmit={updatePet} />;
}

// ❌ 错误 - 重复实现
export default function PetEditPage() {
  return (
    <form>
      <input type="text" placeholder="宠物名字" /> {/* 应该用 shadcn/ui Input */}
      <select> {/* 应该用 shadcn/ui Select */}
        <option>猫</option>
        <option>狗</option>
      </select>
      <button>提交</button> {/* 应该用 shadcn/ui Button */}
    </form>
  );
}
```

---

## 9. 禁止行为清单

**以下行为严格禁止，违反会导致代码冲突或质量问题：**

### 9.1 代码重复
- ❌ 不要重新定义已存在的类型（在 `src/types/` 中）
- ❌ 不要重新实现已存在的工具函数（在 `src/lib/utils/` 中）
- ❌ 不要重新创建已存在的组件（在 `src/components/` 中）
- ❌ 不要硬编码常量（在 `src/lib/constants/` 中）

### 9.2 数据库相关
- ❌ 不要修改 `src/lib/supabase/schema.ts`（数据库结构已稳定）
- ❌ 不要删除任何数据库表或字段
- ❌ 不要直接操作数据库（必须通过 Drizzle ORM）

### 9.3 依赖管理
- ❌ 不要引入新的依赖库（先问我）
- ❌ 不要升级现有依赖版本（可能导致兼容性问题）
- ❌ 不要使用已废弃的 API

### 9.4 文件操作
- ❌ 不要删除任何现有文件
- ❌ 不要重命名现有文件（可能导致导入错误）
- ❌ 不要移动现有文件到不同目录

### 9.5 代码风格
- ❌ 不要使用 class 组件
- ❌ 不要使用 any 类型
- ❌ 不要使用内联样式
- ❌ 不要写 CSS 文件
- ❌ 不要使用 CSS-in-JS 库

---

## 10. 开发新功能的标准流程

### 10.1 步骤一：理解需求

**先问自己：**
- 这个功能属于哪个模块？（宠物/商品/疫苗/用药/计划/记录/提醒）
- 这个功能需要哪些数据？（查看 `src/lib/supabase/schema.ts`）
- 这个功能需要哪些 API？（查看 `src/app/api/v1/`）
- 这个功能需要哪些组件？（查看 `src/components/[模块]/`）

### 10.2 步骤二：查找可复用代码

**按照第 8 章的复用检查清单，逐一检查：**
- UI 组件（`src/components/ui/`）
- 业务组件（`src/components/[模块]/`）
- 工具函数（`src/lib/utils/`）
- 类型定义（`src/types/`）
- 常量定义（`src/lib/constants/`）

### 10.3 步骤三：开发新功能

**按照第 7 章的开发规范，开发新功能：**
- 组件开发规范
- 数据获取规范
- 类型定义规范
- API 开发规范
- 样式规范

### 10.4 步骤四：测试验证

**开发完成后，验证：**
- [ ] 代码是否符合开发规范？
- [ ] 是否复用了现有代码？
- [ ] 是否有重复定义的类型/函数/组件？
- [ ] 是否引入了新的依赖？（如果有，需要先问我）
- [ ] 功能是否正常工作？

---

## 11. 常见问题解答

### Q1: 我需要用一个新的 UI 组件，但 shadcn/ui 没有怎么办？

**A:** 先查看 `src/components/common/` 是否已有类似组件。如果没有，可以：
1. 用现有的 shadcn/ui 组件组合实现
2. 如果确实需要新组件，先在 `src/components/common/` 中创建，并告诉我

### Q2: 我需要修改数据库表结构怎么办？

**A:** 数据库结构已稳定，**不要修改** `src/lib/supabase/schema.ts`。如果需要新增字段或表，先告诉我，我来评估影响。

### Q3: 我需要引入一个新的依赖库怎么办？

**A:** **不要直接引入**，先告诉我你想用什么库、为什么用，我来评估是否合适。

### Q4: 我发现现有代码有 bug 怎么办？

**A:** 如果是小 bug，可以直接修复。如果是大 bug 或涉及核心逻辑，先告诉我，我来评估修复方案。

### Q5: 我不确定某个功能是否已经实现了怎么办？

**A:** 先查看本文档的第 4 章（核心功能模块），了解已实现的功能。如果不确定，可以问我。

---

## 12. 联系与反馈

**如果你在开发过程中遇到任何问题，或者需要帮助：**

1. 先查看本文档是否已有答案
2. 查看 `DEV-GUIDE.md` 获取更详细的功能说明
3. 查看 `src/` 目录下的现有代码，了解实现方式
4. 如果仍然不确定，告诉我，我来帮你解答

---

## 附录：快速参考

### 关键文件路径

| 文件 | 路径 | 说明 |
|------|------|------|
| 数据库 Schema | `src/lib/supabase/schema.ts` | 17张表定义 |
| Supabase 客户端 | `src/lib/supabase/client.ts` | 数据库连接 |
| 认证中间件 | `src/lib/auth/middleware.ts` | JWT 验证 |
| 宠物类型 | `src/types/pet.ts` | 宠物相关类型 |
| 商品类型 | `src/types/product.ts` | 商品相关类型 |
| 疫苗预设 | `src/lib/constants/vaccine-presets.ts` | 疫苗名称预设 |
| 商品品类 | `src/lib/constants/categories.ts` | 品类及开封后保质期 |
| 日期工具 | `src/lib/utils/date.ts` | 日期处理函数 |
| 校验工具 | `src/lib/utils/validation.ts` | Zod 校验规则 |

### 常用命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 启动生产服务
npm start

# 数据库迁移
npm run db:migrate

# 数据库生成（Drizzle schema → SQL）
npm run db:generate
```

---

**文档版本：** v1.0  
**最后更新：** 2026-08-12  
**维护者：** 小煤球（AI 助手）

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。
