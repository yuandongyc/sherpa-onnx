# 第一阶段：构建pgvector
FROM postgres:15 AS builder

# 支持动态传入pgvector版本参数
ARG PGVECTOR_VERSION=v0.5.1
ENV PGVECTOR_VERSION=${PGVECTOR_VERSION}

# 安装构建依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    build-essential \
    postgresql-server-dev-15 \
    && rm -rf /var/lib/apt/lists/*

# 克隆并编译pgvector
RUN git clone --depth 1 --branch ${PGVECTOR_VERSION} https://github.com/pgvector/pgvector.git /tmp/pgvector 2>&1 || \
    (echo "Git clone failed, retrying..." && sleep 5 && git clone --depth 1 --branch ${PGVECTOR_VERSION} https://github.com/pgvector/pgvector.git /tmp/pgvector) \
    && cd /tmp/pgvector \
    && make clean \
    && make \
    && make install

# 第二阶段：生产镜像
FROM postgres:15

# 维护者信息（可选）
LABEL maintainer="Your Name <your-email@example.com>"

# 设置环境变量，确保 pgvector 扩展默认启用
ENV POSTGRES_INITDB_ARGS="--enable-extensions=vector"

# 从构建阶段复制pgvector文件
COPY --from=builder /usr/local/lib/postgresql/*/extension/vector* /usr/local/lib/postgresql/*/extension/
COPY --from=builder /usr/local/share/postgresql/extension/vector* /usr/local/share/postgresql/extension/

# 确保容器启动时加载 pgvector 扩展（写入 postgresql.conf）
RUN echo "shared_preload_libraries = 'vector'" >> /usr/share/postgresql/postgresql.conf.sample

# 创建初始化脚本验证pgvector扩展
RUN echo '#!/bin/bash\n\
set -e\n\
echo "Checking pgvector extension..."\n\
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "CREATE EXTENSION IF NOT EXISTS vector;"\n\
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT extname, extversion FROM pg_extension WHERE extname = '\''vector'\'';"\n\
exec docker-entrypoint.sh postgres\n'\
> /usr/local/bin/init-pgvector.sh && chmod +x /usr/local/bin/init-pgvector.sh

# 设置入口点使用初始化脚本
ENTRYPOINT ["/usr/local/bin/init-pgvector.sh"]

# 添加健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD pg_isready -U postgres || exit 1

# 暴露 PostgreSQL 默认端口
EXPOSE 5432