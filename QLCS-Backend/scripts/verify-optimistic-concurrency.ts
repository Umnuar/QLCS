// Mock Response & Request
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

// In-memory simulator for QLCS Profile Update Controller Logic
function simulateQlcsUpdate(currentDbRecord: any, reqBody: any, user: any) {
  const res = createMockRes();

  if (!currentDbRecord) {
    res.status(404).json({ error: 'Không tìm thấy' });
    return res;
  }

  if (user.village_id && currentDbRecord.village_id && currentDbRecord.village_id !== user.village_id) {
    res.status(403).json({ error: 'Không có quyền' });
    return res;
  }

  // Optimistic locking logic
  if (reqBody.version !== undefined && reqBody.version !== currentDbRecord.version) {
    res.status(409).json({
      error: 'Hồ sơ đã được sửa bởi người khác',
      currentVersion: currentDbRecord.version,
    });
    return res;
  }

  // Success update
  const updatedRecord = {
    ...currentDbRecord,
    ...reqBody,
    version: (currentDbRecord.version || 1) + 1,
    updated_at: new Date(),
  };

  res.status(200).json({ data: updatedRecord });
  return res;
}

// In-memory simulator for QLNN Household Update Controller Logic
function simulateQlnnUpdate(currentDbRecord: any, reqBody: any, user: any) {
  const res = createMockRes();

  if (!currentDbRecord) {
    res.status(404).json({ error: 'Không tìm thấy hộ nông nghiệp' });
    return res;
  }

  if (user.role === 'user' && user.village_id && currentDbRecord.village_id !== user.village_id) {
    res.status(403).json({ error: 'Không có quyền sửa dữ liệu thôn khác' });
    return res;
  }

  // Optimistic locking check in QLNN
  if (reqBody.version !== undefined && currentDbRecord.version !== reqBody.version) {
    res.status(409).json({
      error: 'Dữ liệu đã bị thay đổi bởi người khác. Vui lòng tải lại.',
    });
    return res;
  }

  // Success update
  const updatedRecord = {
    ...currentDbRecord,
    ...reqBody,
    version: (currentDbRecord.version || 1) + 1,
    updated_at: new Date(),
  };

  res.status(200).json({ data: updatedRecord });
  return res;
}

async function runConcurrencyChallenges() {
  console.log('====================================================');
  console.log('CHALLENGER 2: OPTIMISTIC CONCURRENCY EMPIRICAL TESTS');
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

  // 1. QLCS: Single valid update increments version from 1 -> 2
  {
    const initialRecord = { id: 'p1', name: 'Nguyễn Văn A', village_id: 'V1', version: 1 };
    const user = { id: 'u1', village_id: 'V1', role: 'user' };
    const res = simulateQlcsUpdate(initialRecord, { name: 'Nguyễn Văn B', version: 1 }, user);

    assert(res.getStatusCode() === 200, 'QLCS: Valid update succeeds with HTTP 200');
    assert(res.getJsonBody()?.data?.version === 2, 'QLCS: Version incremented to 2');
    assert(res.getJsonBody()?.data?.name === 'Nguyễn Văn B', 'QLCS: Data field updated');
  }

  // 2. QLCS: Race condition - Two concurrent updates starting at version 1
  {
    let dbRecord = { id: 'p1', name: 'Nguyễn Văn A', village_id: 'V1', version: 1 };
    const user1 = { id: 'u1', village_id: 'V1', role: 'user' };
    const user2 = { id: 'u2', village_id: 'V1', role: 'user' };

    // User 1 arrives first and commits
    const res1 = simulateQlcsUpdate(dbRecord, { name: 'Nguyễn Văn A - Sửa bởi User 1', version: 1 }, user1);
    assert(res1.getStatusCode() === 200, 'QLCS: First concurrent request succeeds');
    dbRecord = res1.getJsonBody().data; // DB state is now version 2

    // User 2 arrives with stale version 1
    const res2 = simulateQlcsUpdate(dbRecord, { name: 'Nguyễn Văn A - Sửa bởi User 2', version: 1 }, user2);
    assert(res2.getStatusCode() === 409, 'QLCS: Stale concurrent request is blocked with HTTP 409 Conflict');
    assert(res2.getJsonBody()?.currentVersion === 2, 'QLCS: Response includes latest currentVersion (2) for client resync');
    assert(res2.getJsonBody()?.error === 'Hồ sơ đã được sửa bởi người khác', 'QLCS: Conflict error message matches specification');
  }

  // 3. QLNN: Race condition on Household update
  {
    let dbRecord = { id: 'hh1', full_name: 'Trần Văn X', village_id: 'V1', version: 1 };
    const user1 = { id: 'u1', village_id: 'V1', role: 'user' };
    const user2 = { id: 'u2', village_id: 'V1', role: 'user' };

    // User 1 updates
    const res1 = simulateQlnnUpdate(dbRecord, { full_name: 'Trần Văn X - Cập nhật', version: 1 }, user1);
    assert(res1.getStatusCode() === 200, 'QLNN: User 1 update succeeds with version increment');
    dbRecord = res1.getJsonBody().data;

    // User 2 attempts update with old version
    const res2 = simulateQlnnUpdate(dbRecord, { full_name: 'Trần Văn X - Xung đột', version: 1 }, user2);
    assert(res2.getStatusCode() === 409, 'QLNN: Stale update rejected with HTTP 409 Conflict');
    assert(res2.getJsonBody()?.error.includes('Dữ liệu đã bị thay đổi bởi người khác'), 'QLNN: Conflict message matches specification');
  }

  // 4. Stale future version (version = 99)
  {
    const dbRecord = { id: 'p1', name: 'Nguyễn Văn A', village_id: 'V1', version: 1 };
    const user = { id: 'u1', village_id: 'V1', role: 'user' };
    const res = simulateQlcsUpdate(dbRecord, { name: 'Test', version: 99 }, user);
    assert(res.getStatusCode() === 409, 'Rejects future mismatched version with HTTP 409');
  }

  console.log(`\nResults: ${passed} Passed, ${failed} Failed\n`);
  if (failed > 0) process.exit(1);
}

runConcurrencyChallenges().catch((err) => {
  console.error('Fatal error running concurrency challenges:', err);
  process.exit(1);
});
