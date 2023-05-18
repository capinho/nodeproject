import oauth2Helpers from '../helpers/oauth2Helpers';

const oauth2Controller = {
  authorize: oauth2Helpers.generateAuthorizationCode,
  token: oauth2Helpers.generateToken,
};

export default oauth2Controller;
