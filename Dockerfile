# 第一阶段：构建pgvector
FROM postgres:15 AS builder

# 支持动态传入pgvector版本参数
ARG PGVECTOR_VERSION=v0.5.1
ENV PGVECTOR_VERSION=${PGVECTOR_VERSION}

# 安装构建依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    wget \
    ca-certificates \
    build-essential \
    postgresql-server-dev-15 \
    && rm -rf /var/lib/apt/lists/*

# 下载并编译pgvector（使用release tarball更可靠）
RUN PGVECTOR_VER=$(echo ${PGVECTOR_VERSION} | sed 's/^v//') \
    && apt-get update && apt-get install -y --no-install-recommends wget ca-certificates \
    && wget -O /tmp/pgvector.tar.gz "https://github.com/pgvector/pgvector/archive/refs/tags/${PGVECTOR_VERSION}.tar.gz" \
    && tar -xzf /tmp/pgvector.tar.gz -C /tmp \
    && mv /tmp/pgvector-${PGVECTOR_VER} /tmp/pgvector \
    && cd /tmp/pgvector \
    && make clean \
    && make \
    && make install \
    && rm -rf /tmp/pgvector.tar.gz /var/lib/apt/lists/*

# 第二阶段：生产镜像
FROM postgres:15

# 维护者信息（可选）
LABEL maintainer="Your Name <your-email@example.com>"

# 设置环境变量，确保 pgvector 扩展默认启用
ENV POSTGRES_INITDB_ARGS="--enable-extensions=vector"

# 从构建阶段复制pgvector文件
COPY --from=builder /usr/lib/postgresql/15/lib/vector* /usr/lib/postgresql/15/lib/
COPY --from=builder /usr/share/postgresql/15/extension/vector* /usr/share/postgresql/15/extension/

# 确保容器启动时加载 pgvector 扩展（写入 postgresql.conf）
RUN echo "shared_preload_libraries = '\$libdir/vector'" >> /usr/share/postgresql/postgresql.conf.sample

# 创建初始化脚本，在PostgreSQL首次启动时自动启用pgvector
RUN echo '#!/bin/bash\n\
set -e\n\
echo "Enabling pgvector extension..."\n\
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL\n\
CREATE EXTENSION IF NOT EXISTS vector;\n\
EOSQL\n\
'\
> /docker-entrypoint-initdb.d/10-enable-vector.sh && chmod +x /docker-entrypoint-initdb.d/10-enable-vector.sh

# 使用PostgreSQL官方入口点
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["postgres"]

# 添加健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD pg_isready -U postgres || exit 1

# 暴露 PostgreSQL 默认端口
EXPOSE 5432
