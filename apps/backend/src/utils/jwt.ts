import jwt from 'jsonwebtoken';

const SECRETS = process.env.JWT_SECRET || 'fallback_dev_secret_engi_maintain';

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, SECRETS, { expiresIn: '1d' });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, SECRETS);
};
