const crypto = require('crypto');

import { sign } from 'crypto';
import { verify } from '../../src/lib/webhook-verify';

describe('verify()', () => {
  it('should return the body if the signature is valid', () => {
    const body = { email: 'marc@readme.io' };
    const secret = 'docs4dayz';
    const time = new Date();
    const unsigned = `${time}.${JSON.stringify(body)}`;
    const hmac = crypto.createHmac('sha256', secret);
    const signature = `t=${time},v0=${hmac.update(unsigned).digest('hex')}`;

    const verifiedBody = verify(body, signature, secret);
    expect(verifiedBody).toEqual(body);
  });

  it('should throw an error if signature is invalid', () => {
    const body = { email: 'marc@readme.io' };
    const secret = 'docs4dayz';
    const time = new Date();
    const unsigned = `${time}.${JSON.stringify(body)}`;
    const hmac = crypto.createHmac('sha256', 'invalidsecret');
    const signature = `t=${time},v0=${hmac.update(unsigned).digest('hex')}`;

    expect(() => {
      verify(body, signature, secret)
    }).toThrow();
  });

  it('should throw an error if timestamp is too old', () => {
    const body = { email: 'marc@readme.io' };
    const secret = 'docs4dayz';
    const time = new Date();
    time.setHours(time.getHours() - 1);
    const unsigned = `${time}.${JSON.stringify(body)}`;
    const hmac = crypto.createHmac('sha256', secret);
    const signature = `t=${time},v0=${hmac.update(unsigned).digest('hex')}`;

    expect(() => {
      verify(body, signature, secret)
    }).toThrow();
  });
})
