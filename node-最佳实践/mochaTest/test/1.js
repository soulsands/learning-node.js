var assert = require("assert");
let delay = function() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(15);
    }, 1000);
  });
};

it("#async with done", done => {
  (async function() {
    try {
      let r = await delay();
      assert.strictEqual(r, 115);
      done();
    } catch (err) {
      done(err);
    }
  })();
});
it("#async function", async () => {
  let r = await delay();
  assert.strictEqual(r, 115);
});
