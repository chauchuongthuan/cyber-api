import { ApiProperty } from '@nestjs/swagger';
import { IsExistFileTmp } from '@src/core/validator/IsExistFileTmp';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CustomerUpdateProfile {
   @IsNotEmpty({ message: 'User name is required!' })
   @ApiProperty()
   username: string;

   @IsNotEmpty({ message: 'Email is required!' })
   @ApiProperty()
   email: string;

   @IsOptional()
   @ApiProperty()
   telegramUserId: string;

   @ApiProperty({
      description: 'oldPassword',
      maxLength: 255,
   })
   @IsOptional({})
   oldPassword: string;

   @ApiProperty({
      description: 'newPassword',
      maxLength: 255,
   })
   @IsOptional()
   newPassword: string;
}

export class CustomerUpdatePass {
   @ApiProperty({
      description: 'oldPassword',
      maxLength: 255,
   })
   @IsNotEmpty({})
   oldPassword: string;

   @ApiProperty({
      description: 'newPassword',
      maxLength: 255,
   })
   @IsNotEmpty()
   newPassword: string;
}

export class VertifyCodeDto {
   @ApiProperty({
      description: 'code',
      maxLength: 255,
   })
   @IsNotEmpty()
   vertifyCode: string;

   @ApiProperty({
      description: 'email',
      maxLength: 255,
   })
   @IsNotEmpty()
   email: string;
}

export class ResendVertifyCodeDto {
   @ApiProperty({
      description: 'email',
      maxLength: 255,
   })
   @IsNotEmpty()
   email: string;

   @ApiProperty({
      description: 'reCaptchaCode',
   })
   @IsNotEmpty({ message: 'reCaptchaCode is required!' })
   reCaptchaCode: string;
}

export class ForgotPasswordDto {
   @ApiProperty({
      description: 'email',
   })
   @IsNotEmpty({ message: 'Email is required!' })
   email: string;

   @ApiProperty({
      description: 'reCaptchaCode',
   })
   @IsNotEmpty({ message: 'reCaptchaCode is required!' })
   reCaptchaCode: string;
}

export class ChangePasswordCustomerDto {
   @ApiProperty({
      description: 'code',
      maxLength: 255,
   })
   @IsNotEmpty()
   code: string;

   @ApiProperty({
      description: 'newPassword',
      maxLength: 255,
   })
   @IsNotEmpty()
   newPassword: string;
}

export class CustomerUpdateImage {
   @ApiProperty({
      type: 'file',
      description: 'profileImage',
      maxLength: 255,
      nullable: true,
   })
   @IsOptional()
   @IsExistFileTmp([], {
      message: 'Profile image is invalid!',
   })
   profileImage: string;
}
