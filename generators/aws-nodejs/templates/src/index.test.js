'use strict';

const index = require('./index');

describe('#index', () => {
  describe('#handler', () => {
    it('should call cb', (done) => {
      const event = {};
      const context = {};

      index.handler(event, context, (err, result) => {
        expect(err).toBe(null);
        expect(result).toEqual({ message: 'Horray! You ran a function!' });
        done();
      });
    });
  });
});
