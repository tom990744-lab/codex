const { createSnowflakeIdGenerator } = require('./snowflake');

const generator = createSnowflakeIdGenerator({
  datacenterId: 1n,
  workerId: 3n,
});

console.log(generator.nextIdString());
console.log(generator.nextIdString());
