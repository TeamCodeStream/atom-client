'use strict';

const _levels = {
	'ERROR': 0,
	'WARN':  1,
	'INFO':  2,
	'DEBUG': 3,
	'TRACE': 4,
	'TICK':  5
};

const _tickLevel = _levels['TICK'];

let	_objectIdSeed = 0;

function _normalizeLevel (level) {
	const requestedLevel = level;

	if (typeof level === 'string') {
		level = level.toUpperCase();
		level = _levels[level];
	}

	if (level == null) {
		throw new Error('Unknown log level: ' + requestedLevel);
	}

	return level;
}

class Tick {

	constructor (logger) {
		const me = this;
		me._logger = logger;
		me._lastTick = +new Date();
	}


	tock (message) {
		const me = this;
		const logger = me._logger;

		if (logger._level < _tickLevel) {
			return;
		}

		const now = +new Date();
		const elapsed = now - lastTick;

		me._lastTick = now;
		logger.trace(`[${elapsed} ms] ${message}`);
	}
}

class Logger {

	constructor (className, level, handlers, parent) {
		const me = this;
		me._className = className;
		me._level = _normalizeLevel(level);
		me._handlers = handlers;
		me._parent = parent;
		me._childLoggers = [];
		me._levelChangeListeners = [];
		me._handlers = (handlers && handlers.slice) ? handlers.slice() : [];
	}

	error () {
		this._log('ERROR', arguments);
	}

	warn () {
		this._log('WARN', arguments);
	}

	info () {
		this._log('INFO', arguments);
	}

	debug () {
		this._log('DEBUG', arguments);
	}

	trace () {
		this._log('TRACE', arguments);
	}

	tick () {
		return new Tick(this);
	}

	_log (msgLevel, args) {
		const me = this;
		const msgLevelName = msgLevel;

		let msg;

		msgLevel = _normalizeLevel(msgLevel);

		if (msgLevel <= this._level) {
			for (let i = 0; i < args.length; i++) {
				let arg = args[i];
				if (arg == null) {
					arg = '' + arg;
				} else if (typeof arg === 'object') {
					arg = JSON.stringify(arg).substring(0, 32) + '...';
				}
				args[i] = arg;
			}
			msg = [].join.call(args, ' ');
			const className = me._className;
			msg = (className ? '[' + className + '] ' : '') + msg;

			me._handlers.forEach(handlerFn => {
				try {
					handlerFn.call(me, msgLevelName, msg);
				} catch (err) {
					console.error(err);
				}
			});

			return true;
		}
	}



	print (msg) {
		const me = this;
		this._handlers.forEach(handlerFn => {
			handlerFn.call(me, 'INFO', msg);
		});
	}

	forClass (className) {
		const me = this;
		const childLogger = new Logger(className, me._level, me._handlers, me);

		me._childLoggers.push(childLogger);

		return childLogger;
	}

	forObject (className, id) {
		return this.forClass(className + '-' + (id || ++_objectIdSeed));
	}

	get level () {
		return this._level;
	}

	setLevel (level, path) {
		const me = this;
		const className = me._className;

		level = _normalizeLevel(level);

		if (!path || (className && className.indexOf(path) >= 0)) {
			me._level = level;
		}

		for (const listener of me._levelChangeListeners) {
			listener.call(me, level, path);
		}

		for (const childLogger of me._childLoggers) {
			childLogger.setLevel(level, path);
		}
	}

	addHandler (handlerFn) {
		const me = this;
		me._handlers.push(handlerFn);
		for (const childLogger of me._childLoggers) {
			childLogger.addHandler(handlerFn);
		}
	}

	onLevelChange (fn) {
		this._levelChangeListeners.push(fn);
	}

	destroy () {
		const me = this;
		me._parent._removeChild(me);
	}

	_removeChild (child) {
		const childLoggers = this._childLoggers;
		const index = childLoggers.indexOf(child);

		if (index >= 0) {
			childLoggers.splice(index, 1);
		}
	}
}

const _instance = new Logger(null, 'INFO');

export default _instance;
