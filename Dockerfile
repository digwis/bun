# 使用官方Bun镜像作为基础镜像
FROM oven/bun:1.2.4-slim

# 设置工作目录
WORKDIR /app

# 复制package.json
COPY package.json ./

# 安装依赖
RUN bun install --frozen-lockfile

# 复制项目文件
COPY . .

# 生成Prisma客户端
RUN bunx prisma generate

# 安装Tailwind CSS
RUN bun add tailwindcss@4.0.9

# 暴露端口
EXPOSE 3000

# 启动应用（包含CSS构建）
CMD ["sh", "-c", "mkdir -p ./src/public/css && bunx tailwindcss -i ./src/public/css/styles.css -o ./src/public/css/tailwind.css --minify && bun run start"]
