"use strict";
// import jwt from 'jsonwebtoken';
// import config from '../config';
// /**
//  * Define the payload interface to be used for JWT tokens.
//  */
// export interface TokenPayload {
//   userId: string;
//   tenant?: string;
//   role: string;
// }
// /**
//  * Creates a JWT token with the given payload.
//  * @param payload - Data to include in the token.
//  * @returns A signed JWT token.
//  */
// export const createToken = (payload: TokenPayload): string => {
//   return jwt.sign(payload, config.JWT_SECRET as jwt.Secret,
//     { expiresIn: config.JWT_EXPIRES_IN } as jwt.SignOptions);
// };
// /**
//  * Verifies a JWT token and returns the decoded payload.
//  * @param token - The JWT token to verify.
//  * @returns The decoded token payload.
//  * @throws An error if token verification fails.
//  */
// export const verifyToken = (token: string): TokenPayload => {
//   return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
// };
// /**
//  * Refreshes a JWT token by verifying the current token (ignoring expiration) 
//  * and issuing a new token with updated expiration.
//  * @param token - The existing JWT token.
//  * @returns A new JWT token with a refreshed expiration time.
//  * @throws An error if token refreshing fails.
//  */
// export const refreshToken = (token: string): string => {
//   try {
//     // Verify the token ignoring expiration to extract the payload
//     const decoded = jwt.verify(token, config.JWT_SECRET, { ignoreExpiration: true }) as TokenPayload;
//     // Re-issue a token with the same payload, including userId and tenant, with a refreshed expiration
//     return jwt.sign({ userId: decoded.userId, tenant: decoded.tenant }, config.JWT_SECRET as jwt.Secret,
//       { expiresIn: config.JWT_EXPIRES_IN } as jwt.SignOptions);
//   } catch (error) {
//     throw new Error('Token refresh failed');
//   }
// };
