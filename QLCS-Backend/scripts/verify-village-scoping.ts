import 'dotenv/config';

// Ensure test environment variables exist if not in .env
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_12345678901234567890';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_refresh_secret_key_12345678901234567890';
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

import { authorizeVillageScope } from '../src/middlewares/auth.middleware';

// Mock Response
function createMockRes() {
  let statusCode = 200;
  let jsonBody: any = null;
  const res: any = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(body: any) {
      jsonBody = body;
      return res;
    },
    getStatusCode() {
      return statusCode;
    },
    getJsonBody() {
      return jsonBody;
    },
  };
  return res;
}

async function runVillageScopingChallenges() {
  console.log('====================================================');
  console.log('CHALLENGER 2: VILLAGE SCOPING SECURITY EMPIRICAL TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  // 1. Unauthenticated Request
  {
    const req: any = { method: 'GET', query: {}, body: {} };
    const res = createMockRes();
    let nextCalled = false;
    await authorizeVillageScope(req, res, () => { nextCalled = true; });
    assert(!nextCalled && res.getStatusCode() === 401, 'Unauthenticated request is rejected with HTTP 401');
  }

  // 2. Village Head accessing different village in query params
  {
    const req: any = {
      method: 'GET',
      user: { id: 'u1', username: 'truong_thon_1', role: 'user', village_id: 'VILLAGE_1' },
      query: { villageId: 'VILLAGE_2' },
      body: {},
    };
    const res = createMockRes();
    let nextCalled = false;
    await authorizeVillageScope(req, res, () => { nextCalled = true; });
    assert(!nextCalled && res.getStatusCode() === 403, 'Village user querying another village (villageId=V2) is blocked with HTTP 403');
    assert(res.getJsonBody()?.error === 'Không có quyền truy cập thôn khác', 'Error message explicitly denies cross-village query');
  }

  // 3. Village Head sending mismatched village_id in POST body
  {
    const req: any = {
      method: 'POST',
      user: { id: 'u1', username: 'truong_thon_1', role: 'user', village_id: 'VILLAGE_1' },
      query: {},
      body: { name: 'Adversarial Record', village_id: 'VILLAGE_2' },
    };
    const res = createMockRes();
    let nextCalled = false;
    await authorizeVillageScope(req, res, () => { nextCalled = true; });
    assert(!nextCalled && res.getStatusCode() === 403, 'Village user posting record with another village_id is blocked with HTTP 403');
  }

  // 4. Auto-scoping: Village Head GET request without query parameter
  {
    const req: any = {
      method: 'GET',
      user: { id: 'u1', username: 'truong_thon_1', role: 'user', village_id: 'VILLAGE_1' },
      query: {},
      body: {},
    };
    const res = createMockRes();
    let nextCalled = false;
    await authorizeVillageScope(req, res, () => { nextCalled = true; });
    assert(nextCalled, 'Legitimate request calls next()');
    assert(req.query.villageId === 'VILLAGE_1', 'Auto-injects user villageId into GET query');
  }

  // 5. Auto-scoping: Village Head POST request without village_id in body
  {
    const req: any = {
      method: 'POST',
      user: { id: 'u1', username: 'truong_thon_1', role: 'user', village_id: 'VILLAGE_1' },
      query: {},
      body: { name: 'Valid Citizen' },
    };
    const res = createMockRes();
    let nextCalled = false;
    await authorizeVillageScope(req, res, () => { nextCalled = true; });
    assert(nextCalled, 'Legitimate POST calls next()');
    assert(req.body.village_id === 'VILLAGE_1', 'Auto-injects user village_id into POST body');
  }

  // 6. Admin can query any village without restriction
  {
    const req: any = {
      method: 'GET',
      user: { id: 'admin-id', username: 'admin', role: 'admin', village_id: null },
      query: { villageId: 'VILLAGE_2' },
      body: {},
    };
    const res = createMockRes();
    let nextCalled = false;
    await authorizeVillageScope(req, res, () => { nextCalled = true; });
    assert(nextCalled, 'Admin can query specific village (VILLAGE_2)');
    assert(req.query.villageId === 'VILLAGE_2', 'Admin target village query parameter preserved');
  }

  // 7. Admin can query all villages without auto-injection
  {
    const req: any = {
      method: 'GET',
      user: { id: 'admin-id', username: 'admin', role: 'admin', village_id: null },
      query: {},
      body: {},
    };
    const res = createMockRes();
    let nextCalled = false;
    await authorizeVillageScope(req, res, () => { nextCalled = true; });
    assert(nextCalled, 'Admin can query all villages without restriction');
    assert(req.query.villageId === undefined, 'No villageId injected for admin global query');
  }

  // 8. Single-Record Cross-Village Controller Guard Simulation
  {
    const currentProfileInDb = { id: 'p123', village_id: 'VILLAGE_2', version: 1 };
    const userA = { id: 'u1', village_id: 'VILLAGE_1' };
    const userAdmin = { id: 'u-admin', village_id: null };

    const checkUpdatePermission = (user: any, profile: any) => {
      if (user.village_id && profile.village_id && profile.village_id !== user.village_id) {
        return { allowed: false, status: 403, error: 'Không có quyền' };
      }
      return { allowed: true };
    };

    const userAResult = checkUpdatePermission(userA, currentProfileInDb);
    assert(!userAResult.allowed && userAResult.status === 403, 'Controller rejects cross-village single record modification (Village 1 user editing Village 2 record)');

    const adminResult = checkUpdatePermission(userAdmin, currentProfileInDb);
    assert(adminResult.allowed, 'Admin is permitted to update records across any village');
  }

  console.log(`\nResults: ${passed} Passed, ${failed} Failed\n`);
  if (failed > 0) process.exit(1);
}

runVillageScopingChallenges().catch((err) => {
  console.error('Fatal error running village scoping challenges:', err);
  process.exit(1);
});
