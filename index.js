const {
	SyncHook,
	SyncBailHook,
	SyncWaterfallHook,
	SyncLoopHook,
	AsyncParallelHook,
	AsyncParallelBailHook,
	AsyncSeriesHook,
	AsyncSeriesBailHook,
	AsyncSeriesWaterfallHook
} = require("tapable");

class Car {
	constructor() {
		this.hooks = {
			accelerate: new SyncHook(["newSpeed", "newSpeed2"]),
      testSyncWaterfallHook: new SyncWaterfallHook(["name"]),
      testSyncBailHook: new SyncBailHook(),
      testAsyncParallelBailHook: new AsyncParallelBailHook(["arg1"]),
      testAsyncSeriesBailHook: new AsyncSeriesBailHook(["arg1"]),
			brake: new SyncHook(),
			calculateRoutes: new AsyncParallelHook(["source", "target", "routesList"])
		};
	}

  /**
	  * You won't get returned value from SyncHook or AsyncParallelHook,
	  * to do that, use SyncWaterfallHook and AsyncSeriesWaterfallHook respectively
	 **/

	setSpeed(newSpeed) {
		// following call returns undefined even when you returned values
		this.hooks.accelerate.call(newSpeed, newSpeed + 1);
	}

  setBreak() {
    this.hooks.brake.call("break");
  }

  setWaterFall(newSpeed) {
    this.hooks.testSyncWaterfallHook.call(newSpeed + 1);
  }

  setSyncBailHook() {
    this.hooks.testSyncBailHook.call();
  }

  setAsyncParallelBailHook() {
    this.hooks.testAsyncParallelBailHook.callAsync( "arg1-val", (retVal) => {
      console.info('testAsyncParallelBailHook.callAsync', retVal);
    });
  }

  setAsyncSeriesBailHook() {
    this.hooks.testAsyncSeriesBailHook.callAsync( "arg1-val", (retVal) => {
      console.info('testAsyncSeriesBailHook.callAsync', retVal);
    });
  }

  routesList = new Array();

	useNavigationSystemPromise(source, target) {
    console.info('useNavigationSystemPromise');
		return this.hooks.calculateRoutes.promise(source, target, this.routesList).then((res) => {
			// res is undefined for AsyncParallelHook
      console.info('useNavigationSystemPromise promise', res, this.routesList);
			return this.routesList;
		});
	}

	useNavigationSystemAsync(source, target, callback) {
		const routesList = new Array();
		this.hooks.calculateRoutes.callAsync(source, target, this.routesList, err => {
			if(err) return callback(err);
			callback(null, routesList.getRoutes());
		});
	}
}

const myCar = new Car();

// Use the tap method to add a consument
myCar.hooks.accelerate.tap("newSpeed", (...e) => {
  console.info('accelerate', e);
});
// myCar.setSpeed(40);

// 测试 tapPromise
myCar.hooks.calculateRoutes.tapPromise("GoogleMapsPlugin", (source, target, routesList) => {
  console.info('myCar.hooks.calculateRoutes.tapPromise')
  return new Promise((resoleve) => {
    console.info('myCar.hooks.calculateRoutes.tapPromise Promise', source, target);
    routesList.push('test');
    resoleve("tapPromise done")
  });
});
myCar.hooks.calculateRoutes.tapPromise("GoogleMapsPlugin", (source, target, routesList) => {
  console.info('myCar.hooks.calculateRoutes.tapPromise setTimeout')
  return new Promise((resoleve) => {
    console.info('myCar.hooks.calculateRoutes.tapPromise setTimeout Promise', source, target, routesList);
    
    setTimeout(() => {
      routesList.push('test setTimeout');
      resoleve("tapPromise done setTimeout")
    }, 1000);
  });
});
// myCar.useNavigationSystemPromise("source1", "target1");
// myCar.useNavigationSystemPromise("source2", "target2");

// 测试water full
myCar.hooks.testSyncWaterfallHook.tap("newSpeed 1", (newSpeed) => {
  console.info('testSyncWaterfallHook 1', newSpeed);
  return newSpeed+10;
});
myCar.hooks.testSyncWaterfallHook.tap("newSpeed 2", (newSpeed) => {
  console.info('testSyncWaterfallHook 2', newSpeed);
  return newSpeed+1;
});
// myCar.setWaterFall(90);

// 测试BialHook
myCar.hooks.testSyncBailHook.tap("Bail 1", () => {
  console.info('testSyncBailHook 1', "不返回任何东西");
});
myCar.hooks.testSyncBailHook.tap("Bail 2", () => {
  console.info('testSyncBailHook 2', "返回 true");
  return true;
});
myCar.hooks.testSyncBailHook.tap("Bail 3", () => {
  console.info('testSyncBailHook 3', "这个函数不应该被执行");
});
// myCar.setSyncBailHook();

// 测试 testAsyncParallelBailHook
myCar.hooks.testAsyncParallelBailHook.tapAsync("name", (arg1 ,cb) => {
  setTimeout(() => {
    console.info('testAsyncParallelBailHook.tapAsync 1', arg1);
    cb('AsyncParallelBailHook return 1');
  }, 1000);
});
myCar.hooks.testAsyncParallelBailHook.tapAsync("name", (arg1 ,cb) => {
  setTimeout(() => {
    console.info('testAsyncParallelBailHook.tapAsync 2', arg1);
    cb('AsyncParallelBailHook return 2');
  }, 2000);
});
myCar.hooks.testAsyncParallelBailHook.tapAsync("name", (arg1 ,cb) => {
  setTimeout(() => {
    console.info('testAsyncParallelBailHook.tapAsync 3', arg1);
    cb('AsyncParallelBailHook return 3');
  }, 3000);
});
// myCar.setAsyncParallelBailHook();
// console.info("这里应该先打印");

// 测试 testAsyncSeriesBailHook
myCar.hooks.testAsyncSeriesBailHook.tapAsync("name", (arg1 ,cb) => {
  setTimeout(() => {
    console.info('testAsyncSeriesBailHook.tapAsync 1', arg1);
    cb(null);
  }, 1000);
});
myCar.hooks.testAsyncSeriesBailHook.tapAsync("name", (arg1 ,cb) => {
  setTimeout(() => {
    console.info('testAsyncSeriesBailHook.tapAsync 2', arg1);
    cb('testAsyncSeriesBailHook return 2');
  }, 2000);
});
myCar.hooks.testAsyncSeriesBailHook.tapAsync("name", (arg1 ,cb) => {
  setTimeout(() => {
    console.info('testAsyncSeriesBailHook.tapAsync 3', arg1);
    cb('testAsyncSeriesBailHook return 3');
  }, 3000);
});
myCar.setAsyncSeriesBailHook();
console.info("这里应该先打印");