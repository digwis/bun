#!/bin/bash

# 构建 Docker 镜像
echo "构建 Docker 镜像..."
docker compose build

# 创建远程目录
echo "创建远程目录..."
sshpass -p 'NZ0VphdP1wI8399iYo' ssh root@64.44.115.137 'mkdir -p /root/movie-app'

# 复制必要文件到远程服务器
echo "复制文件到远程服务器..."
sshpass -p 'NZ0VphdP1wI8399iYo' scp docker-compose.yml root@64.44.115.137:/root/movie-app/
sshpass -p 'NZ0VphdP1wI8399iYo' scp -r prisma root@64.44.115.137:/root/movie-app/

# 保存并上传镜像
echo "保存 Docker 镜像..."
docker save movie-app:latest | gzip > movie-app.tar.gz

echo "上传 Docker 镜像到服务器..."
sshpass -p 'NZ0VphdP1wI8399iYo' scp movie-app.tar.gz root@64.44.115.137:/root/movie-app/

# 在远程服务器上加载镜像并启动服务
echo "在远程服务器上部署服务..."
sshpass -p 'NZ0VphdP1wI8399iYo' ssh root@64.44.115.137 '
cd /root/movie-app && \
gunzip -c movie-app.tar.gz | docker load && \
docker compose up -d
'

# 清理本地临时文件
echo "清理临时文件..."
rm movie-app.tar.gz

echo "部署完成!"
