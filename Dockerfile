# 使用官方Bun镜像作为基础镜像
FROM oven/bun:1.2.4-slim

# 设置工作目录
WORKDIR /app

# 复制package.json和bun.lockb
COPY package.json bun.lockb ./

# 安装依赖
RUN bun install --frozen-lockfile

# 复制项目文件
COPY . .

# 生成Prisma客户端
RUN bunx prisma generate

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["bun", "run", "start"]