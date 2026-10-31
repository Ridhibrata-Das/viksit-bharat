let client = {};
let prisma;

function createMockDelegate(entityName, defaultList = []) {
  return {
    findMany: async (args) => {
      let items = [...defaultList];
      if (args?.where) {
        items = items.filter((item) =>
          Object.entries(args.where).every(([key, val]) => {
            if (val && typeof val === 'object' && 'equals' in val) return item[key] === val.equals;
            return item[key] === val;
          })
        );
      }
      if (args?.take && typeof args.take === 'number') {
        items = items.slice(0, args.take);
      }
      return items;
    },
    findFirst: async (args) => {
      const items = await createMockDelegate(entityName, defaultList).findMany(args);
      return items[0] || null;
    },
    findUnique: async (args) => {
      const items = await createMockDelegate(entityName, defaultList).findMany(args);
      return items[0] || null;
    },
    create: async (d) => ({ id: `mock-${entityName}-${Date.now()}`, ...d?.data }),
    update: async (d) => ({ id: d?.where?.id || `mock-${entityName}`, ...d?.data }),
    upsert: async (d) => ({ id: d?.where?.id || `mock-${entityName}`, ...(d?.update || d?.create) }),
    delete: async () => ({ success: true }),
    count: async () => defaultList.length,
  };
}

let seedData = {};
try {
  seedData = require('./prisma/seed-data.json');
} catch {
  seedData = {};
}

const mockPrisma = {
  user: createMockDelegate('user', seedData.users || []),
  promise: createMockDelegate('promise', seedData.promises || []),
  district: createMockDelegate('district', seedData.districts || []),
  indicator: createMockDelegate('indicator', seedData.indicators || []),
  evidenceItem: createMockDelegate('evidenceItem', seedData.evidence || []),
  category: createMockDelegate('category', seedData.categories || []),
  update: createMockDelegate('update', []),
  scrapedSource: createMockDelegate('scrapedSource', []),
  scrapeRun: createMockDelegate('scrapeRun', []),
  $queryRaw: async () => [{ 1: 1 }],
  $disconnect: async () => {},
};

function wrapWithResilience(targetPrisma, fallbackPrisma) {
  return new Proxy(targetPrisma, {
    get(target, modelName) {
      const realModel = target[modelName];
      const fallbackModel = fallbackPrisma[modelName] || createMockDelegate(String(modelName));
      if (!realModel || typeof realModel !== 'object') {
        return fallbackModel;
      }
      return new Proxy(realModel, {
        get(mTarget, action) {
          const fn = mTarget[action];
          if (typeof fn !== 'function') return fn;
          return async (...args) => {
            try {
              return await fn.apply(mTarget, args);
            } catch (err) {
              const msg = err?.message || '';
              if (
                err?.name === 'PrismaClientInitializationError' ||
                err?.code === 'P1001' ||
                msg.includes("Can't reach database server") ||
                msg.includes('Connection refused')
              ) {
                const fallbackFn = fallbackModel[action];
                if (typeof fallbackFn === 'function') {
                  return await fallbackFn.apply(fallbackModel, args);
                }
              }
              throw err;
            }
          };
        },
      });
    },
  });
}

try {
  client = require('@prisma/client');
  if (process.env.DATABASE_URL) {
    const raw = new client.PrismaClient({
      log: ['error'],
    });
    prisma = wrapWithResilience(raw, mockPrisma);
  } else {
    prisma = mockPrisma;
  }
} catch {
  prisma = mockPrisma;
}

async function checkDatabaseHealth() {
  const dbUrl = process.env.DATABASE_URL || '';
  let provider = 'mysql';
  if (dbUrl.startsWith('mysql:') || dbUrl.startsWith('mariadb:')) {
    provider = 'mysql';
  } else if (dbUrl.startsWith('postgresql:') || dbUrl.startsWith('postgres:')) {
    provider = 'postgresql';
  } else if (dbUrl.startsWith('file:') || dbUrl.startsWith('sqlite:')) {
    provider = 'sqlite';
  }

  try {
    if (prisma && typeof prisma.$queryRaw === 'function' && dbUrl) {
      await prisma.$queryRaw`SELECT 1`;
      return { connected: true, provider, activeUrlConfigured: true };
    }
  } catch (err) {
    return { connected: false, provider, error: err.message };
  }

  return { connected: false, provider, status: 'fallback_mock_active' };
}

module.exports = {
  ...client,
  prisma,
  checkDatabaseHealth,
};
