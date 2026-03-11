/**
 * Snowflake (64-bit) layout:
 * 1 bit unused + 41 bits timestamp + 5 bits datacenter + 5 bits worker + 12 bits sequence
 */
const WORKER_ID_BITS = 5n;
const DATACENTER_ID_BITS = 5n;
const SEQUENCE_BITS = 12n;

const MAX_WORKER_ID = (1n << WORKER_ID_BITS) - 1n;
const MAX_DATACENTER_ID = (1n << DATACENTER_ID_BITS) - 1n;
const SEQUENCE_MASK = (1n << SEQUENCE_BITS) - 1n;

const WORKER_ID_SHIFT = SEQUENCE_BITS;
const DATACENTER_ID_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS;
const TIMESTAMP_LEFT_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS + DATACENTER_ID_BITS;

// Twitter Snowflake epoch: 2010-11-04T01:42:54.657Z
const DEFAULT_EPOCH = 1288834974657n;

/**
 * Create a Snowflake ID generator.
 *
 * @param {object} [options]
 * @param {bigint|number|string} [options.epoch=1288834974657n]
 * @param {bigint|number|string} [options.datacenterId=0n] 0~31
 * @param {bigint|number|string} [options.workerId=0n] 0~31
 */
function createSnowflakeIdGenerator(options = {}) {
  const {
    epoch = DEFAULT_EPOCH,
    datacenterId = 0n,
    workerId = 0n,
  } = options;

  const EPOCH = BigInt(epoch);
  const DATACENTER_ID = BigInt(datacenterId);
  const WORKER_ID = BigInt(workerId);

  if (WORKER_ID < 0n || WORKER_ID > MAX_WORKER_ID) {
    throw new RangeError(`workerId must be between 0 and ${MAX_WORKER_ID}`);
  }

  if (DATACENTER_ID < 0n || DATACENTER_ID > MAX_DATACENTER_ID) {
    throw new RangeError(`datacenterId must be between 0 and ${MAX_DATACENTER_ID}`);
  }

  let sequence = 0n;
  let lastTimestamp = -1n;

  const now = () => BigInt(Date.now());

  const waitNextMillis = (current) => {
    let ts = now();
    while (ts <= current) {
      ts = now();
    }
    return ts;
  };

  const nextId = () => {
    let timestamp = now();

    if (timestamp < lastTimestamp) {
      throw new Error(`Clock moved backwards by ${lastTimestamp - timestamp}ms`);
    }

    if (timestamp === lastTimestamp) {
      sequence = (sequence + 1n) & SEQUENCE_MASK;
      if (sequence === 0n) {
        timestamp = waitNextMillis(lastTimestamp);
      }
    } else {
      sequence = 0n;
    }

    lastTimestamp = timestamp;

    return (
      ((timestamp - EPOCH) << TIMESTAMP_LEFT_SHIFT) |
      (DATACENTER_ID << DATACENTER_ID_SHIFT) |
      (WORKER_ID << WORKER_ID_SHIFT) |
      sequence
    );
  };

  return {
    nextId,
    nextIdString: () => nextId().toString(),
  };
}

/**
 * Parse (decode) a Snowflake ID.
 *
 * @param {bigint|number|string} id
 * @param {bigint|number|string} [epoch=1288834974657n]
 */
function parseSnowflakeId(id, epoch = DEFAULT_EPOCH) {
  const value = BigInt(id);
  const EPOCH = BigInt(epoch);

  const sequence = value & SEQUENCE_MASK;
  const workerId = (value >> WORKER_ID_SHIFT) & MAX_WORKER_ID;
  const datacenterId = (value >> DATACENTER_ID_SHIFT) & MAX_DATACENTER_ID;
  const timestamp = (value >> TIMESTAMP_LEFT_SHIFT) + EPOCH;

  return {
    id: value,
    timestamp,
    datacenterId,
    workerId,
    sequence,
  };
}

module.exports = {
  DEFAULT_EPOCH,
  createSnowflakeIdGenerator,
  parseSnowflakeId,
};
