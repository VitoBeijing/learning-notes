function Promise(executor) {
	this.state = 'pending' // 初始pending状态
	this.value = undefined // 保存fulfilled状态的value
	this.reason = undefined // 保存rejected状态的reason
	const self = this
	self.onResolvedCallbacks = [] // 需要两个队列来存储pending状态的回调下文会有提及
	self.onRejectedCallbacks = []
	function resolve(value) {
			if (self.state === 'pending') {
					self.state = 'fulfilled'
					self.value = value
					self.onResolvedCallbacks.forEach(fn =>{
							fn(self.value)}
					)
			}
	}
	function reject(reason) {
			if(self.state === 'pending') {
					self.state = 'rejected'
					self.reason = reason
					self.onRejectedCallbacks.forEach(fn => {
							fn(self.reason)
					})
			}
	}
	try {
		executor(resolve, reject)
	} catch(e) {
		reject(e)
	}
	
}
Promise.prototype.then = function(onFulfilled, onRejected) {
	onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : val => val // "10"
	onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e } // "11"
	const self = this
	const promise2 = new Promise((resolve, reject) => {
			if(self.state === 'fulfilled') {
					setTimeout(() => {
						  try { // '9'
							  	const x = onFulfilled(self.value) // '8'
							    resolvePromise(promise2, x, resolve, reject) // '8'
							} catch (e) {
									reject(e)
							}
					},0)
			}
			if(self.state === 'rejected') {
					setTimeout(() => {
						try { // '9'
							const x = onRejected(self.reason) // '8'
							resolvePromise(promise2, x, resolve, reject) // '8'
							} catch (e) {
								reject(e)
						}
					},0)
			}
			// pending状态处理 发布订阅
			if(self.state === 'pending') {
					self.onResolvedCallbacks.push(() => {
						setTimeout(() => {
							try {
									const x = onFulfilled(self.value)
									resolvePromise(promise2, x, resolve,reject)
							} catch (e) {
									reject(e)
							}
						},0)
					})
					self.onRejectedCallbacks.push(() => {
							setTimeout(() => {
								try {
										const x = onRejected(self.reason)
										resolvePromise(promise2, x, resolve,reject)
								} catch (e) {
										reject(e)
								}
							},0)
					})
			}
	})
	return promise2
}

function resolvePromise(promise2, x, resolve, reject) {
	if (promise2 === x) { // '1'
			return reject(new TypeError('Circular reference error'))
	}
	let called = false // '8'
	if(x != null && (typeof x === 'object' || typeof x === 'function')) { // '11'
			try { // '4'
					let then = x.then // '3'
					if(typeof then === 'function') {
							then.call(x, (y) => { // '6'
									if(called) return
									called = true
									resolvePromise(x, y, resolve, reject)
							}, (r) => { // '7'
									if(called) return
									called = true
									reject(r)
							})
					} else { // '10'
							resolve(x)
					}
			} catch(e) {
					if(called) return
					called = true
					reject(e)
			}
	} else {
			resolve(x)
	}
}

// // Promise.all
// // Promise.resolve
// // Promise.reject
// // Promise.race
// // then catch finally
Promise.prototype.all = function (promiseArray) {
	let valueList = []
	let num = 0
	return new Promise((resolve, reject) => {
		try {
			let index = 0
			for(let item of promiseArray) {
				if(typeof item === 'object' && typeof item !== null && typeof item.then === 'function') {
					;(function (index) {
							item.then(value => {
									valueList[index] = value
									num++
									if(num === promiseArray.length) return resolve(valueList)
							}).catch(e => { reject(e) })
					})(index)
				} else {
					valueList[index] = item
					num++
					if(num === promiseArray.length) return resolve(valueList)
				}
				index++
			}
		} catch(e) {
			throw new Error(e)
			reject(e)
		}
	})
}
let a = new Promise((resolve, reject) => {
	setTimeout(resolve, 5000)
})
Promise.prototype.retry = function(promise, times, delay) {
	return new Promise((resolve, reject) => {
			function attemp() {
					promise().then((data) => {
							resolve(data)
					}).catch((err) => {
							if (times === 0) {
									reject(err)
							} else {
									times--
									setTimeout(attemp, delay)
							}
					})
			}
			attemp()
	})
}

// // 实现一个promise的延迟对象 defer()
// Promise.deferred = function() {
// 	let dfd = {}
// 	dfd.promise = new Promise((resolve, reject) => {
// 		dfd.resolve = resolve
// 		dfd.reject = reject
// 	})
// 	return dfd
// }
// module.exports = Promise


Promise.race = function(promises){
	if(!Array.isArray(promises)){
		throw new TypeError('You must pass array')
	}

	return new Promise(function(resolve,reject){
		function resolver(value){
			resolve(value)
		}

		function rejecter(reason){
			reject(reason)
		}

		for(var i=0;i<promises.length;i++){
			promises[i].then(resolver,rejecter)
		}
	})
}
let a = Promise.resolve(2)
let b = Promise.reject('ddd')
Promise.all(1).then(val => {
	console.log(val)
}).catch(e => {
	console.log(e,'err')
})
Object.defineProperty


