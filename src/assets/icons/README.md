# TabBar 图标文件清单

以下是微信小程序 TabBar 所需的所有图标文件（81x81px PNG）：

## 已生成图标

| 文件名 | 用途 | 颜色 |
|--------|------|------|
| `home.png` | 首页-默认 | #6B7280 灰 |
| `home-active.png` | 首页-选中 | #FF6B5B 珊瑚红 |
| `pet.png` | 宠物-默认 | #94A3B8 灰 |
| `pet-active.png` | 宠物-选中 | #FF6B5B 珊瑚红 |
| `vaccine.png` | 疫苗-默认 | #6B7280 灰 |
| `vaccine-active.png` | 疫苗-选中 | #FF6B5B 珊瑚红 |
| `medication.png` | 用药-默认 | #6B7280 灰 |
| `medication-active.png` | 用药-选中 | #FF6B5B 珊瑚红 |
| `product.png` | 商品-默认 | #94A3B8 灰 |
| `product-active.png` | 商品-选中 | #FF6B5B 珊瑚红 |
| `notification.png` | 通知-默认 | #94A3B8 灰 |
| `notification-active.png` | 通知-选中 | #FF6B5B 珊瑚红 |
| `profile.png` | 我的-默认 | #94A3B8 灰 |
| `profile-active.png` | 我的-选中 | #FF6B5B 珊瑚红 |

图标采用统一的线性风格，选中态与网页主色 `#FF6B5B` 一致。

**要求**:
- 尺寸: 81x81px (推荐 @3x: 243x243px)
- 格式: PNG (透明背景)
- 大小: <40KB
- 设计风格: 线性/面性图标，与产品调性一致

**常用图标库**:
- Lucide Icons: https://lucide.dev
- IconPark (字节): https://iconpark.oceanengine.com
- 阿里巴巴矢量图标库: https://iconfont.cn

重新生成图标:
```bash
powershell -ExecutionPolicy Bypass -File scripts/generate-tab-icons.ps1
```
