import { Injectable } from '@nestjs/common';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';
import { ConfigService } from '@nestjs/config';
import { LoginDto, SignupDto } from './dto';

@Injectable()
export class AuthService {
  private userPool: CognitoUserPool;
  constructor(private configService: ConfigService) {
    this.userPool = new CognitoUserPool({
      UserPoolId: this.configService.get('COGNITO_USER_POOL_ID'),
      ClientId: this.configService.get('COGNITO_CLIENT_ID'),
    });
  }

  authenticateUser(loginDto: LoginDto) {
    const { name, password } = loginDto;

    const userCredentials = new AuthenticationDetails({
      Username: name,
      Password: password,
    });

    const user = new CognitoUser({
      Username: name,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      return user.authenticateUser(userCredentials, {
        onSuccess: (result) => {
          console.log(result);
          resolve(result);
        },
        onFailure: (err) => {
          console.log(err);
          reject(err);
        },
        newPasswordRequired: (err) => {
          console.log(err);
          reject(err);
        },
      });
    });
  }

  signup(signupDto: SignupDto) {
    return new Promise((resolve, reject) => {
      this.userPool.signUp(
        signupDto.name,
        signupDto.password,
        [
          new CognitoUserAttribute({ Name: 'given_name', Value: 'John' }),
          new CognitoUserAttribute({ Name: 'family_name', Value: 'Doe' }),
        ],
        [],
        (err, res) => {
          res && resolve(res);
          err && reject(err);
        },
      );
    });
  }
}
