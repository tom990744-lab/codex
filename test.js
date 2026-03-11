const assert = require('assert');
const { createSnowflakeIdGenerator, parseSnowflakeId } = require('./snowflake');

const generator = createSnowflakeIdGenerator({ datacenterId: 1, workerId: 2 });
const id1 = generator.nextId();
const id2 = generator.nextId();

assert.ok(id2 > id1, 'IDs should be monotonic');

const parsed = parseSnowflakeId(id1);
assert.strictEqual(parsed.datacenterId, 1n);
assert.strictEqual(parsed.workerId, 2n);
assert.ok(parsed.timestamp > 0n);

const p1 = parseSnowflakeId('819496711306084400');
const p2 = parseSnowflakeId('1831652625678995456');
assert.notStrictEqual(p1.timestamp, p2.timestamp);

console.log('ok');
