require(__dirname + "/universal-tester.js");

const describe = UniversalTester.describe;

describe("UniversalTester API Test", async function (it) {
  
  it.never(async function() {
      this.timeout(1000 * 20);
  });

  it("can be loaded", async function() {
      this.timeout(1000 * 20);
  });

  it.always("can do 1", async function() {
      await new Promise((resolve, reject) => {
        setTimeout(resolve, 1000);
      });
  });

  it.never("can do 1", async function() {
      
  });

  it.normally("can do 1", async function() {
      
  });

  it.only("can do 1", async function() {
      
  });

});