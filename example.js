
const {
  DEFAULT_EPOCH,
  createSnowflakeIdGenerator,
  parseSnowflakeId,
} = require('./snowflake');

const generator = createSnowflakeIdGenerator({
  datacenterId: 1,
  workerId: 3,
});

const id = generator.nextIdString();
console.log('id:', id);

const decoded = parseSnowflakeId(id, DEFAULT_EPOCH);
console.log('decoded:', {
  timestamp: decoded.timestamp.toString(),
  datacenterId: decoded.datacenterId.toString(),
  workerId: decoded.workerId.toString(),
  sequence: decoded.sequence.toString(),
});

const a = parseSnowflakeId('819496711306084400');
const b = parseSnowflakeId('1831652625678995456');
console.log('compare:', {
  aTs: a.timestamp.toString(),
  bTs: b.timestamp.toString(),
  aNode: `${a.datacenterId}-${a.workerId}`,
  bNode: `${b.datacenterId}-${b.workerId}`,
});
const { createSnowflakeIdGenerator } = require('./snowflake');

const generator = createSnowflakeIdGenerator({
  datacenterId: 1n,
  workerId: 3n,
});

console.log(generator.nextIdString());
console.log(generator.nextIdString());
