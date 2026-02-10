# PostgreSQL 15 + pgvector Docker 镜像说明

## 概述
本项目提供了一个集成了 `pgvector` 扩展的 PostgreSQL 15 Docker 镜像，专门用于向量相似性搜索和机器学习应用场景。

## 特性
- 基于官方 PostgreSQL 15 镜像
- 预装 `pgvector` 扩展（默认版本 v0.5.1）
- 多阶段构建优化镜像大小
- 内置健康检查和初始化验证
- 支持动态版本配置

## 构建镜像

### 本地构建
```bash
# 使用默认版本构建
docker build -t pg15-vector:latest .

# 指定pgvector版本构建
docker build --build-arg PGVECTOR_VERSION=v0.6.0 -t pg15-vector:v0.6.0 .
```

### 使用GitHub Actions构建
推送代码到 `main` 分支或手动触发工作流，会自动构建并上传到 GitHub Artifacts。

## 运行容器

### 基本运行
```bash
docker run -d \
  --name my-pgvector \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_DB=mydb \
  -p 5432:5432 \
  pg15-vector:latest
```

### 使用docker-compose
```yaml
version: '3.8'
services:
  database:
    image: pg15-vector:latest
    container_name: pgvector-db
    environment:
      POSTGRES_PASSWORD: mypassword
      POSTGRES_USER: myuser
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U myuser"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  pgdata:
```

## 验证pgvector扩展

连接到数据库后执行以下命令验证扩展：

```sql
-- 创建扩展（如果尚未创建）
CREATE EXTENSION IF NOT EXISTS vector;

-- 验证扩展版本
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';

-- 测试向量操作
SELECT '[1,2,3]'::vector;
```

## 使用示例

### 创建向量表
```sql
CREATE TABLE items (
    id bigserial PRIMARY KEY,
    embedding vector(3)
);

INSERT INTO items (embedding) VALUES 
    ('[1,2,3]'),
    ('[4,5,6]'),
    ('[7,8,9]');
```

### 向量相似性查询
```sql
-- 计算欧几里得距离
SELECT id, embedding <-> '[3,1,2]' AS distance 
FROM items 
ORDER BY embedding <-> '[3,1,2]' 
LIMIT 5;

-- 计算内积
SELECT id, embedding <#> '[3,1,2]' AS similarity 
FROM items 
ORDER BY embedding <#> '[3,1,2]' 
LIMIT 5;
```

## 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PGVECTOR_VERSION` | `v0.5.1` | pgvector扩展版本 |
| `POSTGRES_PASSWORD` | 无 | 数据库密码（必需） |
| `POSTGRES_USER` | `postgres` | 数据库用户名 |
| `POSTGRES_DB` | `postgres` | 默认数据库名 |

## 性能优化建议

1. **索引优化**：
```sql
-- 创建IVFFlat索引
CREATE INDEX ON items USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);

-- 创建HNSW索引（需要pgvector v0.5.0+）
CREATE INDEX ON items USING hnsw (embedding vector_l2_ops);
```

2. **内存配置**：
```bash
# 在docker run中添加
-e POSTGRES_INITDB_ARGS="--shared_buffers=256MB --effective_cache_size=1GB"
```

## 故障排除

### 常见问题

1. **扩展无法加载**：
   - 检查容器日志：`docker logs container_name`
   - 验证扩展文件是否存在：`ls /usr/local/lib/postgresql/*/extension/vector*`

2. **连接拒绝**：
   - 确认端口映射正确
   - 检查防火墙设置
   - 验证容器是否正常运行：`docker ps`

3. **性能问题**：
   - 增加容器资源限制
   - 优化查询和索引
   - 调整PostgreSQL配置参数

## 更新日志

- **v1.0.0**：初始版本，集成pgvector v0.5.1
- **多阶段构建**：优化镜像大小
- **健康检查**：添加容器健康状态监控
- **动态版本支持**：支持构建时指定pgvector版本

## 许可证
遵循PostgreSQL许可证条款。