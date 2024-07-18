function dayMs(days: number): number {
  return days * 24 * 60 * 60 * 1000;
}

function minuteMs(minutes: number): number {
  return minutes * 60 * 1000;
}

export const jwtExpiryConfig = {
  accessTokenExpiry: minuteMs(20), // 20 minutes
  refreshTokenExpiry: dayMs(7), // 7 days,
};
// const [accessToken, refreshToken] = await Promise.all([
//   this.jwtService.signAsync(user, {
//     secret: this.configService.get<string>('JWT_SECRET'),
//     expiresIn: '20m',
//   }),
//   this.jwtService.signAsync(user, {
//     secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
//     expiresIn: '7d',
//   }),
// ]);
