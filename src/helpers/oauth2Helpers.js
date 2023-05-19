import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import AuthorizationCode from '../models/authorizationcode';
import AccessToken from '../models/accesstoken';
import RefreshToken from '../models/refreshtoken';
import User from '../models/user';

export const generateAuthorizationCode = async (req, res) => {
  const { clientId, redirectUri } = req.query;
  const userId = "1"; // Assuming you have the user information in the request
  // const userId = req.user.id; // Assuming you have the user information in the request
  const code = uuidv4(); // Generate a unique authorization code

  try {
    await AuthorizationCode.create({
      code,
      userId,
      clientId,
      redirectUri,
    });
    // res.redirect(`${redirectUri}?code=${code}`);
    res.json({ code , redirectUri});
  } catch (error) {
    console.error('Error generating authorization code', error);
    res.status(500).json({ error: 'Error generating authorization code' });
  }
};

export const generateToken = async (req, res) => {
  const { code, clientId, clientSecret, redirectUri, scopes } = req.body;

  try {
    const authorizationCode = await AuthorizationCode.findOne({
      where: {
        code,
        clientId,
        redirectUri,
      },
    });

    if (!authorizationCode) {
      return res.status(401).json({ error: 'Invalid authorization code' });
    }

    const accessToken = generateAccessToken(authorizationCode.userId, scopes);
    const refreshToken = generateRefreshToken(authorizationCode.userId);

    res.json({ access_token: accessToken, refresh_token: refreshToken });
  } catch (error) {
    console.error('Error generating token', error);
    res.status(500).json({ error: 'Error generating token' });
  }
};

export const generateAccessToken = (userId, scopes) => {
  const secretKey = '12456';
  // expire in 10 minutes
  const expiresIn = '10m';

  const accessToken = jwt.sign({ userId, scopes }, secretKey, { expiresIn });

  AccessToken.create({
    token: accessToken,
    userId: userId, 
  });

  return accessToken;
};
  
export const generateRefreshToken = (userId) => {
    const secretKey = '12456'; 
    const expiresIn = '2h'; 
  
    const refreshToken = jwt.sign({ userId }, secretKey, { expiresIn });
  
    // Save the refresh token in the database (optional)
    RefreshToken.create({
      token: refreshToken,
      userId,
    });
  
    return refreshToken;
  };
  
const oauth2Helpers = {
    generateAuthorizationCode,
    generateToken,
    generateAccessToken,
    generateRefreshToken,

};

export default oauth2Helpers;
