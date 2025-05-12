#!/bin/bash

# 确保已安装 ImageMagick
if ! command -v convert &> /dev/null; then
    echo "请先安装 ImageMagick: brew install imagemagick"
    exit 1
fi

# 创建 screenshots 目录
mkdir -p screenshots

# 从 SVG 生成不同尺寸的图标
convert -background none -size 128x128 images/icon.svg images/icon128.png
convert -background none -size 48x48 images/icon.svg images/icon48.png
convert -background none -size 16x16 images/icon.svg images/icon16.png

# 创建 440x280 的小图标（用于商店展示）
convert -background none -size 440x280 images/icon.svg -gravity center -extent 440x280 screenshots/promo_small.png

# 创建 1280x800 的截图
# 首先创建一个基础图片
convert -size 1280x800 xc:white screenshots/screenshot.png

# 在截图中心添加图标
convert screenshots/screenshot.png \
    \( images/icon.svg -resize 256x256 \) \
    -gravity center -composite \
    screenshots/screenshot.png

# 添加文字说明
convert screenshots/screenshot.png \
    -gravity center \
    -pointsize 40 \
    -annotate +0+100 "Simple Proxy Switcher" \
    -pointsize 24 \
    -annotate +0+160 "A simple and secure proxy switcher for Chrome" \
    screenshots/screenshot.png

echo "图片生成完成！"
echo "生成的图片位于："
echo "- 图标：images/icon16.png, icon48.png, icon128.png"
echo "- 商店小图标：screenshots/promo_small.png"
echo "- 商店截图：screenshots/screenshot.png" 