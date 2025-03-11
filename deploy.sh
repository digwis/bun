#!/bin/bash

# 在远程服务器上克隆代码并部署
echo "在远程服务器上部署服务..."
sshpass -p 'NZ0VphdP1wI8399iYo' ssh root@64.44.115.137 '
# 创建目录并克隆代码
mkdir -p /root/movie-app && \
cd /root/movie-app && \
rm -rf * && \
git clone https://github.com/digwis/bun.git . && \

# 使用 Docker Compose 构建和运行服务
docker compose up -d --build
'

echo "部署完成!"
