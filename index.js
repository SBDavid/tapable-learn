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
      testSyncWaterfallHook: new SyncWaterfallHook(["newSpeed"]),
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

  setWater

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
// myCar.hooks.accelerate.tap("newSpeed", (...e) => {
//   console.info('accelerate', e);
// });
// myCar.setSpeed(40);

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



myCar.useNavigationSystemPromise("source1", "target1");
// myCar.useNavigationSystemPromise("source2", "target2");