function chaining(middlewares) {
  return async function (...args) {
    const socket = this;
    let index = -1;
    async function next(i) {
      if (i <= index) throw new Error("next() called multiple times");
      index = i;
      const middleware = middlewares[i];
      if (!middleware) return;
      await middleware(socket, ...args, () => next(i + 1));
    }
    try {
      await next(0);
    } catch (err) {
      console.error('Middleware error:', err.message);
      socket.emit('error', { message: err.message });
    }
  };
}

module.exports = chaining;
